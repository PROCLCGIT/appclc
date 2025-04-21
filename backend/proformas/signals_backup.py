"""
Señales (signals) para el módulo de proformas
Automatiza tareas como la creación de registros de historial
"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Proforma, ProformaHistorial

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Proforma)
def crear_historial_proforma(sender, instance, created, update_fields=None, **kwargs):
    """
    Crea automáticamente un registro en el historial de la proforma cuando
    se crea o actualiza una proforma.
    """
    try:
        # Determinar el tipo de acción basado en si es creación o cambio de estado
        if created:
            accion = 'creacion'
            estado_anterior = ''
            estado_nuevo = instance.estado
            notas = f"Proforma {instance.numero} creada con éxito"
        else:
            # Si solo se actualizó el estado, es un cambio de estado
            if update_fields and 'estado' in update_fields:
                # Mapear acciones del estado
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

                # Obtener estado anterior (no es posible directamente, usamos historial)
                ultimo_historial = ProformaHistorial.objects.filter(
                    proforma=instance
                ).order_by('-created_at').first()
                
                estado_anterior = ultimo_historial.estado_nuevo if ultimo_historial else ''
                estado_nuevo = instance.estado
                notas = f"Estado cambiado de {estado_anterior} a {estado_nuevo}"
            else:
                # Es una modificación general
                accion = 'modificacion'
                estado_anterior = instance.estado
                estado_nuevo = instance.estado
                notas = "Actualización general de datos"
        
        # Crear el registro en el historial
        historial = ProformaHistorial.objects.create(
            proforma=instance,
            accion=accion,
            estado_anterior=estado_anterior,
            estado_nuevo=estado_nuevo,
            notas=notas,
            created_by=instance.updated_by or instance.created_by
        )
        
        logger.info(
            f"Historial creado para Proforma #{instance.numero}: "
            f"{accion}, de {estado_anterior} a {estado_nuevo}"
        )
        
    except Exception as e:
        # Registrar error pero no interrumpir la operación principal
        logger.error(f"Error al crear historial de Proforma #{instance.id}: {str(e)}")
