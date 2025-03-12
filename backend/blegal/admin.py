from django.contrib import admin
from .models import Sri, Sercop, Supercom, OtrasInstituciones

class BaseEmpresaAdmin(admin.ModelAdmin):
    """Clase base para administrar los modelos de empresa."""
    list_display = ('empresa', 'ruc', 'usuario', 'correo', 'telefono', 'representante', 'fecha_actualizacion')
    search_fields = ('empresa', 'ruc', 'usuario', 'correo', 'representante')
    list_filter = ('fecha_creacion', 'fecha_actualizacion')
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
    fieldsets = (
        ('Información de Empresa', {
            'fields': ('empresa', 'ruc', 'representante')
        }),
        ('Credenciales', {
            'fields': ('usuario', 'contrasena')
        }),
        ('Contacto', {
            'fields': ('correo', 'telefono')
        }),
        ('Información del Sistema', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )

class SriAdmin(BaseEmpresaAdmin):
    """Administrador para el modelo SRI."""
    list_filter = ('fecha_creacion', 'fecha_actualizacion')

class SercopAdmin(BaseEmpresaAdmin):
    """Administrador para el modelo SERCOP."""
    list_filter = ('fecha_creacion', 'fecha_actualizacion')

class SupercomAdmin(BaseEmpresaAdmin):
    """Administrador para el modelo SUPERCOM."""
    list_filter = ('fecha_creacion', 'fecha_actualizacion')

class OtrasInstitucionesAdmin(BaseEmpresaAdmin):
    """Administrador para el modelo OtrasInstituciones."""
    list_display = ('empresa', 'institucion', 'ruc', 'usuario', 'correo', 'telefono', 'representante', 'fecha_actualizacion')
    search_fields = ('empresa', 'institucion', 'ruc', 'usuario', 'correo', 'representante')
    list_filter = ('institucion', 'fecha_creacion', 'fecha_actualizacion')
    
    fieldsets = (
        ('Información de Empresa', {
            'fields': ('empresa', 'institucion', 'ruc', 'representante')
        }),
        ('Credenciales', {
            'fields': ('usuario', 'contrasena')
        }),
        ('Contacto', {
            'fields': ('correo', 'telefono', 'url')
        }),
        ('Información del Sistema', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )

# Registrar los modelos con el panel de administración
admin.site.register(Sri, SriAdmin)
admin.site.register(Sercop, SercopAdmin)
admin.site.register(Supercom, SupercomAdmin)
admin.site.register(OtrasInstituciones, OtrasInstitucionesAdmin)
