#!/usr/bin/env python
import os
import sys

# Configurar settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appclc.settings')

import django
django.setup()

from django.urls import get_resolver
from django.core.management import call_command

# Mostrar todas las URLs
print("=== Todas las URLs del proyecto ===")
for pattern in get_resolver().url_patterns:
    print(f"Pattern: {pattern.pattern} - {pattern}")
    
# Verificar las URLs de docmanager
print("\n=== Verificando URLs de docmanager ===")
api_pattern = None
for pattern in get_resolver().url_patterns:
    if 'api/v1' in str(pattern.pattern):
        api_pattern = pattern
        break

if api_pattern:
    for api_url in api_pattern.url_patterns:
        print(f"API URL: {api_url.pattern}")
        if 'docmanager' in str(api_url.pattern):
            print(f"DOCMANAGER FOUND: {api_url}")
            for doc_url in api_url.url_patterns:
                print(f" - {doc_url.pattern}")
else:
    print("API v1 pattern not found")

# Verificar estado de la aplicación
print("\n=== Estado de la aplicación docmanager ===")
call_command('check', 'docmanager')