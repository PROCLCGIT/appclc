# products/serializers.py
from rest_framework import serializers
from django.db.models import Max
from .models import (
    ProductoOfertado, ProductoDisponible,
    ImagenReferenciaProductoOfertado,
    ImagenProductoDisponible, DocumentoProductoDisponible, 
    DocumentoProductoOfertado, HistorialDeVentas, HistorialDeCompras
)
from pandora.serializers_models import (
    CategoriasSerializer,
    MarcaSerializer,
    UnidadesSerializer,
    ProcedenciaSerializer,
    ClientesSerializer,
    EmpresaClcSerializer,
    ProveedoresSerializer
)

# --------------------------------------------------------------------------------
# IMAGEN REFERENCIA PRODUCTO OFERTADO
# --------------------------------------------------------------------------------
class ImagenReferenciaProductoOfertadoSerializer(serializers.ModelSerializer):
    """Serializer para las imágenes de referencia de productos ofertados"""
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = ImagenReferenciaProductoOfertado
        fields = ['id', 'imagen', 'descripcion', 'orden', 'is_primary', 'url']

    def get_url(self, obj):
        if obj.imagen:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None
        
    def to_representation(self, instance):
        """Personaliza la representación para que sea compatible con el frontend"""
        rep = super().to_representation(instance)
        return {
            'id': rep['id'],
            'url': rep['url'],
            'descripcion': rep['descripcion'],
            'orden': rep['orden'],
            'is_primary': rep['is_primary']
        }

# --------------------------------------------------------------------------------
# DOCUMENTO PRODUCTO OFERTADO
# --------------------------------------------------------------------------------
class DocumentoProductoOfertadoSerializer(serializers.ModelSerializer):
    """Serializer para documentos de productos ofertados"""
    url = serializers.SerializerMethodField()
    tipo_documento_display = serializers.CharField(source='get_tipo_documento_display', read_only=True)
    extension = serializers.SerializerMethodField()
    tamano = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentoProductoOfertado
        fields = [
            'id', 'documento', 'tipo_documento', 'tipo_documento_display', 
            'titulo', 'descripcion', 'is_public', 'url', 'extension', 'tamano'
        ]
        
    def get_url(self, obj):
        if obj.documento:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.documento.url)
            return obj.documento.url
        return None
        
    def get_extension(self, obj):
        return obj.extension
        
    def get_tamano(self, obj):
        return obj.tamano_en_mb

