from django.db import models, transaction
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

from django.utils import timezone
from pandora.models import TimeStampedModel, Clientes, EmpresaClc, TipoContratacion


class Proforma(TimeStampedModel):
    """Modelo principal para las proformas"""
    
    class Estado(models.TextChoices):
        BORRADOR = 'borrador', _('Borrador')
        ENVIADA = 'enviada', _('Enviada')
        APROBADA = 'aprobada', _('Aprobada')
        RECHAZADA = 'rechazada', _('Rechazada')
        VENCIDA = 'vencida', _('Vencida')
        CONVERTIDA = 'convertida', _('Convertida a Orden')
    
    # Para mantener compatibilidad con código existente
    ESTADO_CHOICES = Estado.choices
    
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
    
    def enviar(self, usuario=None, notas=None):
        """
        Transición de estado: Borrador -> Enviada
        Envía la proforma al cliente.
        
        Args:
            usuario: Usuario que realiza la acción (opcional)
            notas: Notas adicionales sobre la acción (opcional)
            
        Returns:
            bool: True si la transición fue exitosa, False en caso contrario
            
        Raises:
            ValueError: Si la proforma no está en estado Borrador
        """
        if self.estado != 'borrador':
            raise ValueError(f"Solo proformas en estado 'Borrador' pueden ser enviadas")
        
        estado_anterior = self.estado
        self.estado = 'enviada'
        if usuario:
            self.updated_by = usuario
            
        self.save(update_fields=['estado', 'updated_by', 'updated_at'])
        
        # La notificación se maneja a través del signal post_save
        
        # Adicionalmente, enviar notificación por correo
        self.notify_estado_por_email(
            accion='envio',
            estado_anterior=estado_anterior,
            estado_nuevo=self.estado,
            usuario=usuario, 
            notas=notas
        )
        
        return True
    
    def aprobar(self, usuario=None, notas=None):
        """
        Transición de estado: Enviada -> Aprobada
        Marca la proforma como aprobada por el cliente.
        
        Args:
            usuario: Usuario que realiza la acción (opcional)
            notas: Notas adicionales sobre la acción (opcional)
            
        Returns:
            bool: True si la transición fue exitosa, False en caso contrario
            
        Raises:
            ValueError: Si la proforma no está en estado Enviada
        """
        if self.estado != 'enviada':
            raise ValueError(f"Solo proformas en estado 'Enviada' pueden ser aprobadas")
        
        estado_anterior = self.estado
        self.estado = 'aprobada'
        if usuario:
            self.updated_by = usuario
            
        self.save(update_fields=['estado', 'updated_by', 'updated_at'])
        
        # La notificación se maneja a través del signal post_save
        
        # Adicionalmente, enviar notificación por correo
        self.notify_estado_por_email(
            accion='aprobacion',
            estado_anterior=estado_anterior,
            estado_nuevo=self.estado,
            usuario=usuario, 
            notas=notas
        )
        
        return True
    
    def rechazar(self, usuario=None, notas=None):
        """
        Transición de estado: Enviada -> Rechazada
        Marca la proforma como rechazada por el cliente.
        
        Args:
            usuario: Usuario que realiza la acción (opcional)
            notas: Notas adicionales sobre la acción (opcional)
            
        Returns:
            bool: True si la transición fue exitosa, False en caso contrario
            
        Raises:
            ValueError: Si la proforma no está en estado Enviada
        """
        if self.estado != 'enviada':
            raise ValueError(f"Solo proformas en estado 'Enviada' pueden ser rechazadas")
        
        estado_anterior = self.estado
        self.estado = 'rechazada'
        if usuario:
            self.updated_by = usuario
            
        self.save(update_fields=['estado', 'updated_by', 'updated_at'])
        
        # La notificación se maneja a través del signal post_save
        
        # Adicionalmente, enviar notificación por correo
        self.notify_estado_por_email(
            accion='rechazo',
            estado_anterior=estado_anterior,
            estado_nuevo=self.estado,
            usuario=usuario, 
            notas=notas
        )
        
        return True
    
    def convertir(self, usuario=None, notas=None):
        """
        Transición de estado: Aprobada -> Convertida
        Convierte la proforma aprobada en una orden.
        
        Args:
            usuario: Usuario que realiza la acción (opcional)
            notas: Notas adicionales sobre la acción (opcional)
            
        Returns:
            bool: True si la transición fue exitosa, False en caso contrario
            
        Raises:
            ValueError: Si la proforma no está en estado Aprobada
        """
        if self.estado != 'aprobada':
            raise ValueError(f"Solo proformas en estado 'Aprobada' pueden ser convertidas a orden")
        
        estado_anterior = self.estado
        self.estado = 'convertida'
        if usuario:
            self.updated_by = usuario
            
        self.save(update_fields=['estado', 'updated_by', 'updated_at'])
        
        # La notificación se maneja a través del signal post_save
        
        # Adicionalmente, enviar notificación por correo
        self.notify_estado_por_email(
            accion='conversion',
            estado_anterior=estado_anterior,
            estado_nuevo=self.estado,
            usuario=usuario, 
            notas=notas
        )
        
        return True
    
    def volver_a_borrador(self, usuario=None, notas=None):
        """
        Transición de estado: Enviada/Rechazada -> Borrador
        Vuelve a marcar la proforma como borrador para permitir ediciones.
        
        Args:
            usuario: Usuario que realiza la acción (opcional)
            notas: Notas adicionales sobre la acción (opcional)
            
        Returns:
            bool: True si la transición fue exitosa, False en caso contrario
            
        Raises:
            ValueError: Si la proforma no está en estado Enviada o Rechazada
        """
        if self.estado not in ['enviada', 'rechazada']:
            raise ValueError(f"Solo proformas en estado 'Enviada' o 'Rechazada' pueden volver a borrador")
        
        estado_anterior = self.estado
        self.estado = 'borrador'
        if usuario:
            self.updated_by = usuario
            
        self.save(update_fields=['estado', 'updated_by', 'updated_at'])
        
        # La notificación se maneja a través del signal post_save
        
        # Adicionalmente, enviar notificación por correo
        self.notify_estado_por_email(
            accion='reversion',
            estado_anterior=estado_anterior,
            estado_nuevo=self.estado,
            usuario=usuario, 
            notas=notas
        )
        
        return True
    
    def notify_estado_por_email(self, accion, estado_anterior, estado_nuevo, usuario=None, notas=None):
        """
        Envía notificaciones por correo electrónico sobre cambios de estado.
        
        Args:
            accion: Tipo de acción realizada (envio, aprobacion, rechazo, etc.)
            estado_anterior: Estado anterior de la proforma
            estado_nuevo: Nuevo estado de la proforma
            usuario: Usuario que realizó la acción (opcional)
            notas: Notas adicionales sobre la acción (opcional)
        """
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            from django.template.loader import render_to_string
            
            # Obtener etiquetas legibles de los estados
            estado_anterior_label = dict(self.ESTADO_CHOICES).get(estado_anterior, estado_anterior)
            estado_nuevo_label = dict(self.ESTADO_CHOICES).get(estado_nuevo, estado_nuevo)
            
            # Preparar contexto para la plantilla de correo
            context = {
                'proforma': self,
                'numero': self.numero,
                'cliente': self.cliente.nombre if self.cliente else 'Cliente',
                'estado_anterior': estado_anterior_label,
                'estado_nuevo': estado_nuevo_label,
                'accion': accion,
                'usuario': usuario.get_full_name() if usuario else 'Sistema',
                'fecha': timezone.now().strftime('%d/%m/%Y %H:%M'),
                'notas': notas or '',
                'subtotal': self.subtotal,
                'impuesto': self.impuesto,
                'total': self.total,
            }
            
            # Renderizar asunto y cuerpo del correo basado en plantillas
            subject = f"Proforma #{self.numero} - {estado_nuevo_label}"
            
            # Para tener mensajes personalizados según la acción
            if accion == 'envio':
                mensaje = f"La proforma #{self.numero} ha sido enviada al cliente {self.cliente.nombre}."
            elif accion == 'aprobacion':
                mensaje = f"La proforma #{self.numero} ha sido aprobada por el cliente {self.cliente.nombre}."
            elif accion == 'rechazo':
                mensaje = f"La proforma #{self.numero} ha sido rechazada por el cliente {self.cliente.nombre}."
            elif accion == 'conversion':
                mensaje = f"La proforma #{self.numero} ha sido convertida a orden."
            elif accion == 'reversion':
                mensaje = f"La proforma #{self.numero} ha vuelto a estado borrador para edición."
            else:
                mensaje = f"La proforma #{self.numero} ha cambiado de estado: {estado_anterior_label} → {estado_nuevo_label}."
            
            # Añadir notas si existen
            if notas:
                mensaje += f"\n\nNotas: {notas}"
                
            # Añadir detalles de la proforma
            mensaje += f"\n\nTotal: ${self.total}"
            
            # Determinar destinatarios
            recipients = []
            
            # Siempre incluir al usuario que creó la proforma
            if self.created_by and self.created_by.email:
                recipients.append(self.created_by.email)
                
            # Si hay un usuario asociado a la acción y es diferente, incluirlo
            if usuario and usuario.email and usuario.email != getattr(self.created_by, 'email', None):
                recipients.append(usuario.email)
                
            # Incluir email del cliente si existe y está en acción relevante
            if self.cliente and self.cliente.email and accion in ['envio', 'aprobacion', 'rechazo']:
                recipients.append(self.cliente.email)
            
            # Eliminar duplicados y asegurar que hay destinatarios
            recipients = list(set(recipients))
            if not recipients:
                logger.warning(f"No se enviaron notificaciones por email para proforma #{self.numero} - no hay destinatarios")
                return
                
            # Enviar correo
            send_mail(
                subject=subject,
                message=mensaje,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipients,
                fail_silently=True,  # No interrumpir el flujo principal si falla el envío
            )
            
            logger.info(f"Notificación enviada por email sobre proforma #{self.numero} a {len(recipients)} destinatarios")
            
        except Exception as e:
            # Registrar error pero no interrumpir el flujo principal
            logger.error(f"Error al enviar notificación por email para proforma #{self.numero}: {str(e)}")
    
    def generar_numero(self):
        """
        Genera un número secuencial para la proforma de forma atómica y robusta.
        Utiliza el modelo SecuenciaProforma para evitar race conditions.
        
        Returns:
            str: Número de proforma en formato 'PRO-YYYY-NNNN'
        """
        try:
            # Obtener el año actual
            year = timezone.now().year
            
            # Utilizar el modelo de secuencia para obtener el siguiente número
            # de manera atómica (con bloqueo de tabla)
            numero = SecuenciaProforma.obtener_siguiente_numero(year)
            
            # Verificar que el número generado sea único (doble verificación)
            if Proforma.objects.filter(numero=numero).exists():
                # Si hay una colisión (muy raro pero posible en caso de inconsistencias),
                # intentar generar otro número
                logger.warning(f"Colisión detectada con número {numero} a pesar del uso de secuencia, intentando nuevamente")
                
                # Generar un nuevo número con timestamp para garantizar unicidad
                import time
                timestamp = int(time.time())
                numero = f'PRO-{year}-{timestamp}'
                
                # Registrar evento inusual para investigación posterior
                logger.error(f"Se generó número alternativo con timestamp: {numero}")
            
            return numero
            
        except Exception as e:
            # Registrar el error y generar un número de respaldo utilizando timestamp
            logger.error(f"Error crítico al generar número de proforma: {str(e)}")
            
            # En caso de error, generar un número basado en timestamp que sea único
            import time
            year = timezone.now().year
            timestamp = int(time.time())
            
            # Se incluye un prefijo 'E' para indicar que es un número de emergencia
            numero = f'PRO-{year}-E{timestamp}'
            logger.warning(f"Generado número de emergencia: {numero}")
            
            return numero
    
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
    
    def save(self, *args, **kwargs):
        """
        Sobrescritura del método save para:
        1. Realizar validaciones completas con full_clean()
        2. Generar número de proforma si no existe
        3. Calcular montos automáticamente
        """
        # 1. Realizar validaciones completas
        self.full_clean()
        
        # 2. Generar número de proforma si no existe
        if not self.numero or self.numero.strip() == '':
            self.numero = self.generar_numero()
            logger.info(f"Número de proforma generado automáticamente: {self.numero}")
        
        # 3. Calcular montos antes de guardar
        self.calcular_montos()
        
        # Guardar el modelo
        super().save(*args, **kwargs)
    
    def calcular_montos(self):
        """
        Calcula subtotal, impuesto y total basado en los ítems.
        Usa agregación de base de datos para optimizar el rendimiento.
        """
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
                logger.warning(f"Error en método optimizado de calcular_montos: {e}. Usando método de respaldo.")
                items = self.items.all()
                self.subtotal = sum(item.total for item in items)
                self.impuesto = self.subtotal * (self.porcentaje_impuesto / Decimal('100.0'))
                self.total = self.subtotal + self.impuesto


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
    
    def calcular_total(self):
        """Calcula el total del ítem considerando cantidad, precio y descuento"""
        subtotal = self.cantidad * self.precio_unitario
        descuento = subtotal * (self.porcentaje_descuento / Decimal('100.0'))
        self.total = subtotal - descuento
    
    def save(self, *args, **kwargs):
        """
        Sobrescritura del método save para:
        1. Validar datos con full_clean()
        2. Calcular el total antes de guardar
        3. Autocompletar datos del producto si es necesario
        4. Actualizar totales de la proforma
        """
        # 1. Validar datos
        self.full_clean()
        
        # 2. Calcular el total antes de guardar
        self.calcular_total()
        
        # 3. Si hay un producto asociado, tomar sus datos
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
                self.unidad = self.producto_disponible.presentacion.nombre if hasattr(self.producto_disponible, 'presentacion') and self.producto_disponible.presentacion else 'Unidad'
        
        # Guardar el ítem
        super().save(*args, **kwargs)
        
        # 4. Actualizar los totales de la proforma
        if self.proforma:
            self.proforma.calcular_montos()
            self.proforma.save(update_fields=['subtotal', 'impuesto', 'total'])


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
