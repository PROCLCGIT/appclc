"""
Pruebas para verificar el correcto funcionamiento de los serializers optimizados.

Este módulo contiene tests específicos para comprobar que las optimizaciones
de serializers funcionan correctamente y mejoran el rendimiento.
"""
import time
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from django.db import connection, reset_queries, transaction
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory

from .models import Proforma, ProformaItem, ProformaHistorial
from .serializers import ProformaSerializer, ProformaItemSerializer
from .serializers_optimized import ProformaSerializer as OptimizedProformaSerializer
from pandora.models import Clientes, EmpresaClc

User = get_user_model()

class SerializerTestBase(TestCase):
    """Base para pruebas de serializers con utilidades para medir rendimiento"""
    
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
    
    def create_test_proforma_data(self, num_items=5):
        """Crea datos para probar serializers"""
        return {
            'fecha_emision': timezone.now().date(),
            'fecha_vencimiento': timezone.now().date() + timezone.timedelta(days=15),
            'cliente': self.cliente.id,
            'empresa': self.empresa.id,
            'created_by': self.user.id,
            'updated_by': self.user.id,
            'items_data': [
                {
                    'tipo_item': 'personalizado',
                    'descripcion': f'Item de prueba {i}',
                    'cantidad': 1,
                    'precio_unitario': '100.00',
                    'porcentaje_descuento': 0,
                } for i in range(num_items)
            ]
        }
        
    def measure_execution(self, func, *args, **kwargs):
        """Mide el tiempo de ejecución y el número de consultas"""
        reset_queries()
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        query_count = len(connection.queries)
        
        return {
            'result': result,
            'time': end_time - start_time,
            'queries': query_count
        }


