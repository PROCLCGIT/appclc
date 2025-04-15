# backend/brief/admin.py
from django.contrib import admin
from .models import Brief, BriefItems


class BriefItemsInline(admin.TabularInline):
    model = BriefItems
    extra = 1
    fields = ('nombre', 'descripcion', 'unidad', 'cantidad')


@admin.register(Brief)
class BriefAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'cliente', 'fecha', 'presupuestoref', 'origen')
    list_filter = ('fecha', 'cliente', 'origen')
    search_fields = ('codigo', 'cliente__nombre', 'observaciones')
    date_hierarchy = 'fecha'
    inlines = [BriefItemsInline]
    fieldsets = (
        (None, {
            'fields': ('codigo', 'cliente', 'fecha')
        }),
        ('Detalles del Brief', {
            'fields': ('origen', 'presupuestoref', 'observaciones')
        }),
    )


@admin.register(BriefItems)
class BriefItemsAdmin(admin.ModelAdmin):
    list_display = ('id_brief', 'nombre', 'unidad', 'cantidad')
    list_filter = ('id_brief', 'unidad')
    search_fields = ('nombre', 'descripcion', 'id_brief__codigo')
    # Usamos raw_id_fields en lugar de autocomplete_fields para evitar el error
    raw_id_fields = ['id_brief', 'unidad']