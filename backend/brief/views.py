# backend/brief/views.py
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie

from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Brief, BriefItems
from .serializers import BriefSerializer, BriefItemsSerializer

# Definición temporal de BaseModelViewSet para compatibilidad
class BaseModelViewSet(viewsets.ModelViewSet):
    """Base ViewSet con funcionalidades extendidas."""
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {}


class BriefViewSet(BaseModelViewSet):
    """ViewSet para gestión de Briefs."""
    queryset = Brief.objects.select_related('cliente').all()
    serializer_class = BriefSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'codigo': ['exact', 'icontains'],
        'origen': ['exact', 'icontains'], 
        'fecha': ['gte', 'lte', 'exact', 'gt', 'lt'],
        'presupuestoref': ['gte', 'lte', 'exact', 'gt', 'lt'],
        'observaciones': ['icontains'],
        'cliente': ['exact'],
    }
    search_fields = ['codigo', 'origen', 'observaciones']
    ordering_fields = ['codigo', 'fecha', 'presupuestoref', 'created_at', 'updated_at']

    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        """Obtener los items de un brief específico."""
        brief = self.get_object()
        items = brief.items.all()
        serializer = BriefItemsSerializer(items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    @method_decorator(cache_page(60))
    @method_decorator(vary_on_cookie)
    def stats(self, request):
        """Estadísticas de briefs."""
        queryset = self.get_queryset()
        stats = {
            'total_briefs': queryset.count(),
            'por_cliente': queryset.values('cliente__nombre').annotate(total=Count('id')).order_by('-total'),
            'presupuesto_total': queryset.aggregate(total=Sum('presupuestoref'))['total'],
            'briefs_por_mes': queryset.extra(select={'month': "EXTRACT(month FROM fecha)"}).values('month').annotate(count=Count('id')).order_by('month')
        }
        return Response(stats)
        
    @action(detail=True, methods=['get'])
    def exportar_pdf(self, request, pk=None):
        """Exportar brief a PDF."""
        from django.http import HttpResponse
        from django.template.loader import render_to_string
        import weasyprint
        
        brief = self.get_object()
        items = brief.items.all()
        
        # Contexto para la plantilla
        context = {
            'brief': brief,
            'items': items,
            'cliente': brief.cliente,
            'fecha': brief.fecha.strftime('%d/%m/%Y'),
        }
        
        # Renderizar la plantilla HTML
        html_string = render_to_string('brief/pdf_template.html', context)
        
        # Crear respuesta HTTP con PDF
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="brief_{brief.codigo}.pdf"'
        
        # Generar PDF desde HTML
        weasyprint.HTML(string=html_string).write_pdf(response)
        
        return response


class BriefItemsViewSet(BaseModelViewSet):
    """ViewSet para gestión de items de Brief."""
    queryset = BriefItems.objects.select_related('id_brief', 'unidad').all()
    serializer_class = BriefItemsSerializer
    filterset_fields = {
        **BaseModelViewSet.filterset_fields,
        'id_brief': ['exact'],
        'nombre': ['exact', 'icontains'],
        'cudim': ['exact', 'icontains'],
        'descripcion': ['icontains'],
        'unidad': ['exact'],
        'cantidad': ['gte', 'lte', 'exact', 'gt', 'lt'],
    }
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre', 'cantidad', 'created_at', 'updated_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        brief_id = self.request.query_params.get('brief', None)
        if brief_id is not None:
            queryset = queryset.filter(id_brief__id=brief_id)
        return queryset

    @action(detail=False, methods=['get'])
    def por_unidad(self, request):
        """Agrupar items por unidad."""
        items_por_unidad = self.get_queryset().values('unidad__nombre').annotate(
            total_items=Count('id'),
            cantidad_total=Sum('cantidad')
        ).order_by('-total_items')
        return Response(items_por_unidad)