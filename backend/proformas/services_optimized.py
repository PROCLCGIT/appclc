"""
Servicios para gestionar la lógica de negocio de las proformas.

Este módulo contiene servicios que encapsulan la lógica de negocio relacionada con
proformas, separando esta lógica de los modelos para mejorar la mantenibilidad
y optimizando las operaciones de cálculo para mejor rendimiento.
"""
import time
import logging
from decimal import Decimal
from django.utils import timezone
from django.db import transaction, connection
from django.db.models import Sum, F, ExpressionWrapper, DecimalField, Case, When, Value

logger = logging.getLogger(__name__)

class ProformaService:
    """
    Servicio para gestionar operaciones y lógica de negocio de las proformas.
    Incluye optimizaciones para cálculos de montos y operaciones en lote.
    """
    
    # Constantes para queries directas SQL
    SQL_UPDATE_TOTALS = """
    UPDATE proformas_proforma p
    SET subtotal = COALESCE(t.suma_total, 0),
        impuesto = COALESCE(t.suma_total, 0) * (p.porcentaje_impuesto / 100.0),
        total = COALESCE(t.suma_total, 0) + (COALESCE(t.suma_total, 0) * (p.porcentaje_impuesto / 100.0))
    FROM (
        SELECT proforma_id, SUM(total) as suma_total
        FROM proformas_proformaitem
        WHERE proforma_id = %s
        GROUP BY proforma_id
    ) AS t
    WHERE p.id = t.proforma_id AND p.id = %s
    """
    
    SQL_UPDATE_TOTALS_BATCH = """
    UPDATE proformas_proforma p
    SET subtotal = COALESCE(t.suma_total, 0),
        impuesto = COALESCE(t.suma_total, 0) * (p.porcentaje_impuesto / 100.0),
        total = COALESCE(t.suma_total, 0) + (COALESCE(t.suma_total, 0) * (p.porcentaje_impuesto / 100.0))
    FROM (
        SELECT proforma_id, SUM(total) as suma_total
        FROM proformas_proformaitem
        WHERE proforma_id IN %s
        GROUP BY proforma_id
    ) AS t
    WHERE p.id = t.proforma_id AND p.id IN %s
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
    def calculate_amounts(proforma, save=False):
        """
        Calcula los montos (subtotal, impuesto, total) de una proforma
        basándose en sus ítems. Versión optimizada que usa una sola consulta SQL.
        
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
            # Usar una consulta SQL directa para actualizar los totales
            # Esto es más eficiente que hacer una agregación seguida de un update
            if save:
                with connection.cursor() as cursor:
                    cursor.execute(ProformaService.SQL_UPDATE_TOTALS, [proforma.pk, proforma.pk])
                    # Refrescar valores desde la base de datos
                    proforma.refresh_from_db(fields=['subtotal', 'impuesto', 'total'])
                    logger.debug(f"Totales actualizados para proforma {proforma.numero} usando SQL directo")
                return (proforma.subtotal, proforma.impuesto, proforma.total)
            else:
                # Si no guardamos, usamos agregación para obtener los valores calculados
                from .models import ProformaItem
                items_sum = ProformaItem.objects.filter(proforma=proforma).aggregate(subtotal_sum=Sum('total'))
                subtotal = items_sum['subtotal_sum'] or Decimal('0')
                impuesto = subtotal * (proforma.porcentaje_impuesto / Decimal('100.0'))
                total = subtotal + impuesto
                
                # Actualizar la instancia pero no guardar
                proforma.subtotal = subtotal
                proforma.impuesto = impuesto
                proforma.total = total
                
                return (subtotal, impuesto, total)
        except Exception as e:
            logger.error(f"Error en cálculo optimizado de montos: {e}. Usando método de respaldo.")
            
            try:
                # Método de respaldo usando Python puro
                from .models import ProformaItem
                items = ProformaItem.objects.filter(proforma=proforma)
                subtotal = sum(item.total for item in items)
                impuesto = subtotal * (proforma.porcentaje_impuesto / Decimal('100.0'))
                total = subtotal + impuesto
                
                # Actualizar la instancia
                proforma.subtotal = subtotal
                proforma.impuesto = impuesto
                proforma.total = total
                
                # Guardar si se solicita
                if save:
                    proforma.save(update_fields=['subtotal', 'impuesto', 'total'])
                
                return (subtotal, impuesto, total)
            except Exception as inner_e:
                logger.error(f"Error crítico en el cálculo de montos: {inner_e}")
                return (proforma.subtotal, proforma.impuesto, proforma.total)

    @staticmethod
    def calculate_amounts_batch(proforma_ids):
        """
        Calcula los montos de múltiples proformas en un solo proceso por lotes.
        Altamente eficiente para operaciones de actualización masiva.
        
        Args:
            proforma_ids: Lista de IDs de proformas a actualizar
            
        Returns:
            int: Número de proformas actualizadas
        """
        if not proforma_ids:
            return 0
            
        try:
            # Usar la consulta SQL de lote para actualizar múltiples proformas de una vez
            with connection.cursor() as cursor:
                cursor.execute(
                    ProformaService.SQL_UPDATE_TOTALS_BATCH, 
                    [tuple(proforma_ids), tuple(proforma_ids)]
                )
                return len(proforma_ids)
        except Exception as e:
            logger.error(f"Error en actualización por lotes de proformas {proforma_ids}: {e}")
            
            # Método de respaldo: actualizar una por una
            try:
                from .models import Proforma
                count = 0
                for proforma_id in proforma_ids:
                    try:
                        proforma = Proforma.objects.get(pk=proforma_id)
                        ProformaService.calculate_amounts(proforma, save=True)
                        count += 1
                    except Exception as inner_e:
                        logger.error(f"Error actualizando proforma {proforma_id}: {inner_e}")
                return count
            except Exception as global_e:
                logger.error(f"Error crítico en actualización por lotes: {global_e}")
                return 0

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
                
            # 3. Guardar primero para asegurar que existe el ID
            if is_creation or not calculate_amounts:
                proforma.save()
            
            # 4. Calcular montos si se solicita (usando SQL optimizado)
            if calculate_amounts and proforma.pk:
                ProformaService.calculate_amounts(proforma, save=True)
            elif not calculate_amounts:
                # Si no calculamos montos, debemos guardar
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
    def save_proforma_items_batch(items, validate=True, calculate_once=True):
        """
        Guarda múltiples ítems de proforma en lote y actualiza los totales una sola vez.
        
        Args:
            items: Lista de instancias de ProformaItem
            validate: Si es True, realiza validaciones antes de guardar
            calculate_once: Si es True, calcula los totales una sola vez al final
            
        Returns:
            tuple: (items_guardados, proformas_actualizadas)
        """
        if not items:
            return (0, 0)
            
        proforma_ids = set()
        saved_count = 0
        
        with transaction.atomic():
            # Guardar ítems uno por uno
            for item in items:
                try:
                    # 1. Validar si se solicita
                    if validate:
                        item.full_clean()
                    
                    # 2. Completar datos y calcular total
                    ProformaService.complete_item_data(item)
                    item.total = ProformaService.calculate_item_total(item)
                    
                    # 3. Guardar ítem
                    item.save()
                    saved_count += 1
                    
                    # 4. Registrar ID de proforma para actualización posterior
                    if item.proforma_id:
                        proforma_ids.add(item.proforma_id)
                except Exception as e:
                    logger.error(f"Error guardando ítem {getattr(item, 'id', 'nuevo')}: {e}")
            
            # Actualizar totales de proformas afectadas en una sola operación
            if calculate_once and proforma_ids:
                updated_proformas = ProformaService.calculate_amounts_batch(list(proforma_ids))
                logger.info(f"Actualizados totales de {updated_proformas} proformas en lote")
                
            return (saved_count, len(proforma_ids))

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
                
            # 5. Actualizar montos de la proforma si se solicita (usando SQL optimizado)
            if calculate_amounts and item.proforma_id:
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
            proforma_id = proforma.id if proforma else None
            item_id = item.id
            
            with transaction.atomic():
                # Eliminar el ítem
                item.delete()
                
                # Recalcular montos de la proforma si se solicita (usando SQL optimizado)
                if recalculate and proforma_id:
                    ProformaService.calculate_amounts(proforma, save=True)
                    
            logger.info(f"Ítem {item_id} eliminado correctamente")
            return True
            
        except Exception as e:
            logger.error(f"Error eliminando ítem: {e}")
            return False
            
    @staticmethod
    def delete_proforma_items_batch(items, recalculate_once=True):
        """
        Elimina múltiples ítems de proforma en lote y actualiza los totales una sola vez.
        
        Args:
            items: Lista de instancias de ProformaItem
            recalculate_once: Si es True, calcula los totales una sola vez al final
            
        Returns:
            tuple: (items_eliminados, proformas_actualizadas)
        """
        if not items:
            return (0, 0)
            
        proforma_ids = set()
        deleted_count = 0
        
        with transaction.atomic():
            # Identificar proformas afectadas e IDs de ítems
            for item in items:
                if item.proforma_id:
                    proforma_ids.add(item.proforma_id)
            
            # Eliminar ítems de una vez
            from django.db.models import QuerySet
            if isinstance(items, QuerySet):
                deleted_count = items.delete()[0]
            else:
                from .models import ProformaItem
                item_ids = [item.id for item in items if item.id]
                if item_ids:
                    deleted_count = ProformaItem.objects.filter(id__in=item_ids).delete()[0]
            
            # Actualizar totales de proformas afectadas en una sola operación
            if recalculate_once and proforma_ids:
                updated_proformas = ProformaService.calculate_amounts_batch(list(proforma_ids))
                logger.info(f"Actualizados totales de {updated_proformas} proformas en lote tras eliminar ítems")
                
            return (deleted_count, len(proforma_ids))
            
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