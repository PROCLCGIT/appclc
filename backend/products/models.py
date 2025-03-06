# backend/appclc/products/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.core.exceptions import ValidationError
from PIL import Image
from io import BytesIO
from django.core.files import File
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile
import os
import uuid

# Importa tu modelo base de timestamps
from pandora.models import TimeStampedModel, Categorias, Marca, Unidades, Procedencia, Proveedores


def producto_ofertado_imagen_path(instance, filename):
    """
    Define la ruta de almacenamiento para las imágenes de productos ofertados
    """
    # Obtiene la extensión del archivo original
    ext = filename.split('.')[-1]
    # Crea un nombre único usando UUID
    filename = f"{uuid.uuid4()}.{ext}"
    
    # Para evitar errores, verificamos si la instancia ya tiene id de producto
    # Si no lo tiene (por ejemplo, en una creación), usamos un directorio temporal
    if hasattr(instance, 'producto_ofertado') and instance.producto_ofertado and instance.producto_ofertado.id:
        producto_id = str(instance.producto_ofertado.id)
    else:
        producto_id = 'temp'
        
    # Devuelve la ruta completa
    return os.path.join('productos_ofertados', producto_id, filename)
    
def producto_disponible_imagen_path(instance, filename):
    """
    Define la ruta de almacenamiento para las imágenes de productos disponibles
    """
    # Obtiene la extensión del archivo original
    ext = filename.split('.')[-1]
    # Crea un nombre único usando UUID
    filename = f"{uuid.uuid4()}.{ext}"
    
    # Para evitar errores, verificamos si la instancia ya tiene id de producto
    # Si no lo tiene (por ejemplo, en una creación), usamos un directorio temporal
    if hasattr(instance, 'producto_disponible') and instance.producto_disponible and instance.producto_disponible.id:
        producto_id = str(instance.producto_disponible.id)
    else:
        producto_id = 'temp'
        
    # Devuelve la ruta completa
    return os.path.join('productos_disponibles', 'imagenes', producto_id, filename)
    
def producto_disponible_documento_path(instance, filename):
    """
    Define la ruta de almacenamiento para documentos de productos disponibles
    """
    # Obtiene la extensión del archivo original
    ext = filename.split('.')[-1]
    # Crea un nombre único usando UUID manteniendo el nombre original
    nombre_original = os.path.splitext(filename)[0]
    filename = f"{nombre_original}_{uuid.uuid4()}.{ext}"
    
    # Para evitar errores, verificamos si la instancia ya tiene id de producto
    # Si no lo tiene (por ejemplo, en una creación), usamos un directorio temporal
    if hasattr(instance, 'producto_disponible') and instance.producto_disponible and instance.producto_disponible.id:
        producto_id = str(instance.producto_disponible.id)
    else:
        producto_id = 'temp'
        
    # Devuelve la ruta completa
    return os.path.join('productos_disponibles', 'documentos', producto_id, filename)

def producto_ofertado_documento_path(instance, filename):
    """
    Define la ruta de almacenamiento para documentos de productos ofertados
    """
    # Obtiene la extensión del archivo original
    ext = filename.split('.')[-1]
    # Crea un nombre único usando UUID manteniendo el nombre original
    nombre_original = os.path.splitext(filename)[0]
    filename = f"{nombre_original}_{uuid.uuid4()}.{ext}"
    
    # Para evitar errores, verificamos si la instancia ya tiene id de producto
    # Si no lo tiene (por ejemplo, en una creación), usamos un directorio temporal
    if hasattr(instance, 'producto_ofertado') and instance.producto_ofertado and instance.producto_ofertado.id:
        producto_id = str(instance.producto_ofertado.id)
    else:
        producto_id = 'temp'
        
    # Devuelve la ruta completa
    return os.path.join('productos_ofertados', 'documentos', producto_id, filename)

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
        
    @property
    def imagenes_referencia(self):
        """Devuelve todas las imágenes relacionadas con este producto"""
        return self.imagenes.all() if hasattr(self, 'imagenes') else []
        
    @property
    def documentos(self):
        """Devuelve todos los documentos relacionados con este producto"""
        return self.documentos_producto.all() if hasattr(self, 'documentos_producto') else []


