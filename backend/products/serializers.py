# products/serializers.py
from rest_framework import serializers
from .models import (
    Product, ProductoOfertado, ProductoDisponible,
    PriceList, ProductPrice, StockMovement,
    PriceHistory, ProductChange, RelatedProduct,
    ProductDocument
)
from pandora.serializers import (
    CategoriasSerializer,
    MarcaSerializer,
    UnidadesSerializer,
    ProcedenciaSerializer
)

# --------------------------------------------------------------------------------
# PRODUCT
# --------------------------------------------------------------------------------
class ProductSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Product"""
    categorias_detail = CategoriasSerializer(source='categorias', read_only=True)
    marca_detail = MarcaSerializer(source='marca', read_only=True)
    unidades_detail = UnidadesSerializer(source='unidades', read_only=True)
    procedencia_detail = ProcedenciaSerializer(source='procedencia', read_only=True)

    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
        # Suponiendo que no quieres permitir asignarlos vía API
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']

    def validate(self, data):
        """Validaciones generales para el modelo Product."""
        min_stock = data.get('min_stock')
        max_stock = data.get('max_stock')
        if max_stock is not None and min_stock is not None:
            if max_stock < min_stock:
                raise serializers.ValidationError({
                    "max_stock": "El stock máximo debe ser mayor o igual que el stock mínimo."
                })
        return data

# --------------------------------------------------------------------------------
# PRODUCTO OFERTADO
# --------------------------------------------------------------------------------
class ProductoOfertadoSerializer(serializers.ModelSerializer):
    """Serializer para ProductoOfertado"""
    categoria_detail = CategoriasSerializer(source='id_categoria', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)

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
        return data

# --------------------------------------------------------------------------------
# PRICE LIST
# --------------------------------------------------------------------------------
class PriceListSerializer(serializers.ModelSerializer):
    """Serializer para PriceList"""
    class Meta:
        model = PriceList
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        """Validar rango de fechas."""
        if data.get('valid_from') and data.get('valid_to'):
            if data['valid_to'] < data['valid_from']:
                raise serializers.ValidationError({
                    "valid_to": "La fecha final debe ser posterior a la fecha inicial."
                })
        return data

# --------------------------------------------------------------------------------
# PRODUCT PRICE
# --------------------------------------------------------------------------------
class ProductPriceSerializer(serializers.ModelSerializer):
    """Serializer para ProductPrice"""
    product_detail = ProductSerializer(source='product', read_only=True)
    price_list_detail = PriceListSerializer(source='price_list', read_only=True)

    class Meta:
        model = ProductPrice
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

# --------------------------------------------------------------------------------
# STOCK MOVEMENT
# --------------------------------------------------------------------------------
class StockMovementSerializer(serializers.ModelSerializer):
    """Serializer para StockMovement"""
    product_detail = ProductSerializer(source='product', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = StockMovement
        fields = '__all__'
        # En el modelo no existe updated_by, pero sí tenemos updated_at del TimeStampedModel
        read_only_fields = ['created_by', 'created_at', 'updated_at']

# --------------------------------------------------------------------------------
# PRICE HISTORY
# --------------------------------------------------------------------------------
class PriceHistorySerializer(serializers.ModelSerializer):
    """Serializer para PriceHistory"""
    product_detail = ProductSerializer(source='product', read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = PriceHistory
        fields = '__all__'
        # No hay updated_by, pero tenemos created_at y updated_at por TimeStampedModel
        read_only_fields = ['created_at', 'updated_at', 'changed_by']

# --------------------------------------------------------------------------------
# PRODUCT CHANGE
# --------------------------------------------------------------------------------
class ProductChangeSerializer(serializers.ModelSerializer):
    """Serializer para ProductChange"""
    product_detail = ProductSerializer(source='product', read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = ProductChange
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'changed_by']

# --------------------------------------------------------------------------------
# RELATED PRODUCT
# --------------------------------------------------------------------------------
class RelatedProductSerializer(serializers.ModelSerializer):
    """Serializer para RelatedProduct"""
    product_detail = ProductSerializer(source='product', read_only=True)
    related_product_detail = ProductSerializer(source='related_product', read_only=True)

    class Meta:
        model = RelatedProduct
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

# --------------------------------------------------------------------------------
# PRODUCT DOCUMENT
# --------------------------------------------------------------------------------
class ProductDocumentSerializer(serializers.ModelSerializer):
    """Serializer para ProductDocument"""
    product_detail = ProductSerializer(source='product', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = ProductDocument
        fields = '__all__'
        # 'uploaded_at' ya no existe; se sustituye con 'created_at' y 'updated_at'
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']

    def validate_file_path(self, value):
        """Validar tamaño máximo del archivo (10MB)."""
        if value.size > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError("El archivo no puede ser mayor a 10MB.")
        return value
