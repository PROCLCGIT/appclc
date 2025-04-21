"""
Pruebas para verificar las optimizaciones de rendimiento del módulo de proformas.

Este módulo contiene tests específicos para comprobar que las optimizaciones
implementadas funcionan correctamente y mejoran el rendimiento.
"""
import time
import random
from decimal import Decimal
from django.test import TestCase, TransactionTestCase
from django.utils import timezone
from django.db import connection, reset_queries, transaction
from django.conf import settings
from django.contrib.auth import get_user_model

from .models import Proforma, ProformaItem, ProformaHistorial
from .services_optimized import ProformaService
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
        
    def create_test_proforma(self):
        """Crea una proforma de prueba"""
        proforma = Proforma.objects.create(
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + timezone.timedelta(days=15),
            cliente=self.cliente,
            empresa=self.empresa,
            created_by=self.user,
            updated_by=self.user
        )
        return proforma
        
    def create_test_item(self, proforma, recalculate=True):
        """Crea un ítem de prueba"""
        item = ProformaItem.objects.create(
            proforma=proforma,
            tipo_item='personalizado',
            descripcion=f'Item de prueba {random.randint(1, 1000)}',
            cantidad=Decimal(str(random.randint(1, 10))),
            precio_unitario=Decimal(str(random.randint(10, 100))),
            porcentaje_descuento=Decimal(str(random.randint(0, 20))),
            total=Decimal('0')  # Se calculará automáticamente
        )
        return item
        
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


class OptimizedCalculationTest(PerformanceTestBase):
    """Pruebas para el cálculo optimizado de totales"""
    
    def test_single_item_calculation(self):
        """Prueba el cálculo de totales con un solo ítem"""
        proforma = self.create_test_proforma()
        
        # Medir con método tradicional (usando aggregate)
        def traditional_calculation():
            from django.db.models import Sum
            items_sum = proforma.items.aggregate(subtotal_sum=Sum('total'))
            subtotal = items_sum['subtotal_sum'] or Decimal('0')
            impuesto = subtotal * (proforma.porcentaje_impuesto / Decimal('100.0'))
            total = subtotal + impuesto
            proforma.subtotal = subtotal
            proforma.impuesto = impuesto
            proforma.total = total
            proforma.save(update_fields=['subtotal', 'impuesto', 'total'])
            return proforma
        
        # Medir con método optimizado (SQL directo)
        def optimized_calculation():
            ProformaService.calculate_amounts(proforma, save=True)
            return proforma
        
        # Crear ítem para tener algo que calcular
        item = self.create_test_item(proforma, recalculate=False)
        item._totales_actualizados = True  # Evitar recálculo automático
        item.save()
        
        # Ejecutar y medir ambos métodos
        traditional = self.measure_execution(traditional_calculation)
        optimized = self.measure_execution(optimized_calculation)
        
        # Verificar que ambos métodos calculan los mismos valores
        self.assertEqual(traditional['result'].subtotal, optimized['result'].subtotal)
        self.assertEqual(traditional['result'].impuesto, optimized['result'].impuesto)
        self.assertEqual(traditional['result'].total, optimized['result'].total)
        
        # Verificar que el método optimizado usa menos queries
        self.assertLess(optimized['queries'], traditional['queries'],
                        "El método optimizado debería usar menos queries")
        
        # Mostrar resultados para análisis
        print(f"\nCalcular un solo ítem:")
        print(f"Tradicional: {traditional['time']:.4f}s, {traditional['queries']} queries")
        print(f"Optimizado: {optimized['time']:.4f}s, {optimized['queries']} queries")
        print(f"Mejora: {traditional['time']/optimized['time']:.2f}x más rápido")
    
    def test_batch_calculation(self):
        """Prueba el cálculo por lotes de múltiples proformas"""
        # Crear 10 proformas con 5 ítems cada una
        proformas = []
        for i in range(10):
            proforma = self.create_test_proforma()
            for j in range(5):
                item = self.create_test_item(proforma, recalculate=False)
                item._totales_actualizados = True
                item.save()
            proformas.append(proforma)
        
        proforma_ids = [p.id for p in proformas]
        
        # Medir con método tradicional (actualizar una por una)
        def traditional_batch():
            for proforma_id in proforma_ids:
                proforma = Proforma.objects.get(id=proforma_id)
                from django.db.models import Sum
                items_sum = proforma.items.aggregate(subtotal_sum=Sum('total'))
                subtotal = items_sum['subtotal_sum'] or Decimal('0')
                impuesto = subtotal * (proforma.porcentaje_impuesto / Decimal('100.0'))
                total = subtotal + impuesto
                proforma.subtotal = subtotal
                proforma.impuesto = impuesto
                proforma.total = total
                proforma.save(update_fields=['subtotal', 'impuesto', 'total'])
            return len(proforma_ids)
        
        # Medir con método optimizado (SQL en lotes)
        def optimized_batch():
            return ProformaService.calculate_amounts_batch(proforma_ids)
        
        # Ejecutar y medir ambos métodos
        traditional = self.measure_execution(traditional_batch)
        optimized = self.measure_execution(optimized_batch)
        
        # Verificar que ambos métodos actualizan la misma cantidad de proformas
        self.assertEqual(traditional['result'], optimized['result'])
        
        # Verificar que los totales son correctos después de ambos métodos
        # (necesitamos refrescar desde la BD)
        for proforma in proformas:
            proforma.refresh_from_db()
            total_items = sum(item.total for item in proforma.items.all())
            self.assertEqual(proforma.subtotal, total_items)
            expected_impuesto = total_items * (proforma.porcentaje_impuesto / Decimal('100.0'))
            self.assertAlmostEqual(float(proforma.impuesto), float(expected_impuesto), places=2)
            expected_total = total_items + expected_impuesto
            self.assertAlmostEqual(float(proforma.total), float(expected_total), places=2)
        
        # Verificar que el método optimizado usa menos queries
        self.assertLess(optimized['queries'], traditional['queries'],
                        "El método optimizado debería usar menos queries")
        
        # Mostrar resultados para análisis
        print(f"\nCalcular 10 proformas en lote:")
        print(f"Tradicional: {traditional['time']:.4f}s, {traditional['queries']} queries")
        print(f"Optimizado: {optimized['time']:.4f}s, {optimized['queries']} queries")
        print(f"Mejora: {traditional['time']/optimized['time']:.2f}x más rápido")


