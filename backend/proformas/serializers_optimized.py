"""
Serializers optimizados para el módulo de proformas.

Este módulo contiene versiones optimizadas de los serializers para proformas,
implementando carga masiva de ítems y eliminando la lógica de historial que ahora
está en las señales.
"""
from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal
from django.db import transaction

from .models import Proforma, ProformaItem, ProformaHistorial, ConfiguracionProforma
from .services_optimized import ProformaService
from pandora.serializers_models import ClientesSerializer, EmpresaClcSerializer
from pandora.models import Clientes, EmpresaClc
from products.serializers import ProductoOfertadoSerializer, ProductoDisponibleSerializer
from products.models import ProductoOfertado, ProductoDisponible


class ProformaItemSerializer(serializers.ModelSerializer):
    """Serializer para los ítems de una proforma"""
    
    # Campos de solo lectura para detalles de productos relacionados
    producto_ofertado_detail = ProductoOfertadoSerializer(source='producto_ofertado', read_only=True)
    producto_disponible_detail = ProductoDisponibleSerializer(source='producto_disponible', read_only=True)
    
    class Meta:
        model = ProformaItem
        fields = [
            'id', 'proforma', 'tipo_item', 'producto_ofertado', 'producto_disponible',
            'codigo', 'descripcion', 'unidad', 'cantidad', 'precio_unitario',
            'porcentaje_descuento', 'total', 'orden', 'created_at', 'updated_at',
            'producto_ofertado_detail', 'producto_disponible_detail'
        ]
        read_only_fields = ['total', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validaciones adicionales para los ítems"""
        # Verificar que al menos un producto esté seleccionado si no es personalizado
        tipo_item = data.get('tipo_item', 'personalizado')
        producto_ofertado = data.get('producto_ofertado')
        producto_disponible = data.get('producto_disponible')
        
        if tipo_item == 'producto_ofertado' and not producto_ofertado:
            raise serializers.ValidationError({
                'producto_ofertado': 'Debe seleccionar un producto ofertado para este tipo de ítem.'
            })
        
        if tipo_item == 'producto_disponible' and not producto_disponible:
            raise serializers.ValidationError({
                'producto_disponible': 'Debe seleccionar un producto disponible para este tipo de ítem.'
            })
        
        # Validar cantidad y precio
        cantidad = data.get('cantidad', 0)
        precio = data.get('precio_unitario', 0)
        
        if cantidad <= 0:
            raise serializers.ValidationError({
                'cantidad': 'La cantidad debe ser mayor que cero.'
            })
        
        if precio < 0:
            raise serializers.ValidationError({
                'precio_unitario': 'El precio no puede ser negativo.'
            })
        
        return data
    
    def create(self, validated_data):
        # Calcular el total antes de crear el ítem
        cantidad = validated_data.get('cantidad', 1)
        precio_unitario = validated_data.get('precio_unitario', 0)
        porcentaje_descuento = validated_data.get('porcentaje_descuento', 0)
        
        subtotal = cantidad * precio_unitario
        descuento = subtotal * (porcentaje_descuento / Decimal('100.0'))
        total = subtotal - descuento
        
        validated_data['total'] = total
        
        # Establecer orden si no se proporciona
        if 'orden' not in validated_data or validated_data['orden'] == 0:
            proforma = validated_data.get('proforma')
            if proforma:
                # Obtener el último orden para esta proforma
                last_item = ProformaItem.objects.filter(proforma=proforma).order_by('-orden').first()
                validated_data['orden'] = (last_item.orden + 1) if last_item else 1
        
        # Usar el service para crear el ítem y actualizar la proforma
        proforma = validated_data.get('proforma')
        
        # Si estamos en modo bulk create, no queremos que se recalculen los totales aún
        if hasattr(self.context.get('request', {}), '_bulk_operation'):
            # Crear el ítem pero desactivar el recálculo
            item = ProformaItem(**validated_data)
            item._totales_actualizados = True  # Marcar para evitar recálculo por signal
            item.save()
            return item
        else:
            # Crear el ítem normalmente con el servicio
            item = ProformaItem(**validated_data)
            return ProformaService.save_proforma_item(item)
    
    def update(self, instance, validated_data):
        # Recalcular el total si cambian los valores relevantes
        if 'cantidad' in validated_data or 'precio_unitario' in validated_data or 'porcentaje_descuento' in validated_data:
            cantidad = validated_data.get('cantidad', instance.cantidad)
            precio_unitario = validated_data.get('precio_unitario', instance.precio_unitario)
            porcentaje_descuento = validated_data.get('porcentaje_descuento', instance.porcentaje_descuento)
            
            subtotal = cantidad * precio_unitario
            descuento = subtotal * (porcentaje_descuento / Decimal('100.0'))
            validated_data['total'] = subtotal - descuento
        
        # Si estamos en modo bulk update, no queremos que se recalculen los totales aún
        if hasattr(self.context.get('request', {}), '_bulk_operation'):
            # Actualizar el ítem pero desactivar el recálculo
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance._totales_actualizados = True  # Marcar para evitar recálculo por signal
            instance.save()
            return instance
        else:
            # Actualizar normalmente
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            return ProformaService.save_proforma_item(instance)


class ProformaHistorialSerializer(serializers.ModelSerializer):
    """Serializer para el historial de acciones en una proforma"""
    
    accion_display = serializers.CharField(source='get_accion_display', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = ProformaHistorial
        fields = [
            'id', 'proforma', 'accion', 'accion_display', 'estado_anterior', 
            'estado_nuevo', 'notas', 'created_by', 'created_by_username', 'created_at'
        ]
        read_only_fields = ['created_at']


class ProformaSerializer(serializers.ModelSerializer):
    """Serializer principal para proformas con optimizaciones de rendimiento"""
    
    # Campos anidados para relaciones
    items = ProformaItemSerializer(many=True, read_only=True)
    cliente_detail = ClientesSerializer(source='cliente', read_only=True)
    empresa_detail = EmpresaClcSerializer(source='empresa', read_only=True)
    historial = ProformaHistorialSerializer(many=True, read_only=True)
    
    # Campo para crear ítems al mismo tiempo que la proforma
    items_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    # Campos calculados
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = Proforma
        fields = [
            'id', 'numero', 'nombre', 'fecha_emision', 'fecha_vencimiento', 'cliente', 'cliente_detail',
            'empresa', 'empresa_detail', 'tipo_contratacion', 'atencion_a', 'condiciones_pago',
            'tiempo_entrega', 'subtotal', 'porcentaje_impuesto', 'impuesto', 'total',
            'notas', 'estado', 'estado_display', 'created_by', 'created_by_username',
            'updated_by', 'updated_by_username', 'created_at', 'updated_at', 'items',
            'historial', 'items_data'
        ]
        read_only_fields = ['subtotal', 'impuesto', 'total', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validaciones adicionales para proformas"""
        # Validar fechas
        fecha_emision = data.get('fecha_emision', None)
        fecha_vencimiento = data.get('fecha_vencimiento', None)
        
        if fecha_emision and fecha_vencimiento and fecha_vencimiento < fecha_emision:
            raise serializers.ValidationError({
                'fecha_vencimiento': 'La fecha de vencimiento no puede ser anterior a la fecha de emisión.'
            })
        
        # Validar que existan cliente y empresa
        cliente = data.get('cliente', None)
        if not cliente and not self.instance:
            raise serializers.ValidationError({
                'cliente': 'Debe seleccionar un cliente para la proforma.'
            })
        
        empresa = data.get('empresa', None)
        if not empresa and not self.instance:
            raise serializers.ValidationError({
                'empresa': 'Debe seleccionar una empresa emisora para la proforma.'
            })
        
        return data
    
    def create(self, validated_data):
        """Método optimizado para crear una proforma con sus ítems usando bulk create"""
        # Extraer los datos de ítems si están presentes
        items_data = validated_data.pop('items_data', [])
        
        # Crear proforma usando el servicio para generar número automáticamente
        # y asegurar que las señales manejen el historial
        proforma = ProformaService.save_proforma(Proforma(**validated_data))
        
        # Crear ítems si hay datos, usando bulk_create para mejor rendimiento
        if items_data:
            # Marcar el contexto como operación masiva
            if self.context.get('request'):
                self.context['request']._bulk_operation = True
            
            # Preparar ítems para crear en lote
            item_instances = []
            for idx, item_data in enumerate(items_data):
                # Preparar datos del ítem
                item_data['proforma'] = proforma
                
                # Establecer orden si no se proporciona
                if 'orden' not in item_data or item_data['orden'] == 0:
                    item_data['orden'] = idx + 1
                
                # Calcular total
                cantidad = item_data.get('cantidad', 1)
                precio_unitario = item_data.get('precio_unitario', 0)
                porcentaje_descuento = item_data.get('porcentaje_descuento', 0)
                
                subtotal = Decimal(cantidad) * Decimal(precio_unitario)
                descuento = subtotal * (Decimal(porcentaje_descuento) / Decimal('100.0'))
                item_data['total'] = subtotal - descuento
                
                # Crear instancia de ítem
                item = ProformaItem(**item_data)
                item_instances.append(item)
            
            # Crear ítems en lote
            if item_instances:
                ProformaItem.objects.bulk_create(item_instances)
                
                # Actualizar los totales de la proforma
                ProformaService.calculate_amounts(proforma, save=True)
        
        return proforma
    
    def update(self, instance, validated_data):
        """Método optimizado para actualizar una proforma"""
        # Extraer y manejar los datos de ítems si están presentes
        items_data = validated_data.pop('items_data', [])
        
        # Almacenar estado anterior para el historial
        estado_anterior = instance.estado
        
        # Actualizar proforma usando el servicio
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Actualizar con el servicio, la lógica de historial está ahora en señales
        proforma = ProformaService.save_proforma(
            instance, 
            validate=True, 
            calculate_amounts=False  # Calcularemos después de procesar ítems
        )
        
        # Manejar ítems si hay datos nuevos
        if items_data:
            # Marcar el contexto como operación masiva
            if self.context.get('request'):
                self.context['request']._bulk_operation = True
            
            with transaction.atomic():
                # Opción 1: Reemplazar todos los ítems existentes
                if any(item.get('replace_all', False) for item in items_data):
                    # Eliminar ítems existentes
                    instance.items.all().delete()
                    
                    # Preparar nuevos ítems para bulk create
                    new_items = []
                    for idx, item_data in enumerate(items_data):
                        # Eliminar la bandera replace_all si existe
                        item_data.pop('replace_all', None)
                        
                        # Preparar datos
                        item_data['proforma'] = proforma
                        
                        # Establecer orden si no se proporciona
                        if 'orden' not in item_data or item_data['orden'] == 0:
                            item_data['orden'] = idx + 1
                        
                        # Calcular total
                        cantidad = item_data.get('cantidad', 1)
                        precio_unitario = item_data.get('precio_unitario', 0)
                        porcentaje_descuento = item_data.get('porcentaje_descuento', 0)
                        
                        subtotal = Decimal(cantidad) * Decimal(precio_unitario)
                        descuento = subtotal * (Decimal(porcentaje_descuento) / Decimal('100.0'))
                        item_data['total'] = subtotal - descuento
                        
                        # Crear instancia
                        item = ProformaItem(**item_data)
                        new_items.append(item)
                    
                    # Crear ítems en lote
                    if new_items:
                        ProformaItem.objects.bulk_create(new_items)
                
                # Opción 2: Actualizar ítems existentes y agregar nuevos
                else:
                    # Separar ítems a actualizar y a crear
                    items_to_update = []
                    new_items_data = []
                    
                    for item_data in items_data:
                        item_id = item_data.pop('id', None)
                        if item_id:
                            # Agregar a la lista de actualizaciones
                            items_to_update.append((item_id, item_data))
                        else:
                            # Agregar a la lista de creaciones
                            new_items_data.append(item_data)
                    
                    # Actualizar ítems existentes en lote
                    if items_to_update:
                        # Obtener todos los ítems a actualizar en una sola consulta
                        item_ids = [id for id, _ in items_to_update]
                        items_dict = {item.id: item for item in 
                                     ProformaItem.objects.filter(id__in=item_ids, proforma=proforma)}
                        
                        updated_items = []
                        for item_id, item_data in items_to_update:
                            if item_id in items_dict:
                                item = items_dict[item_id]
                                
                                # Actualizar campos
                                for attr, value in item_data.items():
                                    setattr(item, attr, value)
                                
                                # Recalcular total si es necesario
                                if 'cantidad' in item_data or 'precio_unitario' in item_data or 'porcentaje_descuento' in item_data:
                                    cantidad = item.cantidad
                                    precio_unitario = item.precio_unitario
                                    porcentaje_descuento = item.porcentaje_descuento
                                    
                                    subtotal = cantidad * precio_unitario
                                    descuento = subtotal * (porcentaje_descuento / Decimal('100.0'))
                                    item.total = subtotal - descuento
                                
                                updated_items.append(item)
                        
                        # Actualizar en lote
                        if updated_items:
                            ProformaItem.objects.bulk_update(
                                updated_items, 
                                ['tipo_item', 'producto_ofertado', 'producto_disponible', 
                                 'codigo', 'descripcion', 'unidad', 'cantidad', 
                                 'precio_unitario', 'porcentaje_descuento', 'total', 'orden']
                            )
                    
                    # Crear nuevos ítems en lote
                    if new_items_data:
                        new_items = []
                        for idx, item_data in enumerate(new_items_data):
                            # Preparar datos
                            item_data['proforma'] = proforma
                            
                            # Establecer orden si no se proporciona
                            if 'orden' not in item_data or item_data['orden'] == 0:
                                # Obtener el último orden actual
                                last_order = ProformaItem.objects.filter(proforma=proforma).order_by('-orden').values_list('orden', flat=True).first() or 0
                                item_data['orden'] = last_order + idx + 1
                            
                            # Calcular total
                            cantidad = item_data.get('cantidad', 1)
                            precio_unitario = item_data.get('precio_unitario', 0)
                            porcentaje_descuento = item_data.get('porcentaje_descuento', 0)
                            
                            subtotal = Decimal(cantidad) * Decimal(precio_unitario)
                            descuento = subtotal * (Decimal(porcentaje_descuento) / Decimal('100.0'))
                            item_data['total'] = subtotal - descuento
                            
                            # Crear instancia
                            item = ProformaItem(**item_data)
                            new_items.append(item)
                        
                        # Crear ítems en lote
                        if new_items:
                            ProformaItem.objects.bulk_create(new_items)
                
                # Recalcular totales después de todas las operaciones
                ProformaService.calculate_amounts(proforma, save=True)
        
        return proforma


class ConfiguracionProformaSerializer(serializers.ModelSerializer):
    """Serializer para la configuración global de proformas"""
    
    empresa_predeterminada_detail = EmpresaClcSerializer(source='empresa_predeterminada', read_only=True)
    
    class Meta:
        model = ConfiguracionProforma
        fields = [
            'id', 'empresa_predeterminada', 'empresa_predeterminada_detail', 
            'dias_validez', 'porcentaje_impuesto_default', 'texto_condiciones_pago',
            'texto_tiempo_entrega', 'notas_predeterminadas', 'mostrar_logo',
            'mostrar_descuento', 'mostrar_impuesto', 'mostrar_codigos',
            'formato_moneda', 'decimales'
        ]
    
    def validate_decimales(self, value):
        """Validar que los decimales estén en un rango sensato"""
        if value < 0 or value > 4:
            raise serializers.ValidationError("Los decimales deben estar entre 0 y 4.")
        return value


class BusquedaProductosSerializer(serializers.Serializer):
    """Serializer para búsqueda unificada de productos"""
    
    id = serializers.CharField(read_only=True)
    code = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)
    source = serializers.CharField(read_only=True)
    price = serializers.DecimalField(read_only=True, max_digits=12, decimal_places=2)
    unit = serializers.CharField(read_only=True)
    
    @classmethod
    def from_producto_ofertado(cls, producto):
        """Convierte un ProductoOfertado al formato de búsqueda"""
        return {
            'id': f"of-{producto.id}",
            'code': producto.code,
            'description': producto.nombre,
            'source': 'ofertados',
            'price': Decimal('0.00'),  # ProductoOfertado no tiene precio
            'unit': 'Unidad'  # ProductoOfertado no tiene unidad específica
        }
    
    @classmethod
    def from_producto_disponible(cls, producto):
        """Convierte un ProductoDisponible al formato de búsqueda"""
        return {
            'id': f"disp-{producto.id}",
            'code': producto.code,
            'description': producto.nombre,
            'source': 'disponibles',
            'price': producto.precio_venta_privado or producto.precio_sie_referencial or Decimal('0.00'),
            'unit': producto.presentacion.nombre if hasattr(producto, 'presentacion') and producto.presentacion else 'Unidad'
        }