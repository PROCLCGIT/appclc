"""
Modelos mejorados para el módulo de proformas.

Esta versión de los modelos tiene la lógica de negocio extraída a un service layer,
manteniendo los modelos enfocados en la representación de datos y delegando el
comportamiento a servicios externos.
"""
from django.db import models, transaction
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from decimal import Decimal
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)

from pandora.models import TimeStampedModel, Clientes, EmpresaClc, TipoContratacion


class Proforma(TimeStampedModel):
    """Modelo principal para las proformas"""
    
    ESTADO_CHOICES = (
        ('borrador', _('Borrador')),
        ('enviada', _('Enviada')),
        ('aprobada', _('Aprobada')),
        ('rechazada', _('Rechazada')),
        ('vencida', _('Vencida')),
        ('convertida', _('Convertida a Orden')),
    )
    
    # Campos principales
    numero = models.CharField(
        max_length=50, 
        unique=True, 
        blank=True,  # Permitir blanco para generar automáticamente
        verbose_name=_('Número de Proforma')
    )
    nombre = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_('Nombre descriptivo')
    )
    fecha_emision = models.DateField(
        verbose_name=_('Fecha de Emisión')
    )
    fecha_vencimiento = models.DateField(
        verbose_name=_('Fecha de Vencimiento')
    )
    
    # Relaciones
    cliente = models.ForeignKey(
        Clientes,
        on_delete=models.PROTECT,
        related_name='proformas',
        verbose_name=_('Cliente')
    )
    empresa = models.ForeignKey(
        EmpresaClc,
        on_delete=models.PROTECT,
        related_name='proformas',
        verbose_name=_('Empresa Emisora')
    )
    tipo_contratacion = models.ForeignKey(
        TipoContratacion,
        on_delete=models.PROTECT,
        related_name='proformas',
        verbose_name=_('Tipo de Contratación'),
        null=True,
        blank=True
    )
    
    # Campos adicionales
    atencion_a = models.CharField(
        max_length=255, 
        blank=True, 
        verbose_name=_('Atención a')
    )
    condiciones_pago = models.CharField(
        max_length=255, 
        default="50% anticipo, 50% contra entrega",
        verbose_name=_('Condiciones de Pago')
    )
    tiempo_entrega = models.CharField(
        max_length=255, 
        default="5 días hábiles",
        verbose_name=_('Tiempo de Entrega')
    )
    
    # Montos (calculados por el servicio)
    subtotal = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0, 
        verbose_name=_('Subtotal')
    )
    porcentaje_impuesto = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=12.00, 
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('Porcentaje de Impuesto')
    )
    impuesto = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0, 
        verbose_name=_('Impuesto')
    )
    total = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=0, 
        verbose_name=_('Total')
    )
    
    # Notas y estado
    notas = models.TextField(
        blank=True, 
        verbose_name=_('Notas')
    )
    estado = models.CharField(
        max_length=20, 
        choices=ESTADO_CHOICES, 
        default='borrador', 
        verbose_name=_('Estado')
    )
    
    # Auditoría
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='proformas_created',
        verbose_name=_('Creado por')
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='proformas_updated',
        verbose_name=_('Actualizado por')
    )
    
    class Meta:
        verbose_name = _('Proforma')
        verbose_name_plural = _('Proformas')
        ordering = ['-fecha_emision', '-id']
        indexes = [
            models.Index(fields=['numero']),
            models.Index(fields=['fecha_emision']),
            models.Index(fields=['estado']),
        ]
    
    def __str__(self):
        return f"Proforma #{self.numero} - {self.cliente.nombre}"
    
    def clean(self):
        """
        Validaciones del modelo:
        - Valida fechas
        - Valida relaciones
        - Otras validaciones de negocio
        """
        super().clean()
        
        # Validar que la fecha de vencimiento es posterior o igual a la fecha de emisión
        if self.fecha_vencimiento and self.fecha_emision and self.fecha_vencimiento < self.fecha_emision:
            raise ValidationError({
                'fecha_vencimiento': _('La fecha de vencimiento debe ser igual o posterior a la fecha de emisión')
            })
            
        # Validar que exista cliente
        if not self.cliente:
            raise ValidationError({
                'cliente': _('Debe seleccionar un cliente para la proforma')
            })
            
        # Validar que exista empresa
        if not self.empresa:
            raise ValidationError({
                'empresa': _('Debe seleccionar una empresa emisora para la proforma')
            })
            
        # Validar porcentaje de impuesto
        if self.porcentaje_impuesto < 0 or self.porcentaje_impuesto > 100:
            raise ValidationError({
                'porcentaje_impuesto': _('El porcentaje de impuesto debe estar entre 0 y 100')
            })


