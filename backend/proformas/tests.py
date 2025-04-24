from django.test import TestCase, RequestFactory
from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.urls import reverse
from rest_framework.test import APITestCase, APIRequestFactory, force_authenticate
from rest_framework import status
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import datetime
import json
import mock
import decimal
from decimal import Decimal

from .models import Proforma, SecuenciaProforma, ProformaItem, ProformaHistorial
from .services import ProformaService
from .serializers import ProformaSerializer, ProformaItemSerializer
from .views import ProformaViewSet, OptimizedProformaViewSet, ProformaItemViewSet
from pandora.models import Clientes, EmpresaClc

User = get_user_model()

class SecuenciaProformaTest(TestCase):
    """
    Pruebas para la generación atómica de números de proforma
    utilizando el modelo SecuenciaProforma
    """
    
    def setUp(self):
        """Configurar datos básicos para las pruebas"""
        self.year = timezone.now().year
        
        # Crear usuario para las pruebas
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123'
        )
        
        # Crear cliente para las pruebas
        self.cliente = Clientes.objects.create(
            nombre='Cliente Test',
            ruc='1234567890',
            email='cliente@test.com'
        )
        
        # Crear empresa para las pruebas
        self.empresa = EmpresaClc.objects.create(
            nombre='Empresa Test',
            ruc='0987654321'
        )
    
    def test_secuencia_creation(self):
        """Prueba la creación básica de una secuencia"""
        secuencia = SecuenciaProforma.objects.create(
            anio=self.year,
            ultimo_numero=999
        )
        
        self.assertEqual(secuencia.anio, self.year)
        self.assertEqual(secuencia.ultimo_numero, 999)
        self.assertIsNotNone(secuencia.ultima_actualizacion)
    
    def test_obtener_siguiente_numero(self):
        """Prueba la obtención del siguiente número de forma atómica"""
        # Obtener el primer número
        numero1 = SecuenciaProforma.obtener_siguiente_numero(self.year)
        
        # Verificar formato correcto
        self.assertEqual(numero1, f"PRO-{self.year}-1000")
        
        # Verificar que la secuencia se haya creado
        secuencia = SecuenciaProforma.objects.get(anio=self.year)
        self.assertEqual(secuencia.ultimo_numero, 1000)
        
        # Obtener el siguiente número
        numero2 = SecuenciaProforma.obtener_siguiente_numero(self.year)
        
        # Verificar que sea el siguiente en la secuencia
        self.assertEqual(numero2, f"PRO-{self.year}-1001")
        
        # Verificar que la secuencia se haya actualizado
        secuencia.refresh_from_db()
        self.assertEqual(secuencia.ultimo_numero, 1001)
    
    def test_multiple_years(self):
        """Prueba secuencias para diferentes años"""
        # Crear secuencias para dos años distintos
        next_year = self.year + 1
        
        # Obtener números para el año actual
        numero_current = SecuenciaProforma.obtener_siguiente_numero(self.year)
        self.assertEqual(numero_current, f"PRO-{self.year}-1000")
        
        # Obtener números para el próximo año
        numero_next = SecuenciaProforma.obtener_siguiente_numero(next_year)
        self.assertEqual(numero_next, f"PRO-{next_year}-1000")
        
        # Verificar que existan ambas secuencias
        self.assertEqual(SecuenciaProforma.objects.count(), 2)
        
        # Obtener otros números y verificar que incrementen correctamente
        numero_current2 = SecuenciaProforma.obtener_siguiente_numero(self.year)
        numero_next2 = SecuenciaProforma.obtener_siguiente_numero(next_year)
        
        self.assertEqual(numero_current2, f"PRO-{self.year}-1001")
        self.assertEqual(numero_next2, f"PRO-{next_year}-1001")
    
    def test_generar_numero_proforma(self):
        """Prueba el método generar_numero() de Proforma"""
        # Crear proforma sin número
        proforma = Proforma(
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            created_by=self.user
        )
        
        # Generar número
        numero = proforma.generar_numero()
        
        # Verificar formato
        self.assertTrue(numero.startswith(f"PRO-{self.year}-"))
        
        # Guardar y verificar que persista el número
        proforma.numero = numero
        proforma.save()
        
        self.assertEqual(proforma.numero, numero)
        
        # Crear otra proforma y verificar que obtenga el siguiente número
        proforma2 = Proforma(
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            created_by=self.user
        )
        
        numero2 = proforma2.generar_numero()
        proforma2.numero = numero2
        proforma2.save()
        
        # Verificar que el número sea secuencial
        num1 = int(numero.split('-')[-1])
        num2 = int(numero2.split('-')[-1])
        self.assertEqual(num2, num1 + 1)
    
    def test_concurrent_generation(self):
        """
        Prueba la generación concurrente de números de proforma
        para verificar que no haya race conditions
        """
        # Número de hilos concurrentes
        num_threads = 10
        
        # Función para generar número en un hilo
        def generate_number_task():
            return SecuenciaProforma.obtener_siguiente_numero(self.year)
        
        # Generar números concurrentemente
        generated_numbers = []
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = [executor.submit(generate_number_task) for _ in range(num_threads)]
            for future in as_completed(futures):
                generated_numbers.append(future.result())
        
        # Verificar que todos los números generados sean únicos
        unique_numbers = set(generated_numbers)
        self.assertEqual(len(generated_numbers), len(unique_numbers), 
                         "Los números generados no son únicos, lo que indica un problema de concurrencia")
        
        # Verificar que los números son secuenciales
        numbers = [int(num.split('-')[-1]) for num in generated_numbers]
        numbers.sort()
        
        expected_sequence = list(range(1000, 1000 + num_threads))
        self.assertEqual(numbers, expected_sequence, 
                         "Los números generados no forman una secuencia completa")
        
        # Verificar el estado final de la secuencia
        secuencia = SecuenciaProforma.objects.get(anio=self.year)
        self.assertEqual(secuencia.ultimo_numero, 1000 + num_threads - 1,
                         "El último número de la secuencia no es el esperado")

    def test_create_proformas_concurrently(self):
        """
        Prueba la creación concurrente de proformas completas
        para verificar que los números sean únicos
        """
        # Número de proformas a crear
        num_proformas = 5
        
        # Función para crear proforma en un hilo
        def create_proforma_task():
            with transaction.atomic():
                proforma = Proforma(
                    fecha_emision=timezone.now().date(),
                    fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
                    cliente=self.cliente,
                    empresa=self.empresa,
                    created_by=self.user
                )
                
                # Guardar proforma (internamente genera el número)
                proforma.save()
                
                # Crear un item para la proforma
                item = ProformaItem(
                    proforma=proforma,
                    tipo_item='personalizado',
                    descripcion=f'Item de prueba {threading.get_ident()}',
                    cantidad=1,
                    precio_unitario=100,
                    total=100
                )
                item.save()
                
                return proforma.numero
        
        # Crear proformas concurrentemente
        created_numbers = []
        with ThreadPoolExecutor(max_workers=num_proformas) as executor:
            futures = [executor.submit(create_proforma_task) for _ in range(num_proformas)]
            for future in as_completed(futures):
                created_numbers.append(future.result())
        
        # Verificar que todos los números generados sean únicos
        unique_numbers = set(created_numbers)
        self.assertEqual(len(created_numbers), len(unique_numbers), 
                         "Las proformas creadas concurrentemente tienen números duplicados")
        
        # Verificar que se crearon todas las proformas
        self.assertEqual(Proforma.objects.count(), num_proformas)
        
        # Verificar que todas tienen números diferentes
        proforma_numbers = list(Proforma.objects.values_list('numero', flat=True))
        self.assertEqual(len(proforma_numbers), len(set(proforma_numbers)),
                         "Existen números duplicados en la base de datos")


