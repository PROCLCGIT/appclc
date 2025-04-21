"""
Comando para validar la integridad de datos de proformas.

Este comando realiza diversas validaciones de integridad en los datos de proformas,
verificando la coherencia entre totales, items, historial y otros aspectos críticos.
"""
import logging
import csv
import os
from datetime import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db.models import Sum, F, ExpressionWrapper, DecimalField, Count
from django.db import transaction
from django.conf import settings
from django.utils import timezone

from proformas.models import Proforma, ItemProforma, HistorialProforma

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Valida la integridad de datos de proformas y sus relaciones'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fix',
            action='store_true',
            help='Corregir problemas de integridad automáticamente cuando sea posible'
        )
        parser.add_argument(
            '--report',
            action='store_true',
            help='Generar reporte detallado en CSV'
        )
        parser.add_argument(
            '--validate-totals',
            action='store_true',
            help='Validar consistencia de totales y subtotales'
        )
        parser.add_argument(
            '--validate-historial',
            action='store_true',
            help='Validar integridad del historial de proformas'
        )
        parser.add_argument(
            '--validate-items',
            action='store_true',
            help='Validar items de proformas (precios, descuentos, etc.)'
        )
        parser.add_argument(
            '--validate-all',
            action='store_true',
            help='Ejecutar todas las validaciones disponibles'
        )
        parser.add_argument(
            '--proforma-id',
            type=int,
            help='ID de una proforma específica para validar'
        )

    def handle(self, *args, **options):
        self.fix_mode = options['fix']
        self.report_mode = options['report']
        proforma_id = options['proforma_id']
        
        # Determinar qué validaciones realizar
        validate_all = options['validate_all']
        validate_totals = options['validate_totals'] or validate_all
        validate_historial = options['validate_historial'] or validate_all
        validate_items = options['validate_items'] or validate_all
        
        # Si no se especificó ninguna validación, validar todo
        if not any([validate_totals, validate_historial, validate_items, validate_all]):
            validate_totals = validate_historial = validate_items = True
        
        # Obtener queryset base
        if proforma_id:
            queryset = Proforma.objects.filter(id=proforma_id)
            if not queryset.exists():
                self.stdout.write(self.style.ERROR(f'No existe proforma con ID {proforma_id}'))
                return
            self.stdout.write(self.style.NOTICE(f'Validando proforma específica: ID {proforma_id}'))
        else:
            queryset = Proforma.objects.all()
            self.stdout.write(self.style.NOTICE('Validando todas las proformas...'))
        
        # Inicializar informe y contadores
        self.issues = []
        self.stats = {
            'total_proformas': queryset.count(),
            'proformas_con_problemas': 0,
            'totales_inconsistentes': 0,
            'items_invalidos': 0,
            'historial_inconsistente': 0,
            'elementos_corregidos': 0
        }
        
        # Ejecutar validaciones solicitadas
        if validate_totals:
            self.validate_totals(queryset)
        
        if validate_items:
            self.validate_items(queryset)
        
        if validate_historial:
            self.validate_historial(queryset)
        
        # Generar reporte y mostrar estadísticas
        self.show_summary()
        
        if self.report_mode:
            self.generate_report()

    def validate_totals(self, queryset):
        """Valida la consistencia de totales y subtotales"""
        self.stdout.write('Validando totales y subtotales...')
        
        proformas_with_issues = 0
        
        for proforma in queryset.prefetch_related('items'):
            issues_found = False
            
            # Calcular totales manualmente
            items = proforma.items.all()
            calculated_subtotal = Decimal('0.00')
            
            for item in items:
                # Validar precio_total de cada item
                if item.cantidad and item.precio_unitario:
                    # Aplicar descuento si existe
                    discount_factor = Decimal('1.00') - (Decimal(str(item.descuento)) / Decimal('100')) if item.descuento else Decimal('1.00')
                    expected_precio_total = (item.cantidad * item.precio_unitario * discount_factor).quantize(Decimal('0.01'))
                    
                    if abs(item.precio_total - expected_precio_total) > Decimal('0.01'):
                        self.add_issue(
                            proforma.id,
                            'Item con precio total incorrecto',
                            f'Item {item.id}: Precio total registrado {item.precio_total}, '
                            f'calculado {expected_precio_total}'
                        )
                        issues_found = True
                        
                        if self.fix_mode:
                            item.precio_total = expected_precio_total
                            item.save(update_fields=['precio_total'])
                            self.stats['elementos_corregidos'] += 1
                
                calculated_subtotal += item.precio_total or Decimal('0.00')
            
            # Verificar subtotal
            if abs(proforma.subtotal - calculated_subtotal) > Decimal('0.01'):
                self.add_issue(
                    proforma.id,
                    'Subtotal inconsistente',
                    f'Subtotal registrado {proforma.subtotal}, calculado {calculated_subtotal}'
                )
                issues_found = True
                
                if self.fix_mode:
                    proforma.subtotal = calculated_subtotal
                    self.stats['elementos_corregidos'] += 1
            
            # Verificar IVA
            iva_rate = Decimal('0.12')  # 12% estándar
            expected_iva = (calculated_subtotal * iva_rate).quantize(Decimal('0.01'))
            
            if proforma.iva and abs(proforma.iva - expected_iva) > Decimal('0.01'):
                self.add_issue(
                    proforma.id,
                    'IVA inconsistente',
                    f'IVA registrado {proforma.iva}, calculado {expected_iva}'
                )
                issues_found = True
                
                if self.fix_mode:
                    proforma.iva = expected_iva
                    self.stats['elementos_corregidos'] += 1
            
            # Verificar total
            expected_total = (calculated_subtotal + (proforma.iva or Decimal('0.00'))).quantize(Decimal('0.01'))
            
            if abs(proforma.total - expected_total) > Decimal('0.01'):
                self.add_issue(
                    proforma.id,
                    'Total inconsistente',
                    f'Total registrado {proforma.total}, calculado {expected_total}'
                )
                issues_found = True
                
                if self.fix_mode:
                    proforma.total = expected_total
                    self.stats['elementos_corregidos'] += 1
            
            # Guardar cambios si estamos en modo corrección
            if self.fix_mode and issues_found:
                proforma.save(update_fields=['subtotal', 'iva', 'total'])
            
            if issues_found:
                proformas_with_issues += 1
                self.stats['totales_inconsistentes'] += 1
        
        if proformas_with_issues == 0:
            self.stdout.write(self.style.SUCCESS('Todos los totales son consistentes.'))
        else:
            self.stdout.write(self.style.WARNING(
                f'Se encontraron {proformas_with_issues} proformas con totales inconsistentes.'
            ))

    def validate_items(self, queryset):
        """Valida la integridad de los items de proformas"""
        self.stdout.write('Validando items de proformas...')
        
        proformas_with_issues = 0
        
        for proforma in queryset.prefetch_related('items'):
            issues_found = False
            items = proforma.items.all()
            
            # Verificar si hay items
            if not items:
                self.add_issue(
                    proforma.id,
                    'Proforma sin items',
                    'La proforma no tiene items asociados'
                )
                issues_found = True
                self.stats['items_invalidos'] += 1
                continue
            
            for item in items:
                # Validar campos obligatorios
                if not item.descripcion:
                    self.add_issue(
                        proforma.id,
                        'Item sin descripción',
                        f'Item {item.id} no tiene descripción'
                    )
                    issues_found = True
                
                # Validar cantidad
                if item.cantidad is None or item.cantidad <= 0:
                    self.add_issue(
                        proforma.id,
                        'Item con cantidad inválida',
                        f'Item {item.id} tiene cantidad {item.cantidad}'
                    )
                    issues_found = True
                
                # Validar precio unitario
                if item.precio_unitario is None or item.precio_unitario < 0:
                    self.add_issue(
                        proforma.id,
                        'Item con precio unitario inválido',
                        f'Item {item.id} tiene precio unitario {item.precio_unitario}'
                    )
                    issues_found = True
                
                # Validar descuento
                if item.descuento is not None and (item.descuento < 0 or item.descuento > 100):
                    self.add_issue(
                        proforma.id,
                        'Item con descuento inválido',
                        f'Item {item.id} tiene descuento {item.descuento}% (debe estar entre 0-100)'
                    )
                    issues_found = True
                    
                    if self.fix_mode:
                        # Corregir descuento
                        item.descuento = max(0, min(100, item.descuento or 0))
                        item.save(update_fields=['descuento'])
                        self.stats['elementos_corregidos'] += 1
                
                # Validar precio total
                if item.precio_total is None or item.precio_total < 0:
                    self.add_issue(
                        proforma.id,
                        'Item con precio total inválido',
                        f'Item {item.id} tiene precio total {item.precio_total}'
                    )
                    issues_found = True
            
            if issues_found:
                proformas_with_issues += 1
                self.stats['items_invalidos'] += 1
        
        if proformas_with_issues == 0:
            self.stdout.write(self.style.SUCCESS('Todos los items son válidos.'))
        else:
            self.stdout.write(self.style.WARNING(
                f'Se encontraron {proformas_with_issues} proformas con items inválidos.'
            ))

    def validate_historial(self, queryset):
        """Valida la integridad del historial de proformas"""
        self.stdout.write('Validando historial de proformas...')
        
        proformas_with_issues = 0
        
        for proforma in queryset.prefetch_related('historial'):
            issues_found = False
            historial = proforma.historial.all().order_by('fecha')
            
            # Verificar si hay entradas de historial
            if not historial.exists():
                # Solo considerar un problema si la proforma no es reciente (más de 1 día)
                one_day_ago = timezone.now() - timezone.timedelta(days=1)
                if proforma.fecha_creacion and proforma.fecha_creacion < one_day_ago:
                    self.add_issue(
                        proforma.id,
                        'Proforma sin historial',
                        'La proforma no tiene entradas de historial'
                    )
                    issues_found = True
                    
                    # Crear entrada inicial si estamos en modo corrección
                    if self.fix_mode:
                        HistorialProforma.objects.create(
                            proforma=proforma,
                            estado='creada',
                            descripcion='Creación inicial de proforma',
                            fecha=proforma.fecha_creacion or timezone.now()
                        )
                        self.stats['elementos_corregidos'] += 1
            else:
                # Verificar coherencia con estado actual
                ultimo_estado = historial.last().estado
                if ultimo_estado != proforma.estado:
                    self.add_issue(
                        proforma.id,
                        'Estado inconsistente con historial',
                        f'Estado actual: {proforma.estado}, último estado en historial: {ultimo_estado}'
                    )
                    issues_found = True
                    
                    # Corregir si estamos en modo corrección
                    if self.fix_mode:
                        # Priorizar el estado en la proforma
                        HistorialProforma.objects.create(
                            proforma=proforma,
                            estado=proforma.estado,
                            descripcion=f'Corrección automática de estado a {proforma.estado}',
                            fecha=timezone.now()
                        )
                        self.stats['elementos_corregidos'] += 1
                
                # Verificar secuencia temporal correcta
                prev_date = None
                for entry in historial:
                    if prev_date and entry.fecha < prev_date:
                        self.add_issue(
                            proforma.id,
                            'Secuencia temporal incorrecta en historial',
                            f'Entrada {entry.id} tiene fecha {entry.fecha} anterior a {prev_date}'
                        )
                        issues_found = True
                    prev_date = entry.fecha
            
            if issues_found:
                proformas_with_issues += 1
                self.stats['historial_inconsistente'] += 1
        
        if proformas_with_issues == 0:
            self.stdout.write(self.style.SUCCESS('Todo el historial es consistente.'))
        else:
            self.stdout.write(self.style.WARNING(
                f'Se encontraron {proformas_with_issues} proformas con historial inconsistente.'
            ))

    def add_issue(self, proforma_id, issue_type, description):
        """Añade un problema al informe"""
        self.issues.append({
            'proforma_id': proforma_id,
            'tipo': issue_type,
            'descripcion': description,
            'timestamp': timezone.now().isoformat()
        })

    def show_summary(self):
        """Muestra un resumen de los problemas encontrados"""
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.NOTICE('RESUMEN DE VALIDACIÓN DE INTEGRIDAD'))
        self.stdout.write('=' * 70)
        
        self.stdout.write(f"Total de proformas verificadas: {self.stats['total_proformas']}")
        
        total_issues = len(self.issues)
        if total_issues == 0:
            self.stdout.write(self.style.SUCCESS('\n¡No se encontraron problemas de integridad!'))
        else:
            # Calcular número de proformas con problemas (pueden tener múltiples problemas)
            proforma_ids = set(issue['proforma_id'] for issue in self.issues)
            self.stats['proformas_con_problemas'] = len(proforma_ids)
            
            self.stdout.write(self.style.WARNING(
                f"\nSe encontraron {total_issues} problemas de integridad "
                f"en {self.stats['proformas_con_problemas']} proformas:"
            ))
            self.stdout.write(f"- Proformas con totales inconsistentes: {self.stats['totales_inconsistentes']}")
            self.stdout.write(f"- Proformas con items inválidos: {self.stats['items_invalidos']}")
            self.stdout.write(f"- Proformas con historial inconsistente: {self.stats['historial_inconsistente']}")
            
            if self.fix_mode:
                self.stdout.write(f"\nElementos corregidos automáticamente: {self.stats['elementos_corregidos']}")
            else:
                self.stdout.write(self.style.WARNING(
                    '\nEjecute el comando con --fix para corregir los problemas automáticamente.'
                ))

    def generate_report(self):
        """Genera un informe detallado en CSV"""
        if not self.issues:
            self.stdout.write(self.style.SUCCESS('No hay problemas que reportar.'))
            return
        
        # Crear directorio de informes si no existe
        reports_dir = os.path.join(settings.BASE_DIR, 'reports')
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir)
        
        # Generar nombre de archivo con timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = os.path.join(reports_dir, f'proformas_integrity_{timestamp}.csv')
        
        # Escribir informe
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['Proforma ID', 'Tipo de Problema', 'Descripción', 'Timestamp'])
            
            for issue in self.issues:
                writer.writerow([
                    issue['proforma_id'],
                    issue['tipo'],
                    issue['descripcion'],
                    issue['timestamp']
                ])
        
        self.stdout.write(self.style.SUCCESS(f'\nInforme detallado guardado en: {filename}'))