class ProformaSerializerOptimizationTest(SerializerTestBase):
    """Pruebas específicas para serializers de proformas"""
    
    def test_create_proforma_with_items(self):
        """Prueba la creación de una proforma con varios ítems"""
        # Crear datos de prueba con 10 ítems
        data = self.create_test_proforma_data(num_items=10)
        
        # Configurar factory para context
        factory = APIRequestFactory()
        request = factory.post('/proformas/')
        
        # Medir serializer original
        def create_with_original():
            serializer = ProformaSerializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            return serializer.save()
        
        # Medir serializer optimizado
        def create_with_optimized():
            serializer = OptimizedProformaSerializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            return serializer.save()
        
        # Ejecutar y medir ambos métodos
        with transaction.atomic():
            original = self.measure_execution(create_with_original)
            transaction.set_rollback(True)
        
        with transaction.atomic():
            optimized = self.measure_execution(create_with_optimized)
            transaction.set_rollback(True)
        
        # Verificar que ambos métodos crean los datos correctamente
        self.assertIsNotNone(original['result'])
        self.assertIsNotNone(optimized['result'])
        
        # Verificar que el método optimizado usa menos queries
        self.assertLess(optimized['queries'], original['queries'],
                        "El serializer optimizado debería usar menos queries")
        
        # Mostrar resultados para análisis
        print(f"\nCrear proforma con 10 ítems:")
        print(f"Original: {original['time']:.4f}s, {original['queries']} queries")
        print(f"Optimizado: {optimized['time']:.4f}s, {optimized['queries']} queries")
        print(f"Mejora: {original['time']/optimized['time']:.2f}x más rápido, "
              f"{original['queries']/optimized['queries']:.2f}x menos queries")
    
    def test_create_proforma_with_many_items(self):
        """Prueba la creación de una proforma con muchos ítems (50)"""
        # Crear datos de prueba con 50 ítems
        data = self.create_test_proforma_data(num_items=50)
        
        # Configurar factory para context
        factory = APIRequestFactory()
        request = factory.post('/proformas/')
        
        # Medir serializer original
        def create_with_original():
            serializer = ProformaSerializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            return serializer.save()
        
        # Medir serializer optimizado
        def create_with_optimized():
            serializer = OptimizedProformaSerializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            return serializer.save()
        
        # Ejecutar y medir ambos métodos
        with transaction.atomic():
            original = self.measure_execution(create_with_original)
            transaction.set_rollback(True)
        
        with transaction.atomic():
            optimized = self.measure_execution(create_with_optimized)
            transaction.set_rollback(True)
        
        # Verificar que el método optimizado usa menos queries
        self.assertLess(optimized['queries'], original['queries'],
                        "El serializer optimizado debería usar menos queries")
        
        # Mostrar resultados para análisis
        print(f"\nCrear proforma con 50 ítems:")
        print(f"Original: {original['time']:.4f}s, {original['queries']} queries")
        print(f"Optimizado: {optimized['time']:.4f}s, {optimized['queries']} queries")
        print(f"Mejora: {original['time']/optimized['time']:.2f}x más rápido, "
              f"{original['queries']/optimized['queries']:.2f}x menos queries")
    
    def test_update_proforma_items(self):
        """Prueba la actualización de ítems en una proforma existente"""
        # Crear proforma para la prueba
        proforma = Proforma.objects.create(
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + timezone.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            created_by=self.user,
            updated_by=self.user
        )
        
        # Crear algunos ítems iniciales
        items = []
        for i in range(5):
            item = ProformaItem.objects.create(
                proforma=proforma,
                tipo_item='personalizado',
                descripcion=f'Item inicial {i}',
                cantidad=1,
                precio_unitario=Decimal('100.00'),
                porcentaje_descuento=0,
                total=Decimal('100.00')
            )
            items.append(item)
        
        # Datos para actualizar ítems y agregar nuevos
        update_data = {
            'estado': 'enviada',
            'items_data': [
                # Actualizar ítems existentes
                {'id': items[0].id, 'precio_unitario': '120.00'},
                {'id': items[1].id, 'precio_unitario': '150.00'},
                # Añadir nuevos ítems
                {'tipo_item': 'personalizado', 'descripcion': 'Nuevo item 1', 'cantidad': 1, 'precio_unitario': '200.00'},
                {'tipo_item': 'personalizado', 'descripcion': 'Nuevo item 2', 'cantidad': 2, 'precio_unitario': '250.00'}
            ]
        }
        
        # Configurar factory para context
        factory = APIRequestFactory()
        request = factory.put(f'/proformas/{proforma.id}/')
        
        # Medir serializer original
        def update_with_original():
            serializer = ProformaSerializer(proforma, data=update_data, context={'request': request}, partial=True)
            serializer.is_valid(raise_exception=True)
            return serializer.save()
        
        # Medir serializer optimizado
        def update_with_optimized():
            serializer = OptimizedProformaSerializer(proforma, data=update_data, context={'request': request}, partial=True)
            serializer.is_valid(raise_exception=True)
            return serializer.save()
        
        # Ejecutar y medir ambos métodos
        with transaction.atomic():
            original = self.measure_execution(update_with_original)
            transaction.set_rollback(True)
        
        with transaction.atomic():
            optimized = self.measure_execution(update_with_optimized)
            transaction.set_rollback(True)
        
        # Verificar que el método optimizado usa menos queries
        self.assertLess(optimized['queries'], original['queries'],
                        "El serializer optimizado debería usar menos queries")
        
        # Mostrar resultados para análisis
        print(f"\nActualizar proforma con 5 ítems y agregar 2 nuevos:")
        print(f"Original: {original['time']:.4f}s, {original['queries']} queries")
        print(f"Optimizado: {optimized['time']:.4f}s, {optimized['queries']} queries")
        print(f"Mejora: {original['time']/optimized['time']:.2f}x más rápido, "
              f"{original['queries']/optimized['queries']:.2f}x menos queries")
    
    def test_historial_creation(self):
        """Prueba que el historial se crea correctamente con las señales"""
        # Crear proforma con el serializer optimizado
        data = self.create_test_proforma_data(num_items=2)
        factory = APIRequestFactory()
        request = factory.post('/proformas/')
        
        with transaction.atomic():
            serializer = OptimizedProformaSerializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            proforma = serializer.save()
            
            # Verificar que se creó el historial de creación
            historial_creacion = ProformaHistorial.objects.filter(
                proforma=proforma, 
                accion='creacion'
            )
            self.assertTrue(historial_creacion.exists(), "Debe existir un historial de creación")
            
            # Cambiar estado de la proforma
            update_data = {'estado': 'enviada'}
            update_serializer = OptimizedProformaSerializer(
                proforma, 
                data=update_data, 
                context={'request': request}, 
                partial=True
            )
            update_serializer.is_valid(raise_exception=True)
            proforma_updated = update_serializer.save()
            
            # Verificar que se creó historial de cambio de estado
            historial_envio = ProformaHistorial.objects.filter(
                proforma=proforma_updated, 
                accion='envio',
                estado_anterior='borrador',
                estado_nuevo='enviada'
            )
            self.assertTrue(historial_envio.exists(), "Debe existir un historial de envío")
            
            # Contar el número total de registros de historial
            total_historial = ProformaHistorial.objects.filter(proforma=proforma_updated).count()
            self.assertEqual(total_historial, 2, "Deben existir exactamente 2 registros de historial")
            
            transaction.set_rollback(True)  # Revertir cambios pero mantener resultados del test
    
    def test_replace_all_items(self):
        """Prueba la funcionalidad de reemplazar todos los ítems"""
        # Crear proforma con ítems iniciales
        proforma = Proforma.objects.create(
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + timezone.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            created_by=self.user,
            updated_by=self.user
        )
        
        # Crear 5 ítems iniciales
        for i in range(5):
            ProformaItem.objects.create(
                proforma=proforma,
                tipo_item='personalizado',
                descripcion=f'Item inicial {i}',
                cantidad=1,
                precio_unitario=Decimal('100.00'),
                porcentaje_descuento=0,
                total=Decimal('100.00')
            )
        
        # Datos para reemplazar todos los ítems
        update_data = {
            'items_data': [
                {'replace_all': True},  # Indicador para reemplazar todos
                {'tipo_item': 'personalizado', 'descripcion': 'Nuevo item 1', 'cantidad': 1, 'precio_unitario': '200.00'},
                {'tipo_item': 'personalizado', 'descripcion': 'Nuevo item 2', 'cantidad': 2, 'precio_unitario': '250.00'},
                {'tipo_item': 'personalizado', 'descripcion': 'Nuevo item 3', 'cantidad': 3, 'precio_unitario': '300.00'}
            ]
        }
        
        # Configurar factory para context
        factory = APIRequestFactory()
        request = factory.put(f'/proformas/{proforma.id}/')
        
        # Probar serializer optimizado
        with transaction.atomic():
            serializer = OptimizedProformaSerializer(
                proforma, 
                data=update_data, 
                context={'request': request}, 
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            updated_proforma = serializer.save()
            
            # Verificar que se eliminaron los ítems anteriores y se crearon los nuevos
            items = ProformaItem.objects.filter(proforma=updated_proforma)
            self.assertEqual(items.count(), 3, "Deben existir exactamente 3 ítems")
            
            # Verificar que los ítems son los nuevos
            descriptions = sorted([item.descripcion for item in items])
            expected = sorted(['Nuevo item 1', 'Nuevo item 2', 'Nuevo item 3'])
            self.assertEqual(descriptions, expected, "Los ítems deben tener las nuevas descripciones")
            
            transaction.set_rollback(True)  # Revertir cambios pero mantener resultados del test