class ProformaModelTest(TestCase):
    """Pruebas para el modelo Proforma y sus métodos de validación"""
    
    def setUp(self):
        """Configurar datos básicos para las pruebas"""
        # Crear usuario para las pruebas
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123'
        )
        
        # Crear cliente para las pruebas
        self.cliente = Clientes.objects.create(
            nombre='Cliente Test',
            ruc='1234567890',
            email='cliente@test.com'
        )
        
        # Crear empresa para las pruebas
        self.empresa = EmpresaClc.objects.create(
            nombre='Empresa Test',
            ruc='0987654321'
        )
    
    def test_proforma_creation(self):
        """Prueba la creación básica de una proforma con campos obligatorios"""
        proforma = Proforma.objects.create(
            numero='TEST-2025-1000',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            created_by=self.user,
            updated_by=self.user
        )
        
        self.assertEqual(proforma.numero, 'TEST-2025-1000')
        self.assertEqual(proforma.cliente, self.cliente)
        self.assertEqual(proforma.empresa, self.empresa)
        self.assertEqual(proforma.created_by, self.user)
        self.assertEqual(proforma.estado, 'borrador')  # Estado por defecto
        
    def test_proforma_full_clean_validations(self):
        """Prueba las validaciones en el método clean del modelo"""
        # Caso 1: Porcentaje de impuesto fuera de rango
        proforma = Proforma(
            numero='TEST-2025-1001',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            porcentaje_impuesto=101,  # Inválido - debe estar entre 0 y 100
            created_by=self.user,
            updated_by=self.user
        )
        
        with self.assertRaises(ValidationError) as context:
            proforma.full_clean()
        
        self.assertIn('porcentaje_impuesto', context.exception.message_dict)
        
        # Caso 2: Fecha de vencimiento anterior a fecha de emisión
        proforma = Proforma(
            numero='TEST-2025-1002',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() - datetime.timedelta(days=1),  # Inválido
            cliente=self.cliente,
            empresa=self.empresa,
            created_by=self.user,
            updated_by=self.user
        )
        
        with self.assertRaises(ValidationError) as context:
            proforma.full_clean()
        
        self.assertIn('fecha_vencimiento', context.exception.message_dict)
        
        # Caso 3: Valores negativos en subtotal/impuesto/total
        proforma = Proforma(
            numero='TEST-2025-1003',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            subtotal=-100,  # Inválido
            created_by=self.user,
            updated_by=self.user
        )
        
        with self.assertRaises(ValidationError) as context:
            proforma.full_clean()
        
        self.assertIn('subtotal', context.exception.message_dict)
        
    def test_proforma_save_with_clean(self):
        """Prueba que el método save invoca las validaciones correctamente"""
        # Crear proforma con datos inválidos
        proforma = Proforma(
            numero='TEST-2025-1004',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            porcentaje_impuesto=150,  # Inválido
            created_by=self.user,
            updated_by=self.user
        )
        
        # save() debe llamar a full_clean() y provocar error
        with self.assertRaises(ValidationError):
            proforma.save()
        
        # Corregir el valor y verificar que se guarda correctamente
        proforma.porcentaje_impuesto = 12
        proforma.save()
        
        # Verificar que se guardó
        self.assertIsNotNone(proforma.id)
        
    def test_calcular_montos(self):
        """Prueba el método para calcular montos (subtotal, impuesto, total)"""
        # Crear proforma
        proforma = Proforma.objects.create(
            numero='TEST-2025-1005',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            porcentaje_impuesto=12,
            created_by=self.user,
            updated_by=self.user
        )
        
        # Crear ítems
        ProformaItem.objects.create(
            proforma=proforma,
            tipo_item='personalizado',
            descripcion='Item 1',
            cantidad=2,
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=0,
            total=Decimal('200.00')
        )
        
        ProformaItem.objects.create(
            proforma=proforma,
            tipo_item='personalizado',
            descripcion='Item 2',
            cantidad=1,
            precio_unitario=Decimal('50.00'),
            porcentaje_descuento=10,
            total=Decimal('45.00')
        )
        
        # Calcular montos
        proforma.calcular_montos()
        
        # Verificar cálculos
        self.assertEqual(proforma.subtotal, Decimal('245.00'))
        self.assertEqual(proforma.impuesto, Decimal('29.40'))
        self.assertEqual(proforma.total, Decimal('274.40'))
    
    def test_numero_fallback_generation(self):
        """Prueba el comportamiento de respaldo para generación de números en caso de colisión"""
        # Simular una colisión usando un mock
        with mock.patch('proformas.models.SecuenciaProforma.obtener_siguiente_numero') as mock_seq:
            # Primera llamada retorna número que "ya existe"
            mock_seq.side_effect = ['PRO-2025-1000', 'PRO-2025-1001']
            
            # Primera llamada - simula colisión
            with mock.patch('proformas.models.Proforma.objects.filter') as mock_filter:
                # Simular que el número ya existe
                mock_filter.return_value.exists.return_value = True
                
                # Generar número (usará el respaldo con timestamp)
                proforma = Proforma(
                    fecha_emision=timezone.now().date(),
                    fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
                    cliente=self.cliente,
                    empresa=self.empresa,
                    created_by=self.user
                )
                
                numero = proforma.generar_numero()
                
                # Verificar que se generó un número alternativo
                self.assertTrue(numero.startswith(f"PRO-{timezone.now().year}-"))
                # Si es respaldo, debe ser más largo que el formato normal
                self.assertGreater(len(numero), len('PRO-2025-1000'))
            
            # Segunda llamada - sin colisión
            with mock.patch('proformas.models.Proforma.objects.filter') as mock_filter:
                # Simular que el número no existe
                mock_filter.return_value.exists.return_value = False
                
                proforma = Proforma(
                    fecha_emision=timezone.now().date(),
                    fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
                    cliente=self.cliente,
                    empresa=self.empresa,
                    created_by=self.user
                )
                
                numero = proforma.generar_numero()
                
                # Verificar que se obtuvo el número normal
                self.assertEqual(numero, 'PRO-2025-1001')
    
    def test_emergency_number_generation(self):
        """Prueba la generación de números de emergencia cuando falla la secuencia"""
        # Simular error en SecuenciaProforma
        with mock.patch('proformas.models.SecuenciaProforma.obtener_siguiente_numero') as mock_seq:
            # Lanzar excepción para simular error en secuencia
            mock_seq.side_effect = Exception("Error en secuencia")
            
            proforma = Proforma(
                fecha_emision=timezone.now().date(),
                fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
                cliente=self.cliente,
                empresa=self.empresa,
                created_by=self.user
            )
            
            numero = proforma.generar_numero()
            
            # Verificar que se generó un número de emergencia
            self.assertTrue(numero.startswith(f"PRO-{timezone.now().year}-E"))


