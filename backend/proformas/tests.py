from django.test import TestCase
from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import datetime

from .models import Proforma, SecuenciaProforma, ProformaItem, ProformaHistorial
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
