"""
Señales (signals) extendidas para el módulo de proformas.

Este módulo define receptores para las señales de Django que se conectan
a los eventos de los modelos Proforma y ProformaItem, delegando la lógica
de negocio al servicio ProformaService con optimizaciones de rendimiento.
Incluye manejo mejorado de historial para reemplazar la lógica en serializers.
"""
import logging
from django.db.models.signals import post_save, pre_save, post_delete, pre_delete
from django.dispatch import receiver
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from functools import wraps

from .models import Proforma, ProformaItem, ProformaHistorial
from .services_optimized import ProformaService

logger = logging.getLogger(__name__)

# Constante para cache
PROFORMA_PENDING_UPDATES_KEY = 'proforma_pending_updates'
BATCH_UPDATE_THRESHOLD = 5  # Número de actualizaciones pendientes para procesar en lote

# Función auxiliar para procesar actualizaciones en lote
def process_batch_updates():
    """Procesa actualizaciones pendientes en lote si hay suficientes"""
    pending_ids = cache.get(PROFORMA_PENDING_UPDATES_KEY, set())
    
    if pending_ids and len(pending_ids) >= BATCH_UPDATE_THRESHOLD:
        logger.debug(f"Procesando actualización en lote para {len(pending_ids)} proformas")
        try:
            ProformaService.calculate_amounts_batch(list(pending_ids))
            # Limpiar la lista de pendientes
            cache.delete(PROFORMA_PENDING_UPDATES_KEY)
        except Exception as e:
            logger.error(f"Error en actualización por lotes: {e}")
            # Si falla el proceso por lotes, reducir el umbral para el próximo intento
            global BATCH_UPDATE_THRESHOLD
            BATCH_UPDATE_THRESHOLD = max(1, BATCH_UPDATE_THRESHOLD - 1)

# Decorator para controlar si se debe usar actualización por lotes
def use_batch_update(signal_handler):
    @wraps(signal_handler)
    def wrapper(sender, instance, **kwargs):
        # Verificar si se ha configurado para usar procesamiento por lotes
        if getattr(instance, '_use_batch_update', False):
            # Añadir a pendientes y posiblemente procesar en lote
            if hasattr(instance, 'proforma') and instance.proforma:
                # Caso ProformaItem
                proforma_id = instance.proforma.id
                pending_ids = cache.get(PROFORMA_PENDING_UPDATES_KEY, set())
                pending_ids.add(proforma_id)
                cache.set(PROFORMA_PENDING_UPDATES_KEY, pending_ids, 60*5)  # 5 minutos de validez
                # Procesar en lote si se alcanza el umbral
                process_batch_updates()
            return
        
        # Si no es procesamiento por lotes, ejecutar el handler normal
        return signal_handler(sender, instance, **kwargs)
    return wrapper


# Capturar el estado original de la proforma antes de guardar
@receiver(pre_save, sender=Proforma)
def capturar_estado_original(sender, instance, **kwargs):
    """
    Captura el estado original de la proforma antes de guardar,
    para usar en la creación del historial.
    """
    try:
        if instance.pk:
            try:
                original = Proforma.objects.get(pk=instance.pk)
                instance._estado_original = original.estado
            except Proforma.DoesNotExist:
                instance._estado_original = None
        else:
            instance._estado_original = None
    except Exception as e:
        logger.error(f"Error al capturar estado original: {str(e)}")
        instance._estado_original = None


@receiver(pre_save, sender=Proforma)
def verificar_vencimiento_proforma(sender, instance, **kwargs):
    """
    Verifica si una proforma ha vencido y actualiza su estado automáticamente.
    """
    try:
        # Verificar si la proforma está en estado enviada y ha vencido
        if instance.estado == 'enviada' and instance.fecha_vencimiento < timezone.now().date():
            old_estado = instance.estado
            instance.estado = 'vencida'
            logger.info(f"Proforma #{instance.numero} marcada automáticamente como vencida")
            
            # Delegamos la lógica de cambio de estado al servicio
            # Pero solo registramos la acción, no ejecutamos el cambio,
            # ya que el cambio ya se hizo en la instancia
            instance._estado_cambiado_en_signal = True
    except Exception as e:
        logger.error(f"Error al verificar vencimiento de Proforma #{getattr(instance, 'id', 'nueva')}: {str(e)}")


@receiver(pre_save, sender=Proforma)
def generar_numero_proforma(sender, instance, **kwargs):
    """
    Genera un número de proforma si no existe.
    Delega la generación al servicio.
    """
    try:
        if not instance.numero or instance.numero.strip() == '':
            instance.numero = ProformaService.generate_number(instance)
            logger.info(f"Número de proforma generado automáticamente: {instance.numero}")
    except Exception as e:
        logger.error(f"Error al generar número de proforma: {str(e)}")


