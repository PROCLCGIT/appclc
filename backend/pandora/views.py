# backend/appclc/pandora/views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters import rest_framework as django_filters
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie
from django.db.models import Count, Sum, Avg
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Importar modelos de la app pandora
from .models import (
    Clientes, Zonas, Ciudades, TipoCliente, Pandora,
    Categorias, Especialidades, Marca, Procedencia,
    TipoContratacion, Procesos_auditados, Unidades,
    EmpresaClc, PreciosSie, MsPref, Proveedores,
    Vendedores, Contactos, RelacionesBlue
)

# Importar serializers de la app pandora
from .serializers import (
    ClientesSerializer, ZonasSerializer, CiudadesSerializer,
    TipoClienteSerializer, PandoraSerializer, CategoriasSerializer,
    EspecialidadesSerializer, MarcaSerializer, ProcedenciaSerializer,
    TipoContratacionSerializer, Procesos_auditadosSerializer,
    UnidadesSerializer, EmpresaClcSerializer, PreciosSieSerializer,
    MsPrefSerializer, ProveedoresSerializer, VendedoresSerializer,
    ContactosSerializer, RelacionesBluSerializer
)

# Importar throttles (si los estás usando)
from .throttling import BurstRateThrottle, SustainedRateThrottle

# --------------------------------------------------------------------------------
# Base ViewSet
# --------------------------------------------------------------------------------
class BaseModelViewSet(viewsets.ModelViewSet):
    """
    ViewSet base con configuraciones comunes de permisos,
    filtrado, búsqueda y paginación.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [
        django_filters.DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    throttle_classes = [BurstRateThrottle, SustainedRateThrottle]

    # Campos por defecto que tal vez quieras filtrar en todos tus modelos
    filterset_fields = {
        'created_at': ['gte', 'lte', 'exact', 'gt', 'lt'],
        'updated_at': ['gte', 'lte', 'exact', 'gt', 'lt'],
    }

    @method_decorator(cache_page(15))
    @method_decorator(vary_on_cookie)
    def list(self, *args, **kwargs):
        return super().list(*args, **kwargs)

    @method_decorator(cache_page(15))
    @method_decorator(vary_on_cookie)
    def retrieve(self, *args, **kwargs):
        return super().retrieve(*args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()
        return self.apply_filters(queryset)

    def apply_filters(self, queryset):
        return queryset

# --------------------------------------------------------------------------------
# ViewSets Principales
# --------------------------------------------------------------------------------

class ClientesViewSet(BaseModelViewSet):
    """ViewSet para gestión de clientes."""
    queryset = Clientes.objects.select_related('zona', 'ciudad', 'tipo_cliente').all()
    serializer_class = ClientesSerializer
    # Añadimos aquí todos los campos relevantes
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'zona': ['exact'],
        'ciudad': ['exact'],
        'tipo_cliente': ['exact'],
        'activo': ['exact'],
        'nombre': ['exact', 'icontains'],
        'alias': ['exact', 'icontains'],
        'razon_social': ['exact', 'icontains'],
        'ruc': ['exact', 'icontains'],
        'email': ['exact', 'icontains'],
        'telefono': ['exact', 'icontains'],
        'direccion': ['exact', 'icontains'],
    }
    search_fields = [
        'nombre',
        'alias',
        'razon_social',
        'ruc',
        'email',
        'direccion',
        'telefono'
    ]
    ordering_fields = ['nombre', 'created_at', 'updated_at']

    @action(detail=True, methods=['get'])
    def proformas(self, request, pk=None):
        """Obtener proformas del cliente."""
        cliente = self.get_object()
        from proformas.serializers import ProformaSerializer
        serializer = ProformaSerializer(cliente.proformas.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def historial(self, request, pk=None):
        """Acción extra para el historial del cliente."""
        cliente = self.get_object()
        return Response({
            "cliente_id": cliente.id,
            "mensaje": f"Historial para el cliente {cliente.nombre}"
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de clientes."""
        queryset = self.get_queryset()
        stats = {
            'total': queryset.count(),
            'activos': queryset.filter(activo=True).count(),
            'por_zona': queryset.values('zona__nombre').annotate(total=Count('id')).order_by('-total'),
            'por_tipo': queryset.values('tipo_cliente__nombre').annotate(total=Count('id')).order_by('-total')
        }
        return Response(stats)