# --------------------------------------------------------------------------------
# PRODUCTO OFERTADO
# --------------------------------------------------------------------------------
class ProductoOfertadoSerializer(serializers.ModelSerializer):
    """Serializer para ProductoOfertado"""
    categoria_detail = CategoriasSerializer(source='id_categoria', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    imagenes_referencia = ImagenReferenciaProductoOfertadoSerializer(many=True, read_only=True)
    documentos = DocumentoProductoOfertadoSerializer(source='documentos_producto', many=True, read_only=True)
    
    # Usamos un ListField para aceptar múltiples archivos
    # Importante: En el frontend, todos los archivos deben tener la misma clave en el FormData
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False,
        default=[]
    )
    
    # Campos para subir documentos
    uploaded_documents = serializers.ListField(
        child=serializers.FileField(max_length=5000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False,
        default=[]
    )
    
    # Metadata para documentos subidos
    document_titles = serializers.ListField(
        child=serializers.CharField(max_length=255),
        write_only=True,
        required=False,
        default=[]
    )
    
    document_types = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False,
        default=[]
    )
    
    document_descriptions = serializers.ListField(
        child=serializers.CharField(max_length=1000, allow_blank=False),
        write_only=True,
        required=False,
        default=[]
    )

    class Meta:
        model = ProductoOfertado
        fields = '__all__'
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']

    def validate_code(self, value):
        """Validar código único y convertir a mayúsculas en creación."""
        if self.instance is None:  # Solo validamos si se trata de un nuevo registro
            if ProductoOfertado.objects.filter(code=value.upper()).exists():
                raise serializers.ValidationError("Este código ya existe.")
        return value.upper()
        
    def validate(self, data):
        """Validaciones generales para documentos."""
        # Validar que la cantidad de títulos y tipos coincida con la cantidad de documentos
        uploaded_documents = data.get('uploaded_documents', [])
        document_titles = data.get('document_titles', [])
        document_types = data.get('document_types', [])
        
        if len(uploaded_documents) > 0 and len(document_titles) != len(uploaded_documents):
            raise serializers.ValidationError({
                'document_titles': "Debe proporcionar un título para cada documento."
            })
            
        if len(uploaded_documents) > 0 and len(document_types) != len(uploaded_documents):
            raise serializers.ValidationError({
                'document_types': "Debe proporcionar un tipo para cada documento."
            })
            
        return data
        
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        uploaded_documents = validated_data.pop('uploaded_documents', [])
        document_titles = validated_data.pop('document_titles', [])
        document_types = validated_data.pop('document_types', [])
        document_descriptions = validated_data.pop('document_descriptions', [])
        
        # Crear el producto ofertado primero
        producto = super().create(validated_data)
        
        try:
            # Luego crear las imágenes asociadas
            for i, image in enumerate(uploaded_images):
                ImagenReferenciaProductoOfertado.objects.create(
                    producto_ofertado=producto,
                    imagen=image,
                    orden=i,
                    is_primary=(i == 0),  # La primera imagen es la principal
                    created_by=self.context['request'].user if 'request' in self.context else None
                )
        except Exception as e:
            # Si hay un error al guardar las imágenes, lo registramos pero continuamos
            print(f"Error al guardar imágenes: {str(e)}")
            
        # Procesar documentos
        try:
            for i, doc in enumerate(uploaded_documents):
                # Obtener metadatos del documento
                titulo = document_titles[i] if i < len(document_titles) else f"Documento {i+1}"
                tipo = document_types[i] if i < len(document_types) else "otros"
                descripcion = document_descriptions[i] if i < len(document_descriptions) else ""
                
                # Validar que el tipo de documento sea válido
                tipos_validos = [choice[0] for choice in DocumentoProductoOfertado.TIPO_DOCUMENTO]
                if tipo not in tipos_validos:
                    tipo = "otros"
                
                DocumentoProductoOfertado.objects.create(
                    producto_ofertado=producto,
                    documento=doc,
                    tipo_documento=tipo,
                    titulo=titulo,
                    descripcion=descripcion,
                    is_public=True,
                    created_by=self.context['request'].user if 'request' in self.context else None
                )
        except Exception as e:
            print(f"Error al procesar documentos: {str(e)}")
            
        return producto
        
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        uploaded_documents = validated_data.pop('uploaded_documents', [])
        document_titles = validated_data.pop('document_titles', [])
        document_types = validated_data.pop('document_types', [])
        document_descriptions = validated_data.pop('document_descriptions', [])
        
        # Actualizar primero el producto ofertado
        instance = super().update(instance, validated_data)
        
        try:
            # Luego agregar nuevas imágenes (si hay)
            last_order = instance.imagenes.aggregate(Max('orden'))['orden__max'] or 0
            for i, image in enumerate(uploaded_images):
                ImagenReferenciaProductoOfertado.objects.create(
                    producto_ofertado=instance,
                    imagen=image,
                    orden=last_order + i + 1,
                    created_by=self.context['request'].user if 'request' in self.context else None
                )
        except Exception as e:
            # Si hay un error al guardar las imágenes, lo registramos pero continuamos
            print(f"Error al actualizar imágenes: {str(e)}")
            
        # Procesar documentos nuevos
        try:
            for i, doc in enumerate(uploaded_documents):
                # Obtener metadatos del documento
                titulo = document_titles[i] if i < len(document_titles) else f"Documento {i+1}"
                tipo = document_types[i] if i < len(document_types) else "otros"
                descripcion = document_descriptions[i] if i < len(document_descriptions) else ""
                
                # Validar que el tipo de documento sea válido
                tipos_validos = [choice[0] for choice in DocumentoProductoOfertado.TIPO_DOCUMENTO]
                if tipo not in tipos_validos:
                    tipo = "otros"
                
                DocumentoProductoOfertado.objects.create(
                    producto_ofertado=instance,
                    documento=doc,
                    tipo_documento=tipo,
                    titulo=titulo,
                    descripcion=descripcion,
                    is_public=True,
                    created_by=self.context['request'].user if 'request' in self.context else None
                )
        except Exception as e:
            print(f"Error al procesar documentos: {str(e)}")
            
        return instance

