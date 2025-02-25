# products/admin.py
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    Product, ProductoOfertado, ProductoDisponible,
    PriceList, ProductPrice, StockMovement,
    PriceHistory, ProductChange, RelatedProduct,
    ProductDocument
)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'nombre', 'categorias', 'marca',
        'base_price', 'stock', 'status'
    ]
    list_filter = ['status', 'categorias', 'marca', 'is_active']
    search_fields = ['code', 'nombre', 'description', 'sku', 'barcode']
    fieldsets = (
        ('Información Básica', {
            'fields': (
                'code', 'nombre', 'description',
                'categorias', 'marca', 'unidades', 'procedencia'
            )
        }),
        ('Información Comercial', {
            'fields': (
                'base_price', 'cost_price', 'suggested_price'
            )
        }),
        ('Control de Inventario', {
            'fields': (
                'stock', 'min_stock', 'max_stock', 'reorder_point'
            )
        }),
        ('Especificaciones Técnicas', {
            'fields': ('technical_specs', 'dimensions', 'weight'),
            'classes': ('collapse',)
        }),
        ('Control y Seguimiento', {
            'fields': ('sku', 'barcode', 'location')
        }),
        ('Estado', {
            'fields': (
                'is_active', 'is_sellable', 'is_purchasable', 'status'
            )
        })
    )

@admin.register(ProductoOfertado)
class ProductoOfertadoAdmin(admin.ModelAdmin):
    list_display = ['code', 'nombre', 'id_categoria', 'cudim', 'especialidad', 'is_active']
    list_filter = ['id_categoria', 'especialidad', 'is_active']
    search_fields = ['code', 'cudim', 'nombre', 'descripcion', 'referencias']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': (
                'id_categoria',
                'code',
                'cudim',
                'nombre',
                'descripcion'
            )
        }),
        (_('Additional Information'), {
            'fields': (
                'especialidad',
                'referencias',
                'is_active'
            )
        }),
        (_('System Information'), {
            'fields': (
                'created_at',
                'updated_at',
                'created_by',
                'updated_by'
            ),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(ProductoDisponible)
class ProductoDisponibleAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'nombre', 'id_producto_ofertado', 'id_marca',
        'tz_oferta', 'tz_demanda', 'precio_sie_referencial'
    ]
    list_filter = ['id_categoria', 'id_marca', 'is_active']
    search_fields = ['code', 'nombre', 'modelo', 'referencia']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': (
                'id_categoria',
                'id_producto_ofertado',
                'code',
                'nombre',
                'id_marca',
                'modelo',
                'presentacion',
                'referencia'
            )
        }),
        (_('Ratings'), {
            'fields': (
                'tz_oferta',
                'tz_demanda',
                'tz_inflacion',
                'tz_calidad',
                'tz_eficiencia',
                'tz_referencial'
            )
        }),
        (_('Pricing'), {
            'fields': (
                'costo_referencial',
                'precio_sie_referencial',
                'precio_sie_tipob',
                'precio_venta_privado'
            )
        }),
        (_('Status'), {
            'fields': ('is_active',)
        }),
        (_('System Information'), {
            'fields': (
                'created_at',
                'updated_at',
                'created_by',
                'updated_by'
            ),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(PriceList)
class PriceListAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'nombre', 'markup_percentage',
        'is_active', 'valid_from', 'valid_to'
    ]
    list_filter = ['is_active']
    search_fields = ['code', 'nombre', 'description']

@admin.register(ProductPrice)
class ProductPriceAdmin(admin.ModelAdmin):
    list_display = ['product', 'price_list', 'price', 'valid_from', 'valid_to']
    list_filter = ['price_list', 'valid_from', 'valid_to']
    search_fields = ['product__code', 'product__nombre']

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['product', 'movement_type', 'quantity', 'created_at']
    list_filter = ['movement_type', 'created_at']
    search_fields = ['product__code', 'product__nombre', 'notes']

@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    """
    Se eliminan las referencias a 'change_date'.
    Usamos 'created_at' (TimeStampedModel) para mostrar la fecha de creación.
    """
    list_display = ['product', 'price_type', 'old_price', 'new_price', 'created_at']
    list_filter = ['price_type', 'created_at']
    search_fields = ['product__code', 'product__nombre']

@admin.register(ProductChange)
class ProductChangeAdmin(admin.ModelAdmin):
    """
    Se eliminan referencias a 'changed_at'.
    Usamos 'created_at' en su lugar.
    También mantenemos 'changed_by' si existe en el modelo.
    """
    list_display = ['product', 'field_name', 'created_at', 'changed_by']
    list_filter = ['field_name', 'created_at']
    search_fields = ['product__code', 'product__nombre', 'old_value', 'new_value']

@admin.register(RelatedProduct)
class RelatedProductAdmin(admin.ModelAdmin):
    list_display = ['product', 'related_product', 'relationship_type']
    list_filter = ['relationship_type']
    search_fields = ['product__code', 'related_product__code']

@admin.register(ProductDocument)
class ProductDocumentAdmin(admin.ModelAdmin):
    """
    Se elimina la referencia a 'uploaded_at'.
    Usamos 'created_at' en su lugar (TimeStampedModel).
    """
    list_display = ['product', 'document_type', 'file_name', 'created_at', 'is_active']
    list_filter = ['document_type', 'is_active', 'created_at']
    search_fields = ['product__code', 'file_name', 'description']