class ImagenReferenciaProductoOfertado(TimeStampedModel):
    """Model for storing reference images for offered products"""
    producto_ofertado = models.ForeignKey(
        ProductoOfertado,
        on_delete=models.CASCADE,
        related_name='imagenes',
        verbose_name=_('Producto Ofertado')
    )
    imagen = models.ImageField(
        upload_to=producto_ofertado_imagen_path,
        verbose_name=_('Imagen'),
        help_text=_('Imagen de referencia para el producto')
    )
    descripcion = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Descripción')
    )
    orden = models.PositiveSmallIntegerField(
        default=0,
        verbose_name=_('Orden'),
        help_text=_('Orden de visualización de la imagen')
    )
    is_primary = models.BooleanField(
        default=False,
        verbose_name=_('Es imagen principal'),
        help_text=_('Marca esta imagen como la principal para el producto')
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='imagenes_referencia_created',
        verbose_name=_('Created by')
    )

    class Meta:
        verbose_name = _('Imagen de Referencia')
        verbose_name_plural = _('Imágenes de Referencia')
        ordering = ['orden', 'created_at']
        
    def __str__(self):
        return f"Imagen {self.id} - {self.producto_ofertado.nombre}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.imagen:
            with Image.open(self.imagen.path) as img:
                img = img.convert('RGB')
                img.thumbnail((1500, 1500))
                temp_io = BytesIO()
                img.save(temp_io, format='JPEG', quality=80)
                temp_io.seek(0)

            new_name = self.imagen.name  # puedes forzar .jpg si gustas
            self.imagen.save(new_name, ContentFile(temp_io.read()), save=False)
            super().save(update_fields=['imagen'])

    def clean(self):
        super().clean()
        if self.imagen:
            if self.imagen.size > 3 * 1024 * 1024:  # 3 MB, por ejemplo
                raise ValidationError("La imagen no debe exceder 3MB.")

        
    @property
    def url(self):
        """Devuelve la URL de la imagen"""
        return self.imagen.url if self.imagen else None


class DocumentoProductoOfertado(TimeStampedModel):
    """Modelo para documentos de productos ofertados (manuales, fichas técnicas, etc.)"""
    TIPO_DOCUMENTO = (
        ('manual', _('Manual de Usuario')),
        ('ficha_tecnica', _('Ficha Técnica')),
        ('certificado', _('Certificado')),
        ('catalogo', _('Catálogo')),
        ('otros', _('Otros')),
    )
    
    producto_ofertado = models.ForeignKey(
        ProductoOfertado,
        on_delete=models.CASCADE,
        related_name='documentos_producto',
        verbose_name=_('Producto Ofertado')
    )
    documento = models.FileField(
        upload_to=producto_ofertado_documento_path,
        verbose_name=_('Documento'),
        help_text=_('Documento PDF del producto (manual, ficha técnica, etc.)')
    )
    tipo_documento = models.CharField(
        max_length=50,
        choices=TIPO_DOCUMENTO,
        default='otros',
        verbose_name=_('Tipo de Documento')
    )
    titulo = models.CharField(
        max_length=255,
        verbose_name=_('Título')
    )
    descripcion = models.TextField(
        blank=True,
        verbose_name=_('Descripción')
    )
    is_public = models.BooleanField(
        default=True,
        verbose_name=_('Es público'),
        help_text=_('Indica si el documento es público o solo para uso interno')
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='documentos_producto_ofertado_created',
        verbose_name=_('Created by')
    )

    class Meta:
        verbose_name = _('Documento de Producto Ofertado')
        verbose_name_plural = _('Documentos de Productos Ofertados')
        ordering = ['tipo_documento', 'titulo']
        
    def __str__(self):
        return f"{self.get_tipo_documento_display()} - {self.titulo}"
        
    @property
    def url(self):
        """Devuelve la URL del documento"""
        return self.documento.url if self.documento else None
        
    @property
    def extension(self):
        """Devuelve la extensión del documento"""
        if self.documento:
            return os.path.splitext(self.documento.name)[1].lower()
        return None
        
    @property
    def es_pdf(self):
        """Devuelve True si el documento es un PDF"""
        return self.extension == '.pdf'
        
    @property
    def tamano_en_mb(self):
        """Devuelve el tamaño del documento en MB"""
        if self.documento and hasattr(self.documento, 'size'):
            return round(self.documento.size / (1024 * 1024), 2)
        return None

    