class BatchOperationsTest(PerformanceTestBase):
    """Pruebas para operaciones masivas optimizadas"""
    
    def test_batch_item_creation(self):
        """Prueba la creación por lotes de ítems"""
        proforma = self.create_test_proforma()
        
        # Preparar 20 ítems para crear
        items = []
        for i in range(20):
            item = ProformaItem(
                proforma=proforma,
                tipo_item='personalizado',
                descripcion=f'Item por lotes {i}',
                cantidad=Decimal(str(random.randint(1, 10))),
                precio_unitario=Decimal(str(random.randint(10, 100))),
                porcentaje_descuento=Decimal(str(random.randint(0, 20))),
                total=Decimal('0')  # Se calculará automáticamente
            )
            items.append(item)
        
        # Medir creación tradicional (uno por uno)
        def traditional_creation():
            saved_items = []
            for item in items:
                # Crear una copia del ítem para no modificar el original
                from copy import copy
                item_copy = copy(item)
                item_copy.save()
                saved_items.append(item_copy)
            return len(saved_items)
        
        # Medir creación optimizada (en lote)
        def optimized_creation():
            # Usar copia de los ítems para no interferir con la prueba tradicional
            from copy import copy
            items_copy = [copy(item) for item in items]
            result = ProformaService.save_proforma_items_batch(items_copy)
            return result[0]  # Número de ítems guardados
        
        # Ejecutar y medir ambos métodos
        with transaction.atomic():  # Usar transacción para evitar guardar los items de verdad
            traditional = self.measure_execution(traditional_creation)
            transaction.set_rollback(True)  # Revertir los cambios pero mantener la medición
        
        with transaction.atomic():
            optimized = self.measure_execution(optimized_creation)
            transaction.set_rollback(True)
        
        # Verificar que ambos métodos crean la misma cantidad de ítems
        self.assertEqual(traditional['result'], optimized['result'])
        
        # Verificar que el método optimizado usa menos queries
        self.assertLess(optimized['queries'], traditional['queries'],
                        "El método optimizado debería usar menos queries")
        
        # Mostrar resultados para análisis
        print(f"\nCrear 20 ítems en lote:")
        print(f"Tradicional: {traditional['time']:.4f}s, {traditional['queries']} queries")
        print(f"Optimizado: {optimized['time']:.4f}s, {optimized['queries']} queries")
        print(f"Mejora: {traditional['time']/optimized['time']:.2f}x más rápido")
    
    def test_batch_item_deletion(self):
        """Prueba la eliminación por lotes de ítems"""
        proforma = self.create_test_proforma()
        
        # Crear 20 ítems para la prueba
        items = []
        for i in range(20):
            item = self.create_test_item(proforma, recalculate=False)
            item._totales_actualizados = True
            item.save()
            items.append(item)
        
        # IDs para recuperar los ítems en cada prueba
        item_ids = [item.id for item in items]
        
        # Medir eliminación tradicional (uno por uno)
        def traditional_deletion():
            deleted_count = 0
            for item_id in item_ids:
                try:
                    item = ProformaItem.objects.get(id=item_id)
                    item.delete()
                    deleted_count += 1
                except Exception:
                    pass
            # Actualizar totales al final
            proforma.refresh_from_db()
            from django.db.models import Sum
            items_sum = proforma.items.aggregate(subtotal_sum=Sum('total'))
            subtotal = items_sum['subtotal_sum'] or Decimal('0')
            impuesto = subtotal * (proforma.porcentaje_impuesto / Decimal('100.0'))
            total = subtotal + impuesto
            proforma.subtotal = subtotal
            proforma.impuesto = impuesto
            proforma.total = total
            proforma.save(update_fields=['subtotal', 'impuesto', 'total'])
            return deleted_count
        
        # Medir eliminación optimizada (en lote)
        def optimized_deletion():
            # Recuperar ítems por ID
            items_to_delete = list(ProformaItem.objects.filter(id__in=item_ids))
            result = ProformaService.delete_proforma_items_batch(items_to_delete)
            return result[0]  # Número de ítems eliminados
        
        # Ejecutar y medir ambos métodos en nuevas transacciones para no interferir
        with transaction.atomic():
            # Crear ítems de nuevo para cada prueba
            for i in range(20):
                item = self.create_test_item(proforma, recalculate=False)
                item._totales_actualizados = True
                item.save()
            # Medir método tradicional
            traditional = self.measure_execution(traditional_deletion)
            transaction.set_rollback(True)
        
        with transaction.atomic():
            # Crear ítems de nuevo para la segunda prueba
            for i in range(20):
                item = self.create_test_item(proforma, recalculate=False)
                item._totales_actualizados = True
                item.save()
            # Medir método optimizado
            optimized = self.measure_execution(optimized_deletion)
            transaction.set_rollback(True)
        
        # Verificar que el método optimizado usa menos queries
        self.assertLess(optimized['queries'], traditional['queries'],
                        "El método optimizado debería usar menos queries")
        
        # Mostrar resultados para análisis
        print(f"\nEliminar 20 ítems en lote:")
        print(f"Tradicional: {traditional['time']:.4f}s, {traditional['queries']} queries")
        print(f"Optimizado: {optimized['time']:.4f}s, {optimized['queries']} queries")
        print(f"Mejora: {traditional['time']/optimized['time']:.2f}x más rápido")


