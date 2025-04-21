from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal

from .models import Proforma, ProformaItem, ProformaHistorial, ConfiguracionProforma
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
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Recalcular el total si cambian los valores relevantes
        if 'cantidad' in validated_data or 'precio_unitario' in validated_data or 'porcentaje_descuento' in validated_data:
            cantidad = validated_data.get('cantidad', instance.cantidad)
            precio_unitario = validated_data.get('precio_unitario', instance.precio_unitario)
            porcentaje_descuento = validated_data.get('porcentaje_descuento', instance.porcentaje_descuento)
            
            subtotal = cantidad * precio_unitario
            descuento = subtotal * (porcentaje_descuento / Decimal('100.0'))
            validated_data['total'] = subtotal - descuento
        
        return super().update(instance, validated_data)


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
    """Serializer principal para proformas"""
    
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
    
    # Campos para indicar transiciones disponibles
    puede_enviar = serializers.SerializerMethodField(read_only=True)
    puede_aprobar = serializers.SerializerMethodField(read_only=True)
    puede_rechazar = serializers.SerializerMethodField(read_only=True)
    puede_convertir = serializers.SerializerMethodField(read_only=True)
    puede_volver_a_borrador = serializers.SerializerMethodField(read_only=True)
    
    # Flag para manejar notificaciones
    enviar_notificaciones = serializers.BooleanField(write_only=True, required=False, default=True)
    
    class Meta:
        model = Proforma
        fields = [
            'id', 'numero', 'nombre', 'fecha_emision', 'fecha_vencimiento', 'cliente', 'cliente_detail',
            'empresa', 'empresa_detail', 'tipo_contratacion', 'atencion_a', 'condiciones_pago',
            'tiempo_entrega', 'subtotal', 'porcentaje_impuesto', 'impuesto', 'total',
            'notas', 'estado', 'estado_display', 'created_by', 'created_by_username',
            'updated_by', 'updated_by_username', 'created_at', 'updated_at', 'items',
            'historial', 'items_data', 'puede_enviar', 'puede_aprobar', 'puede_rechazar',
            'puede_convertir', 'puede_volver_a_borrador', 'enviar_notificaciones'
        ]
        read_only_fields = ['subtotal', 'impuesto', 'total', 'created_at', 'updated_at']
    
    def get_puede_enviar(self, obj):
        """Determina si la proforma puede ser enviada"""
        return obj.estado == 'borrador'
    
    def get_puede_aprobar(self, obj):
        """Determina si la proforma puede ser aprobada"""
        return obj.estado == 'enviada'
    
    def get_puede_rechazar(self, obj):
        """Determina si la proforma puede ser rechazada"""
        return obj.estado == 'enviada'
    
    def get_puede_convertir(self, obj):
        """Determina si la proforma puede ser convertida a orden"""
        return obj.estado == 'aprobada'
    
    def get_puede_volver_a_borrador(self, obj):
        """Determina si la proforma puede volver a estado borrador"""
        return obj.estado in ['enviada', 'rechazada']
    
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
        """Método personalizado para crear una proforma con sus ítems"""
        # Extraer los datos de ítems si están presentes
        items_data = validated_data.pop('items_data', [])
        
        # Si no se proporciona un número de proforma, generar uno
        if 'numero' not in validated_data or not validated_data['numero']:
            validated_data['numero'] = Proforma().generar_numero()
        
        # Crear proforma
        proforma = super().create(validated_data)
        
        # Crear ítems si hay datos
        if items_data:
            for item_data in items_data:
                item_data['proforma'] = proforma.pk
                item_serializer = ProformaItemSerializer(data=item_data)
                if item_serializer.is_valid(raise_exception=True):
                    item_serializer.save()
        
        # Registrar en historial
        ProformaHistorial.objects.create(
            proforma=proforma,
            accion='creacion',
            estado_nuevo=proforma.estado,
            created_by=validated_data.get('created_by')
        )
        
        # Recalcular totales
        proforma.calcular_montos()
        proforma.save(update_fields=['subtotal', 'impuesto', 'total'])
        
        return proforma
    
    def update(self, instance, validated_data):
        """Método personalizado para actualizar una proforma"""
        # Extraer y manejar los datos de ítems si están presentes
        items_data = validated_data.pop('items_data', [])
        
        # Almacenar estado anterior para el historial
        estado_anterior = instance.estado
        estado_nuevo = validated_data.get('estado', estado_anterior)
        
        # Actualizar proforma
        proforma = super().update(instance, validated_data)
        
        # Manejar ítems si hay datos nuevos
        if items_data:
            # Opción 1: Reemplazar todos los ítems existentes
            if any(item.get('replace_all', False) for item in items_data):
                # Eliminar ítems existentes
                instance.items.all().delete()
                
                # Crear nuevos ítems
                for item_data in items_data:
                    # Eliminar la bandera replace_all si existe
                    item_data.pop('replace_all', None)
                    item_data['proforma'] = proforma.pk
                    item_serializer = ProformaItemSerializer(data=item_data)
                    if item_serializer.is_valid(raise_exception=True):
                        item_serializer.save()
            
            # Opción 2: Actualizar ítems existentes y agregar nuevos
            else:
                for item_data in items_data:
                    item_id = item_data.pop('id', None)
                    if item_id:
                        # Actualizar ítem existente
                        try:
                            item = ProformaItem.objects.get(pk=item_id, proforma=proforma)
                            item_serializer = ProformaItemSerializer(item, data=item_data, partial=True)
                            if item_serializer.is_valid(raise_exception=True):
                                item_serializer.save()
                        except ProformaItem.DoesNotExist:
                            pass
                    else:
                        # Crear nuevo ítem
                        item_data['proforma'] = proforma.pk
                        item_serializer = ProformaItemSerializer(data=item_data)
                        if item_serializer.is_valid(raise_exception=True):
                            item_serializer.save()
        
        # Registrar en historial si cambió el estado
        if estado_anterior != estado_nuevo:
            ProformaHistorial.objects.create(
                proforma=proforma,
                accion='modificacion' if estado_nuevo == estado_anterior else 'envio' if estado_nuevo == 'enviada' else 'aprobacion' if estado_nuevo == 'aprobada' else 'rechazo' if estado_nuevo == 'rechazada' else 'conversion' if estado_nuevo == 'convertida' else 'vencimiento',
                estado_anterior=estado_anterior,
                estado_nuevo=estado_nuevo,
                created_by=validated_data.get('updated_by')
            )
        
        # Recalcular totales
        proforma.calcular_montos()
        proforma.save(update_fields=['subtotal', 'impuesto', 'total'])
        
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