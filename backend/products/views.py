# products/views.py

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count, Avg, F
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import (
    Product, ProductoOfertado, ProductoDisponible,
    PriceList, ProductPrice, StockMovement,
    PriceHistory, ProductChange, RelatedProduct,
    ProductDocument
)
from .serializers import (
    ProductSerializer, ProductoOfertadoSerializer,
    ProductoDisponibleSerializer, PriceListSerializer,
    ProductPriceSerializer, StockMovementSerializer,
    PriceHistorySerializer, ProductChangeSerializer,
    RelatedProductSerializer, ProductDocumentSerializer
)

# --------------------------------------------------------------------------------
# Base ViewSet
# --------------------------------------------------------------------------------
class BaseProductViewSet(viewsets.ModelViewSet):
    """ViewSet base para productos"""
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    @method_decorator(cache_page(60))
    @method_decorator(vary_on_cookie)
    def list(self, *args, **kwargs):
        return super().list(*args, **kwargs)

    @method_decorator(cache_page(60))
    @method_decorator(vary_on_cookie)
    def retrieve(self, *args, **kwargs):
        return super().retrieve(*args, **kwargs)


# --------------------------------------------------------------------------------
# ViewSets Principales
# --------------------------------------------------------------------------------

class ProductViewSet(BaseProductViewSet):
    """ViewSet para el modelo Product"""
    queryset = Product.objects.select_related(
        'categorias', 'marca', 'unidades', 'procedencia',
        'created_by', 'updated_by'
    ).all()
    serializer_class = ProductSerializer
    
    filterset_fields = {
        'status': ['exact'],
        'categorias': ['exact'],
        'marca': ['exact'],
        'is_active': ['exact'],
        'is_sellable': ['exact'],
        'is_purchasable': ['exact'],
        # Filtrado por rangos de fechas de creación/actualización
        'created_at': ['gte', 'lte'],
        'updated_at': ['gte', 'lte'],
    }
    search_fields = ['code', 'nombre', 'description', 'sku', 'barcode']
    ordering_fields = ['nombre', 'created_at', 'updated_at', 'stock', 'base_price']

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Endpoint para estadísticas del dashboard"""
        queryset = self.get_queryset()
        stats = {
            'total_products': queryset.count(),
            'active_products': queryset.filter(is_active=True).count(),
            'low_stock_products': queryset.filter(stock__lte=F('min_stock')).count(),
            'total_stock_value': queryset.aggregate(
                value=Sum(F('stock') * F('cost_price'))
            )['value'] or 0,
            'by_category': queryset.values('categorias__nombre').annotate(
                count=Count('id')
            ).order_by('-count'),
            'by_status': queryset.values('status').annotate(
                count=Count('id')
            ).order_by('-count')
        }
        return Response(stats)

    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        """Actualizar stock de un producto"""
        product = self.get_object()
        quantity = int(request.data.get('quantity', 0))
        movement_type = request.data.get('type', 'adjustment')
        notes = request.data.get('notes', '')

        # Crear movimiento de stock
        StockMovement.objects.create(
            product=product,
            movement_type=movement_type,
            quantity=quantity,
            notes=notes,
            created_by=request.user
        )

        # Ajustar stock en el producto
        product.stock += quantity
        product.save()

        return Response({
            'status': 'success',
            'new_stock': product.stock
        })


class ProductoOfertadoViewSet(BaseProductViewSet):
    """ViewSet para ProductoOfertado"""
    queryset = ProductoOfertado.objects.select_related(
        'id_categoria', 'created_by', 'updated_by'
    ).all()
    serializer_class = ProductoOfertadoSerializer
    
    filterset_fields = {
        'id_categoria': ['exact'],
        'is_active': ['exact'],
        'especialidad': ['exact', 'icontains'],
        # TimeStampedModel => created_at, updated_at
        'created_at': ['gte', 'lte'],
        'updated_at': ['gte', 'lte'],
    }
    search_fields = ['code', 'cudim', 'nombre', 'descripcion', 'especialidad']
    ordering_fields = ['nombre', 'created_at', 'updated_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de productos ofertados"""
        queryset = self.get_queryset()
        return Response({
            'total': queryset.count(),
            'activos': queryset.filter(is_active=True).count(),
            'por_categoria': queryset.values('id_categoria__nombre').annotate(
                count=Count('id')
            ).order_by('-count'),
            'por_especialidad': queryset.values('especialidad').annotate(
                count=Count('id')
            ).order_by('-count')
        })


