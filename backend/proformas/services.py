"""
Servicios para gestionar la lógica de negocio de las proformas.

Este módulo contiene servicios que encapsulan la lógica de negocio relacionada con
proformas, separando esta lógica de los modelos para mejorar la mantenibilidad.
"""
import time
import logging
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum

logger = logging.getLogger(__name__)

class ProformaService:
    """
    Servicio para gestionar operaciones y lógica de negocio de las proformas.
    """
    
    @staticmethod
    def generate_number(proforma, force_new=False):
        """
        Genera un número secuencial para la proforma utilizando
        el modelo SecuenciaProforma para garantizar unicidad.
        
        Args:
            proforma: Instancia del modelo Proforma
            force_new: Si es True, genera un nuevo número incluso si ya existe uno
            
        Returns:
            str: Número generado para la proforma
        """
        from .models import SecuenciaProforma, Proforma
        
        # Si ya tiene un número y no se fuerza generación, devolverlo
        if not force_new and proforma.numero and proforma.numero.strip():
            return proforma.numero
            
        try:
            # Obtener el año actual
            year = timezone.now().year
            
            # Obtener número desde la secuencia de manera atómica
            numero = SecuenciaProforma.obtener_siguiente_numero(year)
            
            # Verificación adicional como medida de seguridad
            if Proforma.objects.filter(numero=numero).exists():
                logger.warning(f"Colisión detectada con número {numero} a pesar del uso de secuencia, intentando nuevamente")
                
                # Generar un nuevo número con timestamp para garantizar unicidad
                timestamp = int(time.time())
                numero = f'PRO-{year}-{timestamp}'
                
                # Registrar evento inusual para investigación posterior
                logger.error(f"Se generó número alternativo con timestamp: {numero}")
            
            logger.info(f"Número de proforma generado: {numero}")
            return numero
            
        except Exception as e:
            # Registrar el error y generar un número de respaldo
            logger.error(f"Error crítico al generar número de proforma: {str(e)}")
            
            # En caso de error, generar un número basado en timestamp que sea único
            year = timezone.now().year
            timestamp = int(time.time())
            
            # Se incluye un prefijo 'E' para indicar que es un número de emergencia
            numero = f'PRO-{year}-E{timestamp}'
            logger.warning(f"Generado número de emergencia: {numero}")
            
            return numero
    
    @staticmethod
    def calculate_amounts(proforma, save=False):
        """
        Calcula los montos (subtotal, impuesto, total) de una proforma
        basándose en sus ítems.
        
        Args:
            proforma: Instancia del modelo Proforma
            save: Si es True, guarda los cambios en la proforma
            
        Returns:
            tuple: (subtotal, impuesto, total) calculados
        """
        if not proforma.pk:
            # Si la proforma no está guardada, no puede tener ítems
            proforma.subtotal = Decimal('0')
            proforma.impuesto = Decimal('0')
            proforma.total = Decimal('0')
            return (proforma.subtotal, proforma.impuesto, proforma.total)
            
        try:
            # Método optimizado usando agregación de base de datos
            items_sum = proforma.items.aggregate(subtotal_sum=Sum('total'))
            proforma.subtotal = items_sum['subtotal_sum'] or Decimal('0')
            proforma.impuesto = proforma.subtotal * (proforma.porcentaje_impuesto / Decimal('100.0'))
            proforma.total = proforma.subtotal + proforma.impuesto
            
            # Guardar los cambios si se solicita
            if save and proforma.pk:
                # Usar update_fields para optimizar la actualización
                proforma.save(update_fields=['subtotal', 'impuesto', 'total'])
                
            return (proforma.subtotal, proforma.impuesto, proforma.total)
                
        except Exception as e:
            # Método de respaldo para garantizar funcionamiento en caso de error
            logger.warning(f"Error en método optimizado de calcular_montos: {e}. Usando método de respaldo.")
            
            try:
                # Obtener ítems manualmente
                items = proforma.items.all()
                proforma.subtotal = sum(item.total for item in items)
                proforma.impuesto = proforma.subtotal * (proforma.porcentaje_impuesto / Decimal('100.0'))
                proforma.total = proforma.subtotal + proforma.impuesto
                
                # Guardar los cambios si se solicita
                if save and proforma.pk:
                    # Usar update_fields para optimizar la actualización
                    proforma.save(update_fields=['subtotal', 'impuesto', 'total'])
                    
                return (proforma.subtotal, proforma.impuesto, proforma.total)
                
            except Exception as inner_e:
                # Si todo falla, loggear y mantener los valores actuales
                logger.error(f"Error crítico calculando montos: {inner_e}")
                return (proforma.subtotal, proforma.impuesto, proforma.total)
    
    @staticmethod
    def calculate_item_total(item):
        """
        Calcula el total del ítem basado en cantidad, precio y descuento.
        
        Args:
            item: Instancia de ProformaItem
            
        Returns:
            Decimal: Total calculado
        """
        try:
            subtotal = item.cantidad * item.precio_unitario
            descuento = subtotal * (item.porcentaje_descuento / Decimal('100.0'))
            total = subtotal - descuento
            return total
        except Exception as e:
            logger.error(f"Error calculando total de ítem: {e}")
            # En caso de error, intentar devolver un valor razonable
            try:
                if hasattr(item, 'total') and item.total:
                    return item.total
                return Decimal('0')
            except:
                return Decimal('0')
    
    @staticmethod
    def complete_item_data(item):
        """
        Completa la información del ítem basada en el producto asociado.
        
        Args:
            item: Instancia de ProformaItem
            
        Returns:
            bool: True si se modificó el ítem, False en caso contrario
        """
        modified = False
        
        try:
            if item.tipo_item == 'producto_ofertado' and item.producto_ofertado:
                if not item.codigo:
                    item.codigo = item.producto_ofertado.code
                    modified = True
                if not item.descripcion:
                    item.descripcion = item.producto_ofertado.nombre
                    modified = True
                    
            elif item.tipo_item == 'producto_disponible' and item.producto_disponible:
                if not item.codigo:
                    item.codigo = item.producto_disponible.code
                    modified = True
                if not item.descripcion:
                    item.descripcion = item.producto_disponible.nombre
                    modified = True
                if not item.unidad:
                    if hasattr(item.producto_disponible, 'presentacion') and item.producto_disponible.presentacion:
                        item.unidad = item.producto_disponible.presentacion.nombre
                    else:
                        item.unidad = 'Unidad'
                    modified = True
                    
            return modified
            
        except Exception as e:
            logger.error(f"Error completando datos de ítem: {e}")
            return False
    
    @staticmethod
    def save_proforma(proforma, validate=True, calculate_amounts=True, update_history=True):
        """
        Guarda una proforma realizando todas las operaciones necesarias.
        
        Args:
            proforma: Instancia de Proforma
            validate: Si es True, realiza validaciones antes de guardar
            calculate_amounts: Si es True, calcula los montos
            update_history: Si es True, actualiza el historial
            
        Returns:
            Proforma: La instancia guardada
            
        Raises:
            ValidationError: Si validate=True y hay errores de validación
        """
        # Flag para saber si es una creación nueva
        is_creation = not proforma.pk
        old_estado = None if is_creation else proforma.estado
        
        # Transacción para garantizar atomicidad
        with transaction.atomic():
            # 1. Validar si se solicita
            if validate:
                proforma.full_clean()
            
            # 2. Generar número si no existe
            if not proforma.numero or proforma.numero.strip() == '':
                proforma.numero = ProformaService.generate_number(proforma)
                
            # 3. Calcular montos si se solicita
            if calculate_amounts:
                ProformaService.calculate_amounts(proforma)
                
            # 4. Guardar la proforma
            proforma.save()
            
            # 5. Actualizar historial si se solicita
            if update_history:
                from .models import ProformaHistorial
                
                # Determinar la acción y estados
                if is_creation:
                    accion = 'creacion'
                    estado_anterior = None
                    estado_nuevo = proforma.estado
                else:
                    accion = 'modificacion'
                    estado_anterior = old_estado
                    estado_nuevo = proforma.estado
                
                # Si cambió el estado, usar la acción específica
                if old_estado and old_estado != proforma.estado:
                    if proforma.estado == 'enviada':
                        accion = 'envio'
                    elif proforma.estado == 'aprobada':
                        accion = 'aprobacion'
                    elif proforma.estado == 'rechazada':
                        accion = 'rechazo'
                    elif proforma.estado == 'convertida':
                        accion = 'conversion'
                    elif proforma.estado == 'vencida':
                        accion = 'vencimiento'
                
                # Crear entrada en historial
                ProformaHistorial.objects.create(
                    proforma=proforma,
                    accion=accion,
                    estado_anterior=estado_anterior,
                    estado_nuevo=estado_nuevo,
                    created_by=proforma.updated_by
                )
            
            return proforma
    
    @staticmethod
    def save_proforma_item(item, validate=True, calculate_amounts=True):
        """
        Guarda un ítem de proforma y actualiza la proforma asociada.
        
        Args:
            item: Instancia de ProformaItem
            validate: Si es True, realiza validaciones antes de guardar
            calculate_amounts: Si es True, recalcula los montos de la proforma
            
        Returns:
            ProformaItem: La instancia guardada
            
        Raises:
            ValidationError: Si validate=True y hay errores de validación
        """
        with transaction.atomic():
            # 1. Validar si se solicita
            if validate:
                item.full_clean()
                
            # 2. Completar datos basados en el producto
            ProformaService.complete_item_data(item)
                
            # 3. Calcular total del ítem
            item.total = ProformaService.calculate_item_total(item)
                
            # 4. Guardar el ítem
            item.save()
                
            # 5. Actualizar montos de la proforma si se solicita
            if calculate_amounts and item.proforma:
                ProformaService.calculate_amounts(item.proforma, save=True)
                
            return item
    
    @staticmethod
    def delete_proforma_item(item, recalculate=True):
        """
        Elimina un ítem de proforma y actualiza la proforma asociada.
        
        Args:
            item: Instancia de ProformaItem
            recalculate: Si es True, recalcula los montos de la proforma
            
        Returns:
            bool: True si se eliminó correctamente
        """
        try:
            proforma = item.proforma
            item_id = item.id
            
            with transaction.atomic():
                # Eliminar el ítem
                item.delete()
                
                # Recalcular montos de la proforma si se solicita
                if recalculate and proforma:
                    ProformaService.calculate_amounts(proforma, save=True)
                    
            logger.info(f"Ítem {item_id} eliminado correctamente")
            return True
            
        except Exception as e:
            logger.error(f"Error eliminando ítem: {e}")
            return False
            
    @staticmethod
    def change_proforma_state(proforma, new_state, user=None, update_history=True):
        """
        Cambia el estado de una proforma y actualiza su historial.
        
        Args:
            proforma: Instancia de Proforma
            new_state: Nuevo estado ('borrador', 'enviada', etc.)
            user: Usuario que realiza el cambio (opcional)
            update_history: Si es True, actualiza el historial
            
        Returns:
            bool: True si se cambió correctamente
        """
        try:
            old_state = proforma.estado
            
            # Si el estado no cambia, no hacer nada
            if old_state == new_state:
                return True
                
            with transaction.atomic():
                # Actualizar estado y usuario
                proforma.estado = new_state
                if user:
                    proforma.updated_by = user
                
                # Guardar la proforma
                proforma.save(update_fields=['estado', 'updated_by', 'updated_at'])
                
                # Crear entrada en historial si se solicita
                if update_history:
                    from .models import ProformaHistorial
                    
                    # Determinar la acción
                    if new_state == 'enviada':
                        accion = 'envio'
                    elif new_state == 'aprobada':
                        accion = 'aprobacion'
                    elif new_state == 'rechazada':
                        accion = 'rechazo'
                    elif new_state == 'convertida':
                        accion = 'conversion'
                    elif new_state == 'vencida':
                        accion = 'vencimiento'
                    else:
                        accion = 'modificacion'
                    
                    # Crear entrada en historial
                    ProformaHistorial.objects.create(
                        proforma=proforma,
                        accion=accion,
                        estado_anterior=old_state,
                        estado_nuevo=new_state,
                        created_by=user
                    )
                    
            logger.info(f"Estado de proforma {proforma.numero} cambiado de {old_state} a {new_state}")
            return True
            
        except Exception as e:
            logger.error(f"Error cambiando estado de proforma: {e}")
            return False