class ProformaItem(TimeStampedModel):
    """Items/líneas incluidas en una proforma"""
    
    TIPO_ITEM_CHOICES = (
        ('producto_ofertado', _('Producto Ofertado')),
        ('producto_disponible', _('Producto Disponible')),
        ('personalizado', _('Ítem Personalizado')),
    )
    
    # Relación con Proforma
    proforma = models.ForeignKey(
        Proforma,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('Proforma')
    )
    
    # Tipo de item
    tipo_item = models.CharField(
        max_length=50,
        choices=TIPO_ITEM_CHOICES,
        default='personalizado',
        verbose_name=_('Tipo de Ítem')
    )
    
    # Relaciones Opcionales con Productos
    producto_ofertado = models.ForeignKey(
        'products.ProductoOfertado',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='proforma_items',
        verbose_name=_('Producto Ofertado')
    )
    
    producto_disponible = models.ForeignKey(
        'products.ProductoDisponible',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='proforma_items',
        verbose_name=_('Producto Disponible')
    )
    
    # Detalles del Ítem
    codigo = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_('Código')
    )
    descripcion = models.TextField(
        verbose_name=_('Descripción')
    )
    unidad = models.CharField(
        max_length=50,
        default='Unidad',
        verbose_name=_('Unidad')
    )
    
    # Cantidades y Precios
    cantidad = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1,
        validators=[MinValueValidator(0.01)],
        verbose_name=_('Cantidad')
    )
    precio_unitario = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_('Precio Unitario')
    )
    porcentaje_descuento = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('Porcentaje de Descuento')
    )
    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_('Total')
    )
    
    # Posición/orden dentro de la proforma
    orden = models.PositiveSmallIntegerField(
        default=0,
        verbose_name=_('Orden')
    )
    
    class Meta:
        verbose_name = _('Ítem de Proforma')
        verbose_name_plural = _('Ítems de Proforma')
        ordering = ['proforma', 'orden']
        indexes = [
            models.Index(fields=['proforma', 'orden']),
        ]
    
    def __str__(self):
        return f"{self.codigo} - {self.descripcion[:30]}..."
    
    def clean(self):
        """
        Validaciones para ítems de proforma:
        - Validar cantidad y precio
        - Validar descuento
        - Validar tipo de ítem y productos asociados
        """
        super().clean()
        
        # Validar cantidad
        if self.cantidad <= 0:
            raise ValidationError({
                'cantidad': _('La cantidad debe ser mayor que cero')
            })
            
        # Validar precio unitario
        if self.precio_unitario < 0:
            raise ValidationError({
                'precio_unitario': _('El precio unitario no puede ser negativo')
            })
            
        # Validar porcentaje de descuento
        if self.porcentaje_descuento < 0 or self.porcentaje_descuento > 100:
            raise ValidationError({
                'porcentaje_descuento': _('El porcentaje de descuento debe estar entre 0 y 100')
            })
            
        # Validar tipo de ítem y productos asociados
        if self.tipo_item == 'producto_ofertado' and not self.producto_ofertado:
            raise ValidationError({
                'producto_ofertado': _('Debe seleccionar un producto ofertado para este tipo de ítem')
            })
            
        if self.tipo_item == 'producto_disponible' and not self.producto_disponible:
            raise ValidationError({
                'producto_disponible': _('Debe seleccionar un producto disponible para este tipo de ítem')
            })


class ProformaHistorial(TimeStampedModel):
    """Historial de cambios en una proforma"""
    
    ACCION_CHOICES = (
        ('creacion', _('Creación')),
        ('modificacion', _('Modificación')),
        ('envio', _('Envío al cliente')),
        ('aprobacion', _('Aprobación')),
        ('rechazo', _('Rechazo')),
        ('conversion', _('Conversión a orden')),
        ('vencimiento', _('Vencimiento')),
    )
    
    proforma = models.ForeignKey(
        Proforma,
        on_delete=models.CASCADE,
        related_name='historial',
        verbose_name=_('Proforma')
    )
    accion = models.CharField(
        max_length=20,
        choices=ACCION_CHOICES,
        verbose_name=_('Acción')
    )
    estado_anterior = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_('Estado Anterior')
    )
    estado_nuevo = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_('Estado Nuevo')
    )
    notas = models.TextField(
        blank=True,
        verbose_name=_('Notas')
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='proforma_historial_created',
        verbose_name=_('Realizado por')
    )
    
    class Meta:
        verbose_name = _('Historial de Proforma')
        verbose_name_plural = _('Historiales de Proforma')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_accion_display()} - {self.proforma.numero} - {self.created_at}"


