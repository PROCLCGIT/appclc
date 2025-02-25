# backend/appclc/products/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.core.exceptions import ValidationError

# Importa tu modelo base de timestamps
from pandora.models import TimeStampedModel, Categorias, Marca, Unidades, Procedencia


class Product(TimeStampedModel):
    """Main product model"""
    PRODUCT_STATUS = (
        ('active', _('Active')),
        ('discontinued', _('Discontinued')),
        ('out_of_stock', _('Out of Stock')),
        ('coming_soon', _('Coming Soon')),
    )

    # Basic Information
    code = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    categorias = models.ForeignKey(Categorias, on_delete=models.PROTECT)
    marca = models.ForeignKey(Marca, on_delete=models.PROTECT)
    unidades = models.ForeignKey(Unidades, on_delete=models.PROTECT)
    procedencia = models.ForeignKey(Procedencia, on_delete=models.PROTECT)

    # Commercial Information
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    suggested_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Inventory Control
    stock = models.IntegerField(default=0)
    min_stock = models.IntegerField(default=0)
    max_stock = models.IntegerField(null=True, blank=True)
    reorder_point = models.IntegerField(null=True, blank=True)

    # Technical Specifications
    technical_specs = models.TextField(blank=True)
    dimensions = models.CharField(max_length=100, blank=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Control and Tracking
    sku = models.CharField(max_length=50, blank=True)
    barcode = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=50, blank=True)

    # Status and Control
    is_active = models.BooleanField(default=True)
    is_sellable = models.BooleanField(default=True)
    is_purchasable = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=PRODUCT_STATUS, default='active')

    # Audit
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products_created'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products_updated'
    )

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return f"{self.code} - {self.nombre}"


class ProductoOfertado(TimeStampedModel):
    """Model for offered products catalog"""
    id_categoria = models.ForeignKey(
        Categorias,
        on_delete=models.PROTECT,
        verbose_name=_('Category')
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_('Code')
    )
    cudim = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        verbose_name=_('CUDIM')
    )
    nombre = models.CharField(
        max_length=200,
        verbose_name=_('Name')
    )
    descripcion = models.TextField(
        blank=True,
        verbose_name=_('Description')
    )
    especialidad = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Specialty')
    )
    referencias = models.TextField(
        blank=True,
        verbose_name=_('References')
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Active')
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='productos_ofertados_created',
        verbose_name=_('Created by')
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='productos_ofertados_updated',
        verbose_name=_('Updated by')
    )

    class Meta:
        verbose_name = _('Producto Ofertado')
        verbose_name_plural = _('Productos Ofertados')
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['cudim']),
        ]

    def __str__(self):
        return f"{self.code} - {self.nombre}"

    def save(self, *args, **kwargs):
        if self.code:
            self.code = self.code.upper()
        if self.cudim:
            self.cudim = self.cudim.upper()
        super().save(*args, **kwargs)

    


class ProductoDisponible(TimeStampedModel):
    """Model for available products with pricing and ratings"""
    id_categoria = models.ForeignKey(
        Categorias,
        on_delete=models.PROTECT,
        verbose_name=_('Category')
    )
    id_producto_ofertado = models.ForeignKey(
        ProductoOfertado,
        on_delete=models.PROTECT,
        related_name='productos_disponibles',
        verbose_name=_('Offered Product')
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_('Code')
    )
    nombre = models.CharField(
        max_length=200,
        verbose_name=_('Name')
    )
    id_marca = models.ForeignKey(
        Marca,
        on_delete=models.PROTECT,
        verbose_name=_('Brand')
    )
    modelo = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Model')
    )
    presentacion = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Presentation')
    )
    referencia = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Reference')
    )

    # Calificaciones
    tz_oferta = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_('Supply Rating')
    )
    tz_demanda = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_('Demand Rating')
    )
    tz_inflacion = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_('Inflation Rating')
    )
    tz_calidad = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_('Quality Rating')
    )
    tz_eficiencia = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_('Efficiency Rating')
    )
    tz_referencial = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_('Reference Rating')
    )

    # Precios
    costo_referencial = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Reference Cost')
    )
    precio_sie_referencial = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('SIE Reference Price')
    )
    precio_sie_tipob = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('SIE Type B Price')
    )
    precio_venta_privado = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Private Sale Price')
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Active')
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='productos_disponibles_created',
        verbose_name=_('Created by')
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='productos_disponibles_updated',
        verbose_name=_('Updated by')
    )

    class Meta:
        verbose_name = _('Producto disponible')
        verbose_name_plural = _('Productos disponibles')
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['id_categoria']),
            models.Index(fields=['id_producto_ofertado']),
            models.Index(fields=['code']),
        ]

    def __str__(self):
        return f"{self.code} - {self.nombre}"

    def save(self, *args, **kwargs):
        if self.code:
            self.code = self.code.upper()
        super().save(*args, **kwargs)


