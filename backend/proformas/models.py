# //backend/appclc/proformas/models.py
from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from products.models import Product
from pandora.models import TimeStampedModel, Clientes
from django.core.exceptions import ValidationError
from django.utils import timezone

class Proforma(TimeStampedModel):
    """Modelo principal para proformas"""
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('sent', _('Sent')),
        ('approved', _('Approved')),
        ('rejected', _('Rejected')),
        ('expired', _('Expired')),
    ]

    number = models.CharField(_('Number'), max_length=20, unique=True, editable=False)
    client = models.ForeignKey(
        Clientes,
        on_delete=models.PROTECT,
        related_name='proformas',
        verbose_name=_('Client')
    )
    date = models.DateField(_('Date'), auto_now_add=True)
    valid_until = models.DateField(_('Valid Until'))
    
    # Información comercial
    payment_terms = models.CharField(_('Payment Terms'), max_length=200)
    delivery_time = models.CharField(_('Delivery Time'), max_length=100)
    sales_person = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='sales_proformas'
    )

    # Totales
    subtotal = models.DecimalField(
        _('Subtotal'),
        max_digits=15,
        decimal_places=2,
        default=0,
        editable=False
    )
    tax = models.DecimalField(
        _('Tax'),
        max_digits=15,
        decimal_places=2,
        default=0,
        editable=False
    )
    total = models.DecimalField(
        _('Total'),
        max_digits=15,
        decimal_places=2,
        default=0,
        editable=False
    )

    # Estado y notas
    status = models.CharField(
        _('Status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    notes = models.TextField(_('Notes'), blank=True)
    terms_conditions = models.TextField(_('Terms and Conditions'), blank=True)

    # Seguimiento
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_proformas'
    )

    class Meta:
        verbose_name = _('Proforma')
        verbose_name_plural = _('Proformas')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['number']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Proforma #{self.number} - {self.client.nombre}"

    def clean(self):
        """Validaciones adicionales del modelo"""
        if self.valid_until and self.valid_until < timezone.now().date():
            raise ValidationError({
                'valid_until': _('La fecha de validez debe ser posterior a hoy')
            })

    def save(self, *args, **kwargs):
        """Método save personalizado"""
        # Generar número de proforma si es nuevo
        if not self.number:
            last_proforma = Proforma.objects.order_by('-number').first()
            if last_proforma:
                last_number = int(last_proforma.number[3:])
                self.number = f'PRO{str(last_number + 1).zfill(6)}'
            else:
                self.number = 'PRO000001'

        if not self.pk:  # Si es nuevo
            self.calculate_totals()
        
        super().save(*args, **kwargs)

    def calculate_totals(self):
        """Calcular totales de la proforma"""
        items_total = sum(item.total for item in self.items.all())
        self.subtotal = items_total
        self.tax = self.subtotal * 0.18  # IGV 18%
        self.total = self.subtotal + self.tax

    def is_editable(self):
        """Determina si la proforma puede ser editada"""
        return self.status == 'draft'

    def can_approve(self, user):
        """Verifica si un usuario puede aprobar la proforma"""
        return (self.status == 'draft' and 
                (user.is_superuser or user == self.sales_person))

class ProformaItem(TimeStampedModel):
    """Modelo para items de la proforma"""
    proforma = models.ForeignKey(
        Proforma,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT
    )
    description = models.TextField(blank=True)
    quantity = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text=_('Cantidad debe ser mayor a 0')
    )
    unit_price = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text=_('Precio unitario debe ser mayor o igual a 0')
    )
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text=_('Porcentaje de descuento entre 0 y 100')
    )
    total = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        editable=False
    )

    class Meta:
        verbose_name = _('Proforma Item')
        verbose_name_plural = _('Proforma Items')

    def clean(self):
        """Validaciones adicionales"""
        if self.discount_percentage > 100:
            raise ValidationError({
                'discount_percentage': _('El descuento no puede ser mayor a 100%')
            })

    def save(self, *args, **kwargs):
        """Calcular total del item y actualizar totales de la proforma"""
        self.total = self.quantity * self.unit_price * (1 - self.discount_percentage / 100)
        super().save(*args, **kwargs)
        self.proforma.calculate_totals()
        self.proforma.save()

class ProformaHistory(TimeStampedModel):
    """Modelo para el historial de cambios en proformas"""
    proforma = models.ForeignKey(
        Proforma,
        on_delete=models.CASCADE,
        related_name='history'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT
    )
    action = models.CharField(max_length=100)
    details = models.TextField()

    class Meta:
        verbose_name = _('Proforma History')
        verbose_name_plural = _('Proforma History')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['action']),
        ]

    def __str__(self):
        return f"{self.created_at} - {self.action}"