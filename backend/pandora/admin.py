
# Register your models here.
from django.contrib import admin
from .models import (
    Categorias,
    Ciudades,
    EmpresaClc,
    Especialidades,
    Marca,
    Procedencia,
    TipoCliente,
    TipoContratacion,
    Unidades,
    Zonas,
    Pandora,
    Clientes,
    PreciosSie,
    MsPref,
    Proveedores,
    Procesos_auditados,
    Vendedores
)

# Registra cada uno de tus modelos:
admin.site.register(Categorias)
admin.site.register(Ciudades,)
admin.site.register(EmpresaClc)
admin.site.register(Procesos_auditados)
admin.site.register(Especialidades)
admin.site.register(Marca)
admin.site.register(Procedencia)
admin.site.register(TipoCliente)
admin.site.register(TipoContratacion)
admin.site.register(Unidades)
admin.site.register(Zonas)
admin.site.register(Pandora)
admin.site.register(Clientes)
admin.site.register(PreciosSie)
admin.site.register(MsPref)
admin.site.register(Proveedores)
admin.site.register(Vendedores)