class ZonasViewSet(BaseModelViewSet):
    """ViewSet para gestión de zonas."""
    queryset = Zonas.objects.all()
    serializer_class = ZonasSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'nombre': ['exact', 'icontains'],
        'code': ['exact', 'icontains'],
        'cobertura': ['icontains'],
    }
    search_fields = ['nombre', 'code', 'cobertura']
    ordering_fields = ['nombre', 'created_at', 'updated_at']

    @action(detail=True, methods=['get'])
    def clientes(self, request, pk=None):
        """Obtener clientes de una zona."""
        zona = self.get_object()
        serializer = ClientesSerializer(zona.clientes_set.all(), many=True)
        return Response(serializer.data)


class CiudadesViewSet(BaseModelViewSet):
    """ViewSet para gestión de ciudades."""
    queryset = Ciudades.objects.all()
    serializer_class = CiudadesSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'nombre': ['exact', 'icontains'],
        'provincia': ['exact', 'icontains'],
        'code': ['exact', 'icontains'],
    }
    search_fields = ['nombre', 'provincia', 'code']
    ordering_fields = ['nombre', 'provincia', 'created_at', 'updated_at']


class PandoraViewSet(BaseModelViewSet):
    """ViewSet para gestión de productos Pandora."""
    queryset = Pandora.objects.all()
    serializer_class = PandoraSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'nombre': ['exact', 'icontains'],
        'code': ['exact', 'icontains']
    }
    search_fields = ['nombre', 'code']
    ordering_fields = ['nombre', 'created_at', 'updated_at']

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Dashboard básico de Pandora."""
        queryset = self.get_queryset()
        stats = {
            'total_productos': queryset.count(),
            'precios_sie': PreciosSie.objects.filter(pandora__in=queryset).count(),
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def dashboard_resumen(self, request):
        """Dashboard resumen para la ruta 'dashboard/resumen/'."""
        queryset = self.get_queryset()
        stats = {
            'total_pandoras': queryset.count(),
            'precios_sie': PreciosSie.objects.filter(pandora__in=queryset).count(),
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def estadisticas_general(self, request):
        """Estadísticas generales para la ruta 'estadisticas/general/'."""
        # Ejemplo de respuesta
        return Response({
            'ejemplo': 'Estadísticas generales de Pandora'
        })


class CategoriasViewSet(BaseModelViewSet):
    """ViewSet para gestión de categorías."""
    queryset = Categorias.objects.all()
    serializer_class = CategoriasSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'nombre': ['exact', 'icontains'],
        'code': ['exact', 'icontains'],
        'parent': ['exact', 'isnull'],
        'level': ['exact', 'gte', 'lte'],
        'path': ['icontains'],
        'is_active': ['exact']
    }
    search_fields = ['nombre', 'code', 'path']
    ordering_fields = ['nombre', 'level', 'created_at', 'updated_at']

    @action(detail=False, methods=['get'])
    def arbol(self, request):
        """Obtener árbol de categorías (ruta 'categorias/arbol/')."""
        def get_children(category):
            return {
                'id': category.id,
                'nombre': category.nombre,
                'code': category.code,
                'level': category.level,
                'children': [get_children(child) for child in category.children.all()]
            }
        root_categories = self.get_queryset().filter(parent=None)
        tree = [get_children(cat) for cat in root_categories]
        return Response(tree)


class UnidadesViewSet(BaseModelViewSet):
    """ViewSet para gestión de Unidades."""
    queryset = Unidades.objects.all()
    serializer_class = UnidadesSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'nombre': ['exact', 'icontains'],
        'code': ['exact', 'icontains']
    }
    search_fields = ['nombre', 'code']
    ordering_fields = ['nombre', 'created_at', 'updated_at']


class MarcaViewSet(BaseModelViewSet):
    """ViewSet para gestión de marcas."""
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'nombre': ['exact', 'icontains'],
        'code': ['exact', 'icontains'],
        'description': ['icontains'],
        'proveedores': ['icontains'],
        'country_origin': ['icontains'],
        'website': ['icontains'],
        'contact_info': ['icontains'],
        'is_active': ['exact']
    }
    search_fields = [
        'nombre', 'code', 'description', 'proveedores',
        'country_origin', 'website', 'contact_info'
    ]
    ordering_fields = ['nombre', 'created_at', 'updated_at']


class EspecialidadesViewSet(BaseModelViewSet):
    """ViewSet para gestión de especialidades."""
    queryset = Especialidades.objects.all()
    serializer_class = EspecialidadesSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'nombre': ['exact', 'icontains'],
        'code': ['exact', 'icontains']
    }
    search_fields = ['nombre', 'code']
    ordering_fields = ['nombre', 'created_at', 'updated_at']


class ProcedenciaViewSet(BaseModelViewSet):
    """ViewSet para gestión de procedencias."""
    queryset = Procedencia.objects.all()
    serializer_class = ProcedenciaSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'nombre': ['exact', 'icontains'],
        'code': ['exact', 'icontains']
    }
    search_fields = ['nombre', 'code']
    ordering_fields = ['nombre', 'created_at', 'updated_at']


class TipoClienteViewSet(BaseModelViewSet):
    """ViewSet para Tipos de Cliente."""
    queryset = TipoCliente.objects.all()
    serializer_class = TipoClienteSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'nombre': ['exact', 'icontains']
    }
    search_fields = ['nombre']
    ordering_fields = ['nombre', 'created_at', 'updated_at']


class Procesos_auditadosViewSet(BaseModelViewSet):
    """ViewSet para Procesos Auditados."""
    queryset = Procesos_auditados.objects.all()
    serializer_class = Procesos_auditadosSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'nombre': ['exact', 'icontains'],
        'description': ['icontains'],
        'objeto': ['icontains'],
    }
    search_fields = ['nombre', 'description', 'objeto']
    ordering_fields = ['nombre', 'created_at', 'updated_at']


class TipoContratacionViewSet(BaseModelViewSet):
    """ViewSet para Tipos de Contratación."""
    queryset = TipoContratacion.objects.all()
    serializer_class = TipoContratacionSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'nombre': ['exact', 'icontains'],
        'code': ['exact', 'icontains']
    }
    search_fields = ['nombre', 'code']
    ordering_fields = ['nombre', 'created_at', 'updated_at']


class ProveedoresViewSet(BaseModelViewSet):
    """ViewSet para gestión de proveedores."""
    queryset = Proveedores.objects.all()
    serializer_class = ProveedoresSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'ruc': ['exact', 'icontains'],
        'razon_social': ['exact', 'icontains'],
        'nombre': ['exact', 'icontains'],
        'activo': ['exact'],
        'tipo_primario': ['exact']
    }
    search_fields = ['ruc', 'razon_social', 'nombre', 'telefono']
    ordering_fields = ['nombre', 'created_at', 'updated_at']

    @action(detail=True, methods=['get'])
    def productos(self, request, pk=None):
        """Retorna productos relacionados a este proveedor (ruta 'proveedores/<int:pk>/productos/')."""
        proveedor = self.get_object()
        # Nota: CostosPandora ha sido eliminado del modelo
        # Aquí deberías devolver los productos relacionados de otra manera
        # Por ejemplo, usando los modelos de productos disponibles
        from products.models import ProductoDisponible
        from products.serializers import ProductoDisponibleSerializer
        
        # Esto es un ejemplo - ajusta según tu modelo de datos actual
        # productos = ProductoDisponible.objects.filter(proveedor=proveedor)
        # serializer = ProductoDisponibleSerializer(productos, many=True)
        
        # Por ahora devolvemos un mensaje informativo
        return Response({"message": "Funcionalidad en mantenimiento"})


class VendedoresViewSet(BaseModelViewSet):
    """ViewSet para gestión de vendedores."""
    queryset = Vendedores.objects.select_related('proveedor').all()
    serializer_class = VendedoresSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'proveedor': ['exact'],
        'activo': ['exact'],
        'nombre': ['exact', 'icontains'],
        'correo': ['exact', 'icontains'],
        'telefono': ['exact', 'icontains'],
        'observacion': ['icontains'],
    }
    search_fields = ['nombre', 'correo', 'telefono', 'observacion']
    ordering_fields = ['nombre', 'created_at', 'updated_at']


class MsprefViewSet(BaseModelViewSet):
    """ViewSet para MsPref."""
    queryset = MsPref.objects.select_related('categoria', 'especialidad').all()
    serializer_class = MsPrefSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'sku': ['exact', 'icontains'],
        'nombre_generico': ['exact', 'icontains'],
        'categoria': ['exact'],
        'especialidad': ['exact'],
        'normada': ['exact'],
        'referencias_tecnica': ['icontains'],
        'aplicaciones': ['icontains']
    }
    search_fields = ['sku', 'nombre_generico', 'referencias_tecnica', 'aplicaciones']
    ordering_fields = ['sku', 'created_at', 'updated_at']


class PreciosSieViewSet(BaseModelViewSet):
    """ViewSet para PreciosSie."""
    queryset = PreciosSie.objects.select_related('pandora', 'cliente', 'detalle_sie').all()
    serializer_class = PreciosSieSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'pandora': ['exact'],
        'cliente': ['exact'],
        'detalle_sie': ['exact'],
        'fecha_sie': ['gte', 'lte', 'exact', 'gt', 'lt'],
        'nota': ['icontains'],  # si quieres filtrar por texto en 'nota'
        'precio': ['gte', 'lte', 'exact', 'gt', 'lt'],
    }
    search_fields = ['nota']
    ordering_fields = ['precio', 'fecha_sie', 'created_at', 'updated_at']



# --------------------------------------------------------------------------------
# ViewSet adicional para EmpresaClc (si lo requieres)
# --------------------------------------------------------------------------------
class EmpresaClcViewSet(BaseModelViewSet):
    """ViewSet para gestión de Empresas CLC."""
    queryset = EmpresaClc.objects.all()
    serializer_class = EmpresaClcSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'nombre': ['exact', 'icontains'],
        'razon_social': ['exact', 'icontains'],
        'code': ['exact', 'icontains'],
        'ruc': ['exact', 'icontains'],
        'direccion': ['icontains'],
        'telefono': ['exact', 'icontains'],
        'correo': ['exact', 'icontains'],
        'representante_legal': ['icontains']
    }
    search_fields = [
        'nombre', 'razon_social', 'code', 'ruc',
        'direccion', 'telefono', 'correo', 'representante_legal'
    ]
    ordering_fields = ['nombre', 'created_at', 'updated_at']


class ContactosViewSet(BaseModelViewSet):
    """ViewSet para gestión de contactos."""
    queryset = Contactos.objects.all()
    serializer_class = ContactosSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'nombre': ['exact', 'icontains'],
        'alias': ['exact', 'icontains'],
        'telefono': ['exact', 'icontains'],
        'telefono2': ['exact', 'icontains'],
        'email': ['exact', 'icontains'],
        'direccion': ['icontains'],
        'obserbacion': ['icontains'],
        'ingerencia': ['exact', 'icontains'],
    }
    search_fields = ['nombre', 'alias', 'telefono', 'email', 'direccion']
    ordering_fields = ['nombre', 'created_at', 'updated_at']


class RelacionesBlueViewSet(BaseModelViewSet):
    """ViewSet para gestión de Relaciones Blue."""
    queryset = RelacionesBlue.objects.select_related('cliente', 'contacto').all()
    serializer_class = RelacionesBluSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'cliente': ['exact'],
        'contacto': ['exact'],
        'nivel': ['exact', 'gte', 'lte'],
    }
    search_fields = ['cliente__nombre', 'contacto__nombre']
    ordering_fields = ['nivel', 'created_at', 'updated_at']

    @action(detail=False, methods=['get'])
    def por_cliente(self, request):
        """Obtiene todas las relaciones agrupadas por cliente"""
        cliente_id = request.query_params.get('cliente_id')
        if cliente_id:
            relaciones = self.queryset.filter(cliente_id=cliente_id)
        else:
            relaciones = self.queryset
        
        serializer = self.get_serializer(relaciones, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def por_contacto(self, request):
        """Obtiene todas las relaciones agrupadas por contacto"""
        contacto_id = request.query_params.get('contacto_id')
        if contacto_id:
            relaciones = self.queryset.filter(contacto_id=contacto_id)
        else:
            relaciones = self.queryset
        
        serializer = self.get_serializer(relaciones, many=True)
        return Response(serializer.data)