class ProductoDisponibleViewSet(BaseProductViewSet):
    """ViewSet para ProductoDisponible"""
    queryset = ProductoDisponible.objects.select_related(
        'id_categoria',
        'id_producto_ofertado',
        'id_marca',
        'created_by',
        'updated_by'
    ).all()
    serializer_class = ProductoDisponibleSerializer
    
    filterset_fields = {
        'id_categoria': ['exact'],
        'id_marca': ['exact'],
        'is_active': ['exact'],
        # Campos de calificaciones:
        'tz_oferta': ['gte', 'lte'],
        'tz_demanda': ['gte', 'lte'],
        'tz_inflacion': ['gte', 'lte'],
        'tz_calidad': ['gte', 'lte'],
        'tz_eficiencia': ['gte', 'lte'],
        'tz_referencial': ['gte', 'lte'],

        # TimeStampedModel => created_at, updated_at
        'created_at': ['gte', 'lte'],
        'updated_at': ['gte', 'lte'],
    }
    search_fields = ['code', 'nombre', 'modelo', 'referencia']
    ordering_fields = [
        'nombre', 'created_at', 'updated_at',
        'precio_sie_referencial', 'tz_oferta', 'tz_demanda'
    ]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de productos disponibles"""
        queryset = self.get_queryset()
        return Response({
            'total_count': queryset.count(),
            'active_count': queryset.filter(is_active=True).count(),
            'avg_ratings': {
                'oferta': queryset.aggregate(avg=Avg('tz_oferta'))['avg'],
                'demanda': queryset.aggregate(avg=Avg('tz_demanda'))['avg'],
                'calidad': queryset.aggregate(avg=Avg('tz_calidad'))['avg'],
                'eficiencia': queryset.aggregate(avg=Avg('tz_eficiencia'))['avg']
            },
            'por_marca': queryset.values('id_marca__nombre').annotate(
                count=Count('id')
            ).order_by('-count')
        })


class PriceListViewSet(BaseProductViewSet):
    """ViewSet para PriceList"""
    queryset = PriceList.objects.all()
    serializer_class = PriceListSerializer
    
    filterset_fields = {
        'is_active': ['exact'],
        'valid_from': ['gte', 'lte'],
        'valid_to': ['gte', 'lte'],
        # TimeStampedModel
        'created_at': ['gte', 'lte'],
        'updated_at': ['gte', 'lte'],
    }
    search_fields = ['code', 'nombre', 'description']
    ordering_fields = ['nombre', 'valid_from', 'valid_to', 'created_at', 'updated_at']

    @action(detail=True, methods=['post'])
    def apply_markup(self, request, pk=None):
        """Aplicar markup a todos los precios de la lista"""
        price_list = self.get_object()
        markup = price_list.markup_percentage or 0

        for price in price_list.productprice_set.all():
            base_price = price.product.base_price or 0
            price.price = base_price * (1 + markup/100)
            price.save()

        return Response({'status': 'markup applied'})


class ProductPriceViewSet(BaseProductViewSet):
    """ViewSet para ProductPrice"""
    queryset = ProductPrice.objects.select_related('product', 'price_list').all()
    serializer_class = ProductPriceSerializer
    
    filterset_fields = {
        'product': ['exact'],
        'price_list': ['exact'],
        'valid_from': ['gte', 'lte'],
        'valid_to': ['gte', 'lte'],
        'created_at': ['gte', 'lte'],
        'updated_at': ['gte', 'lte'],
    }
    search_fields = ['product__code', 'price_list__nombre']
    ordering_fields = ['price', 'valid_from', 'valid_to', 'created_at', 'updated_at']


class StockMovementViewSet(BaseProductViewSet):
    """ViewSet para StockMovement"""
    queryset = StockMovement.objects.select_related('product', 'created_by').all()
    serializer_class = StockMovementSerializer
    
    filterset_fields = {
        'product': ['exact'],
        'movement_type': ['exact'],
        'created_at': ['gte', 'lte'],
        'updated_at': ['gte', 'lte'],
    }
    search_fields = ['product__code', 'notes']
    ordering_fields = ['created_at', 'updated_at', 'quantity']

    def perform_create(self, serializer):
        movement = serializer.save(created_by=self.request.user)
        # Actualizar stock en el Product (in / out)
        product = movement.product
        if movement.movement_type == 'in':
            product.stock += movement.quantity
        elif movement.movement_type == 'out':
            product.stock -= movement.quantity
        # Para 'adjustment', podrías definir tu propia lógica
        product.save()

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Resumen de movimientos"""
        today = timezone.now().date()
        queryset = self.get_queryset()
        return Response({
            'today': {
                'in': queryset.filter(
                    movement_type='in',
                    created_at__date=today
                ).aggregate(total=Sum('quantity'))['total'] or 0,
                'out': queryset.filter(
                    movement_type='out',
                    created_at__date=today
                ).aggregate(total=Sum('quantity'))['total'] or 0
            },
            'by_type': queryset.values('movement_type').annotate(
                count=Count('id'),
                total_quantity=Sum('quantity')
            )
        })