### PRODUCTOS DISPONIBLES CLC ###
class ProductoDisponible(TimeStampedModel):
    """Model for available products with pricing and ratings"""
    # TODO: Esta FK parece funcionar bien
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
        verbose_name=_('Marca')
    )
    modelo = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Modolo')
    )
    
    presentacion = models.ForeignKey(
        Unidades,
        on_delete=models.PROTECT,
        verbose_name=_('Presentacion')
    )
       
    procedencia = models.ForeignKey(
        Procedencia,
        on_delete=models.PROTECT,
        verbose_name=_('Procedencia')
    )

    referencia = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Referencia')
    )

    # Calificaciones
    tz_oferta = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_('Taza de Oferta')
    )
    tz_demanda = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_('Taza de demanda')
    )
    tz_inflacion = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_('Taza de inflacion')
    )
    tz_calidad = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_('Taza de calidad')
    )
    tz_eficiencia = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_('Taza de eficiencia')
    )
    tz_referencial = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name=_('Taza de Referencia')
    )

    # Precios
    costo_referencial = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Costo Referencial')
    )
    precio_sie_referencial = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('SIE Precio Referencial')
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
        
    @property
    def imagenes(self):
        """Devuelve todas las imágenes relacionadas con este producto"""
        return self.imagenes_producto.all() if hasattr(self, 'imagenes_producto') else []
    
    @property
    def documentos(self):
        """Devuelve todos los documentos relacionados con este producto"""
        return self.documentos_producto.all() if hasattr(self, 'documentos_producto') else []


class ImagenProductoDisponible(TimeStampedModel):
    """Modelo para imágenes de productos disponibles"""
    producto_disponible = models.ForeignKey(
        ProductoDisponible,
        on_delete=models.CASCADE,
        related_name='imagenes_producto',
        verbose_name=_('Producto Disponible')
    )
    imagen = models.ImageField(
        upload_to=producto_disponible_imagen_path,
        verbose_name=_('Imagen'),
        help_text=_('Imagen del producto disponible')
    )
    descripcion = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Descripción')
    )
    orden = models.PositiveSmallIntegerField(
        default=0,
        verbose_name=_('Orden'),
        help_text=_('Orden de visualización de la imagen')
    )
    is_primary = models.BooleanField(
        default=False,
        verbose_name=_('Es imagen principal'),
        help_text=_('Marca esta imagen como la principal para el producto')
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='imagenes_producto_disponible_created',
        verbose_name=_('Created by')
    )

    class Meta:
        verbose_name = _('Imagen de Producto Disponible')
        verbose_name_plural = _('Imágenes de Productos Disponibles')
        ordering = ['orden', 'created_at']
        
    def __str__(self):
        return f"Imagen {self.id} - {self.producto_disponible.nombre}"

    def save(self, *args, **kwargs):
        """
        Sobrescribimos el método save() para procesar la imagen:
        - Convertir a RGB
        - Redimensionar (máximo 1500px de lado)
        - Guardar en formato JPEG, calidad 80
        """
        # 1) Llamamos primero al save() original para que exista self.imagen en disco
        super().save(*args, **kwargs)

        # 2) Revisamos si existe imagen
        if self.imagen:
        # Abrimos la imagen desde su ruta
            img_path = self.imagen.path
            with Image.open(img_path) as img:
                # Convertir a RGB (por si viene en PNG/CMYK/otro)
                img = img.convert('RGB')

                # Redimensionar (ej. máximo 1500 px en el lado más largo)
                max_size = 1500
                img.thumbnail((max_size, max_size))  # Mantiene proporción

                # 3) Guardar en memoria con compresión (JPEG calidad 80)
                temp_io = BytesIO()
                img.save(temp_io, format='JPEG', quality=80)
                temp_io.seek(0)

            # 4) Reemplazar la imagen anterior con la procesada
            #    Manteniendo el mismo nombre (o puedes renombrar si deseas).
            #    Para forzar la extensión ".jpg" puedes hacer algo como:
            #    new_name = os.path.splitext(self.imagen.name)[0] + ".jpg"
            new_name = self.imagen.name  # o un rename si lo necesitas
            self.imagen.save(new_name, ContentFile(temp_io.read()), save=False)

            # 5) Guardar de nuevo el modelo con la imagen procesada
            super().save(update_fields=['imagen'])   

    def clean(self):
        super().clean()
        if self.imagen:
            if self.imagen.size > 3 * 1024 * 1024:  # 3 MB, por ejemplo
                raise ValidationError("La imagen no debe exceder 3MB.")
             
    @property
    def url(self):
        """Devuelve la URL de la imagen"""
        return self.imagen.url if self.imagen else None


