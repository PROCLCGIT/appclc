# proformas/views.py
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import Proforma, ProformaItem, ProformaHistory
from .serializers import ProformaSerializer, ProformaItemSerializer, ProformaHistorySerializer
from .permissions import IsProformaUser

# --------------------------------------------------------------------------
# ProformaViewSet
# --------------------------------------------------------------------------
class ProformaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de proformas"""
    queryset = Proforma.objects.select_related(
        'client', 'sales_person', 'created_by'
    ).prefetch_related('items', 'history').all()
    
    serializer_class = ProformaSerializer
    permission_classes = [IsAuthenticated, IsProformaUser]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'status': ['exact'],
        'date': ['exact', 'gte', 'lte'],
        'created_at': ['exact', 'gte', 'lte'],
        'client': ['exact'],
        'sales_person': ['exact']
    }
    search_fields = ['number', 'client__nombre', 'client__razon_social']
    ordering_fields = ['date', 'total', 'status', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Filtro adicional para que solo puedan ver
        sus propias proformas (o todas si es superuser).
        """
        queryset = super().get_queryset()
        user = self.request.user
        if not user.is_superuser:
            queryset = queryset.filter(
                Q(created_by=user) | Q(sales_person=user)
            )

        # Filtros adicionales por fecha
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset

    def perform_create(self, serializer):
        """
        Asigna automáticamente created_by y sales_person al usuario logueado.
        """
        serializer.save(
            created_by=self.request.user,
            sales_person=self.request.user
        )

    # ---------------------
    # Acciones personalizadas
    # ---------------------

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Aprobar una proforma en estado 'draft'."""
        proforma = self.get_object()
        if proforma.status != 'draft':
            return Response(
                {"error": "Solo se pueden aprobar proformas en estado borrador."},
                status=status.HTTP_400_BAD_REQUEST
            )
        proforma.status = 'approved'
        proforma.save()
        ProformaHistory.objects.create(
            proforma=proforma,
            user=request.user,
            action='approved',
            details='Proforma aprobada'
        )
        return Response({"status": "success", "message": "Proforma aprobada exitosamente"})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Rechazar una proforma en estado 'draft' o 'sent'."""
        proforma = self.get_object()
        reason = request.data.get('reason', 'No se especificó razón')
        
        if proforma.status not in ['draft', 'sent']:
            return Response(
                {"error": "Solo se pueden rechazar proformas en estado borrador o enviadas."},
                status=status.HTTP_400_BAD_REQUEST
            )
        proforma.status = 'rejected'
        proforma.save()
        ProformaHistory.objects.create(
            proforma=proforma,
            user=request.user,
            action='rejected',
            details=f'Proforma rechazada. Razón: {reason}'
        )
        return Response({"status": "success", "message": "Proforma rechazada"})

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """
        Marcar proforma como enviada (estado 'sent') si está en estado 'draft'.
        (Podrías implementar envío de email aquí.)
        """
        proforma = self.get_object()
        if proforma.status != 'draft':
            return Response(
                {"error": "Solo se pueden enviar proformas en estado borrador."},
                status=status.HTTP_400_BAD_REQUEST
            )
        proforma.status = 'sent'
        proforma.save()
        # TODO: Implementar envío de email, e.g. send_proforma_email(proforma)
        ProformaHistory.objects.create(
            proforma=proforma,
            user=request.user,
            action='sent',
            details='Proforma enviada al cliente'
        )
        return Response({"status": "success", "message": "Proforma enviada exitosamente"})

    @action(detail=True, methods=['post'])
    def expire(self, request, pk=None):
        """
        Marcar la proforma como 'expired'.
        Este endpoint se mencionaba en tus URLs, pero no estaba definido.
        """
        proforma = self.get_object()
        # Lógica: permitimos expirar cualquier proforma que no esté ya cerrada,
        # o define tu propia validación:
        if proforma.status in ['approved', 'rejected']:
            return Response(
                {"error": "No puedes expirar una proforma aprobada o rechazada."},
                status=status.HTTP_400_BAD_REQUEST
            )
        proforma.status = 'expired'
        proforma.save()
        ProformaHistory.objects.create(
            proforma=proforma,
            user=request.user,
            action='expired',
            details='Proforma marcada como expirada'
        )
        return Response({"status": "success", "message": "Proforma expirada."})

    # ---------------------
    # Acciones de reporte/estadísticas
    # ---------------------

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Dashboard de estadísticas de proformas.
        """
        queryset = self.get_queryset()
        stats = {
            'total_count': queryset.count(),
            'status_count': {
                status_key: queryset.filter(status=status_key).count()
                for status_key, _ in Proforma.STATUS_CHOICES
            },
            'total_amount': queryset.aggregate(total=Sum('total'))['total'] or 0
        }
        # Totales por mes (últimos 6 meses)
        six_months_ago = timezone.now() - timezone.timedelta(days=180)
        monthly_stats = (
            queryset.filter(date__gte=six_months_ago)
            .values('date__month')
            .annotate(total_amount=Sum('total'), count=Count('id'))
            .order_by('date__month')
        )
        stats['monthly_stats'] = monthly_stats
        return Response(stats)

    @action(detail=False, methods=['get'])
    def monthly_report(self, request):
        """Ejemplo de reporte mensual (placeholder)."""
        # TODO: Lógica concreta de reporte
        return Response({"message": "Reporte mensual (placeholder)."})

    @action(detail=False, methods=['get'])
    def client_report(self, request):
        """Ejemplo de reporte por cliente (placeholder)."""
        # TODO: Lógica concreta de reporte
        return Response({"message": "Reporte por cliente (placeholder)."})

    # ---------------------
    # Acciones de exportación
    # ---------------------

    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        """Ejemplo de exportar a PDF (placeholder)."""
        # TODO: Generar PDF
        return Response({"message": "Exportar a PDF (placeholder)."})

    @action(detail=True, methods=['get'])
    def export_excel(self, request, pk=None):
        """Ejemplo de exportar a Excel (placeholder)."""
        # TODO: Generar Excel
        return Response({"message": "Exportar a Excel (placeholder)."})

    # ---------------------
    # Acciones de búsqueda/filtrado
    # ---------------------

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Búsqueda personalizada (placeholder)."""
        # TODO: Implementar lógica de búsqueda
        return Response({"message": "Búsqueda de proformas (placeholder)."})

    @action(detail=False, methods=['get'])
    def filter_by_date(self, request):
        """Filtrado por fecha (placeholder)."""
        # TODO: Implementar lógica de filtro
        return Response({"message": "Filtrado por fecha (placeholder)."})

    @action(detail=False, methods=['get'])
    def filter_by_status(self, request):
        """Filtrado por estado (placeholder)."""
        # TODO: Implementar lógica de filtro
        return Response({"message": "Filtrado por estado (placeholder)."})

    # ---------------------
    # Acciones de consulta interna
    # ---------------------

    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        """Obtener items de una proforma específica"""
        proforma = self.get_object()
        items = proforma.items.all()
        serializer = ProformaItemSerializer(items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Obtener historial de una proforma específica"""
        proforma = self.get_object()
        history = proforma.history.all()
        history_serializer = ProformaHistorySerializer(history, many=True)
        return Response(history_serializer.data)

# --------------------------------------------------------------------------
# ProformaItemViewSet
# --------------------------------------------------------------------------
class ProformaItemViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar ProformaItem de forma independiente."""
    queryset = ProformaItem.objects.all()
    serializer_class = ProformaItemSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Crear múltiples items de proforma en un solo request.
        Ejemplo de payload: {"items": [{...}, {...}]}
        """
        items_data = request.data.get("items", [])
        if not items_data:
            return Response(
                {"error": "No items provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        created_items = []
        for item in items_data:
            serializer = self.get_serializer(data=item)
            serializer.is_valid(raise_exception=True)
            created_item = serializer.save()
            created_items.append(created_item)

        return Response(
            self.get_serializer(created_items, many=True).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['put'])
    def bulk_update(self, request):
        """
        Actualizar múltiples items de proforma en un solo request.
        Ejemplo de payload: {"items": [{ "id": 1, ...}, { "id": 2, ...}]}
        """
        items_data = request.data.get("items", [])
        if not items_data:
            return Response(
                {"error": "No items provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated_items = []
        for item in items_data:
            item_id = item.get("id")
            if not item_id:
                return Response(
                    {"error": "Each item must have an 'id' to be updated."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            instance = self.get_queryset().filter(id=item_id).first()
            if not instance:
                return Response(
                    {"error": f"Item with id={item_id} not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = self.get_serializer(instance, data=item, partial=True)
            serializer.is_valid(raise_exception=True)
            updated_item = serializer.save()
            updated_items.append(updated_item)

        return Response(
            self.get_serializer(updated_items, many=True).data,
            status=status.HTTP_200_OK
        )

# --------------------------------------------------------------------------
# ProformaHistoryViewSet
# --------------------------------------------------------------------------
class ProformaHistoryViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar el historial de proformas de manera independiente."""
    queryset = ProformaHistory.objects.select_related('proforma', 'user').all()
    serializer_class = ProformaHistorySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Ejemplo de acción para resumir historial global.
        """
        total = self.get_queryset().count()
        return Response({"message": f"Resumen del historial. Total registros: {total}"})

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """
        Agrupar historial por usuario.
        """
        queryset = self.get_queryset().values('user__username').annotate(count=Count('id'))
        return Response(queryset)