# --------------------------------------------------------------------------------
# IMAGEN PRODUCTO DISPONIBLE
# --------------------------------------------------------------------------------
class ImagenProductoDisponibleSerializer(serializers.ModelSerializer):
    """Serializer para imágenes de productos disponibles"""
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = ImagenProductoDisponible
        fields = ['id', 'imagen', 'descripcion', 'orden', 'is_primary', 'url']
        
    def get_url(self, obj):
        if obj.imagen:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None
        
    def to_representation(self, instance):
        """Personaliza la representación para que sea compatible con el frontend"""
        rep = super().to_representation(instance)
        return {
            'id': rep['id'],
            'url': rep['url'],
            'descripcion': rep['descripcion'],
            'orden': rep['orden'],
            'is_primary': rep['is_primary']
        }

# --------------------------------------------------------------------------------
# DOCUMENTO PRODUCTO DISPONIBLE
# --------------------------------------------------------------------------------
class DocumentoProductoDisponibleSerializer(serializers.ModelSerializer):
    """Serializer para documentos de productos disponibles"""
    url = serializers.SerializerMethodField()
    tipo_documento_display = serializers.CharField(source='get_tipo_documento_display', read_only=True)
    extension = serializers.SerializerMethodField()
    tamano = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentoProductoDisponible
        fields = [
            'id', 'documento', 'tipo_documento', 'tipo_documento_display', 
            'titulo', 'descripcion', 'is_public', 'url', 'extension', 'tamano'
        ]
        
    def get_url(self, obj):
        if obj.documento:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.documento.url)
            return obj.documento.url
        return None
        
    def get_extension(self, obj):
        return obj.extension
        
    def get_tamano(self, obj):
        return obj.tamano_en_mb