class PriceHistoryViewSet(BaseProductViewSet):
    """ViewSet para PriceHistory"""
    queryset = PriceHistory.objects.select_related('product', 'changed_by').all()
    serializer_class = PriceHistorySerializer
    
    filterset_fields = {
        'product': ['exact'],
        'price_type': ['exact'],
        # Reemplazamos "change_date" por los timestamps heredados
        'created_at': ['gte', 'lte'],
        'updated_at': ['gte', 'lte'],
    }
    search_fields = ['product__code', 'reason']
    ordering_fields = ['created_at', 'updated_at', 'new_price']

    def perform_create(self, serializer):
        serializer.save(changed_by=self.request.user)


class ProductChangeViewSet(BaseProductViewSet):
    """ViewSet para ProductChange"""
    queryset = ProductChange.objects.select_related('product', 'changed_by').all()
    serializer_class = ProductChangeSerializer
    
    filterset_fields = {
        'product': ['exact'],
        'field_name': ['exact', 'icontains'],
        # Reemplazamos "changed_at" por timestamps
        'created_at': ['gte', 'lte'],
        'updated_at': ['gte', 'lte'],
    }
    search_fields = ['product__code', 'field_name', 'old_value', 'new_value']
    ordering_fields = ['created_at', 'updated_at']

    def perform_create(self, serializer):
        serializer.save(changed_by=self.request.user)


class RelatedProductViewSet(BaseProductViewSet):
    """ViewSet para RelatedProduct"""
    queryset = RelatedProduct.objects.select_related('product', 'related_product').all()
    serializer_class = RelatedProductSerializer
    
    filterset_fields = {
        'product': ['exact'],
        'related_product': ['exact'],
        'relationship_type': ['exact'],
        'created_at': ['gte', 'lte'],
        'updated_at': ['gte', 'lte'],
    }
    search_fields = ['product__code', 'related_product__code']
    ordering_fields = ['created_at', 'updated_at']

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Agrupar por tipo de relación"""
        return Response(
            self.get_queryset()
            .values('relationship_type')
            .annotate(count=Count('id'))
            .order_by('relationship_type')
        )


class ProductDocumentViewSet(BaseProductViewSet):
    """ViewSet para ProductDocument"""
    queryset = ProductDocument.objects.select_related('product', 'uploaded_by').all()
    serializer_class = ProductDocumentSerializer
    
    filterset_fields = {
        'product': ['exact'],
        'document_type': ['exact', 'icontains'],
        'is_active': ['exact'],
        # 'uploaded_at' ya no existe; usamos created_at/updated_at:
        'created_at': ['gte', 'lte'],
        'updated_at': ['gte', 'lte'],
    }
    search_fields = ['product__code', 'file_name', 'description']
    # 'uploaded_at' ya no existe; usamos 'created_at'
    ordering_fields = ['created_at', 'updated_at', 'file_name']

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Agrupar documentos por tipo"""
        return Response(
            self.get_queryset()
            .values('document_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