@receiver(post_save, sender=Proforma)
def crear_historial_proforma(sender, instance, created, update_fields=None, **kwargs):
    """
    Crea automáticamente un registro en el historial de la proforma.
    Maneja tanto las creaciones como los cambios de estado,
    reemplazando la lógica que estaba en el serializer.
    """
    try:
        # Evitar crear múltiples registros en una transacción
        if hasattr(instance, '_historial_created'):
            return
        
        # Determinar el tipo de acción basado en si es creación o cambio de estado
        if created:
            accion = 'creacion'
            estado_anterior = ''
            estado_nuevo = instance.estado
            notas = f"Proforma {instance.numero} creada con éxito"
        else:
            # Obtener estado anterior usando el valor capturado en pre_save
            estado_anterior = getattr(instance, '_estado_original', None)
            
            # Si no hay estado original capturado, intentar obtenerlo del historial
            if estado_anterior is None:
                try:
                    ultimo_historial = ProformaHistorial.objects.filter(
                        proforma=instance
                    ).order_by('-created_at').first()
                    
                    estado_anterior = ultimo_historial.estado_nuevo if ultimo_historial else instance.estado
                except Exception:
                    # Si hay un error, usar el estado actual (no ideal pero seguro)
                    estado_anterior = instance.estado
            
            # Determinar tipo de acción basado en cambio de estado
            if estado_anterior != instance.estado:
                # Mapear acciones según el estado nuevo
                if instance.estado == 'enviada':
                    accion = 'envio'
                elif instance.estado == 'aprobada':
                    accion = 'aprobacion'
                elif instance.estado == 'rechazada':
                    accion = 'rechazo'
                elif instance.estado == 'vencida':
                    accion = 'vencimiento'
                elif instance.estado == 'convertida':
                    accion = 'conversion'
                else:
                    accion = 'modificacion'
                
                estado_nuevo = instance.estado
                notas = f"Estado cambiado de {estado_anterior} a {estado_nuevo}"
            else:
                # Si no hay cambio de estado, es modificación general
                accion = 'modificacion'
                estado_nuevo = instance.estado
                
                # Solo crear historial si hay cambios en campos importantes
                if update_fields:
                    campos_importantes = {'numero', 'nombre', 'fecha_emision', 'fecha_vencimiento', 
                                         'cliente', 'empresa', 'tipo_contratacion', 'condiciones_pago',
                                         'tiempo_entrega', 'porcentaje_impuesto', 'notas'}
                    
                    campos_actualizados = set(update_fields)
                    if not campos_actualizados.intersection(campos_importantes):
                        # Si solo se actualizaron campos no importantes (ej. totales calculados),
                        # no crear entrada en historial
                        return
                
                notas = "Actualización general de datos"
        
        # Crear el registro en el historial
        with transaction.atomic():
            historial = ProformaHistorial.objects.create(
                proforma=instance,
                accion=accion,
                estado_anterior=estado_anterior,
                estado_nuevo=estado_nuevo,
                notas=notas,
                created_by=instance.updated_by or instance.created_by
            )
            
            # Marcar que ya se creó el historial para esta instancia
            instance._historial_created = True
            
            logger.info(
                f"Historial creado para Proforma #{instance.numero}: "
                f"{accion}, de {estado_anterior} a {estado_nuevo}"
            )
        
    except Exception as e:
        # Registrar error pero no interrumpir la operación principal
        logger.error(f"Error al crear historial de Proforma #{getattr(instance, 'id', 'nueva')}: {str(e)}")


@receiver(post_save, sender=ProformaItem)
@use_batch_update
def actualizar_totales_proforma(sender, instance, created, **kwargs):
    """
    Actualiza los totales de la proforma cuando se crea o modifica un ítem.
    Delega el cálculo al servicio optimizado.
    """
    try:
        # Evitar recálculos innecesarios marcando la instancia
        if hasattr(instance, '_totales_actualizados'):
            return
            
        # Actualizar los totales de la proforma usando el servicio optimizado
        proforma = instance.proforma
        
        if proforma:
            # Usar el servicio para calcular los totales y guardarlos
            with transaction.atomic():
                ProformaService.calculate_amounts(proforma, save=True)
                
                # Marcar la instancia para evitar recálculos
                instance._totales_actualizados = True
                
                logger.debug(f"Totales actualizados para Proforma #{proforma.numero}")
            
    except Exception as e:
        logger.error(f"Error al actualizar totales de Proforma: {str(e)}")


@receiver(post_delete, sender=ProformaItem)
@use_batch_update
def actualizar_totales_tras_eliminar_item(sender, instance, **kwargs):
    """
    Actualiza los totales de la proforma cuando se elimina un ítem.
    Delega el cálculo al servicio optimizado.
    """
    try:
        # Capturar la proforma antes de que se elimine la relación
        proforma = instance.proforma
        
        if proforma:
            with transaction.atomic():
                ProformaService.calculate_amounts(proforma, save=True)
                
            logger.debug(f"Totales actualizados para Proforma #{proforma.numero} tras eliminar ítem")
            
    except Exception as e:
        logger.error(f"Error al actualizar totales tras eliminar ítem: {str(e)}")


# Soporte para procesamiento de múltiples ítems
class BatchProcessor:
    """Clase para gestionar operaciones en lote de ítems"""
    
    @staticmethod
    def register_items_for_batch(items):
        """Registra ítems para procesamiento en lote"""
        for item in items:
            item._use_batch_update = True
    
    @staticmethod
    def process_pending_updates():
        """Procesa las actualizaciones pendientes"""
        process_batch_updates()


# Crea una señal personalizada para activar actualizaciones en lote
def trigger_batch_update():
    """
    Activa el procesamiento por lotes de las actualizaciones pendientes.
    Útil para llamar desde un trabajo programado o al final de una transacción.
    """
    process_batch_updates()