# --------------------------------------------------------------------------------
# PRODUCTO DISPONIBLE
# --------------------------------------------------------------------------------
class ProductoDisponibleSerializer(serializers.ModelSerializer):
    """Serializer para ProductoDisponible"""
    categoria_detail = CategoriasSerializer(source='id_categoria', read_only=True)
    marca_detail = MarcaSerializer(source='id_marca', read_only=True)
    producto_ofertado_detail = ProductoOfertadoSerializer(
        source='id_producto_ofertado',
        read_only=True
    )
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    imagenes = ImagenProductoDisponibleSerializer(source='imagenes_producto', many=True, read_only=True)
    documentos = DocumentoProductoDisponibleSerializer(source='documentos_producto', many=True, read_only=True)
    
    # Campos para subir archivos
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False,
        default=[]
    )
    
    uploaded_documents = serializers.ListField(
        child=serializers.FileField(max_length=5000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False,
        default=[]
    )
    
    # Metadata para documentos subidos
    document_titles = serializers.ListField(
        child=serializers.CharField(max_length=255),
        write_only=True,
        required=False,
        default=[]
    )
    
    document_types = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False,
        default=[]
    )
    
    document_descriptions = serializers.ListField(
        child=serializers.CharField(max_length=1000, allow_blank=False),
        write_only=True,
        required=False,
        default=[]
    )

    class Meta:
        model = ProductoDisponible
        fields = '__all__'
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']

    def validate(self, data):
        """Validaciones generales (ej. calificaciones)."""
        rating_fields = [
            'tz_oferta', 'tz_demanda', 'tz_inflacion',
            'tz_calidad', 'tz_eficiencia', 'tz_referencial'
        ]
        for field in rating_fields:
            if field in data and not (0 <= data[field] <= 5):
                raise serializers.ValidationError({
                    field: "La calificación debe estar entre 0 y 5."
                })
                
        # Validar que la cantidad de títulos y tipos coincida con la cantidad de documentos
        uploaded_documents = data.get('uploaded_documents', [])
        document_titles = data.get('document_titles', [])
        document_types = data.get('document_types', [])
        
        if len(uploaded_documents) > 0 and len(document_titles) != len(uploaded_documents):
            raise serializers.ValidationError({
                'document_titles': "Debe proporcionar un título para cada documento."
            })
            
        if len(uploaded_documents) > 0 and len(document_types) != len(uploaded_documents):
            raise serializers.ValidationError({
                'document_types': "Debe proporcionar un tipo para cada documento."
            })
            
        return data
        
    def create(self, validated_data):
        # Extraer listas de imágenes y documentos
        uploaded_images = validated_data.pop('uploaded_images', [])
        uploaded_documents = validated_data.pop('uploaded_documents', [])
        document_titles = validated_data.pop('document_titles', [])
        document_types = validated_data.pop('document_types', [])
        document_descriptions = validated_data.pop('document_descriptions', [])
        
        # Crear el producto disponible
        instance = super().create(validated_data)
        
        # Procesar imágenes
        try:
            for i, image in enumerate(uploaded_images):
                ImagenProductoDisponible.objects.create(
                    producto_disponible=instance,
                    imagen=image,
                    orden=i,
                    is_primary=(i == 0),  # La primera imagen es la principal
                    created_by=self.context['request'].user if 'request' in self.context else None
                )
        except Exception as e:
            print(f"Error al procesar imágenes: {str(e)}")
        
        # Procesar documentos
        try:
            for i, doc in enumerate(uploaded_documents):
                # Obtener metadatos del documento
                titulo = document_titles[i] if i < len(document_titles) else f"Documento {i+1}"
                tipo = document_types[i] if i < len(document_types) else "otros"
                descripcion = document_descriptions[i] if i < len(document_descriptions) else ""
                
                # Validar que el tipo de documento sea válido
                tipos_validos = [choice[0] for choice in DocumentoProductoDisponible.TIPO_DOCUMENTO]
                if tipo not in tipos_validos:
                    tipo = "otros"
                
                DocumentoProductoDisponible.objects.create(
                    producto_disponible=instance,
                    documento=doc,
                    tipo_documento=tipo,
                    titulo=titulo,
                    descripcion=descripcion,
                    is_public=True,
                    created_by=self.context['request'].user if 'request' in self.context else None
                )
        except Exception as e:
            print(f"Error al procesar documentos: {str(e)}")
            
        return instance
        
    def update(self, instance, validated_data):
        # Extraer listas de imágenes y documentos
        uploaded_images = validated_data.pop('uploaded_images', [])
        uploaded_documents = validated_data.pop('uploaded_documents', [])
        document_titles = validated_data.pop('document_titles', [])
        document_types = validated_data.pop('document_types', [])
        document_descriptions = validated_data.pop('document_descriptions', [])
        
        # Actualizar el producto disponible
        instance = super().update(instance, validated_data)
        
        # Procesar imágenes nuevas
        try:
            last_order = instance.imagenes_producto.aggregate(max_orden=Max('orden'))['max_orden'] or 0
            for i, image in enumerate(uploaded_images):
                ImagenProductoDisponible.objects.create(
                    producto_disponible=instance,
                    imagen=image,
                    orden=last_order + i + 1,
                    created_by=self.context['request'].user if 'request' in self.context else None
                )
        except Exception as e:
            print(f"Error al procesar imágenes: {str(e)}")
        
        # Procesar documentos nuevos
        try:
            for i, doc in enumerate(uploaded_documents):
                # Obtener metadatos del documento
                titulo = document_titles[i] if i < len(document_titles) else f"Documento {i+1}"
                tipo = document_types[i] if i < len(document_types) else "otros"
                descripcion = document_descriptions[i] if i < len(document_descriptions) else ""
                
                # Validar que el tipo de documento sea válido
                tipos_validos = [choice[0] for choice in DocumentoProductoDisponible.TIPO_DOCUMENTO]
                if tipo not in tipos_validos:
                    tipo = "otros"
                
                DocumentoProductoDisponible.objects.create(
                    producto_disponible=instance,
                    documento=doc,
                    tipo_documento=tipo,
                    titulo=titulo,
                    descripcion=descripcion,
                    is_public=True,
                    created_by=self.context['request'].user if 'request' in self.context else None
                )
        except Exception as e:
            print(f"Error al procesar documentos: {str(e)}")
            
        return instance