class ProformaItemModelTest(TestCase):
    """Pruebas para el modelo ProformaItem y sus validaciones"""
    
    def setUp(self):
        """Configurar datos básicos para las pruebas"""
        # Crear usuario para las pruebas
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123'
        )
        
        # Crear cliente para las pruebas
        self.cliente = Clientes.objects.create(
            nombre='Cliente Test',
            ruc='1234567890',
            email='cliente@test.com'
        )
        
        # Crear empresa para las pruebas
        self.empresa = EmpresaClc.objects.create(
            nombre='Empresa Test',
            ruc='0987654321'
        )
        
        # Crear proforma
        self.proforma = Proforma.objects.create(
            numero='TEST-2025-1000',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            created_by=self.user,
            updated_by=self.user
        )
    
    def test_item_creation(self):
        """Prueba la creación básica de un ítem de proforma"""
        item = ProformaItem.objects.create(
            proforma=self.proforma,
            tipo_item='personalizado',
            descripcion='Item de prueba',
            cantidad=2,
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=0,
            total=Decimal('200.00')
        )
        
        self.assertEqual(item.proforma, self.proforma)
        self.assertEqual(item.tipo_item, 'personalizado')
        self.assertEqual(item.descripcion, 'Item de prueba')
        self.assertEqual(item.cantidad, 2)
        self.assertEqual(item.precio_unitario, Decimal('100.00'))
        self.assertEqual(item.total, Decimal('200.00'))
    
    def test_item_validations(self):
        """Prueba las validaciones del modelo ProformaItem"""
        # Caso 1: Cantidad negativa o cero
        item = ProformaItem(
            proforma=self.proforma,
            tipo_item='personalizado',
            descripcion='Item inválido',
            cantidad=0,  # Inválido
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=0
        )
        
        with self.assertRaises(ValidationError) as context:
            item.full_clean()
        
        self.assertIn('cantidad', context.exception.message_dict)
        
        # Caso 2: Porcentaje de descuento fuera de rango
        item = ProformaItem(
            proforma=self.proforma,
            tipo_item='personalizado',
            descripcion='Item inválido',
            cantidad=1,
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=101  # Inválido
        )
        
        with self.assertRaises(ValidationError) as context:
            item.full_clean()
        
        self.assertIn('porcentaje_descuento', context.exception.message_dict)
        
        # Caso 3: Descripción vacía
        item = ProformaItem(
            proforma=self.proforma,
            tipo_item='personalizado',
            descripcion='',  # Inválido
            cantidad=1,
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=0
        )
        
        with self.assertRaises(ValidationError) as context:
            item.full_clean()
        
        self.assertIn('descripcion', context.exception.message_dict)
    
    def test_calculo_total(self):
        """Prueba el cálculo del total basado en cantidad, precio y descuento"""
        # Caso 1: Sin descuento
        item = ProformaItem(
            proforma=self.proforma,
            tipo_item='personalizado',
            descripcion='Item sin descuento',
            cantidad=2,
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=0
        )
        
        item.calcular_total()
        self.assertEqual(item.total, Decimal('200.00'))
        
        # Caso 2: Con descuento
        item = ProformaItem(
            proforma=self.proforma,
            tipo_item='personalizado',
            descripcion='Item con descuento',
            cantidad=2,
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=10
        )
        
        item.calcular_total()
        self.assertEqual(item.total, Decimal('180.00'))
        
        # Caso 3: Con descuento del 100%
        item = ProformaItem(
            proforma=self.proforma,
            tipo_item='personalizado',
            descripcion='Item con descuento total',
            cantidad=2,
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=100
        )
        
        item.calcular_total()
        self.assertEqual(item.total, Decimal('0.00'))


class ProformaServiceTest(TestCase):
    """Pruebas para los métodos del servicio ProformaService"""
    
    def setUp(self):
        """Configurar datos básicos para las pruebas"""
        # Crear usuario para las pruebas
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123'
        )
        
        # Crear cliente para las pruebas
        self.cliente = Clientes.objects.create(
            nombre='Cliente Test',
            ruc='1234567890',
            email='cliente@test.com'
        )
        
        # Crear empresa para las pruebas
        self.empresa = EmpresaClc.objects.create(
            nombre='Empresa Test',
            ruc='0987654321'
        )
        
        # Crear proforma
        self.proforma = Proforma.objects.create(
            numero='TEST-2025-2000',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            porcentaje_impuesto=12,
            created_by=self.user,
            updated_by=self.user
        )
        
        # Crear ítems para la proforma
        self.item1 = ProformaItem.objects.create(
            proforma=self.proforma,
            tipo_item='personalizado',
            descripcion='Item 1',
            cantidad=2,
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=0,
            total=Decimal('200.00')
        )
        
        self.item2 = ProformaItem.objects.create(
            proforma=self.proforma,
            tipo_item='personalizado',
            descripcion='Item 2',
            cantidad=1,
            precio_unitario=Decimal('50.00'),
            porcentaje_descuento=10,
            total=Decimal('45.00')
        )
    
    def test_calculate_item_total_from_values(self):
        """Prueba el cálculo de total de ítem a partir de valores individuales"""
        # Caso 1: Sin descuento
        total = ProformaService.calculate_item_total_from_values(
            cantidad=2,
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=0
        )
        self.assertEqual(total, Decimal('200.00'))
        
        # Caso 2: Con descuento
        total = ProformaService.calculate_item_total_from_values(
            cantidad=2,
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=10
        )
        self.assertEqual(total, Decimal('180.00'))
        
        # Caso 3: Manejo de tipos no Decimal
        total = ProformaService.calculate_item_total_from_values(
            cantidad="2",
            precio_unitario=100,
            porcentaje_descuento="10"
        )
        self.assertEqual(total, Decimal('180.00'))
        
        # Caso 4: Manejo de errores
        total = ProformaService.calculate_item_total_from_values(
            cantidad="invalid",
            precio_unitario=100,
            porcentaje_descuento=10
        )
        self.assertEqual(total, Decimal('0'))
    
    def test_calculate_amounts(self):
        """Prueba el cálculo de montos (subtotal, impuesto, total) de una proforma"""
        # Recalcular montos sin guardar
        subtotal, impuesto, total = ProformaService.calculate_amounts(self.proforma, save=False)
        
        # Verificar cálculos
        self.assertEqual(subtotal, Decimal('245.00'))
        self.assertEqual(impuesto, Decimal('29.40'))
        self.assertEqual(total, Decimal('274.40'))
        
        # Verificar que no se guardaron los cambios
        self.proforma.refresh_from_db()
        self.assertEqual(self.proforma.subtotal, Decimal('0'))
        
        # Recalcular montos y guardar
        ProformaService.calculate_amounts(self.proforma, save=True)
        
        # Verificar que se guardaron los cambios
        self.proforma.refresh_from_db()
        self.assertEqual(self.proforma.subtotal, Decimal('245.00'))
        self.assertEqual(self.proforma.impuesto, Decimal('29.40'))
        self.assertEqual(self.proforma.total, Decimal('274.40'))
    
    def test_process_items_data(self):
        """Prueba el procesamiento de datos de ítems para una proforma"""
        # Crear una nueva proforma para las pruebas
        proforma_nueva = Proforma.objects.create(
            numero='TEST-2025-3000',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            porcentaje_impuesto=12,
            created_by=self.user,
            updated_by=self.user
        )
        
        # Datos de ítems a procesar
        items_data = [
            {
                'tipo_item': 'personalizado',
                'descripcion': 'Nuevo Item 1',
                'cantidad': 3,
                'precio_unitario': Decimal('75.00'),
                'porcentaje_descuento': 0
            },
            {
                'tipo_item': 'personalizado',
                'descripcion': 'Nuevo Item 2',
                'cantidad': 1,
                'precio_unitario': Decimal('120.00'),
                'porcentaje_descuento': 5
            }
        ]
        
        # Procesar ítems
        items_creados, proforma = ProformaService.process_items_data(proforma_nueva, items_data)
        
        # Verificar resultados
        self.assertEqual(items_creados, 2)
        self.assertEqual(ProformaItem.objects.filter(proforma=proforma_nueva).count(), 2)
        
        # Verificar que se calcularon los montos correctamente
        proforma_nueva.refresh_from_db()
        
        expected_subtotal = Decimal('225.00') + Decimal('114.00')  # 3*75 + 1*120*0.95
        self.assertEqual(proforma_nueva.subtotal, expected_subtotal)
        self.assertEqual(proforma_nueva.impuesto, expected_subtotal * Decimal('0.12'))
        self.assertEqual(proforma_nueva.total, expected_subtotal + (expected_subtotal * Decimal('0.12')))
    
    def test_process_items_update_replace_all(self):
        """Prueba la actualización de ítems en modo 'replace_all'"""
        # Datos para reemplazar todos los ítems
        items_data = [
            {
                'tipo_item': 'personalizado',
                'descripcion': 'Item Reemplazado 1',
                'cantidad': 1,
                'precio_unitario': Decimal('100.00'),
                'porcentaje_descuento': 0
            }
        ]
        
        # Procesar actualización (sin IDs, se considerará replace_all)
        actualizados, creados, eliminados, proforma = ProformaService.process_items_update(
            self.proforma, items_data
        )
        
        # Verificar que se eliminaron los ítems anteriores y se creó el nuevo
        self.assertEqual(ProformaItem.objects.filter(proforma=self.proforma).count(), 1)
        self.assertEqual(
            ProformaItem.objects.filter(proforma=self.proforma).first().descripcion,
            'Item Reemplazado 1'
        )
        
        # Verificar que se actualizaron los montos
        self.proforma.refresh_from_db()
        self.assertEqual(self.proforma.subtotal, Decimal('100.00'))
    
    def test_process_items_update_selective(self):
        """Prueba la actualización selectiva de ítems (manteniendo algunos, actualizando otros)"""
        # Guardar el ID del primer ítem
        item1_id = self.item1.id
        
        # Datos para actualización selectiva
        items_data = [
            {
                'id': item1_id,  # Actualizar el primer ítem
                'tipo_item': 'personalizado',
                'descripcion': 'Item 1 Actualizado',
                'cantidad': 3,
                'precio_unitario': Decimal('100.00'),
                'porcentaje_descuento': 0
            },
            {
                # Nuevo ítem (sin ID)
                'tipo_item': 'personalizado',
                'descripcion': 'Item 3 Nuevo',
                'cantidad': 1,
                'precio_unitario': Decimal('150.00'),
                'porcentaje_descuento': 0
            }
        ]
        
        # Procesar actualización selectiva
        actualizados, creados, eliminados, proforma = ProformaService.process_items_update(
            self.proforma, items_data
        )
        
        # Verificar resultados
        self.assertEqual(actualizados, 1)
        self.assertEqual(creados, 1)
        self.assertEqual(eliminados, 1)  # El segundo ítem original se eliminó
        
        # Verificar que existen 2 ítems ahora
        self.assertEqual(ProformaItem.objects.filter(proforma=self.proforma).count(), 2)
        
        # Verificar que el primer ítem se actualizó
        item1_actualizado = ProformaItem.objects.get(id=item1_id)
        self.assertEqual(item1_actualizado.descripcion, 'Item 1 Actualizado')
        self.assertEqual(item1_actualizado.cantidad, 3)
        
        # Verificar que se actualizaron los montos
        self.proforma.refresh_from_db()
        expected_subtotal = Decimal('300.00') + Decimal('150.00')  # 3*100 + 1*150
        self.assertEqual(self.proforma.subtotal, expected_subtotal)
    
    def test_save_proforma_item(self):
        """Prueba guardar un ítem de proforma y recalcular los montos de la proforma"""
        # Crear un nuevo ítem
        item_nuevo = ProformaItem(
            proforma=self.proforma,
            tipo_item='personalizado',
            descripcion='Item Nuevo Test',
            cantidad=2,
            precio_unitario=Decimal('200.00'),
            porcentaje_descuento=10
        )
        
        # Guardar usando el servicio
        item_guardado = ProformaService.save_proforma_item(
            item_nuevo, validate=True, calculate_amounts=True, from_serializer=True
        )
        
        # Verificar que se guardó correctamente
        self.assertIsNotNone(item_guardado.id)
        self.assertEqual(item_guardado.total, Decimal('360.00'))  # 2*200*0.9
        
        # Verificar que se actualizaron los montos de la proforma
        self.proforma.refresh_from_db()
        expected_subtotal = Decimal('200.00') + Decimal('45.00') + Decimal('360.00')
        self.assertEqual(self.proforma.subtotal, expected_subtotal)
        
    def test_delete_proforma_item(self):
        """Prueba eliminar un ítem de proforma y recalcular los montos"""
        # Guardar montos iniciales
        initial_subtotal = Decimal('245.00')  # 200 + 45
        
        # Recalcular y guardar montos iniciales para comparación
        ProformaService.calculate_amounts(self.proforma, save=True)
        
        # Eliminar el primer ítem
        result = ProformaService.delete_proforma_item(self.item1, recalculate=True)
        
        # Verificar que se eliminó correctamente
        self.assertTrue(result)
        self.assertEqual(ProformaItem.objects.filter(id=self.item1.id).count(), 0)
        
        # Verificar que se actualizaron los montos
        self.proforma.refresh_from_db()
        self.assertEqual(self.proforma.subtotal, Decimal('45.00'))  # Solo queda el item2
    
    def test_change_proforma_state(self):
        """Prueba cambiar el estado de una proforma y actualizar el historial"""
        # Cambiar estado a 'enviada'
        result = ProformaService.change_proforma_state(
            self.proforma, 'enviada', self.user, update_history=True
        )
        
        # Verificar que se cambió correctamente
        self.assertTrue(result)
        self.proforma.refresh_from_db()
        self.assertEqual(self.proforma.estado, 'enviada')
        
        # Verificar que se creó entrada en el historial
        historial = ProformaHistorial.objects.filter(
            proforma=self.proforma, 
            accion='envio',
            estado_anterior='borrador',
            estado_nuevo='enviada'
        )
        self.assertEqual(historial.count(), 1)
        self.assertEqual(historial.first().created_by, self.user)


