"""
Vistas optimizadas para el módulo de proformas.

Este módulo contiene mejoras de rendimiento para las vistas del módulo de proformas,
especialmente para el dashboard y las operaciones que involucran múltiples consultas.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, F, Value, FloatField, Case, When, ExpressionWrapper
from django.db.models.functions import TruncMonth, Concat, Cast
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

from .models import Proforma, ProformaItem, ProformaHistorial
from .serializers import ProformaSerializer, ProformaItemSerializer
from .pagination import StandardResultsSetPagination, LargeResultsSetPagination
from .views import ProformaFilter, ProformaItemFilter


class DashboardPagination(StandardResultsSetPagination):
    """Paginación específica para dashboard con tamaño de página predeterminado más pequeño"""
    page_size = 10
    max_page_size = 50


class OptimizedProformaViewSet(viewsets.ModelViewSet):
    """
    ViewSet optimizado para gestionar proformas con mejoras de rendimiento
    """
    queryset = Proforma.objects.select_related(
        'cliente', 'empresa', 'tipo_contratacion', 'created_by', 'updated_by'
    ).prefetch_related('items', 'historial').all()
    serializer_class = ProformaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProformaFilter
    search_fields = ['numero', 'nombre', 'cliente__nombre', 'notas', 'atencion_a']
    ordering_fields = ['numero', 'fecha_emision', 'fecha_vencimiento', 'cliente__nombre', 'total', 'estado', 'created_at']
    ordering = ['-fecha_emision']
    pagination_class = StandardResultsSetPagination
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Obtener estadísticas para el dashboard de proformas.
        Versión optimizada que consolida múltiples consultas en una sola.
        """
        try:
            # Filtrar por rango de fechas y otros parámetros
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            estado_filter = request.query_params.get('estado')
            cliente_id = request.query_params.get('cliente_id')
            min_total = request.query_params.get('min_total')
            max_total = request.query_params.get('max_total')
            
            # Base queryset con filtros
            queryset = self.get_queryset()
            
            # Aplicar filtros si existen
            if start_date:
                queryset = queryset.filter(fecha_emision__gte=start_date)
            if end_date:
                queryset = queryset.filter(fecha_emision__lte=end_date)
            if estado_filter:
                # Permitir filtrar por múltiples estados
                estados = [estado.strip() for estado in estado_filter.split(',')]
                queryset = queryset.filter(estado__in=estados)
            if cliente_id:
                queryset = queryset.filter(cliente_id=cliente_id)
            if min_total:
                queryset = queryset.filter(total__gte=min_total)
            if max_total:
                queryset = queryset.filter(total__lte=max_total)
            
            # Registrar información de filtrado
            logger.info(
                f"Dashboard filtrado: fechas={start_date}~{end_date}, "
                f"estado={estado_filter}, cliente={cliente_id}, "
                f"total={min_total}~{max_total}"
            )

            # 1. OPTIMIZACIÓN: Estadísticas por estado en una sola consulta
            estado_stats = {}
            estado_annotate = {}
            
            # Crear anotaciones dinámicas para cada estado
            for estado, label in Proforma.ESTADO_CHOICES:
                # Crear una anotación para contar cada estado
                estado_annotate[f'count_{estado}'] = Count(
                    Case(
                        When(estado=estado, then=1),
                        default=None
                    )
                )
                # Crear una anotación para sumar el total de cada estado
                estado_annotate[f'total_{estado}'] = Sum(
                    Case(
                        When(estado=estado, then=F('total')),
                        default=0
                    )
                )
            
            # Realizar una sola consulta para obtener todas las estadísticas por estado
            estado_aggregate = queryset.aggregate(**estado_annotate)
            
            # Formatear los resultados
            for estado, label in Proforma.ESTADO_CHOICES:
                estado_stats[estado] = {
                    'count': estado_aggregate.get(f'count_{estado}', 0) or 0,
                    'total': float(estado_aggregate.get(f'total_{estado}', 0) or 0),
                    'label': label
                }
            
            # 2. OPTIMIZACIÓN: Estadísticas por cliente (top 5) en una sola consulta
            cliente_stats = list(queryset.values(
                'cliente__id', 'cliente__nombre'
            ).annotate(
                count=Count('id'),
                total=Sum('total')
            ).order_by('-total')[:5])
            
            # Formatear los resultados
            cliente_stats = [{
                'id': cliente['cliente__id'],
                'nombre': cliente['cliente__nombre'],
                'count': cliente['count'],
                'total': float(cliente['total'] or 0)
            } for cliente in cliente_stats]
            
            # 3. OPTIMIZACIÓN: Estadísticas por mes en una sola consulta
            mes_stats = list(queryset.annotate(
                mes=TruncMonth('fecha_emision')
            ).values('mes').annotate(
                count=Count('id'),
                total=Sum('total')
            ).order_by('mes'))
            
            # Formatear los resultados
            mes_stats = [{
                'mes': mes['mes'].strftime('%Y-%m') if mes['mes'] else '',
                'count': mes['count'],
                'total': float(mes['total'] or 0)
            } for mes in mes_stats if mes['mes']]
            
            # 4. OPTIMIZACIÓN: Proformas recientes con prefetch_related y select_related
            recientes_qs = Proforma.objects.select_related(
                'cliente', 'created_by'
            ).order_by('-created_at')[:5]
            
            # Formatear las proformas recientes
            proformas_recientes = []
            for proforma in recientes_qs:
                try:
                    # Obtener nombres para el estado
                    estado_label = dict(Proforma.ESTADO_CHOICES).get(proforma.estado, proforma.estado)
                    
                    # Formatear fechas
                    fecha_emision = proforma.fecha_emision.strftime('%d/%m/%Y') if proforma.fecha_emision else ''
                    fecha_vencimiento = proforma.fecha_vencimiento.strftime('%d/%m/%Y') if proforma.fecha_vencimiento else ''
                    
                    # Iniciales del cliente para el avatar
                    cliente_nombre = proforma.cliente.nombre if proforma.cliente else 'N/A'
                    cliente_avatar = ''.join([word[0] for word in cliente_nombre.split()[:2]]) if cliente_nombre != 'N/A' else 'NA'
                    
                    # Vendedor (usuario que creó la proforma)
                    vendedor = f"{proforma.created_by.first_name} {proforma.created_by.last_name}" if proforma.created_by else 'N/A'
                    if vendedor.strip() == '':
                        vendedor = proforma.created_by.username if proforma.created_by else 'N/A'
                    
                    proformas_recientes.append({
                        'id': proforma.numero,  # Usamos 'numero' como ID para la interfaz
                        'numero': proforma.numero,
                        'cliente': cliente_nombre,
                        'clienteAvatar': cliente_avatar,
                        'fecha': fecha_emision,
                        'expira': fecha_vencimiento,
                        'monto': float(proforma.total),
                        'estado': estado_label,
                        'vendedor': vendedor
                    })
                except Exception as e:
                    logger.error(f"Error al procesar proforma {proforma.id}: {str(e)}")
            
            # 5. OPTIMIZACIÓN: Totales consolidados en una sola consulta
            totals = queryset.aggregate(
                total_count=Count('id'),
                total_aprobadas=Count(Case(When(estado='aprobada', then=1))),
                total_monto=Sum('total') or 0
            )
            
            total_count = totals['total_count']
            total_aprobadas = totals['total_aprobadas']
            total_monto = float(totals['total_monto'])
            
            # Calcular tasa de conversión
            tasa_conversion = round((total_aprobadas / total_count) * 100, 1) if total_count > 0 else 0
            
            # Preparar respuesta final
            response_data = {
                'total_proformas': total_count,
                'total_monto': total_monto,
                'por_estado': estado_stats,
                'por_cliente': cliente_stats,
                'por_mes': mes_stats,
                'proformasRecientes': proformas_recientes,
                'totalStats': {
                    'totalProformas': total_count,
                    'proformasAprobadas': total_aprobadas,
                    'tasaConversion': tasa_conversion,
                    'montoTotal': total_monto
                }
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Error en dashboard optimizado: {str(e)}")
            return Response(
                {"error": "Error al generar el dashboard"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], pagination_class=DashboardPagination)
    def items(self, request, pk=None):
        """
        Obtener los ítems de una proforma específica con paginación.
        Versión optimizada con prefetch_related.
        """
        proforma = self.get_object()
        # Usar prefetch_related para evitar N+1 queries
        items = proforma.items.select_related(
            'producto_ofertado', 'producto_disponible'
        ).all()
        
        # Aplicar paginación
        page = self.paginate_queryset(items)
        if page is not None:
            serializer = ProformaItemSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ProformaItemSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], pagination_class=DashboardPagination)
    def historial(self, request, pk=None):
        """
        Obtener el historial de una proforma específica con paginación.
        Versión optimizada con select_related.
        """
        proforma = self.get_object()
        # Usar select_related para evitar N+1 queries
        historial = proforma.historial.select_related('created_by').all()
        
        # Aplicar paginación
        page = self.paginate_queryset(historial)
        if page is not None:
            from .serializers import ProformaHistorialSerializer
            serializer = ProformaHistorialSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        from .serializers import ProformaHistorialSerializer
        serializer = ProformaHistorialSerializer(historial, many=True)
        return Response(serializer.data)


class OptimizedProformaItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet optimizado para gestionar ítems de proformas.
    Incluye mejoras de prefetch y paginación por defecto.
    """
    queryset = ProformaItem.objects.select_related(
        'proforma', 'producto_ofertado', 'producto_disponible'
    ).all()
    serializer_class = ProformaItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ProformaItemFilter
    ordering_fields = ['orden', 'codigo', 'precio_unitario', 'total']
    ordering = ['proforma', 'orden']
    pagination_class = LargeResultsSetPagination
    
    def get_queryset(self):
        """
        Sobrescribe el queryset base para agregar prefetch_related cuando
        se solicita listado por proforma.
        """
        queryset = super().get_queryset()
        
        # Si se está filtrando por proforma, optimizar la consulta
        proforma_id = self.request.query_params.get('proforma')
        if proforma_id:
            queryset = queryset.filter(proforma_id=proforma_id)
        
        return queryset


class OptimizedProformaHistorialViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet optimizado para consultar el historial de proformas.
    Incluye paginación por defecto y optimizaciones de consulta.
    """
    queryset = ProformaHistorial.objects.select_related(
        'proforma', 'created_by'
    ).all()
    serializer_class = None  # Se define en get_serializer_class
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['proforma', 'accion', 'estado_anterior', 'estado_nuevo', 'created_by']
    ordering_fields = ['created_at', 'accion']
    ordering = ['-created_at']
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        """Importa el serializer aquí para evitar importaciones circulares"""
        from .serializers import ProformaHistorialSerializer
        return ProformaHistorialSerializer