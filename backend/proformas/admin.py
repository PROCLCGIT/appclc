# proformas/admin.py
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Proforma, ProformaItem, ProformaHistory

class ProformaItemInline(admin.TabularInline):
    model = ProformaItem
    extra = 1
    fields = ['product', 'description', 'quantity', 'unit_price', 'discount_percentage', 'total']
    readonly_fields = ['total']

class ProformaHistoryInline(admin.TabularInline):
    model = ProformaHistory
    extra = 0
    readonly_fields = ['created_at', 'user', 'action', 'details']
    can_delete = False
    max_num = 0

    def has_add_permission(self, request, obj=None):
        return False

@admin.register(Proforma)
class ProformaAdmin(admin.ModelAdmin):
    list_display = ['number', 'client', 'created_at', 'valid_until', 'status', 'total']
    list_filter = ['status', 'created_at', 'sales_person']
    search_fields = ['number', 'client__nombre', 'notes']
    inlines = [ProformaItemInline, ProformaHistoryInline]
    
    fieldsets = (
        ('Información General', {
            'fields': ('client', 'valid_until', 'status')
        }),
        ('Información Comercial', {
            'fields': ('payment_terms', 'delivery_time', 'sales_person')
        }),
        ('Notas y Términos', {
            'fields': ('notes', 'terms_conditions'),
            'classes': ('collapse',)
        }),
        ('Información del Sistema', {
            'fields': ('number', 'subtotal', 'tax', 'total'),
            'classes': ('collapse',),
        })
    )
    
    readonly_fields = ['number', 'subtotal', 'tax', 'total']

    def save_model(self, request, obj, form, change):
        if not change:  # Si es una nueva proforma
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(ProformaHistory)
class ProformaHistoryAdmin(admin.ModelAdmin):
    list_display = ['proforma', 'action', 'user', 'created_at']
    list_filter = ['action', 'created_at', 'user']
    search_fields = ['proforma__number', 'details']
    readonly_fields = ['proforma', 'user', 'action', 'details', 'created_at']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False