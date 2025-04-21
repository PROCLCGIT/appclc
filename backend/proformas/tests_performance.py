"""
Pruebas para verificar las optimizaciones de rendimiento en vistas y dashboard.

Este módulo contiene tests específicos para comprobar que las optimizaciones
de rendimiento funcionan correctamente y mejoran el tiempo de respuesta.
"""
import time
import json
from decimal import Decimal
from django.test import TestCase, TransactionTestCase
from django.urls import reverse
from django.utils import timezone
from django.db import connection, reset_queries, transaction
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, APIClient, force_authenticate

from .models import Proforma, ProformaItem, ProformaHistorial
from .views import ProformaViewSet
from .views_optimized import OptimizedProformaViewSet
from pandora.models import Clientes, EmpresaClc

User = get_user_model()

class PerformanceTestBase(TransactionTestCase):
    """Base de pruebas con utilidades para medir rendimiento"""
    
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Crear datos de prueba base
        cls.user = User.objects.create_user(username='testuser', password='12345')
        cls.cliente = Clientes.objects.create(nombre='Cliente Test', correo='test@example.com')
        cls.empresa = EmpresaClc.objects.create(nombre='Empresa Test')
        
    def setUp(self):
        # Activar debug para contar queries
        settings.DEBUG = True
        
    def tearDown(self):
        # Restaurar debug
        settings.DEBUG = False
        
    def create_test_proformas(self, num_proformas=10, items_per_proforma=5):
        """Crea proformas de prueba con ítems"""
        proformas = []
        
        for i in range(num_proformas):
            # Crear proforma
            proforma = Proforma.objects.create(
                fecha_emision=timezone.now().date(),
                fecha_vencimiento=timezone.now().date() + timezone.timedelta(days=15),
                cliente=self.cliente,
                empresa=self.empresa,
                created_by=self.user,
                updated_by=self.user
            )
            proformas.append(proforma)
            
            # Crear ítems para esta proforma
            for j in range(items_per_proforma):
                ProformaItem.objects.create(
                    proforma=proforma,
                    tipo_item='personalizado',
                    descripcion=f'Item {j} para proforma {i}',
                    cantidad=1,
                    precio_unitario=Decimal('100.00'),
                    porcentaje_descuento=0,
                    total=Decimal('100.00')
                )
                
            # Calcular totales y guardar
            proforma.calcular_montos()
            proforma.save()
            
            # Crear entrada de historial
            ProformaHistorial.objects.create(
                proforma=proforma,
                accion='creacion',
                estado_anterior='',
                estado_nuevo='borrador',
                created_by=self.user
            )
            
            # Cambiar algunos estados para tener variedad
            if i % 3 == 0:
                proforma.estado = 'enviada'
                proforma.save()
                ProformaHistorial.objects.create(
                    proforma=proforma,
                    accion='envio',
                    estado_anterior='borrador',
                    estado_nuevo='enviada',
                    created_by=self.user
                )
            elif i % 5 == 0:
                proforma.estado = 'aprobada'
                proforma.save()
                ProformaHistorial.objects.create(
                    proforma=proforma,
                    accion='aprobacion',
                    estado_anterior='enviada',
                    estado_nuevo='aprobada',
                    created_by=self.user
                )
        
        return proformas
        
    def measure_view_execution(self, view_func, request, *args, **kwargs):
        """Mide el tiempo de ejecución y el número de consultas de una vista"""
        reset_queries()
        start_time = time.time()
        response = view_func(request, *args, **kwargs)
        end_time = time.time()
        query_count = len(connection.queries)
        
        return {
            'response': response,
            'time': end_time - start_time,
            'queries': query_count
        }


