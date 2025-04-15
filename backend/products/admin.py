# products/admin.py
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    ProductoOfertado, ProductoDisponible,
    ImagenReferenciaProductoOfertado,
    ImagenProductoDisponible, DocumentoProductoDisponible,
    DocumentoProductoOfertado, HistorialDeVentas, HistorialDeCompras,
    ProductsPrice
)


class ImagenReferenciaInline(admin.TabularInline):
    model = ImagenReferenciaProductoOfertado
    extra = 1
    fields = ('imagen', 'descripcion', 'orden', 'is_primary')

@admin.register(ProductoOfertado)
class ProductoOfertadoAdmin(admin.ModelAdmin):
    list_display = ['code', 'nombre', 'id_categoria', 'cudim', 'especialidad', 'is_active']
    list_filter = ['id_categoria', 'especialidad', 'is_active']
    search_fields = ['code', 'cudim', 'nombre', 'descripcion', 'referencias']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    inlines = [ImagenReferenciaInline]
    
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

class ImagenProductoDisponibleInline(admin.TabularInline):
    model = ImagenProductoDisponible
    extra = 1
    fields = ('imagen', 'descripcion', 'orden', 'is_primary')
    
class DocumentoProductoDisponibleInline(admin.TabularInline):
    model = DocumentoProductoDisponible
    extra = 1
    fields = ('documento', 'tipo_documento', 'titulo', 'descripcion', 'is_public')

@admin.register(ProductoDisponible)
class ProductoDisponibleAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'nombre', 'id_producto_ofertado', 'id_marca',
        'tz_oferta', 'tz_demanda', 'precio_sie_referencial'
    ]
    list_filter = ['id_categoria', 'id_marca', 'is_active']
    search_fields = ['code', 'nombre', 'modelo', 'referencia']
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']
    inlines = [ImagenProductoDisponibleInline, DocumentoProductoDisponibleInline]
    
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

    
@admin.register(ImagenReferenciaProductoOfertado)
class ImagenReferenciaProductoOfertadoAdmin(admin.ModelAdmin):
    list_display = ['id', 'producto_ofertado', 'descripcion', 'orden', 'is_primary', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['descripcion', 'producto_ofertado__nombre', 'producto_ofertado__code']
    readonly_fields = ['created_at']

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
        
@admin.register(ImagenProductoDisponible)
class ImagenProductoDisponibleAdmin(admin.ModelAdmin):
    list_display = ['id', 'producto_disponible', 'descripcion', 'orden', 'is_primary', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['descripcion', 'producto_disponible__nombre', 'producto_disponible__code']
    readonly_fields = ['created_at']

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(DocumentoProductoDisponible)
class DocumentoProductoDisponibleAdmin(admin.ModelAdmin):
    list_display = ['id', 'producto_disponible', 'titulo', 'tipo_documento', 'is_public', 'created_at']
    list_filter = ['tipo_documento', 'is_public', 'created_at']
    search_fields = ['titulo', 'descripcion', 'producto_disponible__nombre', 'producto_disponible__code']
    readonly_fields = ['created_at']

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(DocumentoProductoOfertado)
class DocumentoProductoOfertadoAdmin(admin.ModelAdmin):
    list_display = ['id', 'producto_ofertado', 'titulo', 'tipo_documento', 'is_public', 'created_at']
    list_filter = ['tipo_documento', 'is_public', 'created_at']
    search_fields = ['titulo', 'descripcion', 'producto_ofertado__nombre', 'producto_ofertado__code']
    readonly_fields = ['created_at']

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(HistorialDeVentas)
class HistorialDeVentasAdmin(admin.ModelAdmin):
    list_display = ['factura', 'fecha', 'cliente', 'producto', 'cantidad', 'valor', 'iva', 'empresa']
    list_filter = ['fecha', 'cliente', 'empresa']
    search_fields = ['factura', 'producto__nombre', 'cliente__nombre']
    date_hierarchy = 'fecha'
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Información de Venta'), {
            'fields': (
                'factura',
                'fecha',
                'cliente',
                'empresa'
            )
        }),
        (_('Producto y Valores'), {
            'fields': (
                'producto',
                'cantidad',
                'valor',
                'iva'
            )
        }),
        (_('Información del Sistema'), {
            'fields': (
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        }),
    )


@admin.register(HistorialDeCompras)
class HistorialDeComprasAdmin(admin.ModelAdmin):
    list_display = ['factura', 'fecha', 'proveedor', 'producto', 'cantidad', 'valor', 'iva', 'empresa']
    list_filter = ['fecha', 'proveedor', 'empresa']
    search_fields = ['factura', 'producto__nombre', 'proveedor__nombre']
    date_hierarchy = 'fecha'
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Información de Compra'), {
            'fields': (
                'factura',
                'fecha',
                'proveedor',
                'empresa'
            )
        }),
        (_('Producto y Valores'), {
            'fields': (
                'producto',
                'cantidad',
                'valor',
                'iva'
            )
        }),
        (_('Información del Sistema'), {
            'fields': (
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        }),
    )

@admin.register(ProductsPrice)
class ProductsPriceAdmin(admin.ModelAdmin):
    list_display = ['producto_disponible', 'valor', 'created_at']
    list_filter = ['created_at']
    search_fields = ['producto_disponible__nombre', 'producto_disponible__code', 'valor']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (_('Producto y Precio'), {
            'fields': (
                'producto_disponible',
                'valor'
            )
        }),
        (_('Información del Sistema'), {
            'fields': (
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        }),
    )