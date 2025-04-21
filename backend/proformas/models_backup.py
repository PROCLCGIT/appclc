from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from decimal import Decimal
import logging

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
    
    # Montos
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
        """Validar relaciones y restricciones del modelo"""
        super().clean()
        
        # Validar que la fecha de vencimiento es posterior o igual a la fecha de emisión
        if self.fecha_vencimiento and self.fecha_emision and self.fecha_vencimiento < self.fecha_emision:
            raise ValidationError({
                'fecha_vencimiento': _('La fecha de vencimiento debe ser igual o posterior a la fecha de emisión')
            })
    
    def save(self, *args, **kwargs):
        # Realizar validaciones completas
        self.full_clean()
        
        # Generar número de proforma si no existe
        if not self.numero or self.numero.strip() == '':
            try:
                self.numero = self.generar_numero()
                logger.info(f"Número de proforma generado automáticamente: {self.numero}")
            except Exception as e:
                logger.error(f"Error al generar número de proforma: {e}")
                # Si falla la generación, dejamos que continúe y sea el DB constraint quien lo detecte
        
        # Calcular montos antes de guardar
        self.calcular_montos()
        super().save(*args, **kwargs)
    
    def calcular_montos(self):
        """Calcula subtotal, impuesto y total basado en los ítems"""
        # Obtenemos los ítems relacionados, si la proforma ya está guardada
        if self.pk:
            try:
                # Método optimizado usando agregación de base de datos
                from django.db.models import Sum
                items_sum = self.items.aggregate(subtotal_sum=Sum('total'))
                self.subtotal = items_sum['subtotal_sum'] or Decimal('0')
                self.impuesto = self.subtotal * (self.porcentaje_impuesto / Decimal('100.0'))
                self.total = self.subtotal + self.impuesto
            except Exception as e:
                # Método de respaldo para garantizar funcionamiento en caso de error
                import logging
                logging.warning(f"Error en método optimizado de calcular_montos: {e}. Usando método de respaldo.")
                items = self.items.all()
                self.subtotal = sum(item.total for item in items)
                self.impuesto = self.subtotal * (self.porcentaje_impuesto / Decimal('100.0'))
                self.total = self.subtotal + self.impuesto
        
    def generar_numero(self):
        """Genera un número secuencial para la proforma"""
        from django.utils import timezone
        
        year = timezone.now().year
        # Buscar la última proforma de este año
        last_quote = Proforma.objects.filter(
            numero__startswith=f'PRO-{year}'
        ).order_by('-numero').first()
        
        if last_quote:
            try:
                # Extraer el número secuencial del último número de proforma
                last_number = int(last_quote.numero.split('-')[-1])
                new_number = last_number + 1
            except (ValueError, IndexError):
                # Si hay un error al extraer el número, empezar de 1000
                logger.warning(f"No se pudo extraer el número secuencial de {last_quote.numero}, iniciando desde 1000")
                new_number = 1000
        else:
            # Primera proforma de este año
            new_number = 1000
            
        # Generar el nuevo número
        numero = f'PRO-{year}-{new_number:04d}'
        
        # Verificar que el número generado sea único para evitar colisiones
        if Proforma.objects.filter(numero=numero).exists():
            logger.warning(f"Colisión detectada con número {numero}, aumentando contador")
            return self.generar_numero()  # Recursión para generar otro número
        
        return numero


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
    
    def save(self, *args, **kwargs):
        # Calcular el total antes de guardar
        self.calcular_total()
        
        # Si hay un producto asociado, tomar sus datos
        if self.tipo_item == 'producto_ofertado' and self.producto_ofertado:
            if not self.codigo:
                self.codigo = self.producto_ofertado.code
            if not self.descripcion:
                self.descripcion = self.producto_ofertado.nombre
                
        elif self.tipo_item == 'producto_disponible' and self.producto_disponible:
            if not self.codigo:
                self.codigo = self.producto_disponible.code
            if not self.descripcion:
                self.descripcion = self.producto_disponible.nombre
            if not self.unidad:
                self.unidad = self.producto_disponible.presentacion.nombre if self.producto_disponible.presentacion else 'Unidad'
        
        super().save(*args, **kwargs)
        
        # Actualizar los totales de la proforma
        if self.proforma:
            self.proforma.calcular_montos()
            self.proforma.save(update_fields=['subtotal', 'impuesto', 'total'])
    
    def calcular_total(self):
        """Calcula el total del ítem considerando cantidad, precio y descuento"""
        subtotal = self.cantidad * self.precio_unitario
        descuento = subtotal * (self.porcentaje_descuento / Decimal('100.0'))
        self.total = subtotal - descuento


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
    
    def save(self, *args, **kwargs):
        # Asegurar que solo exista una configuración
        if not self.pk and ConfiguracionProforma.objects.exists():
            return
        super().save(*args, **kwargs)
