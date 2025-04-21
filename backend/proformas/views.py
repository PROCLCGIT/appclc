from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, DateFromToRangeFilter, NumberFilter, CharFilter, ChoiceFilter
from django.db.models import Q
from django.db import transaction, models
from django.utils import timezone
from django.http import HttpResponse, JsonResponse
from django.conf import settings
import json
import csv
import io
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

from .models import Proforma, ProformaItem, ProformaHistorial, ConfiguracionProforma
from .serializers import (
    ProformaSerializer, ProformaItemSerializer, 
    ProformaHistorialSerializer, ConfiguracionProformaSerializer,
    BusquedaProductosSerializer
)
from .pagination import StandardResultsSetPagination, LargeResultsSetPagination

from pandora.models import Clientes, EmpresaClc
from products.models import ProductoOfertado, ProductoDisponible

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
    filterset_class = ProformaFilter
    search_fields = ['numero', 'nombre', 'cliente__nombre', 'notas', 'atencion_a']
    ordering_fields = ['numero', 'fecha_emision', 'fecha_vencimiento', 'cliente__nombre', 'total', 'estado', 'created_at']
    ordering = ['-fecha_emision']
    pagination_class = StandardResultsSetPagination
    
    @transaction.atomic
    def perform_create(self, serializer):
        """Asignar el usuario actual como creador dentro de una transacción atómica"""
        try:
            serializer.save(created_by=self.request.user, updated_by=self.request.user)
            logger.info(f"Proforma creada por usuario {self.request.user.username}")
        except Exception as e:
            logger.exception(f"Error al crear proforma: {str(e)}")
            raise
    
    @transaction.atomic
    def perform_update(self, serializer):
        """Asignar el usuario actual como actualizador dentro de una transacción atómica"""
        try:
            serializer.save(updated_by=self.request.user)
            logger.info(f"Proforma {serializer.instance.id} actualizada por usuario {self.request.user.username}")
        except Exception as e:
            logger.exception(f"Error al actualizar proforma {serializer.instance.id}: {str(e)}")
            raise
    
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
    def dashboard(self, request):
        """Obtener estadísticas para el dashboard de proformas"""
        try:
            # Filtrar por rango de fechas si se proporciona
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            estado_filter = request.query_params.get('estado')
            cliente_id = request.query_params.get('cliente_id')
            min_total = request.query_params.get('min_total')
            max_total = request.query_params.get('max_total')
            
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
                f"total={min_total}~{max_total}, resultados={queryset.count()}"
            )
            
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
            try:
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
                    if mes['mes']:
                        mes_stats.append({
                            'mes': mes['mes'].strftime('%Y-%m'),
                            'count': mes['count'],
                            'total': mes['total'] or 0
                        })
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
                        # Continuar con la siguiente proforma en caso de error
            except Exception as e:
                logger.error(f"Error al obtener proformas recientes: {str(e)}")
                # Proporcionar datos vacíos en caso de error
                proformas_recientes = []
            
            # Devolver estadísticas y proformas recientes
            # Crear datos de respuesta
            try:
                total_count = queryset.count()
                total_aprobadas = queryset.filter(estado='aprobada').count()
                
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
                {"error": "Error al generar el dashboard"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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
        
    @action(detail=True, methods=['get'])
    def exportar_pdf(self, request, pk=None):
        """Exportar una proforma a formato PDF"""
        from django.template.loader import render_to_string
        from weasyprint import HTML, CSS
        from django.core.files.base import ContentFile
        import tempfile
        from rest_framework_simplejwt.tokens import AccessToken, TokenError
        
        # Manejar token pasado como parámetro GET para compatibilidad con iframe
        token = request.GET.get('token')
        if token and not request.user.is_authenticated:
            try:
                # Decodificar el token y obtener el usuario
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(id=user_id)
                # Simular autenticación asignando el usuario a la solicitud
                request.user = user
            except (TokenError, User.DoesNotExist) as e:
                # Si el token no es válido, continuamos con la autenticación estándar
                pass
        
        # Obtener la proforma (esto ya aplica los permisos)
        proforma = self.get_object()
        items = proforma.items.all().order_by('orden')
        
        # Obtener configuración global de proformas
        configuracion = ConfiguracionProforma.objects.first()
        if not configuracion:
            configuracion = ConfiguracionProforma.objects.create()
        
        # Preparar contexto para la plantilla
        context = {
            'proforma': proforma,
            'items': items,
            'cliente': proforma.cliente,
            'empresa': proforma.empresa,
            'config': configuracion,
            'estado': dict(Proforma.ESTADO_CHOICES)[proforma.estado],
            'BASE_URL': request.build_absolute_uri('/').rstrip('/')
        }
        
        # Generar HTML a partir de la plantilla
        html_string = render_to_string('proformas/pdf_template.html', context)
        
        # Crear archivo PDF temporal
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as output:
            try:
                # Generar PDF con WeasyPrint
                html = HTML(string=html_string, base_url=request.build_absolute_uri('/'))
                css = CSS(string='''
                    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@300;400;600&display=swap');
                    
                    @page {
                        size: letter;
                        margin: 1.5cm;
                        @bottom-right {
                            content: "Página " counter(page) " de " counter(pages);
                            font-size: 10px;
                            color: #6B7280;
                        }
                    }
                    
                    /* No se necesita mucho CSS aquí ya que la mayoría está incrustado en el template */
                    /* Esto solo se usa para sobreescribir propiedades si es necesario */
                    
                    .num-cell {
                        text-align: right !important;
                    }
                    
                    /* Un pequeño ajuste para asegurar márgenes en el documento impreso */
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    
                    /* Asegurar que las tablas tengan el ancho correcto en PDF */
                    table { 
                        table-layout: fixed;
                    }
                    
                    /* Mejora las líneas de firma */
                    .signature-line {
                        margin-top: 3em;
                        border-top: 1px solid #000 !important;
                    }
                ''')
                
                html.write_pdf(target=output.name, stylesheets=[css])
                
                # Devolver el archivo PDF como respuesta HTTP
                with open(output.name, 'rb') as pdf_file:
                    response = HttpResponse(pdf_file.read(), content_type='application/pdf')
                    
                    # Por defecto abrir en navegador en lugar de forzar descarga
                    inline_param = request.GET.get('inline', 'true')
                    if inline_param.lower() == 'true':
                        response['Content-Disposition'] = f'inline; filename="proforma_{proforma.numero}.pdf"'
                    else:
                        response['Content-Disposition'] = f'attachment; filename="proforma_{proforma.numero}.pdf"'
                    
                    return response
            except Exception as e:
                import traceback
                print(f"Error generando PDF: {str(e)}")
                print(traceback.format_exc())
                return Response(
                    {"error": f"Error al generar PDF: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
    
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
    filterset_class = ProformaItemFilter
    ordering_fields = ['orden', 'codigo', 'precio_unitario', 'total']
    ordering = ['proforma', 'orden']
    pagination_class = LargeResultsSetPagination
    
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
    filterset_fields = ['proforma', 'accion', 'estado_anterior', 'estado_nuevo', 'created_by']
    ordering_fields = ['created_at', 'accion']
    ordering = ['-created_at']
    pagination_class = StandardResultsSetPagination


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