class DashboardPerformanceTest(PerformanceTestBase):
    """Pruebas de rendimiento para el dashboard"""
    
    def setUp(self):
        super().setUp()
        # Crear un conjunto de datos de prueba
        self.proformas = self.create_test_proformas(num_proformas=20, items_per_proforma=5)
        
    def test_dashboard_performance(self):
        """Compara el rendimiento entre la vista original y la optimizada"""
        factory = APIRequestFactory()
        request = factory.get('/proformas/dashboard/')
        force_authenticate(request, user=self.user)
        
        # Probar la vista original
        original_view = ProformaViewSet.as_view({'get': 'dashboard'})
        original_result = self.measure_view_execution(original_view, request)
        
        # Probar la vista optimizada
        optimized_view = OptimizedProformaViewSet.as_view({'get': 'dashboard'})
        optimized_result = self.measure_view_execution(optimized_view, request)
        
        # Verificar que ambas vistas devuelven datos válidos
        self.assertEqual(original_result['response'].status_code, 200)
        self.assertEqual(optimized_result['response'].status_code, 200)
        
        # Verificar que la vista optimizada usa menos consultas
        self.assertLess(
            optimized_result['queries'], 
            original_result['queries'],
            "La vista optimizada debería usar menos consultas"
        )
        
        # Mostrar resultados para análisis
        print(f"\nDashboard (20 proformas con 5 ítems cada una):")
        print(f"Original: {original_result['time']:.4f}s, {original_result['queries']} consultas")
        print(f"Optimizado: {optimized_result['time']:.4f}s, {optimized_result['queries']} consultas")
        print(f"Mejora: {original_result['time']/optimized_result['time']:.2f}x más rápido, "
              f"{original_result['queries']/optimized_result['queries']:.2f}x menos consultas")
        
        # Verificar que ambas respuestas contienen los mismos datos esenciales
        original_data = json.loads(original_result['response'].content.decode('utf-8'))
        optimized_data = json.loads(optimized_result['response'].content.decode('utf-8'))
        
        self.assertEqual(original_data['total_proformas'], optimized_data['total_proformas'])
        self.assertEqual(len(original_data['por_estado']), len(optimized_data['por_estado']))
        self.assertEqual(len(original_data['por_cliente']), len(optimized_data['por_cliente']))
        self.assertEqual(len(original_data['proformasRecientes']), len(optimized_data['proformasRecientes']))
    
    def test_dashboard_with_filters(self):
        """Prueba el rendimiento del dashboard con filtros aplicados"""
        factory = APIRequestFactory()
        
        # Crear un request con filtros
        request = factory.get('/proformas/dashboard/', {
            'estado': 'enviada,aprobada',
            'start_date': (timezone.now() - timezone.timedelta(days=30)).date().isoformat()
        })
        force_authenticate(request, user=self.user)
        
        # Probar la vista original con filtros
        original_view = ProformaViewSet.as_view({'get': 'dashboard'})
        original_result = self.measure_view_execution(original_view, request)
        
        # Probar la vista optimizada con filtros
        optimized_view = OptimizedProformaViewSet.as_view({'get': 'dashboard'})
        optimized_result = self.measure_view_execution(optimized_view, request)
        
        # Verificar que la vista optimizada sigue siendo más eficiente con filtros
        self.assertLess(
            optimized_result['queries'], 
            original_result['queries'],
            "La vista optimizada debería seguir usando menos consultas con filtros"
        )
        
        # Mostrar resultados para análisis
        print(f"\nDashboard con filtros:")
        print(f"Original: {original_result['time']:.4f}s, {original_result['queries']} consultas")
        print(f"Optimizado: {optimized_result['time']:.4f}s, {optimized_result['queries']} consultas")
        print(f"Mejora: {original_result['time']/optimized_result['time']:.2f}x más rápido, "
              f"{original_result['queries']/optimized_result['queries']:.2f}x menos consultas")


