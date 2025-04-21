"""
Comando para verificar y corregir potenciales problemas con los números de proforma
"""
import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from django.db.models import Count

from proformas.models import Proforma

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Verifica y corrige problemas con los números de proforma'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fix',
            action='store_true',
            help='Corregir los problemas encontrados automáticamente',
        )
        parser.add_argument(
            '--check-sequence',
            action='store_true',
            help='Verificar secuencia de numeración',
        )
        parser.add_argument(
            '--check-duplicates',
            action='store_true',
            help='Verificar números duplicados',
        )
        parser.add_argument(
            '--check-format',
            action='store_true',
            help='Verificar formato de números',
        )

    def handle(self, *args, **options):
        fix_mode = options['fix']
        check_all = not (options['check_sequence'] or options['check_duplicates'] or options['check_format'])
        
        # Determinar qué verificaciones realizar
        check_sequence = options['check_sequence'] or check_all
        check_duplicates = options['check_duplicates'] or check_all
        check_format = options['check_format'] or check_all
        
        self.stdout.write(self.style.NOTICE('Iniciando verificación de proformas...'))
        
        # Contadores para estadísticas
        stats = {
            'total_proformas': Proforma.objects.count(),
            'duplicados': 0,
            'formato_invalido': 0,
            'secuencia_problemas': 0,
            'corregidos': 0
        }
        
        # 1. Verificar números duplicados
        if check_duplicates:
            self.stdout.write('Verificando números duplicados...')
            duplicados = Proforma.objects.values('numero').annotate(
                count=Count('numero')
            ).filter(count__gt=1)
            
            stats['duplicados'] = len(duplicados)
            
            if duplicados:
                self.stdout.write(self.style.WARNING(
                    f'Se encontraron {len(duplicados)} números de proforma duplicados!'
                ))
                
                for dup in duplicados:
                    numero = dup['numero']
                    proformas = Proforma.objects.filter(numero=numero).order_by('id')
                    self.stdout.write(f'  - Número "{numero}" utilizado {dup["count"]} veces (IDs: {", ".join(str(p.id) for p in proformas)})')
                    
                    # Corregir duplicados si fix_mode está activado
                    if fix_mode:
                        self.fix_duplicates(proformas)
                        stats['corregidos'] += dup['count'] - 1
            else:
                self.stdout.write(self.style.SUCCESS('No se encontraron números duplicados.'))
        
        # 2. Verificar formato de números
        if check_format:
            self.stdout.write('Verificando formato de números...')
            # Formato esperado: PRO-YYYY-NNNN
            import re
            pattern = r'^PRO-\d{4}-\d{4}$'
            
            invalid_format = Proforma.objects.exclude(numero__regex=pattern)
            stats['formato_invalido'] = invalid_format.count()
            
            if invalid_format:
                self.stdout.write(self.style.WARNING(
                    f'Se encontraron {invalid_format.count()} proformas con formato incorrecto!'
                ))
                
                for p in invalid_format:
                    self.stdout.write(f'  - ID {p.id}: "{p.numero}" (formato incorrecto)')
                    
                    # Corregir formato si fix_mode está activado
                    if fix_mode:
                        self.fix_format(p)
                        stats['corregidos'] += 1
            else:
                self.stdout.write(self.style.SUCCESS('Todos los números tienen el formato correcto.'))
        
        # 3. Verificar secuencia de numeración
        if check_sequence:
            self.stdout.write('Verificando secuencia de numeración...')
            current_year = timezone.now().year
            
            # Obtener proformas del año actual ordenadas por número
            proformas_year = Proforma.objects.filter(
                numero__startswith=f'PRO-{current_year}-'
            ).order_by('id')
            
            if proformas_year:
                # Verificar secuencia
                sequence_issues = []
                last_number = None
                
                for p in proformas_year:
                    try:
                        # Extraer número secuencial
                        current_number = int(p.numero.split('-')[-1])
                        
                        if last_number is not None and current_number != last_number + 1:
                            # Hay un salto en la secuencia
                            sequence_issues.append((p, last_number, current_number))
                        
                        last_number = current_number
                    except (ValueError, IndexError):
                        # Error al extraer número, se reportará en la verificación de formato
                        pass
                
                stats['secuencia_problemas'] = len(sequence_issues)
                
                if sequence_issues:
                    self.stdout.write(self.style.WARNING(
                        f'Se encontraron {len(sequence_issues)} problemas de secuencia!'
                    ))
                    
                    for p, prev, curr in sequence_issues:
                        self.stdout.write(f'  - ID {p.id}: Salto de secuencia {prev} a {curr} (esperado {prev+1})')
                        
                    # No corregimos automáticamente problemas de secuencia, solo informamos
                else:
                    self.stdout.write(self.style.SUCCESS('La secuencia de numeración es correcta.'))
            else:
                self.stdout.write('No hay proformas del año actual para verificar secuencia.')
        
        # Mostrar resumen de la verificación
        self.stdout.write(self.style.NOTICE('\nResumen de la verificación:'))
        self.stdout.write(f'Total de proformas: {stats["total_proformas"]}')
        self.stdout.write(f'Números duplicados: {stats["duplicados"]}')
        self.stdout.write(f'Formato incorrecto: {stats["formato_invalido"]}')
        self.stdout.write(f'Problemas de secuencia: {stats["secuencia_problemas"]}')
        
        if fix_mode:
            self.stdout.write(f'Proformas corregidas: {stats["corregidos"]}')
            self.stdout.write(self.style.SUCCESS('\nVerificación y corrección completada.'))
        else:
            self.stdout.write(self.style.SUCCESS('\nVerificación completada.'))
            
            if stats["duplicados"] + stats["formato_invalido"] > 0:
                self.stdout.write(self.style.WARNING(
                    'Ejecute el comando con --fix para corregir los problemas automáticamente.'
                ))
    
    @transaction.atomic
    def fix_duplicates(self, proformas):
        """Corrige proformas con números duplicados"""
        # Dejar la primera proforma con el número original
        first = True
        for proforma in proformas:
            if first:
                # Mantener el número de la primera proforma
                self.stdout.write(f'    - Manteniendo ID {proforma.id} con número "{proforma.numero}"')
                first = False
            else:
                # Generar nuevo número para las demás
                old_number = proforma.numero
                proforma.numero = ''  # Limpiar para que se genere automáticamente
                proforma.save()  # Esto generará un nuevo número
                self.stdout.write(f'    - ID {proforma.id}: Cambiado de "{old_number}" a "{proforma.numero}"')
    
    @transaction.atomic
    def fix_format(self, proforma):
        """Corrige el formato del número de una proforma"""
        old_number = proforma.numero
        
        # Verificar si el número tiene el formato PRO-YYYY-NNNN pero con errores
        import re
        if re.match(r'^PRO-\d{4}-\d+$', old_number):
            # El formato es similar, pero puede tener un número con menos de 4 dígitos
            try:
                year = old_number.split('-')[1]
                number = old_number.split('-')[2]
                corrected = f'PRO-{year}-{int(number):04d}'
                proforma.numero = corrected
                proforma.save(update_fields=['numero'])
                self.stdout.write(f'    - ID {proforma.id}: Corregido de "{old_number}" a "{corrected}"')
                return
            except (IndexError, ValueError):
                pass
        
        # Si el formato no se puede corregir, generar uno nuevo
        proforma.numero = ''  # Limpiar para que se genere automáticamente
        proforma.save()  # Esto generará un nuevo número
        self.stdout.write(f'    - ID {proforma.id}: Cambiado de "{old_number}" a "{proforma.numero}"')
