"""
Comando para probar las optimizaciones de proformas.

Este comando permite ejecutar rápidamente pruebas comparativas entre
las implementaciones original y optimizada.
"""
import time
import os
from django.core.management.base import BaseCommand
from django.db import connection, reset_queries
from django.conf import settings
from django.urls import reverse
from django.test import RequestFactory
from rest_framework.test import force_authenticate
from django.contrib.auth import get_user_model

from proformas.views import ProformaViewSet
from proformas.views_optimized import OptimizedProformaViewSet
from proformas.models import Proforma


User = get_user_model()


class Command(BaseCommand):
    help = 'Ejecuta pruebas de rendimiento para comparar las implementaciones original y optimizada.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--list',
            action='store_true',
            help='Listar las pruebas disponibles',
        )
        parser.add_argument(
            '--test',
            type=str,
            help='Nombre de la prueba a ejecutar (dashboard, items, historial, all)',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Mostrar información detallada de las consultas',
        )

    def handle(self, *args, **options):
        # Activar DEBUG para poder capturar las consultas
        original_debug = settings.DEBUG
        settings.DEBUG = True

        if options.get('list'):
            self.stdout.write('Pruebas disponibles:')
            self.stdout.write('  - dashboard: Prueba del dashboard')
            self.stdout.write('  - items: Prueba de listado de ítems')
            self.stdout.write('  - historial: Prueba de historial')
            self.stdout.write('  - all: Ejecutar todas las pruebas')
            return

        # Obtener o crear un usuario para las pruebas
        try:
            user = User.objects.get(username='testuser')
        except User.DoesNotExist:
            user = User.objects.create_user('testuser', 'test@example.com', 'password')
            self.stdout.write(self.style.SUCCESS('Usuario de prueba creado'))

        # Determinar qué pruebas ejecutar
        test_name = options.get('test', 'all')
        verbose = options.get('verbose', False)
        
        if test_name == 'dashboard' or test_name == 'all':
            self.test_dashboard(user, verbose)
            
        if test_name == 'items' or test_name == 'all':
            self.test_items(user, verbose)
            
        if test_name == 'historial' or test_name == 'all':
            self.test_historial(user, verbose)

        # Restaurar configuración
        settings.DEBUG = original_debug

    def test_dashboard(self, user, verbose):
        """Ejecuta prueba de rendimiento para el dashboard"""
        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(self.style.HTTP_INFO('PRUEBA DE DASHBOARD'))
        self.stdout.write('=' * 80)
        
        factory = RequestFactory()
        request = factory.get('/api/proformas/dashboard/')
        force_authenticate(request, user=user)
        
        # Probar vista original
        view_original = ProformaViewSet.as_view({'get': 'dashboard'})
        self.stdout.write('Ejecutando versión original...')
        original_result = self.measure_execution(view_original, request, verbose)
        
        # Probar vista optimizada
        view_optimized = OptimizedProformaViewSet.as_view({'get': 'dashboard'})
        self.stdout.write('Ejecutando versión optimizada...')
        optimized_result = self.measure_execution(view_optimized, request, verbose)
        
        # Mostrar resultados
        self.show_comparison('Dashboard', original_result, optimized_result)

    def test_items(self, user, verbose):
        """Ejecuta prueba de rendimiento para listado de ítems"""
        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(self.style.HTTP_INFO('PRUEBA DE LISTADO DE ÍTEMS'))
        self.stdout.write('=' * 80)
        
        # Obtener una proforma para la prueba
        try:
            proforma = Proforma.objects.first()
            if not proforma:
                self.stdout.write(self.style.WARNING('No hay proformas para probar, omitiendo esta prueba.'))
                return
        except:
            self.stdout.write(self.style.WARNING('Error al obtener proforma, omitiendo esta prueba.'))
            return
        
        factory = RequestFactory()
        request = factory.get(f'/api/proformas/proformas/{proforma.pk}/items/')
        force_authenticate(request, user=user)
        
        # Probar vista original
        view_original = ProformaViewSet.as_view({'get': 'items'})
        self.stdout.write('Ejecutando versión original...')
        original_result = self.measure_execution(view_original, request, verbose, pk=proforma.pk)
        
        # Probar vista optimizada
        view_optimized = OptimizedProformaViewSet.as_view({'get': 'items'})
        self.stdout.write('Ejecutando versión optimizada...')
        optimized_result = self.measure_execution(view_optimized, request, verbose, pk=proforma.pk)
        
        # Mostrar resultados
        self.show_comparison('Listado de Ítems', original_result, optimized_result)

    def test_historial(self, user, verbose):
        """Ejecuta prueba de rendimiento para historial"""
        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(self.style.HTTP_INFO('PRUEBA DE HISTORIAL'))
        self.stdout.write('=' * 80)
        
        # Obtener una proforma para la prueba
        try:
            proforma = Proforma.objects.first()
            if not proforma:
                self.stdout.write(self.style.WARNING('No hay proformas para probar, omitiendo esta prueba.'))
                return
        except:
            self.stdout.write(self.style.WARNING('Error al obtener proforma, omitiendo esta prueba.'))
            return
        
        factory = RequestFactory()
        request = factory.get(f'/api/proformas/proformas/{proforma.pk}/historial/')
        force_authenticate(request, user=user)
        
        # Probar vista original
        view_original = ProformaViewSet.as_view({'get': 'historial'})
        self.stdout.write('Ejecutando versión original...')
        original_result = self.measure_execution(view_original, request, verbose, pk=proforma.pk)
        
        # Probar vista optimizada
        view_optimized = OptimizedProformaViewSet.as_view({'get': 'historial'})
        self.stdout.write('Ejecutando versión optimizada...')
        optimized_result = self.measure_execution(view_optimized, request, verbose, pk=proforma.pk)
        
        # Mostrar resultados
        self.show_comparison('Historial', original_result, optimized_result)

    def measure_execution(self, view_func, request, verbose=False, **kwargs):
        """Mide el tiempo de ejecución y el número de consultas"""
        reset_queries()
        
        start_time = time.time()
        response = view_func(request, **kwargs)
        end_time = time.time()
        
        execution_time = end_time - start_time
        query_count = len(connection.queries)
        
        if verbose:
            self.stdout.write(f"Consultas ejecutadas ({query_count}):")
            for i, query in enumerate(connection.queries, 1):
                self.stdout.write(f"  Query {i}: {query['sql']}")
                self.stdout.write(f"  Tiempo: {query['time']}")
                self.stdout.write("-" * 40)
        
        return {
            'execution_time': execution_time,
            'query_count': query_count,
            'status_code': response.status_code,
        }

    def show_comparison(self, test_name, original, optimized):
        """Muestra la comparación entre las versiones original y optimizada"""
        if original['status_code'] != 200 or optimized['status_code'] != 200:
            self.stdout.write(self.style.ERROR(
                f"Error: Original status {original['status_code']}, "
                f"Optimizado status {optimized['status_code']}"
            ))
            return
        
        time_improvement = original['execution_time'] / optimized['execution_time'] if optimized['execution_time'] > 0 else 0
        query_improvement = original['query_count'] / optimized['query_count'] if optimized['query_count'] > 0 else 0
        
        self.stdout.write(self.style.SUCCESS(f"Resultados para {test_name}:"))
        self.stdout.write("-" * 60)
        self.stdout.write(f"Original:   {original['execution_time']:.4f}s, {original['query_count']} consultas")
        self.stdout.write(f"Optimizado: {optimized['execution_time']:.4f}s, {optimized['query_count']} consultas")
        self.stdout.write("-" * 60)
        self.stdout.write(self.style.SUCCESS(
            f"Mejora: {time_improvement:.2f}x más rápido, "
            f"{query_improvement:.2f}x menos consultas"
        ))
        self.stdout.write("-" * 60)