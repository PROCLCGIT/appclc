"""
Señales (signals) para el módulo de proformas.

Este módulo define receptores para las señales de Django que se conectan
a los eventos de los modelos Proforma y ProformaItem, delegando la lógica
de negocio al servicio ProformaService.
"""
import logging
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.db import transaction

from .models import Proforma, ProformaItem, ProformaHistorial
from .services import ProformaService

logger = logging.getLogger(__name__)


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
            # Obtener la versión anterior para comparar cambios
            try:
                # Intentar obtener el estado anterior desde historial
                ultimo_historial = ProformaHistorial.objects.filter(
                    proforma=instance
                ).order_by('-created_at').first()
                
                estado_anterior = ultimo_historial.estado_nuevo if ultimo_historial else instance.estado
            except Exception:
                # Si hay un error, usar el estado actual (no ideal pero seguro)
                estado_anterior = instance.estado
            
            # Determinar tipo de acción basado en cambio de estado
            if update_fields and 'estado' in update_fields and estado_anterior != instance.estado:
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
                # Si no hay cambio de estado o se actualiza otro campo, es modificación general
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
def actualizar_totales_proforma(sender, instance, created, **kwargs):
    """
    Actualiza los totales de la proforma cuando se crea o modifica un ítem.
    Delega el cálculo al servicio.
    """
    try:
        # Evitar recálculos innecesarios marcando la instancia
        if hasattr(instance, '_totales_actualizados'):
            return
            
        # Actualizar los totales de la proforma usando el servicio
        proforma = instance.proforma
        
        # Usar el servicio para calcular los totales y guardarlos
        # Usar update_fields para optimizar y evitar triggers innecesarios
        with transaction.atomic():
            ProformaService.calculate_amounts(proforma, save=True)
            
            # Marcar la instancia para evitar recálculos
            instance._totales_actualizados = True
            
            logger.debug(f"Totales actualizados para Proforma #{proforma.numero}")
            
    except Exception as e:
        logger.error(f"Error al actualizar totales de Proforma: {str(e)}")


@receiver(post_delete, sender=ProformaItem)
def actualizar_totales_tras_eliminar_item(sender, instance, **kwargs):
    """
    Actualiza los totales de la proforma cuando se elimina un ítem.
    Delega el cálculo al servicio.
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