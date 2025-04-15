from django.contrib import admin
from django.utils.translation import gettext_lazy as _

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
    Vendedores,
    Contactos,
    RelacionesBlue
)

@admin.register(Categorias)
class CategoriasAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code', 'level', 'path', 'is_active')
    list_filter = ('level', 'is_active')
    search_fields = ('nombre', 'code')
    ordering = ['level', 'nombre']

@admin.register(Ciudades)
class CiudadesAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'provincia', 'code')
    list_filter = ('provincia',)
    search_fields = ('nombre', 'provincia', 'code')

@admin.register(EmpresaClc)
class EmpresaClcAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'razon_social', 'ruc', 'correo', 'telefono')
    search_fields = ('nombre', 'razon_social', 'ruc')

@admin.register(Especialidades)
class EspecialidadesAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code')
    search_fields = ('nombre', 'code')

@admin.register(Marca)
class MarcaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code', 'proveedores', 'country_origin', 'is_active')
    list_filter = ('is_active', 'country_origin')
    search_fields = ('nombre', 'code', 'proveedores')

@admin.register(Procedencia)
class ProcedenciaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code')
    search_fields = ('nombre', 'code')

@admin.register(TipoCliente)
class TipoClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre',)
    search_fields = ('nombre',)

@admin.register(TipoContratacion)
class TipoContratacionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code')
    search_fields = ('nombre', 'code')

@admin.register(Unidades)
class UnidadesAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code')
    search_fields = ('nombre', 'code')

@admin.register(Zonas)
class ZonasAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code')
    search_fields = ('nombre', 'code')

@admin.register(Pandora)
class PandoraAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'code')
    search_fields = ('nombre', 'code')

@admin.register(Clientes)
class ClientesAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'razon_social', 'ruc', 'ciudad', 'zona', 'tipo_cliente', 'activo')
    list_filter = ('activo', 'zona', 'ciudad', 'tipo_cliente')
    search_fields = ('nombre', 'razon_social', 'ruc', 'alias')
    fieldsets = (
        (_('Información Básica'), {
            'fields': (('nombre', 'alias'), 'razon_social', 'ruc')
        }),
        (_('Ubicación y Tipo'), {
            'fields': ('zona', 'ciudad', 'tipo_cliente', 'direccion')
        }),
        (_('Contacto'), {
            'fields': ('email', 'telefono')
        }),
        (_('Estado'), {
            'fields': ('activo',)
        }),
    )

@admin.register(PreciosSie)
class PreciosSieAdmin(admin.ModelAdmin):
    list_display = ('pandora', 'cliente', 'detalle_sie', 'precio', 'fecha_sie')
    list_filter = ('cliente', 'fecha_sie')
    search_fields = ('pandora__nombre', 'cliente__nombre', 'detalle_sie__nombre')
    date_hierarchy = 'fecha_sie'

@admin.register(MsPref)
class MsPrefAdmin(admin.ModelAdmin):
    list_display = ('sku', 'nombre_generico', 'categoria', 'especialidad', 'normada')
    list_filter = ('normada', 'categoria', 'especialidad')
    search_fields = ('sku', 'nombre_generico')

@admin.register(Proveedores)
class ProveedoresAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'razon_social', 'ruc', 'correo', 'telefono', 'tipo_primario', 'activo')
    list_filter = ('activo', 'tipo_primario')
    search_fields = ('nombre', 'razon_social', 'ruc')

@admin.register(Procesos_auditados)
class Procesos_auditadosAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'objeto')
    search_fields = ('nombre', 'objeto', 'description')

@admin.register(Vendedores)
class VendedoresAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'proveedor', 'correo', 'telefono', 'activo')
    list_filter = ('activo', 'proveedor')
    search_fields = ('nombre', 'correo', 'proveedor__nombre')

@admin.register(Contactos)
class ContactosAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'alias', 'email', 'telefono', 'ingerencia')
    search_fields = ('nombre', 'alias', 'email', 'ingerencia')

@admin.register(RelacionesBlue)
class RelacionesBlueAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'contacto', 'nivel')
    list_filter = ('nivel', 'cliente', 'contacto')
    search_fields = ('cliente__nombre', 'contacto__nombre')


