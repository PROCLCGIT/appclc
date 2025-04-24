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
from .services import ProformaService
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
        """
        Validaciones detalladas para los ítems de proforma.
        Esta función centraliza todas las validaciones de negocio para ProformaItem.
        """
        # Obtener la instancia actual (si es actualización)
        instance = self.instance
        is_update = instance is not None
        
        # ===============================================================
        # 1. VALIDACIONES DE CAMPOS OBLIGATORIOS Y CONSISTENCIA
        # ===============================================================
        errors = {}
        
        # Verificar consistencia entre tipo de ítem y producto seleccionado
        tipo_item = data.get('tipo_item', 'personalizado')
        producto_ofertado = data.get('producto_ofertado')
        producto_disponible = data.get('producto_disponible')
        
        # Validar selección de producto según tipo
        item_type_validations = {
            'producto_ofertado': (producto_ofertado, 'Debe seleccionar un producto ofertado para este tipo de ítem.'),
            'producto_disponible': (producto_disponible, 'Debe seleccionar un producto disponible para este tipo de ítem.')
        }
        
        if tipo_item in item_type_validations:
            product, error_msg = item_type_validations[tipo_item]
            if not product:
                errors[tipo_item] = error_msg
        
        # Validar que no se seleccionen productos de diferentes tipos
        if tipo_item != 'producto_ofertado' and producto_ofertado:
            errors['producto_ofertado'] = f'No debe seleccionar un producto ofertado para ítems de tipo {tipo_item}.'
            
        if tipo_item != 'producto_disponible' and producto_disponible:
            errors['producto_disponible'] = f'No debe seleccionar un producto disponible para ítems de tipo {tipo_item}.'
        
        # Validar descripción (campo obligatorio)
        descripcion = data.get('descripcion', '')
        if not descripcion or not descripcion.strip():
            errors['descripcion'] = 'La descripción del ítem no puede estar vacía.'
            
        # ===============================================================
        # 2. VALIDACIONES DE VALORES NUMÉRICOS
        # ===============================================================
        
        # Validar cantidad
        cantidad = data.get('cantidad', 0)
        if cantidad <= 0:
            errors['cantidad'] = 'La cantidad debe ser mayor que cero.'
        
        # Validar precio unitario
        precio = data.get('precio_unitario', 0)
        if precio < 0:
            errors['precio_unitario'] = 'El precio no puede ser negativo.'
            
        # Validar porcentaje de descuento
        porcentaje_descuento = data.get('porcentaje_descuento', 0)
        if porcentaje_descuento < 0 or porcentaje_descuento > 100:
            errors['porcentaje_descuento'] = 'El porcentaje de descuento debe estar entre 0 y 100.'
            
        # ===============================================================
        # 3. CÁLCULOS Y VALIDACIONES DE LÍMITES
        # ===============================================================
        
        # Pre-calcular el total para validar límites
        if 'cantidad' in data or 'precio_unitario' in data or 'porcentaje_descuento' in data:
            try:
                # Utilizar valores de la instancia si no están en los datos
                if is_update:
                    if 'cantidad' not in data:
                        cantidad = instance.cantidad
                    if 'precio_unitario' not in data:
                        precio = instance.precio_unitario
                    if 'porcentaje_descuento' not in data:
                        porcentaje_descuento = instance.porcentaje_descuento
                
                subtotal = cantidad * precio
                descuento = subtotal * (porcentaje_descuento / Decimal('100.0'))
                total = subtotal - descuento
                
                # Validar que el total sea válido
                if total < 0:
                    errors['total'] = 'El total calculado es negativo. Revise la cantidad, precio y descuento.'
                
                # Validar que el total no exceda límites del campo
                if total > 9999999999.99:
                    errors['total'] = 'El total calculado excede el límite permitido (máximo 12 dígitos).'
                    
            except (TypeError, ValueError) as e:
                errors['error'] = f'Error al calcular el total: {str(e)}'
        
        # Si hay errores, lanzar excepción
        if errors:
            raise serializers.ValidationError(errors)
            
        # ===============================================================
        # 4. VALIDACIONES DE NEGOCIO ADICIONALES
        # ===============================================================
        
        # Ejemplo: Verificar stock si es un producto disponible
        if tipo_item == 'producto_disponible' and producto_disponible:
            try:
                # Esta es una regla de negocio que verifica disponibilidad
                if hasattr(producto_disponible, 'stock') and producto_disponible.stock < cantidad:
                    raise serializers.ValidationError({
                        'cantidad': f'Stock insuficiente. Disponible: {producto_disponible.stock}.'
                    })
            except Exception as e:
                # Si no podemos verificar stock, lo registramos pero no fallamos
                logger.warning(f"No se pudo verificar stock para {producto_disponible}: {e}")
        
        # ===============================================================
        # 5. ENRIQUECIMIENTO DE DATOS
        # ===============================================================
        
        # Auto-completar datos basados en el producto (si no se proporcionan)
        if tipo_item == 'producto_ofertado' and producto_ofertado:
            if 'codigo' not in data or not data.get('codigo'):
                data['codigo'] = producto_ofertado.code
                
            if 'unidad' not in data or not data.get('unidad'):
                data['unidad'] = 'Unidad'  # Valor por defecto para productos ofertados
                
        elif tipo_item == 'producto_disponible' and producto_disponible:
            if 'codigo' not in data or not data.get('codigo'):
                data['codigo'] = producto_disponible.code
                
            if 'unidad' not in data or not data.get('unidad'):
                if hasattr(producto_disponible, 'presentacion') and producto_disponible.presentacion:
                    data['unidad'] = producto_disponible.presentacion.nombre
                else:
                    data['unidad'] = 'Unidad'
                    
            # Si no se proporciona precio y es un producto disponible, usar el precio de venta
            if 'precio_unitario' not in data and precio == 0:
                if hasattr(producto_disponible, 'precio_venta_privado') and producto_disponible.precio_venta_privado:
                    data['precio_unitario'] = producto_disponible.precio_venta_privado
                elif hasattr(producto_disponible, 'precio_sie_referencial') and producto_disponible.precio_sie_referencial:
                    data['precio_unitario'] = producto_disponible.precio_sie_referencial
        
        return data
    
    def create(self, validated_data):
        # Calcular el total antes de crear el ítem usando el método utilitario
        cantidad = validated_data.get('cantidad', 1)
        precio_unitario = validated_data.get('precio_unitario', 0)
        porcentaje_descuento = validated_data.get('porcentaje_descuento', 0)
        
        # Usar el método utilitario para calcular el total
        total = ProformaService.calculate_item_total_from_values(
            cantidad, precio_unitario, porcentaje_descuento
        )
        
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
            item.save(_from_serializer=True)  # Indicar que los datos vienen del serializer
            return item
        else:
            # Crear el ítem normalmente con el servicio, indicando que los datos vienen del serializer
            item = ProformaItem(**validated_data)
            return ProformaService.save_proforma_item(item, from_serializer=True)
    
    def update(self, instance, validated_data):
        # Recalcular el total si cambian los valores relevantes usando el método utilitario
        if 'cantidad' in validated_data or 'precio_unitario' in validated_data or 'porcentaje_descuento' in validated_data:
            cantidad = validated_data.get('cantidad', instance.cantidad)
            precio_unitario = validated_data.get('precio_unitario', instance.precio_unitario)
            porcentaje_descuento = validated_data.get('porcentaje_descuento', instance.porcentaje_descuento)
            
            # Usar el método utilitario para calcular el total
            validated_data['total'] = ProformaService.calculate_item_total_from_values(
                cantidad, precio_unitario, porcentaje_descuento
            )
        
        # Si estamos en modo bulk update, no queremos que se recalculen los totales aún
        if hasattr(self.context.get('request', {}), '_bulk_operation'):
            # Actualizar el ítem pero desactivar el recálculo
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance._totales_actualizados = True  # Marcar para evitar recálculo por signal
            instance.save(_from_serializer=True)  # Indicar que los datos vienen del serializer
            return instance
        else:
            # Actualizar normalmente, indicando que los datos vienen del serializer
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            return ProformaService.save_proforma_item(instance, from_serializer=True)


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
        """
        Validaciones detalladas para proformas.
        Esta función centraliza todas las validaciones de negocio para Proforma.
        """
        # Obtener la instancia actual (si es actualización)
        instance = self.instance
        is_update = instance is not None
        
        # ===============================================================
        # 1. VALIDACIONES DE CAMPOS OBLIGATORIOS
        # ===============================================================
        errors = {}
        
        # Validar campos obligatorios sólo en creación (no en actualización)
        if not is_update:
            required_fields = {
                'fecha_emision': 'La fecha de emisión es obligatoria.',
                'fecha_vencimiento': 'La fecha de vencimiento es obligatoria.',
                'cliente': 'Debe seleccionar un cliente para la proforma.',
                'empresa': 'Debe seleccionar una empresa emisora para la proforma.'
            }
            
            for field, error_msg in required_fields.items():
                if field not in data or data.get(field) is None:
                    errors[field] = error_msg
        
        # ===============================================================
        # 2. VALIDACIONES DE FORMATOS Y RANGOS
        # ===============================================================
        
        # Validar porcentaje de impuesto
        porcentaje_impuesto = data.get('porcentaje_impuesto', None)
        if porcentaje_impuesto is not None and (porcentaje_impuesto < 0 or porcentaje_impuesto > 100):
            errors['porcentaje_impuesto'] = 'El porcentaje de impuesto debe estar entre 0 y 100.'
        
        # Validar longitud del nombre
        nombre = data.get('nombre', '')
        if nombre and len(nombre) > 255:
            errors['nombre'] = 'El nombre de la proforma no puede exceder los 255 caracteres.'
        
        # ===============================================================
        # 3. VALIDACIONES DE RELACIONES LÓGICAS ENTRE CAMPOS
        # ===============================================================
        
        # Validar relación entre fechas de emisión y vencimiento
        fecha_emision = data.get('fecha_emision')
        fecha_vencimiento = data.get('fecha_vencimiento')
        
        if fecha_emision and fecha_vencimiento and fecha_vencimiento < fecha_emision:
            errors['fecha_vencimiento'] = 'La fecha de vencimiento no puede ser anterior a la fecha de emisión.'
        
        # Validar que la fecha de emisión no sea futura
        if fecha_emision and fecha_emision > timezone.now().date():
            errors['fecha_emision'] = 'La fecha de emisión no puede ser una fecha futura.'
        
        # ===============================================================
        # 4. VALIDACIONES DE ESTADOS Y TRANSICIONES
        # ===============================================================
        
        # Validar estado
        estado = data.get('estado')
        if estado:
            estados_validos = dict(Proforma.ESTADO_CHOICES).keys()
            if estado not in estados_validos:
                errors['estado'] = f'Estado no válido. Opciones: {", ".join(estados_validos)}'
            
            # Validar transiciones de estado permitidas
            if is_update and estado != instance.estado:
                # Definir transiciones permitidas
                transiciones_permitidas = {
                    'borrador': ['enviada'],
                    'enviada': ['aprobada', 'rechazada', 'borrador'],
                    'aprobada': ['convertida', 'vencida'],
                    'rechazada': ['borrador'],
                    'vencida': [],
                    'convertida': []
                }
                
                # Verificar si la transición es válida
                if estado not in transiciones_permitidas.get(instance.estado, []):
                    current_state_name = dict(Proforma.ESTADO_CHOICES).get(instance.estado, instance.estado)
                    new_state_name = dict(Proforma.ESTADO_CHOICES).get(estado, estado)
                    errors['estado'] = f'No se permite la transición de "{current_state_name}" a "{new_state_name}".'
        
        # Si hay errores, lanzar excepción
        if errors:
            raise serializers.ValidationError(errors)
            
        # ===============================================================
        # 5. VALIDACIONES DE NEGOCIO ADICIONALES
        # ===============================================================
        
        # Ejemplo: Validar que ciertas combinaciones de cliente y tipo de contratación sean válidas
        # (esto sería específico de las reglas de negocio particulares)
        
        # Ejemplo: Validar que la proforma no exceda cierto monto según el tipo de cliente
        # (regla de negocio específica)
        
        # ===============================================================
        # 6. ENRIQUECIMIENTO DE DATOS
        # ===============================================================
        
        # Ejemplo: Si no se proporciona fecha de vencimiento pero sí de emisión, 
        # calcularla automáticamente usando una configuración global
        if 'fecha_emision' in data and not data.get('fecha_vencimiento') and not is_update:
            try:
                from .models import ConfiguracionProforma
                config = ConfiguracionProforma.objects.first()
                dias_validez = 15  # Valor por defecto
                if config and config.dias_validez:
                    dias_validez = config.dias_validez
                    
                data['fecha_vencimiento'] = data['fecha_emision'] + timezone.timedelta(days=dias_validez)
            except Exception as e:
                # Registrar pero no fallar
                logger.warning(f"Error al calcular fecha de vencimiento: {e}")
        
        # Devolver datos validados y posiblemente enriquecidos
        return data
    
    def create(self, validated_data):
        """Método optimizado para crear una proforma con sus ítems usando bulk create"""
        # Extraer los datos de ítems si están presentes
        items_data = validated_data.pop('items_data', [])
        
        # Crear proforma usando el servicio para generar número automáticamente
        # y asegurar que las señales manejen el historial, indicando que viene del serializer
        proforma = ProformaService.save_proforma(Proforma(**validated_data), from_serializer=True)
        
        # Procesar los ítems usando el servicio centralizado
        if items_data:
            # Marcar el contexto como operación masiva
            if self.context.get('request'):
                self.context['request']._bulk_operation = True
                
            # Usar el servicio para procesar los ítems
            ProformaService.process_items_data(proforma, items_data)
        
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
        # indicar que los datos vienen del serializer para evitar validaciones redundantes
        proforma = ProformaService.save_proforma(
            instance, 
            validate=True, 
            calculate_amounts=False,  # Calcularemos después de procesar ítems
            from_serializer=True      # Indicar que proviene del serializer y ya se validó
        )
        
        # Manejar ítems si hay datos nuevos
        if items_data:
            # Marcar el contexto como operación masiva
            if self.context.get('request'):
                self.context['request']._bulk_operation = True
            
            # Usar el servicio para procesar las actualizaciones
            ProformaService.process_items_update(proforma, items_data)
        
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