class SimulatedHighVolumeTest(PerformanceTestBase):
    """Pruebas que simulan escenarios de alto volumen"""
    
    def test_simulated_import(self):
        """Simula una importación de datos con muchos ítems"""
        # Esta prueba simula una importación masiva de 50 ítems distribuidos en 5 proformas
        
        # Crear 5 proformas
        proformas = [self.create_test_proforma() for _ in range(5)]
        
        # Preparar 50 ítems (10 para cada proforma)
        items = []
        for proforma in proformas:
            for i in range(10):
                item = ProformaItem(
                    proforma=proforma,
                    tipo_item='personalizado',
                    descripcion=f'Item importado {i}',
                    cantidad=Decimal(str(random.randint(1, 10))),
                    precio_unitario=Decimal(str(random.randint(10, 100))),
                    porcentaje_descuento=Decimal(str(random.randint(0, 20))),
                    total=Decimal('0')  # Se calculará automáticamente
                )
                items.append(item)
        
        # Medir importación tradicional (guardar uno por uno actualizando totales)
        def traditional_import():
            for item in items:
                # Crear copia del ítem para no modificar el original
                from copy import copy
                item_copy = copy(item)
                # Guardar y dejar que los signals actualicen totales
                item_copy.save()
            return len(items)
        
        # Medir importación optimizada (guardar en lote y actualizar al final)
        def optimized_import():
            # Usar copia de los ítems para no interferir
            from copy import copy
            items_copy = [copy(item) for item in items]
            result = ProformaService.save_proforma_items_batch(items_copy)
            return result[0]  # Número de ítems guardados
        
        # Ejecutar y medir ambos métodos
        with transaction.atomic():
            traditional = self.measure_execution(traditional_import)
            transaction.set_rollback(True)
        
        with transaction.atomic():
            optimized = self.measure_execution(optimized_import)
            transaction.set_rollback(True)
        
        # Verificar que ambos métodos importan la misma cantidad de ítems
        self.assertEqual(traditional['result'], optimized['result'])
        
        # Verificar que el método optimizado usa menos queries
        self.assertLess(optimized['queries'], traditional['queries'],
                        "El método optimizado debería usar menos queries")
        
        # Mostrar resultados para análisis
        print(f"\nImportar 50 ítems en 5 proformas:")
        print(f"Tradicional: {traditional['time']:.4f}s, {traditional['queries']} queries")
        print(f"Optimizado: {optimized['time']:.4f}s, {optimized['queries']} queries")
        print(f"Mejora: {traditional['time']/optimized['time']:.2f}x más rápido")