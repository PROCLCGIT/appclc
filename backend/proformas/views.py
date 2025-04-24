"""
Vistas para el módulo de proformas.

Este módulo define las vistas (ViewSets) para gestionar las proformas,
implementando tanto las versiones estándar como las optimizadas.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .permissions import (
    ProformaAccessPermission, CanViewProformas, CanCreateProformas,
    CanApproveProformas, CanRejectProformas, CanSendProformas,
    CanConvertProformas, CanManageProformaItems
)
from datetime import datetime, timedelta
from django.db.models import F, Sum, Count, Q, Case, When, Value, ExpressionWrapper, FloatField, IntegerField
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, Extract, Concat, Cast
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, DateFromToRangeFilter, NumberFilter, CharFilter, ChoiceFilter
from django.db import transaction, models, connection
from django.utils import timezone
from django.http import HttpResponse, JsonResponse
from django.conf import settings
import json
import csv
import io
from decimal import Decimal
import logging
import os

logger = logging.getLogger(__name__)

from .models import Proforma, ProformaItem, ProformaHistorial, ConfiguracionProforma
from .services import ProformaService
from .serializers import (
    ProformaSerializer, ProformaItemSerializer, 
    ProformaHistorialSerializer, ConfiguracionProformaSerializer,
    BusquedaProductosSerializer
)
from .pagination import StandardResultsSetPagination, LargeResultsSetPagination

from pandora.models import Clientes, EmpresaClc
from products.models import ProductoOfertado, ProductoDisponible

# Determinar si usar las vistas optimizadas según variable de entorno
USE_OPTIMIZED = os.environ.get('USE_OPTIMIZED_PROFORMAS', 'True').lower() in ('true', 't', '1', 'yes')

# Definición de filtro personalizado para Proformas
class ProformaFilter(FilterSet):
    """Filtro personalizado para el modelo Proforma con funcionalidades avanzadas"""
    # Filtros de búsqueda por texto
    search = CharFilter(method='filter_search', label='Búsqueda global')
    nombre_contains = CharFilter(field_name='nombre', lookup_expr='icontains')
    numero_contains = CharFilter(field_name='numero', lookup_expr='icontains')
    
    # Filtros de fecha
    fecha_emision = DateFromToRangeFilter()
    fecha_vencimiento = DateFromToRangeFilter()
    created_at = DateFromToRangeFilter()
    
    # Filtros de relaciones
    cliente_nombre = CharFilter(field_name='cliente__nombre', lookup_expr='icontains')
    empresa_nombre = CharFilter(field_name='empresa__nombre', lookup_expr='icontains')
    
    # Filtros de rango para montos
    subtotal_min = NumberFilter(field_name='subtotal', lookup_expr='gte')
    subtotal_max = NumberFilter(field_name='subtotal', lookup_expr='lte')
    total_min = NumberFilter(field_name='total', lookup_expr='gte')
    total_max = NumberFilter(field_name='total', lookup_expr='lte')
    
    # Filtro de estado específico
    estado = ChoiceFilter(choices=Proforma.ESTADO_CHOICES)
    
    # Filtro para múltiples estados
    estados = CharFilter(method='filter_estados', label='Múltiples estados separados por coma')
    
    class Meta:
        model = Proforma
        fields = [
            'search', 'nombre_contains', 'numero_contains',
            'fecha_emision', 'fecha_vencimiento', 'created_at',
            'cliente', 'cliente_nombre', 'empresa', 'empresa_nombre',
            'subtotal_min', 'subtotal_max', 'total_min', 'total_max',
            'estado', 'estados', 'created_by'
        ]
    
    def filter_search(self, queryset, name, value):
        """Búsqueda global en múltiples campos de la proforma"""
        if not value:
            return queryset
            
        # Buscar en múltiples campos relevantes
        query = Q(numero__icontains=value) | \
                Q(nombre__icontains=value) | \
                Q(notas__icontains=value) | \
                Q(cliente__nombre__icontains=value) | \
                Q(cliente__ruc__icontains=value) | \
                Q(atencion_a__icontains=value)
                
        return queryset.filter(query).distinct()
    
    def filter_estados(self, queryset, name, value):
        """Permite filtrar por múltiples estados separados por coma"""
        if not value:
            return queryset
            
        # Dividir la cadena en estados individuales y filtrar
        estados = [estado.strip() for estado in value.split(',')]
        return queryset.filter(estado__in=estados)


# Filtro personalizado para ítems de proforma
class ProformaItemFilter(FilterSet):
    """Filtro para ítems de proforma"""
    descripcion_contains = CharFilter(field_name='descripcion', lookup_expr='icontains')
    codigo_contains = CharFilter(field_name='codigo', lookup_expr='icontains')
    precio_min = NumberFilter(field_name='precio_unitario', lookup_expr='gte')
    precio_max = NumberFilter(field_name='precio_unitario', lookup_expr='lte')
    
    class Meta:
        model = ProformaItem
        fields = [
            'proforma', 'tipo_item', 'descripcion_contains', 'codigo_contains',
            'precio_min', 'precio_max', 'producto_ofertado', 'producto_disponible'
        ]


class DashboardPagination(StandardResultsSetPagination):
    """Paginación específica para dashboard con tamaño de página predeterminado más pequeño"""
    page_size = 10
    max_page_size = 50


class ProformaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar proformas con permisos basados en roles
    """
    queryset = Proforma.objects.select_related(
        'cliente', 'empresa', 'tipo_contratacion', 'created_by', 'updated_by'
    ).prefetch_related('items', 'historial').all()
    serializer_class = ProformaSerializer
    permission_classes = [IsAuthenticated, ProformaAccessPermission]
    
    def get_permissions(self):
        """
        Configurar permisos específicos según la acción
        """
        if self.action == 'list' or self.action == 'retrieve':
            permission_classes = [IsAuthenticated, CanViewProformas]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated, CanCreateProformas]
        elif self.action == 'enviar':
            permission_classes = [IsAuthenticated, CanSendProformas]
        elif self.action == 'aprobar':
            permission_classes = [IsAuthenticated, CanApproveProformas]
        elif self.action == 'rechazar':
            permission_classes = [IsAuthenticated, CanRejectProformas]
        elif self.action == 'convertir':
            permission_classes = [IsAuthenticated, CanConvertProformas]
        elif self.action == 'historial':
            permission_classes = [IsAuthenticated, CanViewProformas]
        elif self.action == 'items':
            permission_classes = [IsAuthenticated, CanViewProformas]
        else:
            # Para update, partial_update, delete y otras acciones
            permission_classes = [IsAuthenticated, ProformaAccessPermission]
            
        return [permission() for permission in permission_classes]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProformaFilter
    search_fields = ['numero', 'nombre', 'cliente__nombre', 'notas', 'atencion_a']
    ordering_fields = ['numero', 'fecha_emision', 'fecha_vencimiento', 'cliente__nombre', 'total', 'estado', 'created_at']
    ordering = ['-fecha_emision']
    pagination_class = StandardResultsSetPagination
    
    @transaction.atomic
    def perform_create(self, serializer):
        """
        Asignar el usuario actual como creador y usar ProformaService para guardar la proforma 
        dentro de una transacción atómica
        """
        try:
            # Preparar datos con los usuarios para trazabilidad
            validated_data = serializer.validated_data.copy()
            validated_data['created_by'] = self.request.user
            validated_data['updated_by'] = self.request.user
            
            # Extraer datos de ítems si están presentes
            items_data = validated_data.pop('items_data', [])
            
            # Crear instancia sin guardar
            instance = Proforma(**validated_data)
            
            # Usar el servicio para guardar con flag from_serializer=True para optimizar validaciones
            proforma = ProformaService.save_proforma(
                instance, 
                validate=True, 
                calculate_amounts=True, 
                update_history=True, 
                from_serializer=True
            )
            
            # Procesar los ítems si hay datos
            if items_data:
                # Marcar el contexto como operación masiva para optimizar
                self.request._bulk_operation = True
                # Usar el servicio para procesar los ítems
                ProformaService.process_items_data(proforma, items_data)
                
            # Actualizar la instancia en el serializer
            serializer.instance = proforma
            
            logger.info(f"Proforma {proforma.numero} creada por usuario {self.request.user.username}")
            
        except Exception as e:
            logger.exception(f"Error al crear proforma: {str(e)}")
            raise
    
    @transaction.atomic
    def perform_update(self, serializer):
        """
        Asignar el usuario actual como actualizador y usar ProformaService para actualizar la proforma
        dentro de una transacción atómica
        """
        try:
            # Preparar datos
            validated_data = serializer.validated_data.copy()
            validated_data['updated_by'] = self.request.user
            
            # Extraer datos de ítems si están presentes
            items_data = validated_data.pop('items_data', [])
            
            # Actualizar la instancia sin guardar
            instance = serializer.instance
            
            # Guardar estado anterior para tracking de cambios
            estado_anterior = instance.estado
            
            # Aplicar los cambios a la instancia
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            # Usar el servicio para guardar con flag from_serializer=True para optimizar validaciones
            proforma = ProformaService.save_proforma(
                instance, 
                validate=True, 
                calculate_amounts=(not items_data),  # Calcular solo si no hay ítems para procesar
                update_history=True, 
                from_serializer=True
            )
            
            # Manejar ítems si hay datos
            if items_data:
                # Marcar el contexto como operación masiva para optimizar
                self.request._bulk_operation = True
                # Usar el servicio para procesar las actualizaciones
                ProformaService.process_items_update(proforma, items_data)
            
            # Actualizar la instancia en el serializer
            serializer.instance = proforma
            
            logger.info(f"Proforma {proforma.numero} actualizada por usuario {self.request.user.username}")
            
        except Exception as e:
            logger.exception(f"Error al actualizar proforma {serializer.instance.id}: {str(e)}")
            raise
            
    def finalize_response(self, request, response, *args, **kwargs):
        """
        Método para realizar operaciones de limpieza después de que se completa una operación en lote.
        Se asegura de que todos los cálculos pendientes se completen correctamente.
        """
        # Verificar si hay operaciones en lote que requieren finalización
        if hasattr(request, '_bulk_operation') and request._bulk_operation:
            try:
                # Verificar si hay proformas afectadas que necesitan recálculos
                if hasattr(request, '_affected_proformas') and request._affected_proformas:
                    if not hasattr(request, '_totals_recalculated'):
                        # Marcar que ya se recalcularon para evitar recálculos duplicados
                        request._totals_recalculated = True
                        
                        # Usar el servicio para recalcular en lote
                        affected_proformas = list(request._affected_proformas)
                        updated_count = ProformaService.calculate_amounts_batch(affected_proformas)
                        
                        logger.info(f"Recalculados totales de {updated_count} proformas tras operación en lote")
                
                # Si hay una proforma actual afectada por operaciones en lote
                if hasattr(self, 'serializer_class') and hasattr(response, 'data'):
                    # Para operaciones tipo create/update, asegurarse de que la respuesta es correcta
                    if 'id' in response.data and not hasattr(request, '_totals_recalculated'):
                        from .models import Proforma
                        try:
                            # Refrescar datos de la proforma para tener datos actualizados en la respuesta
                            proforma_id = response.data['id']
                            proforma = Proforma.objects.get(id=proforma_id)
                            
                            # Actualizar la respuesta con los totales actualizados (si es necesario)
                            response.data['subtotal'] = float(proforma.subtotal)
                            response.data['impuesto'] = float(proforma.impuesto)
                            response.data['total'] = float(proforma.total)
                        except Exception as inner_e:
                            logger.error(f"Error al actualizar respuesta: {inner_e}")
                            
            except Exception as e:
                logger.error(f"Error en finalize_response: {e}")
        
        # Devolver la respuesta normal
        return super().finalize_response(request, response, *args, **kwargs)
    
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
        try:
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
            
            # El registro en historial ahora se hace automáticamente via signals
            
            logger.info(
                f"Proforma #{proforma.numero} cambio de estado: {estado_anterior} -> {nuevo_estado} "  
                f"por usuario: {request.user.username}"
            )
            
            # Devolver proforma actualizada
            serializer = self.get_serializer(proforma)
            return Response(serializer.data)
            
        except Exception as e:
            logger.exception(f"Error al cambiar estado de proforma {pk}: {str(e)}")
            return Response(
                {"error": f"No se pudo cambiar el estado: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def enviar(self, request, pk=None):
        """Marcar una proforma como enviada al cliente usando el método de transición"""
        try:
            proforma = self.get_object()
            
            # Usar el método de transición definido en el modelo
            proforma.enviar(
                usuario=request.user,
                notas=request.data.get('notas', '')
            )
            
            # Devolver proforma actualizada
            serializer = self.get_serializer(proforma)
            return Response(serializer.data)
            
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception(f"Error al enviar proforma {pk}: {str(e)}")
            return Response(
                {"error": f"Error al enviar proforma: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        """Marcar una proforma como aprobada por el cliente usando el método de transición"""
        try:
            proforma = self.get_object()
            
            # Usar el método de transición definido en el modelo
            proforma.aprobar(
                usuario=request.user,
                notas=request.data.get('notas', '')
            )
            
            # Devolver proforma actualizada
            serializer = self.get_serializer(proforma)
            return Response(serializer.data)
            
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception(f"Error al aprobar proforma {pk}: {str(e)}")
            return Response(
                {"error": f"Error al aprobar proforma: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        """Marcar una proforma como rechazada por el cliente usando el método de transición"""
        try:
            proforma = self.get_object()
            
            # Usar el método de transición definido en el modelo
            proforma.rechazar(
                usuario=request.user,
                notas=request.data.get('notas', '')
            )
            
            # Devolver proforma actualizada
            serializer = self.get_serializer(proforma)
            return Response(serializer.data)
            
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception(f"Error al rechazar proforma {pk}: {str(e)}")
            return Response(
                {"error": f"Error al rechazar proforma: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    @action(detail=True, methods=['post'])
    def convertir(self, request, pk=None):
        """Convertir proforma a orden usando el método de transición"""
        try:
            proforma = self.get_object()
            
            # Usar el método de transición definido en el modelo
            proforma.convertir(
                usuario=request.user,
                notas=request.data.get('notas', '')
            )
            
            # Devolver proforma actualizada
            serializer = self.get_serializer(proforma)
            return Response(serializer.data)
            
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception(f"Error al convertir proforma {pk}: {str(e)}")
            return Response(
                {"error": f"Error al convertir proforma: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def volver_a_borrador(self, request, pk=None):
        """Volver a marcar proforma como borrador usando el método de transición"""
        try:
            proforma = self.get_object()
            
            # Usar el método de transición definido en el modelo
            proforma.volver_a_borrador(
                usuario=request.user,
                notas=request.data.get('notas', '')
            )
            
            # Devolver proforma actualizada
            serializer = self.get_serializer(proforma)
            return Response(serializer.data)
            
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception(f"Error al revertir proforma {pk} a borrador: {str(e)}")
            return Response(
                {"error": f"Error al revertir proforma a borrador: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @transaction.atomic
    @action(detail=True, methods=['post'])
    def duplicar(self, request, pk=None):
        """Crear una copia de una proforma existente"""
        try:
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
            
            # Duplicar ítems con bulk_create
            items_originales = proforma_original.items.all()
            nuevos_items = []
            
            for item_original in items_originales:
                nuevos_items.append(
                    ProformaItem(
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
                )
            
            # Usar bulk_create para optimizar la inserción masiva de ítems
            if nuevos_items:
                ProformaItem.objects.bulk_create(nuevos_items)
                logger.info(f"Se duplicaron {len(nuevos_items)} ítems para la proforma #{nueva_proforma.numero}")
            
            # Calcular totales
            nueva_proforma.calcular_montos()
            nueva_proforma.save(update_fields=['subtotal', 'impuesto', 'total'])
            
            # Registrar en historial (ahora automático con signals)
            
            # Devolver nueva proforma
            serializer = self.get_serializer(nueva_proforma)
            return Response(serializer.data)
            
        except Exception as e:
            logger.exception(f"Error al duplicar proforma {pk}: {str(e)}")
            return Response(
                {"error": f"No se pudo duplicar la proforma: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def buscar_productos(self, request):
        """
        Buscar productos (ofertados y disponibles) para seleccionar en proformas.
        
        Parámetros:
        - q: Término de búsqueda
        - tipo: Tipo de producto (ofertados, disponibles o ambos)
        """
        try:
            search_term = request.query_params.get('q', '')
            tipo = request.query_params.get('tipo', 'ambos')  # 'ofertados', 'disponibles', 'ambos'
            
            resultados = []
            
            # Buscar en productos ofertados
            if tipo in ['ofertados', 'ambos']:
                ofertados = ProductoOfertado.objects.filter(
                    Q(nombre__icontains=search_term) | 
                    Q(code__icontains=search_term) |
                    Q(descripcion__icontains=search_term)
                )[:50]  # Limitar a 50 resultados
                
                for producto in ofertados:
                    resultados.append(BusquedaProductosSerializer.from_producto_ofertado(producto))
            
            # Buscar en productos disponibles
            if tipo in ['disponibles', 'ambos']:
                disponibles = ProductoDisponible.objects.filter(
                    Q(nombre__icontains=search_term) | 
                    Q(code__icontains=search_term) |
                    Q(descripcion__icontains=search_term)
                )[:50]  # Limitar a 50 resultados
                
                for producto in disponibles:
                    resultados.append(BusquedaProductosSerializer.from_producto_disponible(producto))
            
            # Ordenar por relevancia - primero los que contienen el término en el código
            resultados = sorted(
                resultados,
                key=lambda x: (search_term.lower() not in x['code'].lower(), x['description'])
            )
            
            return Response({
                'results': resultados,
                'count': len(resultados)
            })
            
        except Exception as e:
            logger.exception(f"Error en búsqueda de productos: {str(e)}")
            return Response(
                {"error": "Error al buscar productos"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def obtener_configuracion(self, request):
        """Obtener la configuración actual o crear una por defecto si no existe"""
        try:
            configuracion = ConfiguracionProforma.objects.first()
            
            if not configuracion:
                # Crear configuración por defecto
                empresa_default = EmpresaClc.objects.first()
                configuracion = ConfiguracionProforma.objects.create(
                    empresa_predeterminada=empresa_default,
                    dias_validez=15,
                    porcentaje_impuesto_default=12.00,
                    texto_condiciones_pago="50% anticipo, 50% contra entrega",
                    texto_tiempo_entrega="5 días hábiles",
                    notas_predeterminadas="Precios incluyen IVA. Entrega en sus oficinas sin costo adicional dentro del perímetro urbano."
                )
                logger.info("Configuración de proformas creada por defecto")
            
            serializer = ConfiguracionProformaSerializer(configuracion)
            return Response(serializer.data)
            
        except Exception as e:
            logger.exception(f"Error al obtener configuración: {str(e)}")
            return Response(
                {"error": "Error al obtener la configuración"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def exportar_pdf(self, request, pk=None):
        """Exportar proforma a PDF"""
        try:
            from django.template.loader import render_to_string
            from weasyprint import HTML, CSS
            from django.conf import settings
            import tempfile
            
            proforma = self.get_object()
            
            # Renderizar la plantilla HTML
            html_string = render_to_string('proformas/pdf_template.html', {
                'proforma': proforma,
                'items': proforma.items.all().order_by('orden'),
                'empresa': proforma.empresa,
                'cliente': proforma.cliente,
                'base_url': request.build_absolute_uri('/')[:-1],
                'media_url': settings.MEDIA_URL,
                'static_url': settings.STATIC_URL,
                'fecha_emision': proforma.fecha_emision.strftime('%d/%m/%Y'),
                'fecha_vencimiento': proforma.fecha_vencimiento.strftime('%d/%m/%Y'),
            })
            
            # Generar PDF con WeasyPrint
            html = HTML(string=html_string, base_url=request.build_absolute_uri('/'))
            
            # Crear un archivo temporal
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
                # Renderizar el PDF y guardarlo en el archivo temporal
                html.write_pdf(tmp.name)
                
                # Leer el contenido del archivo para devolverlo en la respuesta
                with open(tmp.name, 'rb') as pdf_file:
                    pdf_content = pdf_file.read()
            
            # Construir la respuesta HTTP con el PDF
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="Proforma-{proforma.numero}.pdf"'
            
            return response
            
        except Exception as e:
            logger.exception(f"Error al exportar PDF: {str(e)}")
            return Response(
                {"error": f"No se pudo generar el PDF: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Obtener estadísticas para el dashboard de proformas
        (Versión original - se reemplaza automáticamente por la optimizada si USE_OPTIMIZED=True)
        """
        try:
            # Filtrar por rango de fechas si se proporciona
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            estado_filter = request.query_params.get('estado')
            cliente_id = request.query_params.get('cliente_id')
            min_total = request.query_params.get('min_total')
            max_total = request.query_params.get('max_total')
            
            queryset = self.get_queryset()
            
            # Validar formato de fechas y aplicar filtros
            if start_date:
                try:
                    # Validar formato de fecha (YYYY-MM-DD)
                    datetime.strptime(start_date, '%Y-%m-%d')
                    queryset = queryset.filter(fecha_emision__gte=start_date)
                except (ValueError, TypeError) as e:
                    logger.error(f"Error en formato de fecha inicio: {start_date}, error: {str(e)}")
                    # No aplicar filtro de fecha inválida
                    pass
                    
            if end_date:
                try:
                    # Validar formato de fecha (YYYY-MM-DD)
                    datetime.strptime(end_date, '%Y-%m-%d')
                    queryset = queryset.filter(fecha_emision__lte=end_date)
                except (ValueError, TypeError) as e:
                    logger.error(f"Error en formato de fecha fin: {end_date}, error: {str(e)}")
                    # No aplicar filtro de fecha inválida
                    pass
                    
            if estado_filter:
                try:
                    # Permitir filtrar por múltiples estados
                    estados = [estado.strip() for estado in estado_filter.split(',')]
                    queryset = queryset.filter(estado__in=estados)
                except Exception as e:
                    logger.error(f"Error al procesar filtro de estados: {str(e)}")
                    # No aplicar filtro si hay error
                    pass
                    
            if cliente_id:
                try:
                    queryset = queryset.filter(cliente_id=cliente_id)
                except (ValueError, TypeError) as e:
                    logger.error(f"Error en ID de cliente: {cliente_id}, error: {str(e)}")
                    # No aplicar filtro de cliente inválido
                    pass
                    
            if min_total:
                try:
                    min_total_value = float(min_total)
                    queryset = queryset.filter(total__gte=min_total_value)
                except (ValueError, TypeError) as e:
                    logger.error(f"Error en valor mínimo total: {min_total}, error: {str(e)}")
                    # No aplicar filtro de total mínimo inválido
                    pass
                    
            if max_total:
                try:
                    max_total_value = float(max_total)
                    queryset = queryset.filter(total__lte=max_total_value)
                except (ValueError, TypeError) as e:
                    logger.error(f"Error en valor máximo total: {max_total}, error: {str(e)}")
                    # No aplicar filtro de total máximo inválido
                    pass
            
            # Registrar información de filtrado
            logger.info(
                f"Dashboard filtrado: fechas={start_date}~{end_date}, "
                f"estado={estado_filter}, cliente={cliente_id}, "
                f"total={min_total}~{max_total}, resultados={queryset.count()}"
            )
            
            # Estadísticas por estado
            estado_stats = {}
            for estado, label in Proforma.ESTADO_CHOICES:
                try:
                    count = queryset.filter(estado=estado).count()
                    total = queryset.filter(estado=estado).values_list('total', flat=True)
                    estado_stats[estado] = {
                        'count': count,
                        'total': float(sum(total) if total else 0),
                        'label': label
                    }
                except Exception as e:
                    logger.error(f"Error al procesar estadísticas para estado {estado}: {str(e)}")
                    estado_stats[estado] = {
                        'count': 0,
                        'total': 0.0,
                        'label': label
                    }
            
            # Estadísticas por cliente (top 5)
            cliente_stats = []
            try:
                top_clientes = queryset.values('cliente__id', 'cliente__nombre').annotate(
                    count=models.Count('id'),
                    total=models.Sum('total')
                ).order_by('-total')[:5]
                
                for cliente in top_clientes:
                    try:
                        cliente_stats.append({
                            'id': cliente['cliente__id'],
                            'nombre': cliente['cliente__nombre'] or 'Cliente sin nombre',
                            'count': cliente['count'],
                            'total': float(cliente['total'] or 0)
                        })
                    except Exception as e:
                        logger.error(f"Error al procesar cliente en estadísticas: {cliente}, error: {str(e)}")
                        # Saltar este cliente pero continuar procesando
                        continue
            except Exception as e:
                logger.error(f"Error al procesar estadísticas por cliente: {str(e)}")
                # Proporcionar datos vacíos en caso de error
                cliente_stats = []
            
            # Estadísticas por mes
            from django.db.models.functions import TruncMonth
            
            mes_stats = []
            try:
                por_mes = queryset.annotate(
                    mes=TruncMonth('fecha_emision')
                ).values('mes').annotate(
                    count=models.Count('id'),
                    total=models.Sum('total')
                ).order_by('mes')
                
                for mes in por_mes:
                    try:
                        if mes['mes'] is None:
                            continue
                        mes_stats.append({
                            'mes': mes['mes'].strftime('%Y-%m'),
                            'count': mes['count'],
                            'total': float(mes['total'] or 0)
                        })
                    except (AttributeError, TypeError, ValueError) as e:
                        logger.error(f"Error al procesar registro de mes: {mes}, error: {str(e)}")
                        # Saltar este registro pero continuar procesando
                        continue
            except Exception as e:
                logger.error(f"Error al procesar estadísticas por mes: {str(e)}")
                # Proporcionar datos vacíos en caso de error
                mes_stats = []
            
            # Obtener proformas recientes (últimas 5)
            proformas_recientes = []
            try:
                recientes = Proforma.objects.select_related('cliente', 'created_by').order_by('-created_at')[:5]
                
                for proforma in recientes:
                    try:
                        # Obtener nombres para el estado
                        estado_label = dict(Proforma.ESTADO_CHOICES).get(proforma.estado, proforma.estado)
                        
                        # Formatear fechas - con manejo de excepciones
                        try:
                            fecha_emision = proforma.fecha_emision.strftime('%d/%m/%Y') if proforma.fecha_emision else ''
                        except Exception:
                            fecha_emision = ''
                            
                        try:
                            fecha_vencimiento = proforma.fecha_vencimiento.strftime('%d/%m/%Y') if proforma.fecha_vencimiento else ''
                        except Exception:
                            fecha_vencimiento = ''
                        
                        # Iniciales del cliente para el avatar - con manejo de excepciones
                        try:
                            cliente_nombre = proforma.cliente.nombre if proforma.cliente else 'N/A'
                            cliente_avatar = ''.join([word[0] for word in cliente_nombre.split()[:2]]) if cliente_nombre != 'N/A' else 'NA'
                        except Exception:
                            cliente_nombre = 'N/A'
                            cliente_avatar = 'NA'
                        
                        # Vendedor (usuario que creó la proforma) - con manejo de excepciones
                        try:
                            vendedor = f"{proforma.created_by.first_name} {proforma.created_by.last_name}" if proforma.created_by else 'N/A'
                            if vendedor.strip() == '':
                                vendedor = proforma.created_by.username if proforma.created_by else 'N/A'
                        except Exception:
                            vendedor = 'N/A'
                        
                        proformas_recientes.append({
                            'id': str(proforma.numero) if proforma.numero else str(proforma.id),  # Asegurar que sea string
                            'numero': str(proforma.numero) if proforma.numero else str(proforma.id),
                            'cliente': cliente_nombre,
                            'clienteAvatar': cliente_avatar,
                            'fecha': fecha_emision,
                            'expira': fecha_vencimiento,
                            'monto': float(proforma.total) if proforma.total is not None else 0.0,
                            'estado': estado_label,
                            'vendedor': vendedor
                        })
                    except Exception as e:
                        logger.error(f"Error al procesar proforma {proforma.id}: {str(e)}")
                        # Continuar con la siguiente proforma en caso de error
            except Exception as e:
                logger.error(f"Error al obtener proformas recientes: {str(e)}")
                # Proporcionar datos vacíos en caso de error
                proformas_recientes = []
            
            # Crear datos de respuesta con manejo de excepciones más robusto
            try:
                # Operaciones con manejo de excepciones individual
                try:
                    total_count = queryset.count()
                except Exception:
                    logger.error("Error al contar total de proformas, usando 0")
                    total_count = 0
                
                try:
                    total_aprobadas = queryset.filter(estado='aprobada').count()
                except Exception:
                    logger.error("Error al contar proformas aprobadas, usando 0")
                    total_aprobadas = 0
                
                try:
                    total_monto = float(sum(queryset.values_list('total', flat=True)))
                except Exception:
                    logger.error("Error al calcular suma de montos, usando 0")
                    total_monto = 0.0
                    
                try:
                    tasa_conversion = round((total_aprobadas / total_count) * 100, 1) if total_count > 0 else 0
                except Exception:
                    logger.error("Error al calcular tasa de conversión, usando 0")
                    tasa_conversion = 0.0
                
                response_data = {
                    'total_proformas': total_count,
                    'total_monto': total_monto,
                    'por_estado': estado_stats,
                    'por_cliente': cliente_stats,
                    'por_mes': mes_stats,
                    'proformasRecientes': proformas_recientes,
                    # Añadir campos totales para las estadísticas principales
                    'totalStats': {
                        'totalProformas': total_count,
                        'proformasAprobadas': total_aprobadas,
                        'tasaConversion': tasa_conversion,
                        'montoTotal': total_monto
                    }
                }
            except Exception as e:
                logger.error(f"Error al crear datos de respuesta: {str(e)}")
                # Proporcionar estructura mínima en caso de error
                response_data = {
                    'total_proformas': 0,
                    'total_monto': 0.0,
                    'por_estado': {},
                    'por_cliente': [],
                    'por_mes': [],
                    'proformasRecientes': [],
                    'totalStats': {
                        'totalProformas': 0,
                        'proformasAprobadas': 0,
                        'tasaConversion': 0.0,
                        'montoTotal': 0.0
                    }
                }
            
            # Log para depuración
            if settings.DEBUG:
                logger.debug(f"Respuesta dashboard API: {len(str(response_data))} bytes")
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Error en dashboard: {str(e)}")
            return Response(
                {"error": "Error al generar el dashboard", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProformaItemViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar ítems de proformas con permisos basados en roles"""
    queryset = ProformaItem.objects.all()
    serializer_class = ProformaItemSerializer
    permission_classes = [IsAuthenticated, CanManageProformaItems]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ProformaItemFilter
    ordering_fields = ['orden', 'codigo', 'precio_unitario', 'total']
    ordering = ['proforma', 'orden']
    
    def get_queryset(self):
        """Filtro adicional por proforma"""
        queryset = super().get_queryset()
        proforma_id = self.request.query_params.get('proforma')
        if proforma_id:
            queryset = queryset.filter(proforma_id=proforma_id)
        return queryset
    
    @transaction.atomic
    def perform_create(self, serializer):
        """Usar el servicio para crear el ítem y mantener la consistencia"""
        try:
            # Crear la instancia sin guardar
            validated_data = serializer.validated_data.copy()
            instance = ProformaItem(**validated_data)
            
            # Usar el servicio para crear y mantener consistencia
            item = ProformaService.save_proforma_item(
                instance, 
                validate=True, 
                calculate_amounts=True, 
                from_serializer=True
            )
            
            # Actualizar la instancia en el serializer
            serializer.instance = item
            
            logger.info(f"Item creado para proforma {item.proforma.numero if item.proforma else 'N/A'}")
            
        except Exception as e:
            logger.exception(f"Error al crear ítem de proforma: {str(e)}")
            raise
    
    @transaction.atomic
    def perform_update(self, serializer):
        """Usar el servicio para actualizar el ítem y mantener la consistencia"""
        try:
            # Actualizar la instancia sin guardar
            validated_data = serializer.validated_data.copy()
            instance = serializer.instance
            
            # Aplicar los cambios
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            # Usar el servicio para actualizar y mantener consistencia
            item = ProformaService.save_proforma_item(
                instance, 
                validate=True, 
                calculate_amounts=True, 
                from_serializer=True
            )
            
            # Actualizar la instancia en el serializer
            serializer.instance = item
            
            logger.info(f"Item {item.id} actualizado para proforma {item.proforma.numero if item.proforma else 'N/A'}")
            
        except Exception as e:
            logger.exception(f"Error al actualizar ítem de proforma: {str(e)}")
            raise
    
    @transaction.atomic
    def perform_destroy(self, instance):
        """Usar el servicio para eliminar el ítem y mantener la consistencia"""
        try:
            # Guardar información para el log
            item_id = instance.id
            proforma_numero = instance.proforma.numero if instance.proforma else 'N/A'
            
            # Usar el servicio para eliminar y recalcular totales
            result = ProformaService.delete_proforma_item(instance, recalculate=True)
            
            if result:
                logger.info(f"Item {item_id} eliminado de proforma {proforma_numero}")
            else:
                logger.warning(f"No se pudo eliminar el ítem {item_id} de proforma {proforma_numero}")
                
        except Exception as e:
            logger.exception(f"Error al eliminar ítem de proforma: {str(e)}")
            raise


class ProformaHistorialViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para consultar el historial de proformas"""
    queryset = ProformaHistorial.objects.all()
    serializer_class = ProformaHistorialSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['proforma', 'accion', 'estado_anterior', 'estado_nuevo', 'created_by']
    ordering_fields = ['created_at', 'accion']
    ordering = ['-created_at']


class ConfiguracionProformaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar la configuración global de proformas"""
    queryset = ConfiguracionProforma.objects.all()
    serializer_class = ConfiguracionProformaSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Prevenir la creación de más de una configuración"""
        if ConfiguracionProforma.objects.exists():
            return Response(
                {"error": "Ya existe una configuración de proformas"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)


# ===========================================================================
# IMPLEMENTACIONES OPTIMIZADAS DE LOS VIEWSETS
# ===========================================================================

class OptimizedProformaViewSet(viewsets.ModelViewSet):
    """
    ViewSet optimizado para gestionar proformas con mejoras de rendimiento
    y permisos basados en roles
    """
    queryset = Proforma.objects.select_related(
        'cliente', 'empresa', 'tipo_contratacion', 'created_by', 'updated_by'
    ).prefetch_related('items', 'historial').all()
    serializer_class = ProformaSerializer
    permission_classes = [IsAuthenticated, ProformaAccessPermission]
    
    def get_permissions(self):
        """
        Configurar permisos específicos según la acción
        """
        if self.action == 'list' or self.action == 'retrieve':
            permission_classes = [IsAuthenticated, CanViewProformas]
        elif self.action == 'create':
            permission_classes = [IsAuthenticated, CanCreateProformas]
        elif self.action == 'enviar':
            permission_classes = [IsAuthenticated, CanSendProformas]
        elif self.action == 'aprobar':
            permission_classes = [IsAuthenticated, CanApproveProformas]
        elif self.action == 'rechazar':
            permission_classes = [IsAuthenticated, CanRejectProformas]
        elif self.action == 'convertir':
            permission_classes = [IsAuthenticated, CanConvertProformas]
        elif self.action == 'historial':
            permission_classes = [IsAuthenticated, CanViewProformas]
        elif self.action == 'items':
            permission_classes = [IsAuthenticated, CanViewProformas]
        elif self.action == 'dashboard':
            permission_classes = [IsAuthenticated, CanViewProformas]
        else:
            # Para update, partial_update, delete y otras acciones
            permission_classes = [IsAuthenticated, ProformaAccessPermission]
            
        return [permission() for permission in permission_classes]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProformaFilter
    search_fields = ['numero', 'nombre', 'cliente__nombre', 'notas', 'atencion_a']
    ordering_fields = ['numero', 'fecha_emision', 'fecha_vencimiento', 'cliente__nombre', 'total', 'estado', 'created_at']
    ordering = ['-fecha_emision']
    pagination_class = StandardResultsSetPagination
    
    @transaction.atomic
    def perform_create(self, serializer):
        """
        Asignar el usuario actual como creador y usar ProformaService para guardar la proforma 
        con optimizaciones de rendimiento
        """
        try:
            # Preparar datos con los usuarios para trazabilidad
            validated_data = serializer.validated_data.copy()
            validated_data['created_by'] = self.request.user
            validated_data['updated_by'] = self.request.user
            
            # Extraer datos de ítems si están presentes
            items_data = validated_data.pop('items_data', [])
            
            # Crear instancia sin guardar
            instance = Proforma(**validated_data)
            
            # Usar el servicio para guardar con flag from_serializer=True para optimizar validaciones
            proforma = ProformaService.save_proforma(
                instance, 
                validate=True, 
                calculate_amounts=True, 
                update_history=True, 
                from_serializer=True
            )
            
            # Procesar los ítems si hay datos (usando operaciones en lote)
            if items_data:
                # Marcar el contexto como operación masiva para optimizar
                self.request._bulk_operation = True
                # Usar el servicio para procesar los ítems
                ProformaService.process_items_data(proforma, items_data)
                
            # Actualizar la instancia en el serializer
            serializer.instance = proforma
            
            logger.info(f"Proforma optimizada {proforma.numero} creada por usuario {self.request.user.username}")
            
        except Exception as e:
            logger.exception(f"Error al crear proforma optimizada: {str(e)}")
            raise
    
    @transaction.atomic
    def perform_update(self, serializer):
        """
        Asignar el usuario actual como actualizador y usar ProformaService para actualizar la proforma
        con optimizaciones de rendimiento
        """
        try:
            # Preparar datos
            validated_data = serializer.validated_data.copy()
            validated_data['updated_by'] = self.request.user
            
            # Extraer datos de ítems si están presentes
            items_data = validated_data.pop('items_data', [])
            
            # Actualizar la instancia sin guardar
            instance = serializer.instance
            
            # Aplicar los cambios a la instancia
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            # Usar el servicio para guardar con flag from_serializer=True para optimizar validaciones
            proforma = ProformaService.save_proforma(
                instance, 
                validate=True, 
                calculate_amounts=(not items_data),  # Calcular solo si no hay ítems para procesar
                update_history=True, 
                from_serializer=True
            )
            
            # Manejar ítems si hay datos
            if items_data:
                # Marcar el contexto como operación masiva para optimizar
                self.request._bulk_operation = True
                # Usar el servicio para procesar las actualizaciones con optimizaciones
                ProformaService.process_items_update(proforma, items_data)
            
            # Actualizar la instancia en el serializer
            serializer.instance = proforma
            
            logger.info(f"Proforma optimizada {proforma.numero} actualizada por usuario {self.request.user.username}")
            
        except Exception as e:
            logger.exception(f"Error al actualizar proforma optimizada {serializer.instance.id}: {str(e)}")
            raise
    
    def finalize_response(self, request, response, *args, **kwargs):
        """
        Método para realizar operaciones de limpieza después de que se completa una operación en lote.
        Versión optimizada que usa cálculos en batch para mejor rendimiento.
        """
        # Verificar si hay operaciones en lote que requieren finalización
        if hasattr(request, '_bulk_operation') and request._bulk_operation:
            try:
                # Verificar si hay proformas afectadas que necesitan recálculos
                if hasattr(request, '_affected_proformas') and request._affected_proformas:
                    if not hasattr(request, '_totals_recalculated'):
                        # Marcar que ya se recalcularon para evitar recálculos duplicados
                        request._totals_recalculated = True
                        
                        # Usar el servicio para recalcular en lote
                        affected_proformas = list(request._affected_proformas)
                        updated_count = ProformaService.calculate_amounts_batch(affected_proformas)
                        
                        logger.info(f"Recalculados totales de {updated_count} proformas tras operación en lote optimizada")
                
                # Si hay una proforma actual afectada por operaciones en lote
                if hasattr(self, 'serializer_class') and hasattr(response, 'data'):
                    # Para operaciones tipo create/update, asegurarse de que la respuesta es correcta
                    if 'id' in response.data and not hasattr(request, '_totals_recalculated'):
                        from .models import Proforma
                        try:
                            # Refrescar datos de la proforma para tener datos actualizados en la respuesta
                            proforma_id = response.data['id']
                            # Usar select_related para optimizar la consulta
                            proforma = Proforma.objects.select_related().get(id=proforma_id)
                            
                            # Actualizar la respuesta con los totales actualizados (si es necesario)
                            response.data['subtotal'] = float(proforma.subtotal)
                            response.data['impuesto'] = float(proforma.impuesto)
                            response.data['total'] = float(proforma.total)
                        except Exception as inner_e:
                            logger.error(f"Error al actualizar respuesta optimizada: {inner_e}")
                            
            except Exception as e:
                logger.error(f"Error en finalize_response optimizado: {e}")
        
        # Devolver la respuesta normal
        return super().finalize_response(request, response, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Obtener estadísticas para el dashboard de proformas.
        Versión optimizada que consolida múltiples consultas en una sola
        y utiliza caché para mejorar el rendimiento.
        """
        try:
            # Extraer parámetros de filtro
            params = {
                'start_date': request.query_params.get('start_date'),
                'end_date': request.query_params.get('end_date'),
                'estado': request.query_params.get('estado'),
                'cliente_id': request.query_params.get('cliente_id'),
                'min_total': request.query_params.get('min_total'),
                'max_total': request.query_params.get('max_total')
            }
            
            # Intentar obtener datos desde la caché
            from .cache import get_cached_dashboard, cache_dashboard_data
            
            # Si force_refresh=true en parámetros, ignorar caché
            force_refresh = request.query_params.get('force_refresh', '').lower() in ('true', 't', '1', 'yes')
            
            if not force_refresh:
                cached_data = get_cached_dashboard(params)
                if cached_data:
                    logger.info(f"Dashboard servido desde caché: {request.query_params}")
                    return Response(cached_data)
            
            # Si no hay datos en caché o se forzó refresco, generar nuevos datos
            logger.info(f"Generando datos de dashboard: {params}")
            
            # Base queryset con filtros
            queryset = self.get_queryset()
            
            # Validar formato de fechas y aplicar filtros
            if params['start_date']:
                try:
                    # Validar formato de fecha (YYYY-MM-DD)
                    datetime.strptime(params['start_date'], '%Y-%m-%d')
                    queryset = queryset.filter(fecha_emision__gte=params['start_date'])
                except (ValueError, TypeError) as e:
                    logger.error(f"Error en formato de fecha inicio: {params['start_date']}, error: {str(e)}")
                    # No aplicar filtro de fecha inválida
                    pass
                    
            if params['end_date']:
                try:
                    # Validar formato de fecha (YYYY-MM-DD)
                    datetime.strptime(params['end_date'], '%Y-%m-%d')
                    queryset = queryset.filter(fecha_emision__lte=params['end_date'])
                except (ValueError, TypeError) as e:
                    logger.error(f"Error en formato de fecha fin: {params['end_date']}, error: {str(e)}")
                    # No aplicar filtro de fecha inválida
                    pass
                    
            if params['estado']:
                try:
                    # Permitir filtrar por múltiples estados
                    estados = [estado.strip() for estado in params['estado'].split(',')]
                    queryset = queryset.filter(estado__in=estados)
                except Exception as e:
                    logger.error(f"Error al procesar filtro de estados: {str(e)}")
                    # No aplicar filtro si hay error
                    pass
                    
            if params['cliente_id']:
                try:
                    queryset = queryset.filter(cliente_id=params['cliente_id'])
                except (ValueError, TypeError) as e:
                    logger.error(f"Error en ID de cliente: {params['cliente_id']}, error: {str(e)}")
                    # No aplicar filtro de cliente inválido
                    pass
                    
            if params['min_total']:
                try:
                    min_total_value = float(params['min_total'])
                    queryset = queryset.filter(total__gte=min_total_value)
                except (ValueError, TypeError) as e:
                    logger.error(f"Error en valor mínimo total: {params['min_total']}, error: {str(e)}")
                    # No aplicar filtro de total mínimo inválido
                    pass
                    
            if params['max_total']:
                try:
                    max_total_value = float(params['max_total'])
                    queryset = queryset.filter(total__lte=max_total_value)
                except (ValueError, TypeError) as e:
                    logger.error(f"Error en valor máximo total: {params['max_total']}, error: {str(e)}")
                    # No aplicar filtro de total máximo inválido
                    pass
            
            # Registrar información de filtrado
            logger.info(
                f"Dashboard optimizado filtrado: fechas={params['start_date']}~{params['end_date']}, "
                f"estado={params['estado']}, cliente={params['cliente_id']}, "
                f"total={params['min_total']}~{params['max_total']}, resultados={queryset.count()}"
            )

            # 1. OPTIMIZACIÓN: Estadísticas por estado en una sola consulta
            try:
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
            except Exception as e:
                logger.error(f"Error al procesar estadísticas por estado: {str(e)}")
                # Crear estructura vacía en caso de error
                estado_stats = {}
                for estado, label in Proforma.ESTADO_CHOICES:
                    estado_stats[estado] = {'count': 0, 'total': 0.0, 'label': label}
            
            # 2. OPTIMIZACIÓN: Estadísticas por cliente (top 5) en una sola consulta
            try:
                cliente_stats_raw = list(queryset.values(
                    'cliente__id', 'cliente__nombre'
                ).annotate(
                    count=Count('id'),
                    total=Sum('total')
                ).order_by('-total')[:5])
                
                # Formatear los resultados con manejo de excepciones
                cliente_stats = []
                for cliente in cliente_stats_raw:
                    try:
                        cliente_stats.append({
                            'id': cliente['cliente__id'],
                            'nombre': cliente['cliente__nombre'] or 'Cliente sin nombre',
                            'count': cliente['count'],
                            'total': float(cliente['total'] or 0)
                        })
                    except Exception as e:
                        logger.error(f"Error al procesar cliente en estadísticas: {cliente}, error: {str(e)}")
                        # Continuar con el siguiente cliente
                        continue
            except Exception as e:
                logger.error(f"Error al procesar estadísticas por cliente: {str(e)}")
                # Proporcionar datos vacíos en caso de error
                cliente_stats = []
            
            # 3. OPTIMIZACIÓN: Estadísticas por mes en una sola consulta
            try:
                mes_stats_raw = list(queryset.annotate(
                    mes=TruncMonth('fecha_emision')
                ).values('mes').annotate(
                    count=Count('id'),
                    total=Sum('total')
                ).order_by('mes'))
                
                # Formatear los resultados con mejor manejo de errores
                mes_stats = []
                for mes in mes_stats_raw:
                    try:
                        if mes['mes'] is None:
                            continue
                        mes_stats.append({
                            'mes': mes['mes'].strftime('%Y-%m'),
                            'count': mes['count'],
                            'total': float(mes['total'] or 0)
                        })
                    except (AttributeError, TypeError, ValueError) as e:
                        logger.error(f"Error al procesar registro de mes: {mes}, error: {str(e)}")
                        # Saltar este registro pero continuar con el resto
                        continue
            except Exception as e:
                logger.error(f"Error al procesar estadísticas por mes: {str(e)}")
                # Proporcionar datos vacíos en caso de error
                mes_stats = []
            
            # 4. OPTIMIZACIÓN: Proformas recientes con prefetch_related y select_related
            try:
                recientes_qs = Proforma.objects.select_related(
                    'cliente', 'created_by'
                ).order_by('-created_at')[:5]
                
                # Formatear las proformas recientes con mejor manejo de errores
                proformas_recientes = []
                for proforma in recientes_qs:
                    try:
                        # Obtener nombres para el estado
                        estado_label = dict(Proforma.ESTADO_CHOICES).get(proforma.estado, proforma.estado)
                        
                        # Formatear fechas - con manejo de excepciones
                        try:
                            fecha_emision = proforma.fecha_emision.strftime('%d/%m/%Y') if proforma.fecha_emision else ''
                        except Exception:
                            fecha_emision = ''
                            
                        try:
                            fecha_vencimiento = proforma.fecha_vencimiento.strftime('%d/%m/%Y') if proforma.fecha_vencimiento else ''
                        except Exception:
                            fecha_vencimiento = ''
                        
                        # Iniciales del cliente para el avatar - con manejo de excepciones
                        try:
                            cliente_nombre = proforma.cliente.nombre if proforma.cliente else 'N/A'
                            cliente_avatar = ''.join([word[0] for word in cliente_nombre.split()[:2]]) if cliente_nombre != 'N/A' else 'NA'
                        except Exception:
                            cliente_nombre = 'N/A'
                            cliente_avatar = 'NA'
                        
                        # Vendedor (usuario que creó la proforma) - con manejo de excepciones
                        try:
                            vendedor = f"{proforma.created_by.first_name} {proforma.created_by.last_name}" if proforma.created_by else 'N/A'
                            if vendedor.strip() == '':
                                vendedor = proforma.created_by.username if proforma.created_by else 'N/A'
                        except Exception:
                            vendedor = 'N/A'
                        
                        proformas_recientes.append({
                            'id': str(proforma.numero) if proforma.numero else str(proforma.id),  # Asegurar que sea string
                            'numero': str(proforma.numero) if proforma.numero else str(proforma.id),
                            'cliente': cliente_nombre,
                            'clienteAvatar': cliente_avatar,
                            'fecha': fecha_emision,
                            'expira': fecha_vencimiento,
                            'monto': float(proforma.total) if proforma.total is not None else 0.0,
                            'estado': estado_label,
                            'vendedor': vendedor
                        })
                    except Exception as e:
                        logger.error(f"Error al procesar proforma {proforma.id}: {str(e)}")
                        # Continuar con la siguiente proforma
                        continue
            except Exception as e:
                logger.error(f"Error al obtener proformas recientes: {str(e)}")
                # Proporcionar datos vacíos en caso de error
                proformas_recientes = []
            
            # 5. OPTIMIZACIÓN: Totales consolidados en una sola consulta
            try:
                totals = queryset.aggregate(
                    total_count=Count('id'),
                    total_aprobadas=Count(Case(When(estado='aprobada', then=1))),
                    total_monto=Sum('total') or 0
                )
                
                total_count = totals['total_count']
                total_aprobadas = totals['total_aprobadas']
                total_monto = float(totals['total_monto'] or 0)
                
                # Calcular tasa de conversión con manejo de excepciones
                try:
                    tasa_conversion = round((total_aprobadas / total_count) * 100, 1) if total_count > 0 else 0
                except (ZeroDivisionError, TypeError):
                    tasa_conversion = 0.0
            except Exception as e:
                logger.error(f"Error al calcular totales: {str(e)}")
                # Proporcionar valores predeterminados en caso de error
                total_count = 0
                total_aprobadas = 0
                total_monto = 0.0
                tasa_conversion = 0.0
            
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
            
            # Guardar en caché antes de devolver
            cache_dashboard_data(params, response_data)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Error en dashboard optimizado: {str(e)}")
            return Response(
                {"error": "Error al generar el dashboard", "detail": str(e)},
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
    Incluye mejoras de prefetch, paginación por defecto y permisos basados en roles.
    """
    queryset = ProformaItem.objects.select_related(
        'proforma', 'producto_ofertado', 'producto_disponible'
    ).all()
    serializer_class = ProformaItemSerializer
    permission_classes = [IsAuthenticated, CanManageProformaItems]
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
    
    @transaction.atomic
    def perform_create(self, serializer):
        """
        Usar el servicio para crear el ítem y mantener la consistencia
        con optimizaciones de rendimiento
        """
        try:
            # Crear la instancia sin guardar
            validated_data = serializer.validated_data.copy()
            instance = ProformaItem(**validated_data)
            
            # Detectar si estamos en una operación en lote
            is_bulk = hasattr(self.request, '_bulk_operation') and self.request._bulk_operation
            
            if is_bulk:
                # En operaciones masivas, calcular el total pero no recalcular la proforma todavía
                instance.total = ProformaService.calculate_item_total_from_values(
                    instance.cantidad, instance.precio_unitario, instance.porcentaje_descuento
                )
                instance._totales_actualizados = True  # Marcar para evitar recálculo por signal
                instance.save(_from_serializer=True)
                serializer.instance = instance
            else:
                # Operación individual, usar el servicio completo
                item = ProformaService.save_proforma_item(
                    instance, 
                    validate=True, 
                    calculate_amounts=True, 
                    from_serializer=True
                )
                serializer.instance = item
            
            logger.info(f"Item optimizado creado para proforma {instance.proforma.numero if instance.proforma else 'N/A'}")
            
        except Exception as e:
            logger.exception(f"Error al crear ítem optimizado: {str(e)}")
            raise
    
    @transaction.atomic
    def perform_update(self, serializer):
        """
        Usar el servicio para actualizar el ítem y mantener la consistencia
        con optimizaciones de rendimiento
        """
        try:
            # Actualizar la instancia sin guardar
            validated_data = serializer.validated_data.copy()
            instance = serializer.instance
            
            # Aplicar los cambios
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            # Detectar si estamos en una operación en lote
            is_bulk = hasattr(self.request, '_bulk_operation') and self.request._bulk_operation
            
            if is_bulk:
                # En operaciones masivas, calcular el total pero no recalcular la proforma todavía
                instance.total = ProformaService.calculate_item_total_from_values(
                    instance.cantidad, instance.precio_unitario, instance.porcentaje_descuento
                )
                instance._totales_actualizados = True  # Marcar para evitar recálculo por signal
                instance.save(_from_serializer=True)
                serializer.instance = instance
            else:
                # Operación individual, usar el servicio completo
                item = ProformaService.save_proforma_item(
                    instance, 
                    validate=True, 
                    calculate_amounts=True, 
                    from_serializer=True
                )
                serializer.instance = item
            
            logger.info(f"Item optimizado {instance.id} actualizado para proforma {instance.proforma.numero if instance.proforma else 'N/A'}")
            
        except Exception as e:
            logger.exception(f"Error al actualizar ítem optimizado: {str(e)}")
            raise
    
    @transaction.atomic
    def perform_destroy(self, instance):
        """
        Usar el servicio para eliminar el ítem y mantener la consistencia
        con optimizaciones de rendimiento
        """
        try:
            # Guardar información para el log
            item_id = instance.id
            proforma_id = instance.proforma_id
            proforma_numero = instance.proforma.numero if instance.proforma else 'N/A'
            
            # Detectar si estamos en una operación en lote
            is_bulk = hasattr(self.request, '_bulk_operation') and self.request._bulk_operation
            
            if is_bulk:
                # En operaciones masivas, eliminar pero no recalcular todavía
                instance.delete()
                
                # Mantener registro de la proforma para actualización posterior
                if hasattr(self.request, '_affected_proformas'):
                    self.request._affected_proformas.add(proforma_id)
                else:
                    self.request._affected_proformas = {proforma_id}
                    
                logger.info(f"Item optimizado {item_id} eliminado de proforma {proforma_numero} (en lote)")
            else:
                # Operación individual, usar el servicio completo
                result = ProformaService.delete_proforma_item(instance, recalculate=True)
                
                if result:
                    logger.info(f"Item optimizado {item_id} eliminado de proforma {proforma_numero}")
                else:
                    logger.warning(f"No se pudo eliminar el ítem optimizado {item_id} de proforma {proforma_numero}")
                
        except Exception as e:
            logger.exception(f"Error al eliminar ítem optimizado: {str(e)}")
            raise
    
    def finalize_response(self, request, response, *args, **kwargs):
        """
        Método para realizar operaciones de limpieza después de que se completa una operación en lote.
        Recalcula los totales de las proformas afectadas si hay operaciones en lote.
        """
        # Verificar si hay proformas que necesitan recálculos después de operaciones en lote
        if (hasattr(request, '_affected_proformas') and request._affected_proformas and 
            not hasattr(request, '_totals_recalculated')):
            try:
                # Marcar que ya se recalcularon para evitar recálculos duplicados
                request._totals_recalculated = True
                
                # Usar el servicio para recalcular en lote
                affected_proformas = list(request._affected_proformas)
                updated_count = ProformaService.calculate_amounts_batch(affected_proformas)
                
                logger.info(f"Recalculados totales de {updated_count} proformas tras operación en lote")
                
            except Exception as e:
                logger.error(f"Error al recalcular totales después de operación en lote: {e}")
        
        # Devolver la respuesta normal
        return super().finalize_response(request, response, *args, **kwargs)


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


# Vista estadística para el dashboard
@api_view(['GET'])
def stats_dashboard(request):
    """
    Dashboard estadístico con datos agregados para visualización
    
    Parámetros:
    - periodo: 'day', 'week', 'month' (default: 'month')
    - desde: Fecha inicio en formato YYYY-MM-DD
    - hasta: Fecha fin en formato YYYY-MM-DD
    - empresa_id: ID de la empresa (opcional)
    - format: 'json' o 'csv' (default: 'json')
    """
    try:
        # Parámetros
        periodo = request.GET.get('periodo', 'month')
        fecha_desde = request.GET.get('desde')
        fecha_hasta = request.GET.get('hasta')
        empresa_id = request.GET.get('empresa_id')
        formato = request.GET.get('format', 'json')
        
        # Base queryset
        queryset = Proforma.objects.all()
        
        # Aplicar filtros con validación
        if fecha_desde:
            try:
                # Validar formato de fecha (YYYY-MM-DD)
                datetime.strptime(fecha_desde, '%Y-%m-%d')
                queryset = queryset.filter(fecha_emision__gte=fecha_desde)
            except (ValueError, TypeError) as e:
                logger.error(f"Error en formato de fecha inicio: {fecha_desde}, error: {str(e)}")
                # No aplicar filtro de fecha inválida
                pass
                
        if fecha_hasta:
            try:
                # Validar formato de fecha (YYYY-MM-DD)
                datetime.strptime(fecha_hasta, '%Y-%m-%d')
                queryset = queryset.filter(fecha_emision__lte=fecha_hasta)
            except (ValueError, TypeError) as e:
                logger.error(f"Error en formato de fecha fin: {fecha_hasta}, error: {str(e)}")
                # No aplicar filtro de fecha inválida
                pass
                
        if empresa_id:
            try:
                empresa_id_int = int(empresa_id)
                queryset = queryset.filter(empresa_id=empresa_id_int)
            except (ValueError, TypeError) as e:
                logger.error(f"Error en formato de ID de empresa: {empresa_id}, error: {str(e)}")
                # No aplicar filtro de empresa inválida
                pass
        
        # Función para truncar fecha según periodo
        trunc_func = None
        date_format = '%Y-%m'
        
        if periodo == 'day':
            trunc_func = TruncDay('fecha_emision')
            date_format = '%Y-%m-%d'
        elif periodo == 'week':
            trunc_func = TruncWeek('fecha_emision')
            date_format = '%Y-%m-%d'
        else:  # default: month
            trunc_func = TruncMonth('fecha_emision')
            date_format = '%Y-%m'
        
        # Agrupar y contar por periodo y estado
        try:
            stats = queryset.annotate(
                periodo=trunc_func
            ).values('periodo', 'estado').annotate(
                count=Count('id'),
                total=Sum('total')
            ).order_by('periodo', 'estado')
        except Exception as e:
            logger.error(f"Error al agrupar estadísticas: {str(e)}")
            # Proporcionar datos vacíos en caso de error
            return Response(
                {"error": f"Error al agrupar estadísticas: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Preparar datos para respuesta con manejo de excepciones
        periodos = {}
        try:
            for stat in stats:
                try:
                    fecha = stat['periodo']
                    if fecha is None:
                        continue
                        
                    try:
                        fecha_str = fecha.strftime(date_format)
                    except (AttributeError, ValueError, TypeError) as e:
                        logger.error(f"Error al formatear fecha: {fecha}, error: {str(e)}")
                        continue
                        
                    if fecha_str not in periodos:
                        periodos[fecha_str] = {
                            'fecha': fecha_str,
                            'total': 0,
                            'count': 0,
                            'estados': {}
                        }
                    
                    # Actualizar conteos por estado
                    estado = stat['estado']
                    if estado is None:
                        estado = 'sin_estado'
                        
                    periodos[fecha_str]['estados'][estado] = {
                        'count': stat['count'],
                        'total': float(stat['total'] or 0)
                    }
                    
                    # Actualizar totales del periodo
                    periodos[fecha_str]['total'] += float(stat['total'] or 0)
                    periodos[fecha_str]['count'] += stat['count']
                except Exception as e:
                    logger.error(f"Error al procesar estadística: {stat}, error: {str(e)}")
                    # Continuar con el siguiente registro
                    continue
        except Exception as e:
            logger.error(f"Error al preparar datos de periodos: {str(e)}")
            periodos = {}
        
        # Convertir a lista ordenada para la respuesta
        result = []
        try:
            for fecha_str in sorted(periodos.keys()):
                try:
                    periodo_data = periodos[fecha_str]
                    
                    # Calcular estadísticas adicionales con manejo de excepciones
                    proformas_enviadas = periodo_data['estados'].get('enviada', {}).get('count', 0)
                    proformas_aprobadas = periodo_data['estados'].get('aprobada', {}).get('count', 0)
                    
                    total_periodo = periodo_data['count']
                    
                    # Calcular tasas con manejo de división por cero
                    try:
                        tasa_aprobacion = (proformas_aprobadas / total_periodo) * 100 if total_periodo > 0 else 0
                    except (ZeroDivisionError, TypeError):
                        tasa_aprobacion = 0
                        
                    try:
                        tasa_conversion = (proformas_aprobadas / proformas_enviadas) * 100 if proformas_enviadas > 0 else 0
                    except (ZeroDivisionError, TypeError):
                        tasa_conversion = 0
                    
                    # Añadir estadísticas adicionales
                    periodo_data['tasa_aprobacion'] = round(tasa_aprobacion, 2)
                    periodo_data['tasa_conversion'] = round(tasa_conversion, 2)
                    
                    result.append(periodo_data)
                except Exception as e:
                    logger.error(f"Error al procesar periodo {fecha_str}: {str(e)}")
                    # Continuar con el siguiente periodo
                    continue
        except Exception as e:
            logger.error(f"Error al ordenar y procesar periodos: {str(e)}")
            result = []
        
        # Devolver en formato solicitado
        if formato == 'csv':
            try:
                # Crear un archivo CSV en memoria
                output = io.StringIO()
                writer = csv.writer(output)
                
                # Escribir cabecera
                writer.writerow([
                    'Fecha', 'Total Proformas', 'Monto Total', 
                    'Borradores', 'Enviadas', 'Aprobadas', 'Rechazadas',
                    'Tasa Aprobación', 'Tasa Conversión'
                ])
                
                # Escribir filas con manejo de excepciones
                for periodo in result:
                    try:
                        writer.writerow([
                            periodo['fecha'],
                            periodo['count'],
                            f"{periodo['total']:.2f}",
                            periodo['estados'].get('borrador', {}).get('count', 0),
                            periodo['estados'].get('enviada', {}).get('count', 0),
                            periodo['estados'].get('aprobada', {}).get('count', 0),
                            periodo['estados'].get('rechazada', {}).get('count', 0),
                            f"{periodo['tasa_aprobacion']:.2f}%",
                            f"{periodo['tasa_conversion']:.2f}%"
                        ])
                    except Exception as e:
                        logger.error(f"Error al escribir fila CSV: {periodo}, error: {str(e)}")
                        # Continuar con el siguiente periodo
                        continue
                
                # Devolver respuesta CSV
                output.seek(0)
                response = HttpResponse(output.read(), content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename=stats_{periodo}_{fecha_desde}_{fecha_hasta}.csv'
                return response
            except Exception as e:
                logger.error(f"Error al generar CSV: {str(e)}")
                return Response(
                    {"error": f"Error al generar CSV: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # Devolver respuesta JSON
            return Response({
                'periodo': periodo,
                'desde': fecha_desde,
                'hasta': fecha_hasta,
                'data': result
            })
    
    except Exception as e:
        logger.exception(f"Error en stats_dashboard: {str(e)}")
        return Response(
            {"error": f"Error al generar estadísticas: {str(e)}", "detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )