from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import Proforma, ProformaItem, ProformaHistorial, ConfiguracionProforma


class ProformaItemInline(admin.TabularInline):
    model = ProformaItem
    extra = 1
    fields = ('tipo_item', 'codigo', 'descripcion', 'cantidad', 'precio_unitario', 
              'porcentaje_descuento', 'total')
    readonly_fields = ('total',)


@admin.register(Proforma)
class ProformaAdmin(admin.ModelAdmin):
    list_display = ('numero', 'cliente', 'empresa', 'fecha_emision', 'fecha_vencimiento', 
                   'total', 'estado')
    list_filter = ('estado', 'empresa', 'fecha_emision')
    search_fields = ('numero', 'nombre', 'cliente__nombre', 'notas')
    readonly_fields = ('subtotal', 'impuesto', 'total')
    date_hierarchy = 'fecha_emision'
    inlines = [ProformaItemInline]
    fieldsets = (
        (_('Información Básica'), {
            'fields': (('numero', 'nombre'), ('fecha_emision', 'fecha_vencimiento'), 'estado')
        }),
        (_('Cliente y Empresa'), {
            'fields': ('cliente', 'empresa', 'tipo_contratacion', 'atencion_a')
        }),
        (_('Condiciones'), {
            'fields': ('condiciones_pago', 'tiempo_entrega', 'notas')
        }),
        (_('Montos'), {
            'fields': (('subtotal', 'porcentaje_impuesto', 'impuesto'), 'total')
        }),
    )


@admin.register(ProformaItem)
class ProformaItemAdmin(admin.ModelAdmin):
    list_display = ('proforma', 'descripcion', 'cantidad', 'precio_unitario', 'total')
    list_filter = ('proforma__estado',)
    search_fields = ('descripcion', 'codigo', 'proforma__numero')
    readonly_fields = ('total',)


@admin.register(ProformaHistorial)
class ProformaHistorialAdmin(admin.ModelAdmin):
    list_display = ('proforma', 'accion', 'created_at', 'created_by')
    list_filter = ('accion', 'created_at')
    search_fields = ('proforma__numero', 'notas')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ConfiguracionProforma)
class ConfiguracionProformaAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'empresa_predeterminada', 'dias_validez', 'porcentaje_impuesto_default')
    
    def has_add_permission(self, request):
        # Solo permitir crear una configuración si no existe ninguna
        return not ConfiguracionProforma.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # No permitir eliminar la configuración
        return False
