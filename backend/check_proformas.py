import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appclc.settings')
django.setup()

from proformas.models import Proforma

proformas = Proforma.objects.all()
print(f"Total proformas: {proformas.count()}")

for p in proformas:
    cliente_nombre = p.cliente.nombre if p.cliente else "None"
    print(f'ID: {p.id}, Número: {p.numero}, Estado: {p.estado}, Cliente: {cliente_nombre}, Fecha: {p.fecha_emision}')