# --------------------------------------------------------------------------------
# HISTORIAL DE VENTAS
# --------------------------------------------------------------------------------
class HistorialDeVentasSerializer(serializers.ModelSerializer):
    """Serializer para el historial de ventas de productos"""
    # Campos para relaciones detalladas
    producto_detail = ProductoDisponibleSerializer(source='producto', read_only=True)
    cliente_detail = ClientesSerializer(source='cliente', read_only=True)
    empresa_detail = EmpresaClcSerializer(source='empresa', read_only=True)
    
    class Meta:
        model = HistorialDeVentas
        fields = '__all__'
    
    def to_internal_value(self, data):
        """Convertir tipos de datos de entrada antes de validar"""
        try:
            print("Convirtiendo datos de ventas:", data)
            
            # Convertir IDs de string a int si es necesario
            for field in ['producto', 'cliente', 'empresa']:
                if field in data and data[field] and isinstance(data[field], str):
                    try:
                        data[field] = int(data[field])
                    except (ValueError, TypeError):
                        # Dejar el valor como está y dejar que la validación maneje el error
                        pass
                    
            return super().to_internal_value(data)
        except Exception as e:
            print("Error en to_internal_value de ventas:", e)
            raise
        
    def validate(self, data):
        """Validaciones específicas para el historial de ventas"""
        print("Validando datos de ventas:", data)
        
        if 'valor' in data and data['valor'] < 0:
            raise serializers.ValidationError({"valor": "El valor no puede ser negativo."})
        
        if 'iva' in data and data['iva'] < 0:
            raise serializers.ValidationError({"iva": "El IVA no puede ser negativo."})
            
        if 'cantidad' in data and data['cantidad'] < 1:
            raise serializers.ValidationError({"cantidad": "La cantidad debe ser al menos 1."})
            
        if 'factura' in data and 'cliente' in data:
            # Verificar si la factura ya existe para este cliente
            instance = getattr(self, 'instance', None)
            if instance:
                # En caso de actualización, excluimos la instancia actual
                exists = HistorialDeVentas.objects.exclude(id=instance.id).filter(
                    factura=data['factura'], 
                    cliente=data['cliente']
                ).exists()
            else:
                # En caso de creación
                exists = HistorialDeVentas.objects.filter(
                    factura=data['factura'], 
                    cliente=data['cliente']
                ).exists()
                
            if exists:
                raise serializers.ValidationError({"factura": "Este número de factura ya existe para este cliente."})
                
        return data

# --------------------------------------------------------------------------------
# HISTORIAL DE COMPRAS
# --------------------------------------------------------------------------------
class HistorialDeComprasSerializer(serializers.ModelSerializer):
    """Serializer para el historial de compras de productos"""
    # Campos para relaciones detalladas
    producto_detail = ProductoDisponibleSerializer(source='producto', read_only=True)
    proveedor_detail = ProveedoresSerializer(source='proveedor', read_only=True)
    empresa_detail = EmpresaClcSerializer(source='empresa', read_only=True)
    
    class Meta:
        model = HistorialDeCompras
        fields = '__all__'
    
    def to_internal_value(self, data):
        """Convertir tipos de datos antes de validar"""
        try:
            print("Procesando datos de compra:", data)
            # Convertir IDs de string a int si es necesario
            for field in ['producto', 'proveedor', 'empresa']:
                if field in data and data[field] and isinstance(data[field], str):
                    try:
                        data[field] = int(data[field])
                    except (ValueError, TypeError):
                        # Dejar el valor como está y dejar que la validación maneje el error
                        pass
            
            return super().to_internal_value(data)
        except Exception as e:
            print("Error en to_internal_value de compras:", e)
            raise
        
    def validate(self, data):
        """Validaciones específicas para el historial de compras"""
        print("Validando datos de compra:", data)
        
        if 'valor' in data and data['valor'] < 0:
            raise serializers.ValidationError({"valor": "El valor no puede ser negativo."})
        
        if 'iva' in data and data['iva'] < 0:
            raise serializers.ValidationError({"iva": "El IVA no puede ser negativo."})
            
        if 'cantidad' in data and data['cantidad'] < 1:
            raise serializers.ValidationError({"cantidad": "La cantidad debe ser al menos 1."})
            
        if 'factura' in data and 'proveedor' in data:
            # Verificar si la factura ya existe para este proveedor
            instance = getattr(self, 'instance', None)
            if instance:
                # En caso de actualización, excluimos la instancia actual
                exists = HistorialDeCompras.objects.exclude(id=instance.id).filter(
                    factura=data['factura'], 
                    proveedor=data['proveedor']
                ).exists()
            else:
                # En caso de creación
                exists = HistorialDeCompras.objects.filter(
                    factura=data['factura'], 
                    proveedor=data['proveedor']
                ).exists()
                
            if exists:
                raise serializers.ValidationError({"factura": "Este número de factura ya existe para este proveedor."})
                
        return data

