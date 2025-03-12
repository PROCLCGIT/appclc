from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone
from django.http import HttpResponse
from django.conf import settings
import json
import csv
import io
from decimal import Decimal

from .models import Proforma, ProformaItem, ProformaHistorial, ConfiguracionProforma
from .serializers import (
    ProformaSerializer, ProformaItemSerializer, 
    ProformaHistorialSerializer, ConfiguracionProformaSerializer,
    BusquedaProductosSerializer
)

from pandora.models import Clientes, EmpresaClc
from products.models import ProductoOfertado, ProductoDisponible


class ProformaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar proformas
    """
    queryset = Proforma.objects.select_related(
        'cliente', 'empresa', 'tipo_contratacion', 'created_by', 'updated_by'
    ).prefetch_related('items', 'historial').all()
    serializer_class = ProformaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'numero': ['exact', 'icontains'],
        'fecha_emision': ['exact', 'gte', 'lte'],
        'fecha_vencimiento': ['exact', 'gte', 'lte'],
        'cliente': ['exact'],
        'empresa': ['exact'],
        'tipo_contratacion': ['exact'],
        'estado': ['exact', 'in'],
        'created_by': ['exact'],
        'created_at': ['gte', 'lte'],
    }
    search_fields = ['numero', 'cliente__nombre', 'notas', 'atencion_a']
    ordering_fields = ['numero', 'fecha_emision', 'fecha_vencimiento', 'cliente__nombre', 'total', 'estado', 'created_at']
    ordering = ['-fecha_emision']
    
    def perform_create(self, serializer):
        """Asignar el usuario actual como creador"""
        serializer.save(created_by=self.request.user, updated_by=self.request.user)
    
    def perform_update(self, serializer):
        """Asignar el usuario actual como actualizador"""
        serializer.save(updated_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        """Obtener los ítems de una proforma específica"""
        proforma = self.get_object()
        items = proforma.items.all()
        serializer = ProformaItemSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def historial(self, request, pk=None):
        """Obtener el historial de una proforma específica"""
        proforma = self.get_object()
        historial = proforma.historial.all()
        serializer = ProformaHistorialSerializer(historial, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        """Cambiar el estado de una proforma"""
        proforma = self.get_object()
        nuevo_estado = request.data.get('estado', None)
        
        if not nuevo_estado:
            return Response(
                {"error": "Debe proporcionar un nuevo estado"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        estados_validos = dict(Proforma.ESTADO_CHOICES).keys()
        if nuevo_estado not in estados_validos:
            return Response(
                {"error": f"Estado no válido. Opciones: {', '.join(estados_validos)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Almacenar estado anterior
        estado_anterior = proforma.estado
        
        # Cambiar estado
        proforma.estado = nuevo_estado
        proforma.save(update_fields=['estado'])
        
        # Registrar en historial
        accion = 'envio' if nuevo_estado == 'enviada' else 'aprobacion' if nuevo_estado == 'aprobada' else 'rechazo' if nuevo_estado == 'rechazada' else 'conversion' if nuevo_estado == 'convertida' else 'vencimiento' if nuevo_estado == 'vencida' else 'modificacion'
        
        ProformaHistorial.objects.create(
            proforma=proforma,
            accion=accion,
            estado_anterior=estado_anterior,
            estado_nuevo=nuevo_estado,
            notas=request.data.get('notas', ''),
            created_by=request.user
        )
        
        # Devolver proforma actualizada
        serializer = self.get_serializer(proforma)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def enviar(self, request, pk=None):
        """Marcar una proforma como enviada al cliente"""
        proforma = self.get_object()
        
        if proforma.estado != 'borrador':
            return Response(
                {"error": "Solo se pueden enviar proformas en estado 'borrador'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cambiar estado
        proforma.estado = 'enviada'
        proforma.save(update_fields=['estado'])
        
        # Registrar en historial
        ProformaHistorial.objects.create(
            proforma=proforma,
            accion='envio',
            estado_anterior='borrador',
            estado_nuevo='enviada',
            notas=request.data.get('notas', ''),
            created_by=request.user
        )
        
        # Devolver proforma actualizada
        serializer = self.get_serializer(proforma)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        """Marcar una proforma como aprobada por el cliente"""
        proforma = self.get_object()
        
        if proforma.estado != 'enviada':
            return Response(
                {"error": "Solo se pueden aprobar proformas en estado 'enviada'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cambiar estado
        proforma.estado = 'aprobada'
        proforma.save(update_fields=['estado'])
        
        # Registrar en historial
        ProformaHistorial.objects.create(
            proforma=proforma,
            accion='aprobacion',
            estado_anterior='enviada',
            estado_nuevo='aprobada',
            notas=request.data.get('notas', ''),
            created_by=request.user
        )
        
        # Devolver proforma actualizada
        serializer = self.get_serializer(proforma)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        """Marcar una proforma como rechazada por el cliente"""
        proforma = self.get_object()
        
        if proforma.estado not in ['borrador', 'enviada']:
            return Response(
                {"error": "Solo se pueden rechazar proformas en estado 'borrador' o 'enviada'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cambiar estado
        proforma.estado = 'rechazada'
        proforma.save(update_fields=['estado'])
        
        # Registrar en historial
        ProformaHistorial.objects.create(
            proforma=proforma,
            accion='rechazo',
            estado_anterior=proforma.estado,
            estado_nuevo='rechazada',
            notas=request.data.get('notas', ''),
            created_by=request.user
        )
        
        # Devolver proforma actualizada
        serializer = self.get_serializer(proforma)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def duplicar(self, request, pk=None):
        """Crear una copia de una proforma existente"""
        proforma_original = self.get_object()
        
        # Crear nueva proforma
        nueva_proforma = Proforma.objects.create(
            numero=Proforma().generar_numero(),
            fecha_emision=timezone.now().date(),
            fecha_vencimiento=timezone.now().date() + timezone.timedelta(days=15),
            cliente=proforma_original.cliente,
            empresa=proforma_original.empresa,
            tipo_contratacion=proforma_original.tipo_contratacion,
            atencion_a=proforma_original.atencion_a,
            condiciones_pago=proforma_original.condiciones_pago,
            tiempo_entrega=proforma_original.tiempo_entrega,
            porcentaje_impuesto=proforma_original.porcentaje_impuesto,
            notas=proforma_original.notas,
            estado='borrador',
            created_by=request.user,
            updated_by=request.user
        )
        
        # Duplicar ítems
        for item_original in proforma_original.items.all():
            ProformaItem.objects.create(
                proforma=nueva_proforma,
                tipo_item=item_original.tipo_item,
                producto_ofertado=item_original.producto_ofertado,
                producto_disponible=item_original.producto_disponible,
                codigo=item_original.codigo,
                descripcion=item_original.descripcion,
                unidad=item_original.unidad,
                cantidad=item_original.cantidad,
                precio_unitario=item_original.precio_unitario,
                porcentaje_descuento=item_original.porcentaje_descuento,
                total=item_original.total,
                orden=item_original.orden
            )
        
        # Calcular totales
        nueva_proforma.calcular_montos()
        nueva_proforma.save()
        
        # Registrar en historial
        ProformaHistorial.objects.create(
            proforma=nueva_proforma,
            accion='creacion',
            estado_nuevo='borrador',
            notas=f"Duplicada de la proforma #{proforma_original.numero}",
            created_by=request.user
        )
        
        # Devolver nueva proforma
        serializer = self.get_serializer(nueva_proforma)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Obtener estadísticas para el dashboard de proformas"""
        # Filtrar por rango de fechas si se proporciona
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = self.get_queryset()
        
        if start_date:
            queryset = queryset.filter(fecha_emision__gte=start_date)
        if end_date:
            queryset = queryset.filter(fecha_emision__lte=end_date)
        
        # Estadísticas por estado
        estado_stats = {}
        for estado, label in Proforma.ESTADO_CHOICES:
            count = queryset.filter(estado=estado).count()
            total = queryset.filter(estado=estado).values_list('total', flat=True)
            estado_stats[estado] = {
                'count': count,
                'total': sum(total) if total else 0,
                'label': label
            }
        
        # Estadísticas por cliente (top 5)
        cliente_stats = []
        top_clientes = queryset.values('cliente__id', 'cliente__nombre').annotate(
            count=models.Count('id'),
            total=models.Sum('total')
        ).order_by('-total')[:5]
        
        for cliente in top_clientes:
            cliente_stats.append({
                'id': cliente['cliente__id'],
                'nombre': cliente['cliente__nombre'],
                'count': cliente['count'],
                'total': cliente['total'] or 0
            })
        
        # Estadísticas por mes
        from django.db.models.functions import TruncMonth
        
        mes_stats = []
        por_mes = queryset.annotate(
            mes=TruncMonth('fecha_emision')
        ).values('mes').annotate(
            count=models.Count('id'),
            total=models.Sum('total')
        ).order_by('mes')
        
        for mes in por_mes:
            if mes['mes']:
                mes_stats.append({
                    'mes': mes['mes'].strftime('%Y-%m'),
                    'count': mes['count'],
                    'total': mes['total'] or 0
                })
        
        # Devolver estadísticas
        return Response({
            'total_proformas': queryset.count(),
            'total_monto': sum(queryset.values_list('total', flat=True)),
            'por_estado': estado_stats,
            'por_cliente': cliente_stats,
            'por_mes': mes_stats
        })
    
    @action(detail=True, methods=['get'])
    def exportar_csv(self, request, pk=None):
        """Exportar una proforma a formato CSV"""
        proforma = self.get_object()
        
        # Crear buffer en memoria para el CSV
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        
        # Encabezado
        writer.writerow(['Proforma', proforma.numero])
        writer.writerow(['Fecha Emisión', proforma.fecha_emision.strftime('%Y-%m-%d')])
        writer.writerow(['Fecha Vencimiento', proforma.fecha_vencimiento.strftime('%Y-%m-%d')])
        writer.writerow(['Cliente', proforma.cliente.nombre])
        writer.writerow(['RUC Cliente', proforma.cliente.ruc])
        writer.writerow(['Empresa Emisora', proforma.empresa.nombre])
        writer.writerow(['Estado', dict(Proforma.ESTADO_CHOICES)[proforma.estado]])
        writer.writerow([])
        
        # Ítems
        writer.writerow(['Código', 'Descripción', 'Unidad', 'Cantidad', 'Precio Unitario', 'Descuento %', 'Total'])
        
        for item in proforma.items.all():
            writer.writerow([
                item.codigo,
                item.descripcion,
                item.unidad,
                item.cantidad,
                item.precio_unitario,
                item.porcentaje_descuento,
                item.total
            ])
        
        writer.writerow([])
        
        # Totales
        writer.writerow(['', '', '', '', '', 'Subtotal', proforma.subtotal])
        writer.writerow(['', '', '', '', '', f'Impuesto ({proforma.porcentaje_impuesto}%)', proforma.impuesto])
        writer.writerow(['', '', '', '', '', 'Total', proforma.total])
        
        # Preparar respuesta
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="proforma_{proforma.numero}.csv"'
        
        return response
    
    @action(detail=False, methods=['get'])
    def buscar_productos(self, request):
        """Buscar productos para agregar a una proforma"""
        search_term = request.query_params.get('term', '')
        source = request.query_params.get('source', 'all')
        
        if not search_term or len(search_term) < 2:
            return Response([])
        
        results = []
        
        # Buscar en productos ofertados
        if source in ['all', 'ofertados']:
            ofertados = ProductoOfertado.objects.filter(
                Q(code__icontains=search_term) | 
                Q(nombre__icontains=search_term) |
                Q(descripcion__icontains=search_term)
            ).filter(is_active=True)[:10]
            
            for producto in ofertados:
                results.append(BusquedaProductosSerializer.from_producto_ofertado(producto))
        
        # Buscar en productos disponibles
        if source in ['all', 'disponibles']:
            disponibles = ProductoDisponible.objects.filter(
                Q(code__icontains=search_term) | 
                Q(nombre__icontains=search_term)
            ).filter(is_active=True)[:10]
            
            for producto in disponibles:
                results.append(BusquedaProductosSerializer.from_producto_disponible(producto))
        
        return Response(results)
    
    @action(detail=False, methods=['get'])
    def obtener_configuracion(self, request):
        """Obtener la configuración actual de proformas"""
        config = ConfiguracionProforma.objects.first()
        
        if not config:
            # Crear configuración por defecto si no existe
            config = ConfiguracionProforma.objects.create()
        
        serializer = ConfiguracionProformaSerializer(config)
        return Response(serializer.data)


class ProformaItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar ítems de proformas
    """
    queryset = ProformaItem.objects.select_related(
        'proforma', 'producto_ofertado', 'producto_disponible'
    ).all()
    serializer_class = ProformaItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['proforma', 'tipo_item']
    ordering_fields = ['orden', 'codigo', 'precio_unitario', 'total']
    ordering = ['proforma', 'orden']
    
    def perform_destroy(self, instance):
        """Cuando se elimina un ítem, recalcular los totales de la proforma"""
        proforma = instance.proforma
        super().perform_destroy(instance)
        proforma.calcular_montos()
        proforma.save(update_fields=['subtotal', 'impuesto', 'total'])


class ProformaHistorialViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consultar el historial de proformas (solo lectura)
    """
    queryset = ProformaHistorial.objects.select_related(
        'proforma', 'created_by'
    ).all()
    serializer_class = ProformaHistorialSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['proforma', 'accion']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class ConfiguracionProformaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar la configuración de proformas
    """
    queryset = ConfiguracionProforma.objects.all()
    serializer_class = ConfiguracionProformaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """Asegurar que siempre se devuelva la configuración actual"""
        config = ConfiguracionProforma.objects.first()
        
        if not config:
            # Crear configuración por defecto si no existe
            config = ConfiguracionProforma.objects.create()
        
        self.check_object_permissions(self.request, config)
        return config
    
    def list(self, request, *args, **kwargs):
        """Devolver siempre la única configuración existente"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Sobreescribir create para actualizar la configuración existente"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)