class DocumentoProductoDisponible(TimeStampedModel):
    """Modelo para documentos de productos disponibles (manuales, fichas técnicas, etc.)"""
    TIPO_DOCUMENTO = (
        ('manual', _('Manual de Usuario')),
        ('ficha_tecnica', _('Ficha Técnica')),
        ('certificado', _('Certificado')),
        ('catalogo', _('Catálogo')),
        ('otros', _('Otros')),
    )
    
    producto_disponible = models.ForeignKey(
        ProductoDisponible,
        on_delete=models.CASCADE,
        related_name='documentos_producto',
        verbose_name=_('Producto Disponible')
    )
    documento = models.FileField(
        upload_to=producto_disponible_documento_path,
        verbose_name=_('Documento'),
        help_text=_('Documento PDF del producto (manual, ficha técnica, etc.)')
    )
    tipo_documento = models.CharField(
        max_length=50,
        choices=TIPO_DOCUMENTO,
        default='otros',
        verbose_name=_('Tipo de Documento')
    )
    titulo = models.CharField(
        max_length=255,
        verbose_name=_('Título')
    )
    descripcion = models.TextField(
        blank=True,
        verbose_name=_('Descripción')
    )
    is_public = models.BooleanField(
        default=True,
        verbose_name=_('Es público'),
        help_text=_('Indica si el documento es público o solo para uso interno')
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='documentos_producto_disponible_created',
        verbose_name=_('Created by')
    )

    class Meta:
        verbose_name = _('Documento de Producto Disponible')
        verbose_name_plural = _('Documentos de Productos Disponibles')
        ordering = ['tipo_documento', 'titulo']
        
    def __str__(self):
        return f"{self.get_tipo_documento_display()} - {self.titulo}"
        
    @property
    def url(self):
        """Devuelve la URL del documento"""
        return self.documento.url if self.documento else None
        
    @property
    def extension(self):
        """Devuelve la extensión del documento"""
        if self.documento:
            return os.path.splitext(self.documento.name)[1].lower()
        return None
        
    @property
    def es_pdf(self):
        """Devuelve True si el documento es un PDF"""
        return self.extension == '.pdf'
        
    @property
    def tamano_en_mb(self):
        """Devuelve el tamaño del documento en MB"""
        if self.documento and hasattr(self.documento, 'size'):
            return round(self.documento.size / (1024 * 1024), 2)
        return None


class HistorialDeCompras(TimeStampedModel):
     
     producto = models.ForeignKey(
    'products.ProductoDisponible',
    on_delete=models.PROTECT,
    related_name='compras',
    verbose_name='Producto'
)


     proveedor = models.ForeignKey(
         'pandora.Proveedores',
         on_delete=models.CASCADE,
         verbose_name='Proveedor'
     )

     empresa = models.ForeignKey(
         'pandora.EmpresaClc',
         on_delete=models.CASCADE,
         verbose_name='Empresa'
     )

     fecha = models.DateField(verbose_name='Fecha')
     factura = models.CharField(max_length=100, unique=True, verbose_name='Factura')
     valor = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Valor')
     iva = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='IVA')
     cantidad = models.PositiveIntegerField(default=1, verbose_name='Cantidad')

     class Meta:
         verbose_name = 'Historial de Compra'
         verbose_name_plural = 'Historiales de Compras'
         ordering = ['-fecha']

     def __str__(self):
         return f"{self.factura} - {self.proveedor}"
     
class HistorialDeVentas(TimeStampedModel):
     
     producto = models.ForeignKey(
    'products.ProductoDisponible',
    on_delete=models.PROTECT,
    related_name='ventas',
    verbose_name='Producto'
)

     cliente = models.ForeignKey(
         'pandora.Clientes',
         on_delete=models.CASCADE,
         verbose_name='Cliente'
     )
     empresa = models.ForeignKey(
         'pandora.EmpresaClc',
         on_delete=models.CASCADE,
         verbose_name='Empresa'
     )
     fecha = models.DateField(verbose_name='Fecha')
     factura = models.CharField(max_length=100, unique=True, verbose_name='Factura')
     valor = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Valor')
     iva = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='IVA')
     cantidad = models.PositiveIntegerField(default=1, verbose_name='Cantidad')

     class Meta:
         verbose_name = 'Historial de Ventas'
         verbose_name_plural = 'Historiales de Ventas'
         ordering = ['-fecha']

     def __str__(self):
         return f"{self.factura} - {self.cliente}"
