"""
Comando para configurar los permisos y roles necesarios para el módulo de proformas.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth.models import User
from proformas.permissions import setup_proforma_permissions


class Command(BaseCommand):
    help = 'Configura los permisos y roles necesarios para el módulo de proformas'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Iniciando configuración de permisos para proformas...'))
        
        with transaction.atomic():
            # Configurar permisos
            setup_proforma_permissions()
            
            # Verificar que se hayan creado los grupos
            from django.contrib.auth.models import Group
            groups = Group.objects.filter(name__in=['Vendedor', 'Supervisor', 'Administrativo'])
            for group in groups:
                self.stdout.write(self.style.SUCCESS(f"Grupo '{group.name}' configurado con {group.permissions.count()} permisos"))
        
        self.stdout.write(self.style.SUCCESS('Configuración de permisos completada con éxito'))