class ProformaSerializerTest(TestCase):
    """Pruebas para los serializers de Proforma y ProformaItem"""
    
    def setUp(self):
        """Configurar datos básicos para las pruebas"""
        # Crear usuario para las pruebas
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123'
        )
        
        # Crear cliente para las pruebas
        self.cliente = Clientes.objects.create(
            nombre='Cliente Test',
            ruc='1234567890',
            email='cliente@test.com'
        )
        
        # Crear empresa para las pruebas
        self.empresa = EmpresaClc.objects.create(
            nombre='Empresa Test',
            ruc='0987654321'
        )
    
    def test_proforma_item_serializer_validation(self):
        """Prueba validaciones del serializer de ProformaItem"""
        # Crear proforma para los ítems
        proforma = Proforma.objects.create(
            numero='TEST-2025-4000',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            created_by=self.user,
            updated_by=self.user
        )
        
        # Caso 1: Datos válidos
        data_valido = {
            'proforma': proforma.id,
            'tipo_item': 'personalizado',
            'descripcion': 'Item Test',
            'cantidad': 2,
            'precio_unitario': '100.00',
            'porcentaje_descuento': 0
        }
        
        serializer = ProformaItemSerializer(data=data_valido)
        self.assertTrue(serializer.is_valid())
        
        # Caso 2: Cantidad inválida
        data_invalido = {
            'proforma': proforma.id,
            'tipo_item': 'personalizado',
            'descripcion': 'Item Test',
            'cantidad': 0,  # Inválido
            'precio_unitario': '100.00',
            'porcentaje_descuento': 0
        }
        
        serializer = ProformaItemSerializer(data=data_invalido)
        self.assertFalse(serializer.is_valid())
        self.assertIn('cantidad', serializer.errors)
        
        # Caso 3: Porcentaje de descuento fuera de rango
        data_invalido = {
            'proforma': proforma.id,
            'tipo_item': 'personalizado',
            'descripcion': 'Item Test',
            'cantidad': 1,
            'precio_unitario': '100.00',
            'porcentaje_descuento': 101  # Inválido
        }
        
        serializer = ProformaItemSerializer(data=data_invalido)
        self.assertFalse(serializer.is_valid())
        self.assertIn('porcentaje_descuento', serializer.errors)
    
    def test_proforma_serializer_create_with_items(self):
        """Prueba crear una proforma con ítems usando el serializer"""
        # Datos para crear proforma con ítems
        data = {
            'numero': 'TEST-2025-5000',
            'fecha_emision': timezone.now().date().isoformat(),
            'fecha_vencimiento': (timezone.now().date() + datetime.timedelta(days=15)).isoformat(),
            'cliente': self.cliente.id,
            'empresa': self.empresa.id,
            'porcentaje_impuesto': 12,
            'items_data': [
                {
                    'tipo_item': 'personalizado',
                    'descripcion': 'Item 1 Serializer',
                    'cantidad': 2,
                    'precio_unitario': '100.00',
                    'porcentaje_descuento': 0
                },
                {
                    'tipo_item': 'personalizado',
                    'descripcion': 'Item 2 Serializer',
                    'cantidad': 1,
                    'precio_unitario': '50.00',
                    'porcentaje_descuento': 10
                }
            ]
        }
        
        # Crear contexto con request y usuario
        request = RequestFactory().post('/fake-url/')
        request.user = self.user
        
        serializer = ProformaSerializer(data=data, context={'request': request})
        
        # Verificar que los datos son válidos
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        # Guardar proforma
        proforma = serializer.save(created_by=self.user, updated_by=self.user)
        
        # Verificar que se creó correctamente
        self.assertEqual(proforma.numero, 'TEST-2025-5000')
        self.assertEqual(proforma.cliente, self.cliente)
        self.assertEqual(proforma.empresa, self.empresa)
        
        # Verificar que se crearon los ítems
        items = ProformaItem.objects.filter(proforma=proforma)
        self.assertEqual(items.count(), 2)
        
        # Verificar que se calcularon los montos correctamente
        self.assertEqual(proforma.subtotal, Decimal('245.00'))  # 200 + 45
        self.assertEqual(proforma.impuesto, Decimal('29.40'))  # 245 * 0.12
        self.assertEqual(proforma.total, Decimal('274.40'))  # 245 + 29.4
    
    def test_proforma_serializer_update_with_items(self):
        """Prueba actualizar una proforma y sus ítems usando el serializer"""
        # Crear proforma para actualizar
        proforma = Proforma.objects.create(
            numero='TEST-2025-6000',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            porcentaje_impuesto=12,
            created_by=self.user,
            updated_by=self.user
        )
        
        # Crear ítem inicial
        item = ProformaItem.objects.create(
            proforma=proforma,
            tipo_item='personalizado',
            descripcion='Item Original',
            cantidad=1,
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=0,
            total=Decimal('100.00')
        )
        
        # Calcular montos iniciales
        ProformaService.calculate_amounts(proforma, save=True)
        
        # Datos para actualizar
        data = {
            'nombre': 'Proforma Actualizada',
            'porcentaje_impuesto': 15,  # Cambio del porcentaje
            'items_data': [
                {
                    'id': item.id,  # Actualizar ítem existente
                    'tipo_item': 'personalizado',
                    'descripcion': 'Item Actualizado',
                    'cantidad': 2,  # Cambio de cantidad
                    'precio_unitario': '100.00',
                    'porcentaje_descuento': 0
                },
                {
                    'tipo_item': 'personalizado',
                    'descripcion': 'Item Nuevo',
                    'cantidad': 1,
                    'precio_unitario': '150.00',
                    'porcentaje_descuento': 0
                }
            ]
        }
        
        # Crear contexto con request y usuario
        request = RequestFactory().put('/fake-url/')
        request.user = self.user
        
        serializer = ProformaSerializer(proforma, data=data, partial=True, context={'request': request})
        
        # Verificar que los datos son válidos
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        # Actualizar proforma
        proforma_actualizada = serializer.save(updated_by=self.user)
        
        # Verificar que se actualizó correctamente
        self.assertEqual(proforma_actualizada.nombre, 'Proforma Actualizada')
        self.assertEqual(proforma_actualizada.porcentaje_impuesto, 15)
        
        # Verificar que se actualizaron los ítems
        items = ProformaItem.objects.filter(proforma=proforma_actualizada)
        self.assertEqual(items.count(), 2)
        
        item_actualizado = items.get(id=item.id)
        self.assertEqual(item_actualizado.descripcion, 'Item Actualizado')
        self.assertEqual(item_actualizado.cantidad, 2)
        
        item_nuevo = items.exclude(id=item.id).first()
        self.assertEqual(item_nuevo.descripcion, 'Item Nuevo')
        
        # Verificar que se calcularon los montos correctamente
        self.assertEqual(proforma_actualizada.subtotal, Decimal('350.00'))  # 2*100 + 1*150
        self.assertEqual(proforma_actualizada.impuesto, Decimal('52.50'))  # 350 * 0.15
        self.assertEqual(proforma_actualizada.total, Decimal('402.50'))  # 350 + 52.5