class ProformaItemsPerformanceTest(PerformanceTestBase):
    """Pruebas de rendimiento para listado de ítems de proforma"""
    
    def setUp(self):
        super().setUp()
        # Crear una proforma con muchos ítems para la prueba
        self.proformas = self.create_test_proformas(num_proformas=1, items_per_proforma=50)
        self.proforma = self.proformas[0]
        
    def test_items_endpoint_performance(self):
        """Prueba el rendimiento del endpoint de ítems"""
        factory = APIRequestFactory()
        request = factory.get(f'/proformas/{self.proforma.pk}/items/')
        force_authenticate(request, user=self.user)
        
        # Probar la vista original
        original_view = ProformaViewSet.as_view({'get': 'items'})
        original_result = self.measure_view_execution(original_view, request, pk=self.proforma.pk)
        
        # Probar la vista optimizada
        optimized_view = OptimizedProformaViewSet.as_view({'get': 'items'})
        optimized_result = self.measure_view_execution(optimized_view, request, pk=self.proforma.pk)
        
        # Verificar que ambas vistas devuelven datos válidos
        self.assertEqual(original_result['response'].status_code, 200)
        self.assertEqual(optimized_result['response'].status_code, 200)
        
        # Verificar que la vista optimizada usa menos consultas
        self.assertLess(
            optimized_result['queries'], 
            original_result['queries'],
            "La vista optimizada debería usar menos consultas"
        )
        
        # Mostrar resultados para análisis
        print(f"\nItems de proforma (50 ítems):")
        print(f"Original: {original_result['time']:.4f}s, {original_result['queries']} consultas")
        print(f"Optimizado: {optimized_result['time']:.4f}s, {optimized_result['queries']} consultas")
        print(f"Mejora: {original_result['time']/optimized_result['time']:.2f}x más rápido, "
              f"{original_result['queries']/optimized_result['queries']:.2f}x menos consultas")


class HistorialPerformanceTest(PerformanceTestBase):
    """Pruebas de rendimiento para listado de historial de proforma"""
    
    def setUp(self):
        super().setUp()
        # Crear una proforma con varios cambios de estado para la prueba
        self.proformas = self.create_test_proformas(num_proformas=1, items_per_proforma=5)
        self.proforma = self.proformas[0]
        
        # Agregar más entradas de historial
        estados = ['enviada', 'aprobada', 'convertida']
        ultimo_estado = 'borrador'
        
        for estado in estados:
            self.proforma.estado = estado
            self.proforma.save()
            
            ProformaHistorial.objects.create(
                proforma=self.proforma,
                accion='modificacion',
                estado_anterior=ultimo_estado,
                estado_nuevo=estado,
                created_by=self.user
            )
            
            ultimo_estado = estado
        
    def test_historial_endpoint_performance(self):
        """Prueba el rendimiento del endpoint de historial"""
        factory = APIRequestFactory()
        request = factory.get(f'/proformas/{self.proforma.pk}/historial/')
        force_authenticate(request, user=self.user)
        
        # Probar la vista original
        original_view = ProformaViewSet.as_view({'get': 'historial'})
        original_result = self.measure_view_execution(original_view, request, pk=self.proforma.pk)
        
        # Probar la vista optimizada
        optimized_view = OptimizedProformaViewSet.as_view({'get': 'historial'})
        optimized_result = self.measure_view_execution(optimized_view, request, pk=self.proforma.pk)
        
        # Verificar que ambas vistas devuelven datos válidos
        self.assertEqual(original_result['response'].status_code, 200)
        self.assertEqual(optimized_result['response'].status_code, 200)
        
        # Verificar que la vista optimizada usa menos consultas
        self.assertLessEqual(
            optimized_result['queries'], 
            original_result['queries'],
            "La vista optimizada debería usar menos consultas"
        )
        
        # Mostrar resultados para análisis
        print(f"\nHistorial de proforma (5 entradas):")
        print(f"Original: {original_result['time']:.4f}s, {original_result['queries']} consultas")
        print(f"Optimizado: {optimized_result['time']:.4f}s, {optimized_result['queries']} consultas")
        print(f"Mejora: {original_result['time']/optimized_result['time']:.2f}x más rápido, "
              f"{original_result['queries']/optimized_result['queries']:.2f}x menos consultas")