class SecuenciaProforma(models.Model):
    """
    Modelo para gestionar las secuencias numéricas de las proformas
    garantizando unicidad y evitando race conditions.
    """
    anio = models.PositiveSmallIntegerField(
        verbose_name=_('Año'),
        unique=True
    )
    ultimo_numero = models.PositiveIntegerField(
        default=999,  # Empezará en 1000
        verbose_name=_('Último número utilizado')
    )
    ultima_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Última actualización')
    )
    
    class Meta:
        verbose_name = _('Secuencia de Proforma')
        verbose_name_plural = _('Secuencias de Proformas')
        indexes = [
            models.Index(fields=['anio']),
        ]
    
    def __str__(self):
        return f"Secuencia proformas {self.anio}: último={self.ultimo_numero}"
    
    @classmethod
    def obtener_siguiente_numero(cls, anio=None):
        """
        Obtiene el siguiente número de secuencia para el año especificado
        de manera atómica, evitando race conditions.
        
        Args:
            anio: Año para el que se quiere obtener el número. Si es None, usa el año actual.
            
        Returns:
            str: El número de proforma en formato 'PRO-YYYY-NNNN'
        """
        if anio is None:
            anio = timezone.now().year
            
        with transaction.atomic():
            # Bloquear la tabla para evitar race conditions con select_for_update()
            secuencia, created = cls.objects.select_for_update().get_or_create(
                anio=anio,
                defaults={'ultimo_numero': 999}  # Empezar desde 1000
            )
            
            # Incrementar el contador
            secuencia.ultimo_numero += 1
            secuencia.save(update_fields=['ultimo_numero', 'ultima_actualizacion'])
            
            # Generar el número de proforma en formato PRO-YYYY-NNNN
            numero_proforma = f"PRO-{anio}-{secuencia.ultimo_numero:04d}"
            
            logger.info(f"Generado número de proforma: {numero_proforma}")
            return numero_proforma


class ConfiguracionProforma(models.Model):
    """Configuración global para proformas"""
    
    empresa_predeterminada = models.ForeignKey(
        EmpresaClc,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Empresa Predeterminada')
    )
    dias_validez = models.PositiveSmallIntegerField(
        default=15,
        verbose_name=_('Días de Validez')
    )
    porcentaje_impuesto_default = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=12.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('Porcentaje de Impuesto Predeterminado')
    )
    texto_condiciones_pago = models.CharField(
        max_length=255,
        default="50% anticipo, 50% contra entrega",
        verbose_name=_('Texto de Condiciones de Pago')
    )
    texto_tiempo_entrega = models.CharField(
        max_length=255,
        default="5 días hábiles",
        verbose_name=_('Texto de Tiempo de Entrega')
    )
    notas_predeterminadas = models.TextField(
        default="Precios incluyen IVA. Entrega en sus oficinas sin costo adicional dentro del perímetro urbano.",
        blank=True,
        verbose_name=_('Notas Predeterminadas')
    )
    mostrar_logo = models.BooleanField(
        default=True,
        verbose_name=_('Mostrar Logo')
    )
    mostrar_descuento = models.BooleanField(
        default=True,
        verbose_name=_('Mostrar Descuento')
    )
    mostrar_impuesto = models.BooleanField(
        default=True,
        verbose_name=_('Mostrar Impuesto')
    )
    mostrar_codigos = models.BooleanField(
        default=True,
        verbose_name=_('Mostrar Códigos de Productos')
    )
    formato_moneda = models.CharField(
        max_length=10,
        default="$",
        verbose_name=_('Símbolo de Moneda')
    )
    decimales = models.PositiveSmallIntegerField(
        default=2,
        validators=[MinValueValidator(0), MaxValueValidator(4)],
        verbose_name=_('Decimales')
    )
    
    class Meta:
        verbose_name = _('Configuración de Proforma')
        verbose_name_plural = _('Configuraciones de Proforma')
    
    def __str__(self):
        return _("Configuración de Proformas")
    
    def clean(self):
        """Validaciones para la configuración"""
        super().clean()
        
        # Validar decimales
        if self.decimales < 0 or self.decimales > 4:
            raise ValidationError({
                'decimales': _('El número de decimales debe estar entre 0 y 4')
            })
            
        # Validar porcentaje de impuesto predeterminado
        if self.porcentaje_impuesto_default < 0 or self.porcentaje_impuesto_default > 100:
            raise ValidationError({
                'porcentaje_impuesto_default': _('El porcentaje de impuesto debe estar entre 0 y 100')
            })
    
    def save(self, *args, **kwargs):
        """Garantizar que solo exista una configuración"""
        # Validar datos
        self.full_clean()
        
        # Asegurar que solo exista una configuración
        if not self.pk and ConfiguracionProforma.objects.exists():
            return
            
        super().save(*args, **kwargs)