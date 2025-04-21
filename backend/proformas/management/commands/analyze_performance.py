"""
Comando para analizar el rendimiento de las operaciones de proformas.

Este comando genera reportes de rendimiento para diferentes operaciones 
con proformas, identificando cuellos de botella y proporcionando 
recomendaciones para mejorar el rendimiento.
"""
import time
import json
import os
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import connection, reset_queries
from django.conf import settings
from django.test import RequestFactory
from rest_framework.test import force_authenticate
from django.contrib.auth import get_user_model
from django.utils.termcolors import colorize

from proformas.models import Proforma
from proformas.views import ProformaViewSet
from proformas.views_optimized import OptimizedProformaViewSet

User = get_user_model()

class Command(BaseCommand):
    help = 'Analiza el rendimiento de operaciones de proformas y genera reportes detallados'

    def add_arguments(self, parser):
        parser.add_argument(
            '--operation',
            type=str,
            choices=['list', 'detail', 'items', 'historial', 'dashboard', 'all'],
            default='all',
            help='La operación específica a analizar'
        )
        parser.add_argument(
            '--compare',
            action='store_true',
            help='Compara versiones optimizadas con versiones originales'
        )
        parser.add_argument(
            '--save-report',
            action='store_true',
            help='Guarda el reporte en un archivo JSON'
        )
        parser.add_argument(
            '--analyze-queries',
            action='store_true',
            help='Analiza las consultas SQL en busca de problemas comunes'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='Número de elementos a procesar para las operaciones de lista'
        )

    def handle(self, *args, **options):
        # Activar DEBUG para capturar las consultas
        original_debug = settings.DEBUG
        settings.DEBUG = True

        # Determinar qué operaciones analizar
        operation = options['operation']
        compare_mode = options['compare']
        save_report = options['save_report']
        analyze_queries = options['analyze_queries']
        limit = options['limit']

        # Obtener o crear un usuario para las pruebas
        try:
            user = User.objects.get(username='testuser')
        except User.DoesNotExist:
            user = User.objects.create_user('testuser', 'test@example.com', 'password')
            self.stdout.write(self.style.SUCCESS('Usuario de prueba creado'))

        # Inicializar diccionario para el reporte
        report = {
            'timestamp': datetime.now().isoformat(),
            'django_version': django.get_version(),
            'operations': {}
        }

        try:
            factory = RequestFactory()

            # Ejecutar las operaciones seleccionadas
            if operation in ['list', 'all']:
                self.stdout.write(self.style.HTTP_INFO('\nAnalizando operación: list'))
                list_report = self.analyze_list(factory, user, limit, compare_mode, analyze_queries)
                report['operations']['list'] = list_report

            if operation in ['detail', 'all']:
                self.stdout.write(self.style.HTTP_INFO('\nAnalizando operación: detail'))
                detail_report = self.analyze_detail(factory, user, compare_mode, analyze_queries)
                report['operations']['detail'] = detail_report

            if operation in ['items', 'all']:
                self.stdout.write(self.style.HTTP_INFO('\nAnalizando operación: items'))
                items_report = self.analyze_items(factory, user, compare_mode, analyze_queries)
                report['operations']['items'] = items_report

            if operation in ['historial', 'all']:
                self.stdout.write(self.style.HTTP_INFO('\nAnalizando operación: historial'))
                historial_report = self.analyze_historial(factory, user, compare_mode, analyze_queries)
                report['operations']['historial'] = historial_report

            if operation in ['dashboard', 'all']:
                self.stdout.write(self.style.HTTP_INFO('\nAnalizando operación: dashboard'))
                dashboard_report = self.analyze_dashboard(factory, user, compare_mode, analyze_queries)
                report['operations']['dashboard'] = dashboard_report

            # Mostrar resumen global
            self.show_global_summary(report)

            # Generar recomendaciones basadas en el análisis
            if analyze_queries:
                recommendations = self.generate_recommendations(report)
                report['recommendations'] = recommendations
                self.show_recommendations(recommendations)

            # Guardar reporte
            if save_report:
                self.save_performance_report(report)

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error durante la ejecución del análisis: {str(e)}"))
        finally:
            # Restaurar configuración
            settings.DEBUG = original_debug

    def analyze_list(self, factory, user, limit, compare_mode, analyze_queries):
        """Analiza la operación de listar proformas"""
        request = factory.get('/api/proformas/proformas/')
        force_authenticate(request, user=user)
        
        report = {'name': 'Listar Proformas'}
        
        # Analizar versión original
        view_original = ProformaViewSet.as_view({'get': 'list'})
        self.stdout.write('Analizando versión original...')
        original_result = self.measure_execution(view_original, request, analyze_queries)
        report['original'] = original_result
        
        # Analizar versión optimizada si está en modo comparación
        if compare_mode:
            view_optimized = OptimizedProformaViewSet.as_view({'get': 'list'})
            self.stdout.write('Analizando versión optimizada...')
            optimized_result = self.measure_execution(view_optimized, request, analyze_queries)
            report['optimized'] = optimized_result
            
            # Mostrar comparación
            self.show_comparison('Listar Proformas', original_result, optimized_result)
        
        return report

    def analyze_detail(self, factory, user, compare_mode, analyze_queries):
        """Analiza la operación de detalle de proforma"""
        try:
            proforma = Proforma.objects.first()
            if not proforma:
                self.stdout.write(self.style.WARNING('No hay proformas para analizar, omitiendo esta operación.'))
                return {'error': 'No hay proformas disponibles'}
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error al obtener proforma: {str(e)}'))
            return {'error': f'Error al obtener proforma: {str(e)}'}
        
        request = factory.get(f'/api/proformas/proformas/{proforma.pk}/')
        force_authenticate(request, user=user)
        
        report = {'name': 'Detalle de Proforma', 'proforma_id': proforma.pk}
        
        # Analizar versión original
        view_original = ProformaViewSet.as_view({'get': 'retrieve'})
        self.stdout.write('Analizando versión original...')
        original_result = self.measure_execution(view_original, request, analyze_queries, pk=proforma.pk)
        report['original'] = original_result
        
        # Analizar versión optimizada si está en modo comparación
        if compare_mode:
            view_optimized = OptimizedProformaViewSet.as_view({'get': 'retrieve'})
            self.stdout.write('Analizando versión optimizada...')
            optimized_result = self.measure_execution(view_optimized, request, analyze_queries, pk=proforma.pk)
            report['optimized'] = optimized_result
            
            # Mostrar comparación
            self.show_comparison('Detalle de Proforma', original_result, optimized_result)
        
        return report

    def analyze_items(self, factory, user, compare_mode, analyze_queries):
        """Analiza la operación de listar items de proforma"""
        try:
            proforma = Proforma.objects.first()
            if not proforma:
                self.stdout.write(self.style.WARNING('No hay proformas para analizar, omitiendo esta operación.'))
                return {'error': 'No hay proformas disponibles'}
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error al obtener proforma: {str(e)}'))
            return {'error': f'Error al obtener proforma: {str(e)}'}
        
        request = factory.get(f'/api/proformas/proformas/{proforma.pk}/items/')
        force_authenticate(request, user=user)
        
        report = {'name': 'Items de Proforma', 'proforma_id': proforma.pk}
        
        # Analizar versión original
        view_original = ProformaViewSet.as_view({'get': 'items'})
        self.stdout.write('Analizando versión original...')
        original_result = self.measure_execution(view_original, request, analyze_queries, pk=proforma.pk)
        report['original'] = original_result
        
        # Analizar versión optimizada si está en modo comparación
        if compare_mode:
            view_optimized = OptimizedProformaViewSet.as_view({'get': 'items'})
            self.stdout.write('Analizando versión optimizada...')
            optimized_result = self.measure_execution(view_optimized, request, analyze_queries, pk=proforma.pk)
            report['optimized'] = optimized_result
            
            # Mostrar comparación
            self.show_comparison('Items de Proforma', original_result, optimized_result)
        
        return report

    def analyze_historial(self, factory, user, compare_mode, analyze_queries):
        """Analiza la operación de historial de proforma"""
        try:
            proforma = Proforma.objects.first()
            if not proforma:
                self.stdout.write(self.style.WARNING('No hay proformas para analizar, omitiendo esta operación.'))
                return {'error': 'No hay proformas disponibles'}
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error al obtener proforma: {str(e)}'))
            return {'error': f'Error al obtener proforma: {str(e)}'}
        
        request = factory.get(f'/api/proformas/proformas/{proforma.pk}/historial/')
        force_authenticate(request, user=user)
        
        report = {'name': 'Historial de Proforma', 'proforma_id': proforma.pk}
        
        # Analizar versión original
        view_original = ProformaViewSet.as_view({'get': 'historial'})
        self.stdout.write('Analizando versión original...')
        original_result = self.measure_execution(view_original, request, analyze_queries, pk=proforma.pk)
        report['original'] = original_result
        
        # Analizar versión optimizada si está en modo comparación
        if compare_mode:
            view_optimized = OptimizedProformaViewSet.as_view({'get': 'historial'})
            self.stdout.write('Analizando versión optimizada...')
            optimized_result = self.measure_execution(view_optimized, request, analyze_queries, pk=proforma.pk)
            report['optimized'] = optimized_result
            
            # Mostrar comparación
            self.show_comparison('Historial de Proforma', original_result, optimized_result)
        
        return report

    def analyze_dashboard(self, factory, user, compare_mode, analyze_queries):
        """Analiza la operación del dashboard de proformas"""
        request = factory.get('/api/proformas/dashboard/')
        force_authenticate(request, user=user)
        
        report = {'name': 'Dashboard de Proformas'}
        
        # Analizar versión original
        view_original = ProformaViewSet.as_view({'get': 'dashboard'})
        self.stdout.write('Analizando versión original...')
        original_result = self.measure_execution(view_original, request, analyze_queries)
        report['original'] = original_result
        
        # Analizar versión optimizada si está en modo comparación
        if compare_mode:
            view_optimized = OptimizedProformaViewSet.as_view({'get': 'dashboard'})
            self.stdout.write('Analizando versión optimizada...')
            optimized_result = self.measure_execution(view_optimized, request, analyze_queries)
            report['optimized'] = optimized_result
            
            # Mostrar comparación
            self.show_comparison('Dashboard de Proformas', original_result, optimized_result)
        
        return report

    def measure_execution(self, view_func, request, analyze_queries=False, **kwargs):
        """Mide el tiempo de ejecución y analiza las consultas ejecutadas"""
        reset_queries()
        
        start_time = time.time()
        response = view_func(request, **kwargs)
        end_time = time.time()
        
        execution_time = end_time - start_time
        queries = connection.queries.copy()  # Copiar para análisis posterior
        query_count = len(queries)
        
        # Tamaño aproximado de la respuesta en bytes
        response_size = len(response.rendered_content) if hasattr(response, 'rendered_content') else 0
        
        result = {
            'execution_time': execution_time,
            'query_count': query_count,
            'status_code': response.status_code,
            'response_size': response_size
        }
        
        # Analizar consultas en busca de problemas comunes
        if analyze_queries and query_count > 0:
            query_analysis = self.analyze_queries(queries)
            result['query_analysis'] = query_analysis
        
        return result

    def analyze_queries(self, queries):
        """Analiza las consultas SQL en busca de problemas comunes"""
        analysis = {
            'total_queries': len(queries),
            'total_time': sum(float(q.get('time', 0)) for q in queries),
            'unique_queries': len(set(q['sql'] for q in queries)),
            'repeated_queries': 0,
            'select_star_queries': 0,
            'non_indexed_queries': 0,
            'queries_by_type': {
                'SELECT': 0,
                'INSERT': 0,
                'UPDATE': 0,
                'DELETE': 0,
                'OTHER': 0
            },
            'slowest_queries': [],
            'potential_issues': []
        }
        
        # Contar consultas por tipo
        for q in queries:
            sql = q['sql'].strip().upper()
            
            # Determinar tipo de consulta
            if sql.startswith('SELECT'):
                analysis['queries_by_type']['SELECT'] += 1
                
                # Verificar consultas SELECT *
                if ' SELECT * ' in sql or sql.startswith('SELECT *'):
                    analysis['select_star_queries'] += 1
                    
                # Verificar consultas sin WHERE que podrían beneficiarse de índices
                if ' WHERE ' not in sql and ' FROM ' in sql:
                    # Excluir consultas a tablas de sistema o propias del ORM
                    if not any(table in sql for table in ['SQLITE_MASTER', 'INFORMATION_SCHEMA', 'AUTH_USER']):
                        analysis['non_indexed_queries'] += 1
                
            elif sql.startswith('INSERT'):
                analysis['queries_by_type']['INSERT'] += 1
            elif sql.startswith('UPDATE'):
                analysis['queries_by_type']['UPDATE'] += 1
            elif sql.startswith('DELETE'):
                analysis['queries_by_type']['DELETE'] += 1
            else:
                analysis['queries_by_type']['OTHER'] += 1
        
        # Identificar consultas repetidas
        query_counts = {}
        for q in queries:
            sql = q['sql']
            query_counts[sql] = query_counts.get(sql, 0) + 1
        
        repeated = {sql: count for sql, count in query_counts.items() if count > 1}
        analysis['repeated_queries'] = len(repeated)
        
        # Guardar las 5 consultas más lentas
        sorted_queries = sorted(queries, key=lambda q: float(q.get('time', 0)), reverse=True)
        analysis['slowest_queries'] = [{
            'sql': q['sql'],
            'time': float(q.get('time', 0))
        } for q in sorted_queries[:5]]
        
        # Identificar potenciales problemas
        if analysis['repeated_queries'] > 10:
            analysis['potential_issues'].append({
                'type': 'repetición',
                'description': f'Hay {analysis["repeated_queries"]} consultas repetidas. Considere utilizar select_related/prefetch_related.'
            })
        
        if analysis['select_star_queries'] > 0:
            analysis['potential_issues'].append({
                'type': 'select_star',
                'description': f'Hay {analysis["select_star_queries"]} consultas usando SELECT *. Especifique solo las columnas necesarias.'
            })
        
        if analysis['non_indexed_queries'] > 3:
            analysis['potential_issues'].append({
                'type': 'no_indice',
                'description': f'Hay {analysis["non_indexed_queries"]} consultas sin WHERE que podrían beneficiarse de índices.'
            })
        
        return analysis

    def show_comparison(self, test_name, original, optimized):
        """Muestra la comparación entre las versiones original y optimizada"""
        if original.get('status_code') != 200 or optimized.get('status_code') != 200:
            self.stdout.write(self.style.ERROR(
                f"Error: Original status {original.get('status_code')}, "
                f"Optimizado status {optimized.get('status_code')}"
            ))
            return
        
        time_improvement = original['execution_time'] / optimized['execution_time'] if optimized['execution_time'] > 0 else 0
        query_improvement = (original['query_count'] / optimized['query_count'] 
                            if optimized['query_count'] > 0 else float('inf'))
        
        size_diff = optimized['response_size'] - original['response_size']
        size_percent = (size_diff / original['response_size'] * 100 
                       if original['response_size'] > 0 else 0)
        
        self.stdout.write(self.style.SUCCESS(f"Resultados para {test_name}:"))
        self.stdout.write("-" * 60)
        self.stdout.write(f"Original:   {original['execution_time']:.4f}s, {original['query_count']} consultas, {original['response_size']/1024:.2f} KB")
        self.stdout.write(f"Optimizado: {optimized['execution_time']:.4f}s, {optimized['query_count']} consultas, {optimized['response_size']/1024:.2f} KB")
        self.stdout.write("-" * 60)
        
        time_msg = f"{time_improvement:.2f}x más rápido"
        if time_improvement < 1:
            time_msg = f"{1/time_improvement:.2f}x más lento"
        
        query_msg = f"{query_improvement:.2f}x menos consultas"
        if query_improvement < 1:
            query_msg = f"{1/query_improvement:.2f}x más consultas"
        
        size_msg = f"Respuesta {'mayor' if size_diff > 0 else 'menor'} en {abs(size_percent):.1f}%"
        
        self.stdout.write(self.style.SUCCESS(f"Mejora en tiempo: {time_msg}"))
        self.stdout.write(self.style.SUCCESS(f"Mejora en consultas: {query_msg}"))
        self.stdout.write(self.style.SUCCESS(f"Cambio en tamaño: {size_msg}"))
        self.stdout.write("-" * 60)

    def show_global_summary(self, report):
        """Muestra un resumen global de todas las operaciones analizadas"""
        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(self.style.SUCCESS('RESUMEN GLOBAL DE RENDIMIENTO'))
        self.stdout.write('=' * 80)
        
        # Tabla de resultados
        headers = ['Operación', 'Tiempo (s)', 'Consultas', 'Estado']
        self.stdout.write(f"{headers[0]:<20} {headers[1]:<15} {headers[2]:<15} {headers[3]:<10}")
        self.stdout.write('-' * 60)
        
        for op_name, op_data in report['operations'].items():
            if 'error' in op_data:
                self.stdout.write(f"{op_name:<20} {'N/A':<15} {'N/A':<15} {'ERROR':<10}")
                continue
                
            original = op_data.get('original', {})
            time_val = f"{original.get('execution_time', 0):.4f}"
            queries = str(original.get('query_count', 'N/A'))
            status = 'OK' if original.get('status_code') == 200 else 'ERROR'
            
            self.stdout.write(f"{op_name:<20} {time_val:<15} {queries:<15} {status:<10}")
        
        self.stdout.write('=' * 80)

    def generate_recommendations(self, report):
        """Genera recomendaciones basadas en el análisis de rendimiento"""
        recommendations = []
        
        # Analizar problemas de consultas repetidas
        repeated_ops = []
        for op_name, op_data in report['operations'].items():
            if 'error' in op_data:
                continue
                
            original = op_data.get('original', {})
            query_analysis = original.get('query_analysis', {})
            
            if query_analysis.get('repeated_queries', 0) > 5:
                repeated_ops.append(op_name)
        
        if repeated_ops:
            recommendations.append({
                'priority': 'alta',
                'issue': 'Consultas repetidas',
                'description': f'Las operaciones {", ".join(repeated_ops)} tienen muchas consultas repetidas.',
                'solution': 'Utilice select_related y prefetch_related para reducir el número de consultas.'
            })
        
        # Analizar problemas de SELECT *
        star_ops = []
        for op_name, op_data in report['operations'].items():
            if 'error' in op_data:
                continue
                
            original = op_data.get('original', {})
            query_analysis = original.get('query_analysis', {})
            
            if query_analysis.get('select_star_queries', 0) > 0:
                star_ops.append(op_name)
        
        if star_ops:
            recommendations.append({
                'priority': 'media',
                'issue': 'Uso de SELECT *',
                'description': f'Las operaciones {", ".join(star_ops)} utilizan SELECT * en sus consultas.',
                'solution': 'Especifique solo las columnas necesarias en sus consultas para reducir el tráfico de datos.'
            })
        
        # Analizar operaciones lentas
        slow_ops = []
        for op_name, op_data in report['operations'].items():
            if 'error' in op_data:
                continue
                
            original = op_data.get('original', {})
            if original.get('execution_time', 0) > 1.0:  # Más de 1 segundo
                slow_ops.append((op_name, original.get('execution_time', 0)))
        
        if slow_ops:
            slow_ops.sort(key=lambda x: x[1], reverse=True)
            slow_list = [f"{name} ({time:.2f}s)" for name, time in slow_ops]
            recommendations.append({
                'priority': 'alta',
                'issue': 'Operaciones lentas',
                'description': f'Las siguientes operaciones son lentas: {", ".join(slow_list)}',
                'solution': 'Revise las consultas más lentas y optimice las uniones JOIN o añada índices.'
            })
        
        # Recomendar uso de caché si hay consultas repetidas constantes
        cache_candidate = False
        for op_name, op_data in report['operations'].items():
            if 'error' in op_data:
                continue
                
            original = op_data.get('original', {})
            if original.get('query_count', 0) > 10 and op_name in ['dashboard', 'list']:
                cache_candidate = True
        
        if cache_candidate:
            recommendations.append({
                'priority': 'media',
                'issue': 'Oportunidad de caché',
                'description': 'Operaciones como dashboard y list podrían beneficiarse del uso de caché.',
                'solution': 'Implemente Django Cache Framework para cachear resultados de operaciones frecuentes como dashboard.'
            })
        
        return recommendations

    def show_recommendations(self, recommendations):
        """Muestra las recomendaciones generadas"""
        if not recommendations:
            return
            
        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(self.style.SUCCESS('RECOMENDACIONES DE OPTIMIZACIÓN'))
        self.stdout.write('=' * 80)
        
        for i, rec in enumerate(recommendations, 1):
            priority_color = 'red' if rec['priority'] == 'alta' else 'yellow' if rec['priority'] == 'media' else 'green'
            
            self.stdout.write(f"{i}. {rec['issue']} - " + colorize(f"Prioridad: {rec['priority'].upper()}", fg=priority_color))
            self.stdout.write(f"   Problema: {rec['description']}")
            self.stdout.write(f"   Solución: {rec['solution']}")
            self.stdout.write("")
        
        self.stdout.write('=' * 80)

    def save_performance_report(self, report):
        """Guarda el reporte de rendimiento en un archivo JSON"""
        # Crear directorio reports si no existe
        reports_dir = os.path.join(settings.BASE_DIR, 'reports')
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir)
        
        # Generar nombre de archivo con timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = os.path.join(reports_dir, f'proformas_performance_{timestamp}.json')
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.stdout.write(self.style.SUCCESS(f'\nReporte guardado en: {filename}'))