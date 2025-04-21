"""
Comando para inicializar el modelo SecuenciaProforma con datos de las proformas existentes.
Este comando debe ejecutarse después de aplicar la migración que añade el modelo SecuenciaProforma.
"""
import logging
import re
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Max
from django.utils import timezone

from proformas.models import Proforma, SecuenciaProforma

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Inicializa las secuencias de proformas basado en los datos existentes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Forzar la reinicialización de secuencias existentes',
        )

    def handle(self, *args, **options):
        force = options['force']
        
        self.stdout.write(self.style.NOTICE('Inicializando secuencias de proformas...'))
        
        # Obtener años únicos de proformas existentes
        years = set()
        pattern = r'^PRO-(\d{4})-'
        
        proformas = Proforma.objects.all()
        for proforma in proformas:
            match = re.match(pattern, proforma.numero)
            if match:
                years.add(int(match.group(1)))
        
        # Añadir el año actual si no está
        current_year = timezone.now().year
        years.add(current_year)
        
        # Estadísticas para el reporte
        stats = {
            'years_found': len(years),
            'sequences_created': 0,
            'sequences_updated': 0,
            'errors': 0
        }
        
        self.stdout.write(f"Encontrados {len(years)} años distintos para inicializar secuencias")
        
        # Procesar cada año
        for year in sorted(years):
            try:
                with transaction.atomic():
                    # Verificar si ya existe una secuencia para este año
                    sequence_exists = SecuenciaProforma.objects.filter(anio=year).exists()
                    
                    if sequence_exists and not force:
                        self.stdout.write(f"  - Año {year}: Secuencia ya existe, omitiendo (use --force para actualizar)")
                        continue
                    
                    # Buscar el número más alto para el año
                    max_number = 999  # Valor predeterminado
                    year_proformas = proformas.filter(numero__startswith=f'PRO-{year}-')
                    
                    if year_proformas.exists():
                        # Extraer los números y encontrar el máximo
                        numbers = []
                        for p in year_proformas:
                            try:
                                num_part = p.numero.split('-')[-1]
                                # Verificar si es un número válido (no tiene letras)
                                if re.match(r'^\d+$', num_part):
                                    numbers.append(int(num_part))
                            except (ValueError, IndexError):
                                continue
                        
                        if numbers:
                            max_number = max(numbers)
                            self.stdout.write(f"  - Año {year}: Número máximo encontrado: {max_number}")
                    
                    # Crear o actualizar secuencia
                    if sequence_exists:
                        sequence = SecuenciaProforma.objects.get(anio=year)
                        # Solo actualizar si el número nuevo es mayor
                        if max_number > sequence.ultimo_numero:
                            sequence.ultimo_numero = max_number
                            sequence.save(update_fields=['ultimo_numero', 'ultima_actualizacion'])
                            self.stdout.write(self.style.SUCCESS(f"  - Año {year}: Secuencia actualizada a {max_number}"))
                            stats['sequences_updated'] += 1
                        else:
                            self.stdout.write(f"  - Año {year}: Secuencia existente ({sequence.ultimo_numero}) es mayor o igual, no se actualiza")
                    else:
                        sequence = SecuenciaProforma.objects.create(
                            anio=year,
                            ultimo_numero=max_number
                        )
                        self.stdout.write(self.style.SUCCESS(f"  - Año {year}: Secuencia creada con valor {max_number}"))
                        stats['sequences_created'] += 1
            
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  - Error al procesar año {year}: {str(e)}"))
                stats['errors'] += 1
        
        # Mostrar resumen
        self.stdout.write(self.style.NOTICE('\nResumen de inicialización:'))
        self.stdout.write(f"Años encontrados: {stats['years_found']}")
        self.stdout.write(f"Secuencias creadas: {stats['sequences_created']}")
        self.stdout.write(f"Secuencias actualizadas: {stats['sequences_updated']}")
        
        if stats['errors'] > 0:
            self.stdout.write(self.style.ERROR(f"Errores encontrados: {stats['errors']}"))
            self.stdout.write(self.style.WARNING('Revise los logs para más detalles'))
        
        self.stdout.write(self.style.SUCCESS('\nInicialización de secuencias completada.'))
        self.stdout.write(self.style.NOTICE('Recuerde migrar la base de datos ejecutando:'))
        self.stdout.write('  python manage.py migrate proformas')