class ProformaPermissionTest(APITestCase):
    """Pruebas para los permisos personalizados del módulo de proformas"""
    
    def setUp(self):
        """Configurar datos básicos para las pruebas de permisos"""
        # Crear usuarios para los diferentes roles
        self.admin_user = User.objects.create_user(
            username='admin_user',
            email='admin@example.com',
            password='password123'
        )
        
        self.vendedor_user = User.objects.create_user(
            username='vendedor_user',
            email='vendedor@example.com',
            password='password123'
        )
        
        self.supervisor_user = User.objects.create_user(
            username='supervisor_user',
            email='supervisor@example.com',
            password='password123'
        )
        
        self.administrativo_user = User.objects.create_user(
            username='administrativo_user',
            email='administrativo@example.com',
            password='password123'
        )
        
        # Crear grupos y asignar permisos
        from proformas.permissions import setup_proforma_permissions
        setup_proforma_permissions()
        
        # Asignar usuarios a grupos
        from django.contrib.auth.models import Group
        vendedor_group = Group.objects.get(name='Vendedor')
        supervisor_group = Group.objects.get(name='Supervisor')
        administrativo_group = Group.objects.get(name='Administrativo')
        
        self.vendedor_user.groups.add(vendedor_group)
        self.supervisor_user.groups.add(supervisor_group)
        self.administrativo_user.groups.add(administrativo_group)
        
        # Crear cliente y empresa para las proformas
        self.cliente = Clientes.objects.create(
            nombre='Cliente Test',
            ruc='1234567890',
            email='cliente@test.com'
        )
        
        self.empresa = EmpresaClc.objects.create(
            nombre='Empresa Test',
            ruc='0987654321'
        )
        
        # Crear proformas con diferentes estados
        self.proforma_borrador = Proforma.objects.create(
            numero='TEST-2025-8001',
            nombre='Proforma Borrador',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            estado='borrador',
            created_by=self.vendedor_user,
            updated_by=self.vendedor_user
        )
        
        self.proforma_enviada = Proforma.objects.create(
            numero='TEST-2025-8002',
            nombre='Proforma Enviada',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            estado='enviada',
            created_by=self.vendedor_user,
            updated_by=self.vendedor_user
        )
        
        self.proforma_aprobada = Proforma.objects.create(
            numero='TEST-2025-8003',
            nombre='Proforma Aprobada',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            estado='aprobada',
            created_by=self.vendedor_user,
            updated_by=self.vendedor_user
        )
        
        # Crear ítem para proforma borrador
        self.item = ProformaItem.objects.create(
            proforma=self.proforma_borrador,
            tipo_item='personalizado',
            descripcion='Item Test',
            cantidad=1,
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=0,
            total=Decimal('100.00')
        )
        
        # Factory para simular requests
        self.factory = APIRequestFactory()
    
    def test_vendedor_permissions(self):
        """Prueba permisos para usuarios con rol Vendedor"""
        # 1. Puede ver todas las proformas
        request = self.factory.get('/api/proformas/')
        force_authenticate(request, user=self.vendedor_user)
        view = ProformaViewSet.as_view({'get': 'list'})
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 2. Puede crear nuevas proformas
        data = {
            'fecha_emision': timezone.now().date().isoformat(),
            'fecha_vencimiento': (timezone.now().date() + datetime.timedelta(days=15)).isoformat(),
            'cliente': self.cliente.id,
            'empresa': self.empresa.id
        }
        request = self.factory.post('/api/proformas/', data, format='json')
        force_authenticate(request, user=self.vendedor_user)
        view = ProformaViewSet.as_view({'post': 'create'})
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 3. Puede editar sus propias proformas en borrador
        data = {'nombre': 'Proforma Actualizada por Vendedor'}
        request = self.factory.patch(f'/api/proformas/{self.proforma_borrador.id}/', data, format='json')
        force_authenticate(request, user=self.vendedor_user)
        view = ProformaViewSet.as_view({'patch': 'partial_update'})
        response = view(request, pk=self.proforma_borrador.id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. No puede editar proformas que no están en borrador
        data = {'nombre': 'Intento de Actualización de Enviada'}
        request = self.factory.patch(f'/api/proformas/{self.proforma_enviada.id}/', data, format='json')
        force_authenticate(request, user=self.vendedor_user)
        view = ProformaViewSet.as_view({'patch': 'partial_update'})
        response = view(request, pk=self.proforma_enviada.id)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # 5. Puede enviar proformas en borrador
        data = {'estado': 'enviada'}
        request = self.factory.post(f'/api/proformas/{self.proforma_borrador.id}/enviar/', {}, format='json')
        force_authenticate(request, user=self.vendedor_user)
        view = ProformaViewSet.as_view({'post': 'enviar'})
        response = view(request, pk=self.proforma_borrador.id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 6. No puede aprobar proformas
        request = self.factory.post(f'/api/proformas/{self.proforma_enviada.id}/aprobar/', {}, format='json')
        force_authenticate(request, user=self.vendedor_user)
        view = ProformaViewSet.as_view({'post': 'aprobar'})
        response = view(request, pk=self.proforma_enviada.id)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # 7. No puede convertir proformas
        request = self.factory.post(f'/api/proformas/{self.proforma_aprobada.id}/convertir/', {}, format='json')
        force_authenticate(request, user=self.vendedor_user)
        view = ProformaViewSet.as_view({'post': 'convertir'})
        response = view(request, pk=self.proforma_aprobada.id)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_supervisor_permissions(self):
        """Prueba permisos para usuarios con rol Supervisor"""
        # 1. Puede ver todas las proformas
        request = self.factory.get('/api/proformas/')
        force_authenticate(request, user=self.supervisor_user)
        view = ProformaViewSet.as_view({'get': 'list'})
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 2. Puede editar cualquier proforma (incluso las que no creó)
        data = {'nombre': 'Proforma Actualizada por Supervisor'}
        request = self.factory.patch(f'/api/proformas/{self.proforma_borrador.id}/', data, format='json')
        force_authenticate(request, user=self.supervisor_user)
        view = ProformaViewSet.as_view({'patch': 'partial_update'})
        response = view(request, pk=self.proforma_borrador.id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 3. Puede aprobar proformas enviadas
        request = self.factory.post(f'/api/proformas/{self.proforma_enviada.id}/aprobar/', {}, format='json')
        force_authenticate(request, user=self.supervisor_user)
        view = ProformaViewSet.as_view({'post': 'aprobar'})
        response = view(request, pk=self.proforma_enviada.id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. Puede convertir proformas aprobadas
        request = self.factory.post(f'/api/proformas/{self.proforma_aprobada.id}/convertir/', {}, format='json')
        force_authenticate(request, user=self.supervisor_user)
        view = ProformaViewSet.as_view({'post': 'convertir'})
        response = view(request, pk=self.proforma_aprobada.id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_administrativo_permissions(self):
        """Prueba permisos para usuarios con rol Administrativo"""
        # 1. Puede ver todas las proformas
        request = self.factory.get('/api/proformas/')
        force_authenticate(request, user=self.administrativo_user)
        view = ProformaViewSet.as_view({'get': 'list'})
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 2. No puede crear proformas
        data = {
            'fecha_emision': timezone.now().date().isoformat(),
            'fecha_vencimiento': (timezone.now().date() + datetime.timedelta(days=15)).isoformat(),
            'cliente': self.cliente.id,
            'empresa': self.empresa.id
        }
        request = self.factory.post('/api/proformas/', data, format='json')
        force_authenticate(request, user=self.administrativo_user)
        view = ProformaViewSet.as_view({'post': 'create'})
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # 3. No puede editar proformas
        data = {'nombre': 'Intento de Actualización por Administrativo'}
        request = self.factory.patch(f'/api/proformas/{self.proforma_borrador.id}/', data, format='json')
        force_authenticate(request, user=self.administrativo_user)
        view = ProformaViewSet.as_view({'patch': 'partial_update'})
        response = view(request, pk=self.proforma_borrador.id)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # 4. Puede aprobar proformas enviadas
        request = self.factory.post(f'/api/proformas/{self.proforma_enviada.id}/aprobar/', {}, format='json')
        force_authenticate(request, user=self.administrativo_user)
        view = ProformaViewSet.as_view({'post': 'aprobar'})
        response = view(request, pk=self.proforma_enviada.id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 5. Puede rechazar proformas enviadas
        request = self.factory.post(f'/api/proformas/{self.proforma_enviada.id}/rechazar/', {}, format='json')
        force_authenticate(request, user=self.administrativo_user)
        view = ProformaViewSet.as_view({'post': 'rechazar'})
        response = view(request, pk=self.proforma_enviada.id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 6. No puede convertir proformas
        request = self.factory.post(f'/api/proformas/{self.proforma_aprobada.id}/convertir/', {}, format='json')
        force_authenticate(request, user=self.administrativo_user)
        view = ProformaViewSet.as_view({'post': 'convertir'})
        response = view(request, pk=self.proforma_aprobada.id)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_proforma_item_permissions(self):
        """Prueba permisos para gestión de ítems de proformas"""
        # 1. Vendedor puede añadir ítems a sus propias proformas en borrador
        data = {
            'proforma': self.proforma_borrador.id,
            'tipo_item': 'personalizado',
            'descripcion': 'Nuevo Item Test',
            'cantidad': 1,
            'precio_unitario': '100.00',
            'porcentaje_descuento': 0
        }
        request = self.factory.post('/api/proforma-items/', data, format='json')
        force_authenticate(request, user=self.vendedor_user)
        view = ProformaItemViewSet.as_view({'post': 'create'})
        response = view(request)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 2. Vendedor no puede modificar ítems de proformas que no están en borrador
        data = {'descripcion': 'Intento de modificación en proforma enviada'}
        request = self.factory.patch(f'/api/proforma-items/{self.item.id}/', data, format='json')
        force_authenticate(request, user=self.vendedor_user)
        
        # Primero cambiar el estado de la proforma del ítem a enviada
        self.proforma_borrador.estado = 'enviada'
        self.proforma_borrador.save()
        
        view = ProformaItemViewSet.as_view({'patch': 'partial_update'})
        response = view(request, pk=self.item.id)
        
        # Volver a estado borrador para otras pruebas
        self.proforma_borrador.estado = 'borrador'
        self.proforma_borrador.save()
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # 3. Supervisor puede modificar ítems de cualquier proforma en borrador
        data = {'descripcion': 'Item Modificado por Supervisor'}
        request = self.factory.patch(f'/api/proforma-items/{self.item.id}/', data, format='json')
        force_authenticate(request, user=self.supervisor_user)
        view = ProformaItemViewSet.as_view({'patch': 'partial_update'})
        response = view(request, pk=self.item.id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. Administrativo no puede modificar ítems
        data = {'descripcion': 'Intento de modificación por administrativo'}
        request = self.factory.patch(f'/api/proforma-items/{self.item.id}/', data, format='json')
        force_authenticate(request, user=self.administrativo_user)
        view = ProformaItemViewSet.as_view({'patch': 'partial_update'})
        response = view(request, pk=self.item.id)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ProformaCacheTest(TestCase):
    """Pruebas para el sistema de caché de proformas"""
    
    def setUp(self):
        """Configurar datos básicos para las pruebas de caché"""
        # Limpiar caché al inicio
        from django.core.cache import cache
        cache.clear()
        
        # Crear usuario para las pruebas
        self.user = User.objects.create_user(
            username='cacheuser',
            email='cache@example.com',
            password='password123'
        )
        
        # Crear cliente y empresa para proformas
        self.cliente = Clientes.objects.create(
            nombre="Cliente Prueba Cache",
            ruc="0912345678001",
            direccion="Dirección de prueba para caché",
            telefono="0991234567",
            email="clientecache@example.com"
        )
        
        self.empresa = EmpresaClc.objects.create(
            nombre="Empresa Prueba Cache",
            ruc="0987654321001",
            direccion="Dirección empresa prueba caché"
        )
        
        # Crear algunas proformas de prueba
        self.proformas = []
        for i in range(5):
            proforma = Proforma.objects.create(
                numero=f"TEST-CACHE-{i+1}",
                nombre=f"Proforma Cache Test {i+1}",
                fecha_emision=timezone.now().date(),
                fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
                cliente=self.cliente,
                empresa=self.empresa,
                porcentaje_impuesto=12.0,
                estado='borrador',
                created_by=self.user,
                updated_by=self.user
            )
            self.proformas.append(proforma)
            
            # Agregar algunos ítems a las proformas
            for j in range(3):
                ProformaItem.objects.create(
                    proforma=proforma,
                    tipo_item='producto',
                    descripcion=f"Item {j+1} de Proforma {i+1}",
                    codigo=f"ITEM-{i+1}-{j+1}",
                    unidad="Unidad",
                    cantidad=j+1,
                    precio_unitario=100.0,
                    porcentaje_descuento=0,
                    total=(j+1) * 100.0,
                    orden=j+1
                )
    
    def test_dashboard_cache_key_generation(self):
        """Prueba la generación de claves de caché para el dashboard"""
        from .cache import get_dashboard_cache_key
        
        # Generar claves con diferentes parámetros
        params1 = {'start_date': '2023-01-01', 'end_date': '2023-12-31'}
        params2 = {'cliente_id': '1', 'estado': 'borrador'}
        params3 = {'start_date': '2023-01-01', 'end_date': '2023-12-31', 'cliente_id': '1'}
        
        # Verificar que son diferentes
        key1 = get_dashboard_cache_key(params1)
        key2 = get_dashboard_cache_key(params2)
        key3 = get_dashboard_cache_key(params3)
        
        self.assertNotEqual(key1, key2)
        self.assertNotEqual(key1, key3)
        self.assertNotEqual(key2, key3)
        
        # Verificar que el orden no importa
        params4 = {'end_date': '2023-12-31', 'start_date': '2023-01-01'}
        key4 = get_dashboard_cache_key(params4)
        self.assertEqual(key1, key4)
    
    def test_cache_dashboard_data(self):
        """Prueba la función de caché de datos del dashboard"""
        from .cache import get_dashboard_cache_key, cache_dashboard_data
        from django.core.cache import cache
        
        # Datos de prueba
        params = {'start_date': '2023-01-01', 'end_date': '2023-12-31'}
        data = {'total_proformas': 100, 'por_estado': {'borrador': 50, 'enviada': 30, 'aprobada': 20}}
        
        # Guardar en caché
        cache_dashboard_data(params, data)
        
        # Verificar que se guarda correctamente
        key = get_dashboard_cache_key(params)
        cached_data = cache.get(key)
        
        self.assertIsNotNone(cached_data)
        self.assertEqual(cached_data, data)
    
    def test_invalidate_dashboard_cache(self):
        """Prueba la invalidación de caché del dashboard"""
        from .cache import get_dashboard_cache_key, cache_dashboard_data, invalidate_dashboard_cache
        from django.core.cache import cache
        
        # Guardar varios datos en caché
        params1 = {'start_date': '2023-01-01', 'end_date': '2023-12-31'}
        params2 = {'cliente_id': '1', 'estado': 'borrador'}
        
        data = {'total_proformas': 100, 'por_estado': {'borrador': 50, 'enviada': 30, 'aprobada': 20}}
        
        cache_dashboard_data(params1, data)
        cache_dashboard_data(params2, data)
        
        # Verificar que ambos están en caché
        key1 = get_dashboard_cache_key(params1)
        key2 = get_dashboard_cache_key(params2)
        
        self.assertIsNotNone(cache.get(key1))
        self.assertIsNotNone(cache.get(key2))
        
        # Invalidar caché
        invalidate_dashboard_cache()
        
        # Verificar que se eliminaron ambos
        self.assertIsNone(cache.get(key1))
        self.assertIsNone(cache.get(key2))


class ProformaDashboardAPITest(APITestCase):
    """Pruebas de integración para el API con caché del dashboard"""
    
    def setUp(self):
        """Configurar datos básicos para las pruebas"""
        # Limpiar caché al inicio
        from django.core.cache import cache
        cache.clear()
        
        # Crear usuario y autenticar
        self.user = User.objects.create_user(
            username='apitestuserproformas',
            email='apitestcache@example.com',
            password='complex-password-123',
            is_staff=True
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # Crear cliente y empresa para proformas
        self.cliente = Clientes.objects.create(
            nombre="Cliente API Test",
            ruc="0912345678001",
            direccion="Dirección de prueba API",
            telefono="0991234567",
            email="clienteapi@example.com"
        )
        
        self.empresa = EmpresaClc.objects.create(
            nombre="Empresa API Test",
            ruc="0987654321001",
            direccion="Dirección empresa API test"
        )
        
        # Crear algunas proformas de prueba
        self.proformas = []
        for i in range(5):
            proforma = Proforma.objects.create(
                numero=f"TEST-API-{i+1}",
                nombre=f"Proforma API Test {i+1}",
                fecha_emision=timezone.now().date(),
                fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
                cliente=self.cliente,
                empresa=self.empresa,
                porcentaje_impuesto=12.0,
                estado='borrador' if i < 3 else 'enviada',
                created_by=self.user,
                updated_by=self.user
            )
            self.proformas.append(proforma)
            
            # Agregar algunos ítems a las proformas
            for j in range(3):
                ProformaItem.objects.create(
                    proforma=proforma,
                    tipo_item='producto',
                    descripcion=f"Item {j+1} de Proforma API {i+1}",
                    codigo=f"ITEM-API-{i+1}-{j+1}",
                    unidad="Unidad",
                    cantidad=j+1,
                    precio_unitario=100.0,
                    porcentaje_descuento=0,
                    total=(j+1) * 100.0,
                    orden=j+1
                )
    
    @override_settings(
        # Usar un backend de caché más simple para pruebas
        CACHES={
            'default': {
                'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
                'LOCATION': 'proformas-test',
            }
        },
        # Reducir el TTL para pruebas
        DASHBOARD_CACHE_TTL=2  # 2 segundos
    )
    def test_dashboard_api_uses_cache(self):
        """Verificar que la API del dashboard utiliza el caché"""
        # Primera solicitud - debe llenar el caché
        url = reverse('optimizedproforma-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Segunda solicitud - debe usar el caché
        # (Para verificar, modificamos la base de datos y comprobamos que sigue retornando los datos antiguos)
        # Crear una nueva proforma que no debería aparecer en el dashboard cacheado
        nueva_proforma = Proforma.objects.create(
            numero="TEST-NUEVA-CACHE",
            nombre="Nueva Proforma que no debería estar en caché",
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            porcentaje_impuesto=12.0,
            estado='borrador',
            created_by=self.user,
            updated_by=self.user
        )
        
        # Solicitar el dashboard nuevamente
        response2 = self.client.get(url)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        
        # Verificar que ambas respuestas son iguales (está usando caché)
        self.assertEqual(json.dumps(response.data), json.dumps(response2.data))
        
        # Verificar que podemos forzar un refresco
        response3 = self.client.get(f"{url}?force_refresh=true")
        self.assertEqual(response3.status_code, status.HTTP_200_OK)
        
        # La respuesta con refresco debería ser diferente (incluir la nueva proforma)
        self.assertNotEqual(json.dumps(response.data), json.dumps(response3.data))
        
        # Verificar que el total de proformas ha cambiado
        self.assertEqual(response.data['total_proformas'] + 1, response3.data['total_proformas'])
    
    @override_settings(
        CACHES={
            'default': {
                'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
                'LOCATION': 'proformas-test-invalidation',
            }
        }
    )
    def test_cache_invalidation(self):
        """Verificar que el caché se invalida cuando corresponde"""
        # Primera solicitud - debe llenar el caché
        url = reverse('optimizedproforma-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        initial_count = response.data['total_proformas']
        
        # Crear una nueva proforma que debería invalidar el caché automáticamente
        nueva_proforma = Proforma.objects.create(
            numero="TEST-INVALIDATE-CACHE",
            nombre="Proforma para invalidar caché",
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            porcentaje_impuesto=12.0,
            estado='borrador',
            created_by=self.user,
            updated_by=self.user
        )
        
        # Solicitar el dashboard nuevamente sin force_refresh
        response2 = self.client.get(url)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        
        # Esta vez el caché debe haberse invalidado por el signal al crear la proforma
        # Verificar que el total ha aumentado
        self.assertEqual(initial_count + 1, response2.data['total_proformas'])
        
        # Cambiar el estado de una proforma también debería invalidar el caché
        proforma = self.proformas[0]
        proforma.estado = 'enviada'
        proforma.save()
        
        # Crear un ítem también debería invalidar el caché
        ProformaItem.objects.create(
            proforma=proforma,
            tipo_item='producto',
            descripcion="Item adicional para invalidar caché",
            codigo="ITEM-INVALIDATE-CACHE",
            unidad="Unidad",
            cantidad=10,
            precio_unitario=200.0,
            porcentaje_descuento=5,
            total=1900.0,
            orden=10
        )
        
        # Solicitar dashboard nuevamente
        response3 = self.client.get(url)
        self.assertEqual(response3.status_code, status.HTTP_200_OK)
        
        # Verificar que los datos son diferentes (han cambiado los totales por estado)
        self.assertNotEqual(json.dumps(response2.data['por_estado']), json.dumps(response3.data['por_estado']))


class ProformaAPITest(APITestCase):
    """Pruebas para los endpoints API de proformas"""
    def setUp(self):
        """Configurar datos básicos para las pruebas"""
        # Crear usuario para las pruebas
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123'
        )
        
        # Crear cliente para las pruebas
        self.cliente = Clientes.objects.create(
            nombre='Cliente Test',
            ruc='1234567890',
            email='cliente@test.com'
        )
        
        # Crear empresa para las pruebas
        self.empresa = EmpresaClc.objects.create(
            nombre='Empresa Test',
            ruc='0987654321'
        )
        
        # Crear algunas proformas para pruebas
        self.proforma1 = Proforma.objects.create(
            numero='TEST-2025-7001',
            nombre='Proforma Test 1',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            estado='borrador',
            created_by=self.user,
            updated_by=self.user
        )
        
        self.proforma2 = Proforma.objects.create(
            numero='TEST-2025-7002',
            nombre='Proforma Test 2',
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + datetime.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            estado='enviada',
            created_by=self.user,
            updated_by=self.user
        )
        
        # Crear ítems para las proformas
        self.item1 = ProformaItem.objects.create(
            proforma=self.proforma1,
            tipo_item='personalizado',
            descripcion='Item 1 Proforma 1',
            cantidad=2,
            precio_unitario=Decimal('100.00'),
            porcentaje_descuento=0,
            total=Decimal('200.00')
        )
        
        self.item2 = ProformaItem.objects.create(
            proforma=self.proforma2,
            tipo_item='personalizado',
            descripcion='Item 1 Proforma 2',
            cantidad=1,
            precio_unitario=Decimal('150.00'),
            porcentaje_descuento=0,
            total=Decimal('150.00')
        )
        
        # Calcular montos
        ProformaService.calculate_amounts(self.proforma1, save=True)
        ProformaService.calculate_amounts(self.proforma2, save=True)
        
        # Factory para simular requests
        self.factory = APIRequestFactory()
    
    def test_proforma_list_endpoint(self):
        """Prueba endpoint de listado de proformas"""
        # Crear request
        request = self.factory.get('/api/proformas/')
        force_authenticate(request, user=self.user)
        
        # Obtener vista
        view = ProformaViewSet.as_view({'get': 'list'})
        response = view(request)
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_proforma_detail_endpoint(self):
        """Prueba endpoint de detalle de proforma"""
        # Crear request
        request = self.factory.get(f'/api/proformas/{self.proforma1.id}/')
        force_authenticate(request, user=self.user)
        
        # Obtener vista
        view = ProformaViewSet.as_view({'get': 'retrieve'})
        response = view(request, pk=self.proforma1.id)
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['numero'], self.proforma1.numero)
        self.assertEqual(response.data['estado'], 'borrador')
    
    def test_proforma_create_endpoint(self):
        """Prueba endpoint de creación de proforma"""
        # Datos para crear proforma
        data = {
            'fecha_emision': timezone.now().date().isoformat(),
            'fecha_vencimiento': (timezone.now().date() + datetime.timedelta(days=15)).isoformat(),
            'cliente': self.cliente.id,
            'empresa': self.empresa.id,
            'items_data': [
                {
                    'tipo_item': 'personalizado',
                    'descripcion': 'Item API Test',
                    'cantidad': 1,
                    'precio_unitario': '200.00',
                    'porcentaje_descuento': 0
                }
            ]
        }
        
        # Crear request
        request = self.factory.post('/api/proformas/', data, format='json')
        force_authenticate(request, user=self.user)
        
        # Obtener vista
        view = ProformaViewSet.as_view({'post': 'create'})
        response = view(request)
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('numero', response.data)
        self.assertEqual(response.data['estado'], 'borrador')
        
        # Verificar que se creó el ítem
        proforma_id = response.data['id']
        items = ProformaItem.objects.filter(proforma_id=proforma_id)
        self.assertEqual(items.count(), 1)
        
    def test_proforma_update_endpoint(self):
        """Prueba endpoint de actualización de proforma"""
        # Datos para actualizar
        data = {
            'nombre': 'Proforma Actualizada API',
            'items_data': [
                {
                    'id': self.item1.id,
                    'tipo_item': 'personalizado',
                    'descripcion': 'Item Actualizado API',
                    'cantidad': 3,
                    'precio_unitario': '100.00',
                    'porcentaje_descuento': 0
                }
            ]
        }
        
        # Crear request
        request = self.factory.patch(f'/api/proformas/{self.proforma1.id}/', data, format='json')
        force_authenticate(request, user=self.user)
        
        # Obtener vista
        view = ProformaViewSet.as_view({'patch': 'partial_update'})
        response = view(request, pk=self.proforma1.id)
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Proforma Actualizada API')
        
        # Verificar que se actualizó el ítem
        self.item1.refresh_from_db()
        self.assertEqual(self.item1.descripcion, 'Item Actualizado API')
        self.assertEqual(self.item1.cantidad, 3)
    
    def test_proforma_items_endpoint(self):
        """Prueba endpoint para obtener ítems de una proforma"""
        # Crear request
        request = self.factory.get(f'/api/proformas/{self.proforma1.id}/items/')
        force_authenticate(request, user=self.user)
        
        # Obtener vista
        view = ProformaViewSet.as_view({'get': 'items'})
        response = view(request, pk=self.proforma1.id)
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['descripcion'], 'Item 1 Proforma 1')
    
    def test_proforma_dashboard_endpoint(self):
        """Prueba endpoint de dashboard con estadísticas de proformas"""
        # Crear request
        request = self.factory.get('/api/proformas/dashboard/')
        force_authenticate(request, user=self.user)
        
        # Obtener vista
        view = ProformaViewSet.as_view({'get': 'dashboard'})
        response = view(request)
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_proformas', response.data)
        self.assertIn('por_estado', response.data)
        self.assertEqual(response.data['total_proformas'], 2)
        
        # Verificar estadísticas por estado
        self.assertIn('borrador', response.data['por_estado'])
        self.assertIn('enviada', response.data['por_estado'])
        self.assertEqual(response.data['por_estado']['borrador']['count'], 1)
        self.assertEqual(response.data['por_estado']['enviada']['count'], 1)
    
    def test_cambiar_estado_endpoint(self):
        """Prueba endpoint para cambiar estado de una proforma"""
        # Datos para cambiar estado
        data = {
            'estado': 'enviada'
        }
        
        # Crear request
        request = self.factory.post(f'/api/proformas/{self.proforma1.id}/cambiar_estado/', data, format='json')
        force_authenticate(request, user=self.user)
        
        # Obtener vista
        view = ProformaViewSet.as_view({'post': 'cambiar_estado'})
        response = view(request, pk=self.proforma1.id)
        
        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['estado'], 'enviada')
        
        # Verificar que se actualizó el estado
        self.proforma1.refresh_from_db()
        self.assertEqual(self.proforma1.estado, 'enviada')
        
        # Verificar que se creó entrada en el historial
        historial = ProformaHistorial.objects.filter(
            proforma=self.proforma1,
            accion='envio',
            estado_anterior='borrador',
            estado_nuevo='enviada'
        )
        self.assertEqual(historial.count(), 1)