class PriceList(TimeStampedModel):
    """Model for price lists"""
    code = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    markup_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.nombre


class ProductPrice(TimeStampedModel):
    """Model for product prices in different price lists"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='prices')
    price_list = models.ForeignKey(PriceList, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    min_quantity = models.IntegerField(default=1)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)

    class Meta:
        # unique_together = ['product', 'price_list']  # DEPRECATED
        constraints = [
            models.UniqueConstraint(
                fields=['product', 'price_list'],
                name='unique_product_price_list'
            )
        ]

    def __str__(self):
        return f"{self.product.code} - {self.price_list.nombre}"


class StockMovement(TimeStampedModel):
    """Model for stock movements"""
    MOVEMENT_TYPES = (
        ('in', _('In')),
        ('out', _('Out')),
        ('adjustment', _('Adjustment')),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_movements')
    movement_type = models.CharField(max_length=10, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    reference_type = models.CharField(max_length=50, blank=True)
    reference_id = models.IntegerField(null=True, blank=True)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    # Eliminamos el 'created_at' manual para usar el de TimeStampedModel

    def __str__(self):
        return f"{self.movement_type} - {self.product.code} - {self.quantity}"


class PriceHistory(TimeStampedModel):
    """Model for tracking price changes"""
    PRICE_TYPES = (
        ('base', _('Base')),
        ('cost', _('Cost')),
        ('list', _('List')),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='price_history')
    price_type = models.CharField(max_length=10, choices=PRICE_TYPES)
    old_price = models.DecimalField(max_digits=10, decimal_places=2)
    new_price = models.DecimalField(max_digits=10, decimal_places=2)
    # change_date = models.DateTimeField(auto_now_add=True)  # Usamos created_at de TimeStampedModel
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    reason = models.TextField(blank=True)

    def __str__(self):
        return f"{self.product.code} - {self.price_type}"


class ProductChange(TimeStampedModel):
    """Model for tracking product changes"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='changes')
    field_name = models.CharField(max_length=50)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    # changed_at = models.DateTimeField(auto_now_add=True)  # Usamos created_at
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.product.code} - {self.field_name}"


class RelatedProduct(TimeStampedModel):
    """Model for related products"""
    RELATIONSHIP_TYPES = (
        ('upsell', _('Upsell')),
        ('cross_sell', _('Cross Sell')),
        ('substitute', _('Substitute')),
        ('complement', _('Complement')),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='related_products')
    related_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='related_to')
    relationship_type = models.CharField(max_length=20, choices=RELATIONSHIP_TYPES)
    # created_at = models.DateTimeField(auto_now_add=True) # Se elimina en favor de TimeStampedModel

    class Meta:
        # unique_together = ['product', 'related_product', 'relationship_type']  # DEPRECATED
        constraints = [
            models.UniqueConstraint(
                fields=['product', 'related_product', 'relationship_type'],
                name='unique_related_product_relationship'
            )
        ]

    def __str__(self):
        return f"{self.product.code} - {self.related_product.code} ({self.relationship_type})"


class ProductDocument(TimeStampedModel):
    """Model for product documents"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50)
    file_name = models.CharField(max_length=255)
    file_path = models.FileField(upload_to='product_documents/')
    # uploaded_at = models.DateTimeField(auto_now_add=True)  # Se elimina en favor de TimeStampedModel
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _('Product Document')
        verbose_name_plural = _('Product Documents')
        ordering = ['-created_at']  # Usamos -created_at en lugar de -uploaded_at
        indexes = [
            models.Index(fields=['document_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.product.code} - {self.document_type}"

    def clean(self):
        """Validaciones adicionales para documentos"""
        if self.file_path and self.file_path.size > 10 * 1024 * 1024:  # 10MB limit
            raise ValidationError(_('El archivo no puede ser mayor a 10MB'))
