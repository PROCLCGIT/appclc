"""
Vistas base y utilidades para todos los módulos.
"""
from rest_framework import viewsets, mixins, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F, Value, CharField, Q as models_Q
from django.db.models.functions import Concat
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie
from django.utils.timezone import now

from .auth import IsOwnerOrAdmin
from .cache import cache_result
from .logging import log_execution_time, log_user_action
from .exporters import create_exporter
from .models import Categorias, Zonas, Ciudades, TipoCliente, Clientes, Pandora, Especialidades, Marca, Procedencia, TipoContratacion, Unidades, EmpresaClc, PreciosSie, Proveedores, Vendedores, Procesos_auditados, MsPref, Contactos, RelacionesBlue
from .serializers import CategoriasSerializer, ClientesSerializer, ZonasSerializer, CiudadesSerializer, TipoClienteSerializer

class BaseModelViewSet(viewsets.ModelViewSet):
    """
    ViewSet base con funcionalidades comunes para todos los modelos.
    Incluye caching, filtrado, ordenación, búsqueda, auditoría y exportación.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    ordering = ['-created_at']  # Ordenamiento por defecto
    
    # Cache de resultados por defecto
    cache_timeout = 60  # segundos
    enable_cache = True
    
    # Exportación de datos
    export_formats = ['xlsx', 'csv', 'json']  # Formatos soportados
    
    def get_serializer_context(self):
        """
        Añade contexto extra a los serializers.
        Útil para acceder al request en los serializadores.
        """
        context = super().get_serializer_context()
        context.update({
            'detail_view': self.action == 'retrieve',
            'list_view': self.action == 'list',
            'user': self.request.user if hasattr(self.request, 'user') else None,
        })
        return context
    
    def get_queryset(self):
        """
        Permite filtrar por 'active' si el modelo tiene un campo is_active.
        También aplica optimizaciones de rendimiento.
        """
        queryset = super().get_queryset()
        
        # Filtrar por activo/inactivo si se solicita
        if hasattr(queryset.model, 'is_active') and 'active' in self.request.query_params:
            active = self.request.query_params.get('active', '').lower() not in ('false', '0')
            queryset = queryset.filter(is_active=active)
        
        # Aplicar optimizaciones de queryset (select_related, prefetch_related)
        # Cada subclase puede implementar get_optimized_queryset
        if hasattr(self, 'get_optimized_queryset'):
            queryset = self.get_optimized_queryset(queryset)
            
        return queryset
    
    @method_decorator(cache_page(60))  # Cache por 1 minuto
    @method_decorator(vary_on_cookie)
    @log_execution_time()
    def list(self, request, *args, **kwargs):
        """
        Añade caché y logging de tiempo de ejecución al listar recursos.
        """
        return super().list(request, *args, **kwargs)
    
    @method_decorator(cache_page(60))  # Cache por 1 minuto
    @method_decorator(vary_on_cookie)
    @log_execution_time()
    def retrieve(self, request, *args, **kwargs):
        """
        Añade caché y logging de tiempo de ejecución al recuperar un recurso.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        """
        Registra la creación de recursos y asigna el usuario actual como creador.
        """
        instance = serializer.save(
            created_by=self.request.user if hasattr(self.request, 'user') else None,
            updated_by=self.request.user if hasattr(self.request, 'user') else None
        )
        
        # Registrar acción para auditoría
        log_user_action(
            self.request.user,
            'create',
            self.get_serializer().Meta.model.__name__,
            getattr(instance, 'id', None)
        )
        
        return instance
    
    def perform_update(self, serializer):
        """
        Registra la actualización de recursos y actualiza el campo updated_by.
        """
        instance = serializer.save(
            updated_by=self.request.user if hasattr(self.request, 'user') else None
        )
        
        # Registrar acción para auditoría
        log_user_action(
            self.request.user,
            'update',
            self.get_serializer().Meta.model.__name__,
            getattr(instance, 'id', None)
        )
        
        return instance
    
    def perform_destroy(self, instance):
        """
        Registra la eliminación de recursos.
        Si el modelo tiene is_active, lo marca como inactivo en lugar de eliminarlo.
        """
        instance_id = getattr(instance, 'id', None)
        model_name = self.get_serializer().Meta.model.__name__
        
        # Si el modelo tiene is_active, desactivar en lugar de eliminar
        if hasattr(instance, 'is_active'):
            instance.is_active = False
            instance.updated_by = self.request.user if hasattr(self.request, 'user') else None
            instance.save()
            
            # Registrar acción
            log_user_action(
                self.request.user,
                'deactivate',
                model_name,
                instance_id
            )
        else:
            # Eliminar físicamente
            super().perform_destroy(instance)
            
            # Registrar acción
            log_user_action(
                self.request.user,
                'delete',
                model_name,
                instance_id
            )
    
    @action(detail=False, methods=['get'])
    def export(self, request, *args, **kwargs):
        """
        Endpoint para exportar datos en diferentes formatos.
        Permite exportar todos los resultados o aplicar los mismos filtros que en el listado.
        """
        # Obtener formato solicitado
        format = request.query_params.get('format', 'xlsx').lower()
        
        # Validar formato
        if format not in self.export_formats:
            return Response(
                {"error": f"Formato no válido. Use: {', '.join(self.export_formats)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener el nombre del modelo/recurso
        model_meta = self.get_serializer().Meta.model._meta
        resource_name = model_meta.verbose_name_plural.lower().replace(' ', '_')
        
        # Crear exportador
        exporter = create_exporter(resource_name, model_meta.verbose_name_plural)
        
        # Llamar a la función de exportación
        return exporter(self, request, format)
    
    @action(detail=False, methods=['get'])
    def autocomplete(self, request, *args, **kwargs):
        """
        Endpoint para autocompletado.
        Devuelve resultados para campos de texto con coincidencia parcial.
        """
        # Obtener parámetros
        search = request.query_params.get('q', '')
        field = request.query_params.get('field', 'nombre')
        limit = int(request.query_params.get('limit', 10))
        
        if not search:
            return Response([])
        
        # Obtener queryset con filtro
        queryset = self.get_queryset()
        
        # Si el modelo tiene is_active, solo considerar activos
        if hasattr(queryset.model, 'is_active'):
            queryset = queryset.filter(is_active=True)
        
        # Buscar en el campo especificado
        filter_kwargs = {f"{field}__icontains": search}
        queryset = queryset.filter(**filter_kwargs).distinct()[:limit]
        
        # Obtener campos para mostrar (label) y valor (value)
        label_field = request.query_params.get('label_field')
        value_field = request.query_params.get('value_field', 'id')
        
        # Determinar label automáticamente si no se especifica
        if not label_field:
            # Intentar usar nombre, si existe
            if hasattr(queryset.model, 'nombre'):
                label_field = 'nombre'
            # Si no, usar el primer campo de texto disponible
            else:
                for f in queryset.model._meta.fields:
                    if isinstance(f, (CharField, TextField)):
                        label_field = f.name
                        break
                # Si no hay ningún campo de texto, usar el campo de valor
                if not label_field:
                    label_field = value_field
        
        # Preparar resultados
        results = []
        for item in queryset:
            label = getattr(item, label_field)
            value = getattr(item, value_field)
            
            results.append({
                'label': str(label),
                'value': value
            })
        
        return Response(results)

class ReadOnlyModelViewSet(mixins.RetrieveModelMixin,
                          mixins.ListModelMixin,
                          viewsets.GenericViewSet):
    """
    ViewSet base para modelos de solo lectura.
    Implementa list() y retrieve().
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    
    # Cache de resultados
    cache_timeout = 60 * 60  # 1 hora por defecto
    enable_cache = True
    
    @method_decorator(cache_page(60 * 60))  # Cache por 1 hora
    @method_decorator(vary_on_cookie)
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @method_decorator(cache_page(60 * 60))  # Cache por 1 hora
    @method_decorator(vary_on_cookie)
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

class OwnerViewSetMixin:
    """
    Mixin para filtrar recursos por el propietario (usuario actual).
    Útil para modelos con campo 'created_by' o 'user'.
    """
    def get_queryset(self):
        """
        Filtra el queryset para mostrar solo recursos del usuario.
        """
        queryset = super().get_queryset()
        
        # Solo aplicar si el usuario no es admin/staff
        user = self.request.user
        if not user.is_superuser and not user.is_staff:
            # Determinar el campo de propietario
            if hasattr(queryset.model, 'created_by'):
                queryset = queryset.filter(created_by=user)
            elif hasattr(queryset.model, 'user'):
                queryset = queryset.filter(user=user)
                
        return queryset
    
    def get_permissions(self):
        """
        Añade permiso IsOwnerOrAdmin para acciones de detalle.
        """
        permissions = super().get_permissions()
        
        # Para acciones sobre un objeto específico
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            permissions.append(IsOwnerOrAdmin())
            
        return permissions

class PublicViewSetMixin:
    """
    Mixin para recursos públicos que no requieren autenticación.
    """
    def get_permissions(self):
        """
        No requiere autenticación para list y retrieve.
        """
        if self.action in ['list', 'retrieve']:
            return []
        return super().get_permissions()

# ViewSets específicos

class ZonasViewSet(BaseModelViewSet):
    """
    API endpoint para gestionar zonas.
    Permite ver, crear, actualizar y eliminar zonas.
    """
    queryset = Zonas.objects.all()
    serializer_class = ZonasSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'code', 'cobertura']
    ordering_fields = ['nombre', 'code', 'created_at']
    ordering = ['nombre']


class CiudadesViewSet(BaseModelViewSet):
    """
    API endpoint para gestionar ciudades.
    Permite ver, crear, actualizar y eliminar ciudades.
    """
    queryset = Ciudades.objects.all()
    serializer_class = CiudadesSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'provincia', 'code']
    ordering_fields = ['nombre', 'provincia', 'created_at']
    ordering = ['nombre']


class TipoClienteViewSet(BaseModelViewSet):
    """
    API endpoint para gestionar tipos de cliente.
    Permite ver, crear, actualizar y eliminar tipos de cliente.
    """
    queryset = TipoCliente.objects.all()
    serializer_class = TipoClienteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre', 'created_at']
    ordering = ['nombre']


class ClientesViewSet(BaseModelViewSet):
    """
    API endpoint para gestionar clientes.
    Permite ver, crear, actualizar y eliminar clientes, y filtrar por diferentes criterios.
    """
    queryset = Clientes.objects.all()
    serializer_class = ClientesSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['zona', 'ciudad', 'tipo_cliente', 'activo']
    search_fields = ['nombre', 'alias', 'razon_social', 'ruc', 'email']
    ordering_fields = ['nombre', 'alias', 'created_at']
    ordering = ['nombre']
    
    def get_optimized_queryset(self, queryset):
        """Optimiza el queryset para reducir consultas"""
        return queryset.select_related('zona', 'ciudad', 'tipo_cliente')
    
    @action(detail=True, methods=['get'])
    def historial(self, request, pk=None):
        """
        Endpoint para obtener el historial de un cliente específico.
        """
        cliente = self.get_object()
        
        # Aquí se implementaría la lógica para obtener el historial del cliente
        # Por ahora, retornamos un objeto vacío
        return Response({
            'cliente_id': cliente.id,
            'historial': []
        })


class CategoriasViewSet(BaseModelViewSet):
    """
    API endpoint para gestionar categorías.
    Permite ver, crear, actualizar y eliminar categorías.
    """
    queryset = Categorias.objects.all()
    serializer_class = CategoriasSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'level', 'parent']
    search_fields = ['nombre', 'code', 'path']
    ordering_fields = ['nombre', 'code', 'level', 'created_at']
    ordering = ['nombre']
    
    def get_optimized_queryset(self, queryset):
        """Optimiza el queryset para reducir consultas"""
        return queryset.select_related('parent')
    
    @action(detail=False, methods=['get'])
    def arbol(self, request):
        """
        Endpoint para obtener todas las categorías en estructura jerárquica.
        Solo incluye las categorías de nivel 0 (raíz) con sus hijos.
        """
        # Obtener solo categorías raíz (nivel 0)
        queryset = self.get_queryset().filter(level=0, is_active=True)
        
        # Aplicar filtros de búsqueda si se proporcionan
        search = request.query_params.get('search', None)
        if search:
            # Si hay búsqueda, incluir todas las categorías que coincidan
            # independientemente del nivel
            queryset = self.get_queryset().filter(
                is_active=True
            ).filter(
                models_Q(nombre__icontains=search) | 
                models_Q(code__icontains=search)
            )
        
        serializer = self.get_serializer(
            queryset, 
            many=True, 
            context={'detail_view': True}  # Para incluir hijos
        )
        
        return Response(serializer.data)
