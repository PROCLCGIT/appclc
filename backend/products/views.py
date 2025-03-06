# products/views.py

from rest_framework import viewsets, status, filters, parsers, views
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count, Avg, F, Max  # Añadimos Max aquí
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import (
    ProductoOfertado, ProductoDisponible,
    ImagenReferenciaProductoOfertado,
    DocumentoProductoOfertado,
    HistorialDeVentas, HistorialDeCompras
)
from .serializers import (
    ProductoOfertadoSerializer,
    ProductoDisponibleSerializer,
    ImagenReferenciaProductoOfertadoSerializer,
    DocumentoProductoOfertadoSerializer,
    HistorialDeVentasSerializer,
    HistorialDeComprasSerializer
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
    
    # Configurar el filter backend para ignorar filtros inválidos
    def get_filter_backend_settings(self):
        return {
            'STRICT_PARAM_PARSING': False,
            'IGNORE_UNKNOWN_QUERY_PARAMS': True
        }

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



class ProductoOfertadoViewSet(BaseProductViewSet):
    """ViewSet para ProductoOfertado"""
    queryset = ProductoOfertado.objects.select_related(
        'id_categoria', 'created_by', 'updated_by'
    ).prefetch_related('imagenes', 'documentos_producto').all()
    serializer_class = ProductoOfertadoSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    # Temporalmente permitir acceso sin autenticación para pruebas
    permission_classes = []
    
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
        
    @action(detail=True, methods=['post'])
    def upload_images(self, request, pk=None):
        """Endpoint para subir imágenes de referencia a un producto"""
        producto = self.get_object()
        files = request.FILES.getlist('imagenes')
        
        if not files:
            return Response(
                {'error': 'No se proporcionaron imágenes'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Obtener la última posición ordenada
        last_order = producto.imagenes.aggregate(max_orden=Max('orden'))['max_orden'] or 0
        
        uploaded_images = []
        
        # Crear registros de imágenes
        for i, file in enumerate(files):
            try:
                imagen = ImagenReferenciaProductoOfertado.objects.create(
                    producto_ofertado=producto,
                    imagen=file,
                    orden=last_order + i + 1,
                    is_primary=(i == 0 and last_order == 0),  # Es principal solo si es la primera imagen del producto
                    created_by=request.user
                )
                uploaded_images.append({
                    'id': imagen.id,
                    'url': imagen.url if hasattr(imagen, 'url') else None
                })
            except Exception as e:
                import traceback
                traceback.print_exc()
                return Response(
                    {'error': f'Error al subir imagen: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
        return Response({
            'message': f'Se subieron {len(files)} imágenes correctamente',
            'images': uploaded_images
        }, status=status.HTTP_201_CREATED)
        
    @action(detail=True, methods=['post'])
    def upload_documents(self, request, pk=None):
        """Endpoint para subir documentos a un producto ofertado"""
        producto = self.get_object()
        documentos = request.FILES.getlist('uploaded_documents')
        titulos = request.POST.getlist('document_titles')
        tipos = request.POST.getlist('document_types')
        descripciones = request.POST.getlist('document_descriptions')
        
        if not documentos:
            return Response(
                {'error': 'No se proporcionaron documentos'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        uploaded_documents = []
        
        # Crear registros de documentos
        for i, documento in enumerate(documentos):
            try:
                # Obtener metadatos si están disponibles
                titulo = titulos[i] if i < len(titulos) else f"Documento {i+1}"
                tipo = tipos[i] if i < len(tipos) else "otros"
                descripcion = descripciones[i] if i < len(descripciones) else ""
                
                # Validar que el tipo de documento sea válido
                tipos_validos = [choice[0] for choice in DocumentoProductoOfertado.TIPO_DOCUMENTO]
                if tipo not in tipos_validos:
                    tipo = "otros"
                
                doc = DocumentoProductoOfertado.objects.create(
                    producto_ofertado=producto,
                    documento=documento,
                    tipo_documento=tipo,
                    titulo=titulo,
                    descripcion=descripcion,
                    is_public=True,
                    created_by=request.user
                )
                uploaded_documents.append({
                    'id': doc.id,
                    'url': doc.url if hasattr(doc, 'url') else None,
                    'titulo': doc.titulo,
                    'tipo_documento': doc.tipo_documento
                })
            except Exception as e:
                import traceback
                traceback.print_exc()
                return Response(
                    {'error': f'Error al subir documento: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
        return Response({
            'message': f'Se subieron {len(documentos)} documentos correctamente',
            'documents': uploaded_documents
        }, status=status.HTTP_201_CREATED)
        
    @action(detail=True, methods=['delete'])
    def delete_image(self, request, pk=None):
        """Eliminar una imagen de referencia"""
        producto = self.get_object()
        imagen_id = request.data.get('imagen_id')
        
        if not imagen_id:
            return Response(
                {'error': 'Debe proporcionar el ID de la imagen'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            imagen = producto.imagenes.get(id=imagen_id)
            imagen.delete()
            return Response(
                {'message': 'Imagen eliminada correctamente'},
                status=status.HTTP_200_OK
            )
        except ImagenReferenciaProductoOfertado.DoesNotExist:
            return Response(
                {'error': 'La imagen no existe o no pertenece a este producto'},
                status=status.HTTP_404_NOT_FOUND
            )
            
    @action(detail=True, methods=['delete'])
    def delete_document(self, request, pk=None):
        """Eliminar un documento de un producto ofertado"""
        producto = self.get_object()
        documento_id = request.data.get('documento_id')
        
        if not documento_id:
            return Response(
                {'error': 'Debe proporcionar el ID del documento'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            documento = DocumentoProductoOfertado.objects.get(
                id=documento_id, 
                producto_ofertado=producto
            )
            documento.delete()
            return Response(
                {'message': 'Documento eliminado correctamente'},
                status=status.HTTP_200_OK
            )
        except DocumentoProductoOfertado.DoesNotExist:
            return Response(
                {'error': 'El documento no existe o no pertenece a este producto'},
                status=status.HTTP_404_NOT_FOUND
            )

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
    ).prefetch_related('imagenes_producto', 'documentos_producto').all()
    # Temporalmente permitir acceso sin autenticación para pruebas
    permission_classes = []
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


class HistorialDeVentasViewSet(BaseProductViewSet):
    """ViewSet para el historial de ventas de productos"""
    queryset = HistorialDeVentas.objects.select_related(
        'producto', 'cliente', 'empresa'
    ).all()
    serializer_class = HistorialDeVentasSerializer
    # Temporalmente permitir acceso sin autenticación para pruebas
    permission_classes = []
    
    def create(self, request, *args, **kwargs):
        """Método create personalizado para depurar errores"""
        try:
            print("=== VENTAS CREATE ===")
            print("Datos recibidos:", request.data)
            
            # Verificar que los datos sean procesables
            data = request.data.copy()
            
            # Comprobación de campos obligatorios
            required_fields = ['producto', 'cliente', 'empresa', 'fecha', 'factura', 'valor']
            missing_fields = [field for field in required_fields if field not in data or not data[field]]
            if missing_fields:
                print(f"Faltan campos obligatorios: {missing_fields}")
                return Response(
                    {"error": f"Faltan campos obligatorios: {', '.join(missing_fields)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Validar formato de fecha
            if 'fecha' in data:
                try:
                    from datetime import datetime
                    from django.utils.dateparse import parse_date
                    
                    # Intentar convertir fecha a formato válido
                    if isinstance(data['fecha'], str):
                        print(f"Validando fecha: {data['fecha']}")
                        fecha_parsed = parse_date(data['fecha'])
                        if not fecha_parsed:
                            return Response(
                                {"error": f"El formato de fecha es inválido. Utilice YYYY-MM-DD."},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        data['fecha'] = fecha_parsed
                except Exception as e:
                    print(f"Error al procesar fecha: {e}")
                    return Response(
                        {"error": f"Error al procesar la fecha: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Asegurar que el campo 'cantidad' esté presente
            if 'cantidad' not in data:
                data['cantidad'] = 1
            elif data['cantidad'] and not isinstance(data['cantidad'], int):
                try:
                    data['cantidad'] = int(data['cantidad'])
                except (ValueError, TypeError) as e:
                    print(f"Error de conversión en cantidad: {e}")
                    return Response(
                        {"error": f"La cantidad debe ser un número entero válido. Error: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Asegurar que los campos numéricos sean del tipo correcto
            for field in ['valor', 'iva']:
                if field in data and data[field] and not isinstance(data[field], (int, float, str)):
                    print(f"Tipo incorrecto para {field}: {type(data[field])}")
                    return Response(
                        {"error": f"El campo '{field}' debe ser un valor numérico válido. Tipo recibido: {type(data[field])}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                elif field in data and isinstance(data[field], str):
                    try:
                        data[field] = float(data[field].replace(',', '.'))
                    except (ValueError, TypeError) as e:
                        print(f"Error al convertir {field}: {e}")
                        return Response(
                            {"error": f"El campo '{field}' debe ser un valor numérico válido. Error: {str(e)}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
            # Asegurar que los IDs sean enteros para relaciones
            for field in ['producto', 'cliente', 'empresa']:
                if field in data and data[field] and not isinstance(data[field], int):
                    try:
                        print(f"Convirtiendo {field} a entero: {data[field]}")
                        data[field] = int(data[field])
                    except (ValueError, TypeError) as e:
                        print(f"Error al convertir ID de {field}: {e}")
                        return Response(
                            {"error": f"El ID del campo '{field}' debe ser un número entero válido. Error: {str(e)}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
            
            # Estado del procesamiento de datos
            print("Datos procesados para validación:", data)
            
            # Buscar registros existentes
            if 'factura' in data and 'cliente' in data:
                try:
                    print(f"Buscando factura existente: {data['factura']} para cliente: {data['cliente']}")
                    existing = self.queryset.filter(
                        factura=data['factura'],
                        cliente=data['cliente']
                    ).first()
                    
                    if existing:
                        print(f"Factura duplicada encontrada: {existing.id}")
                        return Response(
                            {"error": f"Ya existe una venta con esta factura ({data['factura']}) para este cliente."},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except Exception as e:
                    print(f"Error al verificar factura duplicada: {e}")
            
            # Log intermedio
            print("Pasando datos al serializador:", data)
            
            # Crear el serializador e intentar validar
            try:
                serializer = self.get_serializer(data=data)
                
                # Validar de forma explícita para capturar errores específicos
                if not serializer.is_valid():
                    print("Errores de validación:", serializer.errors)
                    return Response(
                        {"error": "Datos inválidos", "details": serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
                print("Datos válidos, intentando guardar")
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            except Exception as e:
                print(f"Error al procesar con el serializador: {e}")
                raise
        except Exception as e:
            print("ERROR en create HistorialDeVentas:", str(e))
            print("Tipo de error:", type(e).__name__)
            print("Datos recibidos en el request:", request.data)
            
            # Más información de diagnóstico
            if hasattr(e, 'detail'):
                print("Detalles del error:", e.detail)
                
            import traceback
            traceback.print_exc()
            
            # Revisar si el error está relacionado con IntegrityError
            from django.db import IntegrityError
            if isinstance(e, IntegrityError):
                return Response(
                    {"error": "Error de integridad en la base de datos. Posible campo único duplicado o restricción violada.", 
                     "detail": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    filterset_fields = {
        'producto': ['exact'],
        'cliente': ['exact'],
        'empresa': ['exact'],
        'fecha': ['exact', 'gte', 'lte'],
        'valor': ['gte', 'lte'],
        'cantidad': ['gte', 'lte'],
        # TimeStampedModel => created_at, updated_at
        'created_at': ['gte', 'lte'],
        'updated_at': ['gte', 'lte'],
    }
    search_fields = ['factura']
    ordering_fields = ['fecha', 'valor', 'factura', 'created_at']
    ordering = ['-fecha']  # Ordenamiento por defecto: fechas más recientes primero
    
    def get_queryset(self):
        """Personalizar el queryset con filtros adicionales"""
        queryset = super().get_queryset()
        
        # Filtros para fecha (inicio y fin)
        fecha_inicio = self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fecha_fin')
        
        # Filtros especiales para cliente, producto y empresa
        cliente = self.request.query_params.get('cliente')
        producto = self.request.query_params.get('producto')
        empresa = self.request.query_params.get('empresa')
        
        # Aplicamos filtros de fecha
        if fecha_inicio:
            queryset = queryset.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha__lte=fecha_fin)
            
        # Aplicamos filtros de entidades relacionadas, si no son valores especiales
        if cliente and cliente != 'all_clientes':
            queryset = queryset.filter(cliente_id=cliente)
        if producto and producto != 'all_productos':
            queryset = queryset.filter(producto_id=producto)
        if empresa and empresa != 'all_empresas':
            queryset = queryset.filter(empresa_id=empresa)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas del historial de ventas"""
        queryset = self.get_queryset()
        
        # Estadísticas generales
        total_ventas = queryset.count()
        monto_total = queryset.aggregate(total=Sum('valor'))['total'] or 0
        iva_total = queryset.aggregate(total=Sum('iva'))['total'] or 0
        
        # Ventas por cliente (top 5)
        ventas_por_cliente = queryset.values(
            'cliente__id', 'cliente__nombre'
        ).annotate(
            total=Sum('valor'),
            count=Count('id')
        ).order_by('-total')[:5]
        
        # Ventas por producto (top 5)
        ventas_por_producto = queryset.values(
            'producto__id', 'producto__nombre'
        ).annotate(
            total=Sum('valor'),
            count=Count('id')
        ).order_by('-total')[:5]
        
        # Ventas por empresa
        ventas_por_empresa = queryset.values(
            'empresa__id', 'empresa__nombre'
        ).annotate(
            total=Sum('valor'),
            count=Count('id')
        ).order_by('-total')
        
        # Ventas por mes (últimos 12 meses)
        # Aquí usamos una consulta más compleja con anotación y extracción de fecha
        from django.db.models.functions import TruncMonth
        
        ventas_por_mes = queryset.annotate(
            mes=TruncMonth('fecha')
        ).values('mes').annotate(
            total=Sum('valor'),
            count=Count('id')
        ).order_by('-mes')[:12]
        
        return Response({
            'total_ventas': total_ventas,
            'monto_total': monto_total,
            'iva_total': iva_total,
            'monto_total_con_iva': monto_total + iva_total,
            'ventas_por_cliente': ventas_por_cliente,
            'ventas_por_producto': ventas_por_producto,
            'ventas_por_empresa': ventas_por_empresa,
            'ventas_por_mes': ventas_por_mes
        })
        
        
class HistorialDeComprasViewSet(BaseProductViewSet):
    """ViewSet para el historial de compras de productos"""
    queryset = HistorialDeCompras.objects.select_related(
        'producto', 'proveedor', 'empresa'
    ).all()
    serializer_class = HistorialDeComprasSerializer
    # Temporalmente permitir acceso sin autenticación para pruebas
    permission_classes = []
    
    def create(self, request, *args, **kwargs):
        """Método create personalizado para depurar errores"""
        try:
            print("=== COMPRAS CREATE ===")
            print("Datos recibidos:", request.data)
            
            # Verificar que los datos sean procesables
            data = request.data.copy()
            
            # Comprobación de campos obligatorios
            required_fields = ['producto', 'proveedor', 'empresa', 'fecha', 'factura', 'valor']
            missing_fields = [field for field in required_fields if field not in data or not data[field]]
            if missing_fields:
                print(f"Faltan campos obligatorios: {missing_fields}")
                return Response(
                    {"error": f"Faltan campos obligatorios: {', '.join(missing_fields)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Validar formato de fecha
            if 'fecha' in data:
                try:
                    from datetime import datetime
                    from django.utils.dateparse import parse_date
                    
                    # Intentar convertir fecha a formato válido
                    if isinstance(data['fecha'], str):
                        print(f"Validando fecha: {data['fecha']}")
                        fecha_parsed = parse_date(data['fecha'])
                        if not fecha_parsed:
                            return Response(
                                {"error": f"El formato de fecha es inválido. Utilice YYYY-MM-DD."},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        data['fecha'] = fecha_parsed
                except Exception as e:
                    print(f"Error al procesar fecha: {e}")
                    return Response(
                        {"error": f"Error al procesar la fecha: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Asegurar que el campo 'cantidad' esté presente
            if 'cantidad' not in data:
                data['cantidad'] = 1
            elif data['cantidad'] and not isinstance(data['cantidad'], int):
                try:
                    data['cantidad'] = int(data['cantidad'])
                except (ValueError, TypeError) as e:
                    print(f"Error de conversión en cantidad: {e}")
                    return Response(
                        {"error": f"La cantidad debe ser un número entero válido. Error: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Asegurar que los campos numéricos sean del tipo correcto
            for field in ['valor', 'iva']:
                if field in data and data[field] and not isinstance(data[field], (int, float, str)):
                    print(f"Tipo incorrecto para {field}: {type(data[field])}")
                    return Response(
                        {"error": f"El campo '{field}' debe ser un valor numérico válido. Tipo recibido: {type(data[field])}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                elif field in data and isinstance(data[field], str):
                    try:
                        data[field] = float(data[field].replace(',', '.'))
                    except (ValueError, TypeError) as e:
                        print(f"Error al convertir {field}: {e}")
                        return Response(
                            {"error": f"El campo '{field}' debe ser un valor numérico válido. Error: {str(e)}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
            # Asegurar que los IDs sean enteros para relaciones
            for field in ['producto', 'proveedor', 'empresa']:
                if field in data and data[field] and not isinstance(data[field], int):
                    try:
                        print(f"Convirtiendo {field} a entero: {data[field]}")
                        data[field] = int(data[field])
                    except (ValueError, TypeError) as e:
                        print(f"Error al convertir ID de {field}: {e}")
                        return Response(
                            {"error": f"El ID del campo '{field}' debe ser un número entero válido. Error: {str(e)}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
            
            # Estado del procesamiento de datos
            print("Datos procesados para validación:", data)
            
            # Buscar registros existentes
            if 'factura' in data and 'proveedor' in data:
                try:
                    print(f"Buscando factura existente: {data['factura']} para proveedor: {data['proveedor']}")
                    existing = self.queryset.filter(
                        factura=data['factura'],
                        proveedor=data['proveedor']
                    ).first()
                    
                    if existing:
                        print(f"Factura duplicada encontrada: {existing.id}")
                        return Response(
                            {"error": f"Ya existe una compra con esta factura ({data['factura']}) para este proveedor."},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except Exception as e:
                    print(f"Error al verificar factura duplicada: {e}")
            
            # Log intermedio
            print("Pasando datos al serializador:", data)
            
            # Crear el serializador e intentar validar
            try:
                serializer = self.get_serializer(data=data)
                
                # Validar de forma explícita para capturar errores específicos
                if not serializer.is_valid():
                    print("Errores de validación:", serializer.errors)
                    return Response(
                        {"error": "Datos inválidos", "details": serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
                print("Datos válidos, intentando guardar")
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            except Exception as e:
                print(f"Error al procesar con el serializador: {e}")
                raise
        except Exception as e:
            print("ERROR en create HistorialDeCompras:", str(e))
            print("Tipo de error:", type(e).__name__)
            print("Datos recibidos en el request:", request.data)
            
            # Más información de diagnóstico
            if hasattr(e, 'detail'):
                print("Detalles del error:", e.detail)
            
            import traceback
            traceback.print_exc()
            
            # Revisar si el error está relacionado con IntegrityError
            from django.db import IntegrityError
            if isinstance(e, IntegrityError):
                return Response(
                    {"error": "Error de integridad en la base de datos. Posible campo único duplicado o restricción violada.", 
                     "detail": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    filterset_fields = {
        'producto': ['exact'],
        'proveedor': ['exact'],
        'empresa': ['exact'],
        'fecha': ['exact', 'gte', 'lte'],
        'valor': ['gte', 'lte'],
        'cantidad': ['gte', 'lte'],
        # TimeStampedModel => created_at, updated_at
        'created_at': ['gte', 'lte'],
        'updated_at': ['gte', 'lte'],
    }
    search_fields = ['factura']
    ordering_fields = ['fecha', 'valor', 'factura', 'created_at']
    ordering = ['-fecha']  # Ordenamiento por defecto: fechas más recientes primero
    
    def get_queryset(self):
        """Personalizar el queryset con filtros adicionales"""
        queryset = super().get_queryset()
        
        # Filtros para fecha (inicio y fin)
        fecha_inicio = self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fecha_fin')
        
        # Filtros especiales para proveedor, producto y empresa
        proveedor = self.request.query_params.get('proveedor')
        producto = self.request.query_params.get('producto')
        empresa = self.request.query_params.get('empresa')
        
        # Aplicamos filtros de fecha
        if fecha_inicio:
            queryset = queryset.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha__lte=fecha_fin)
            
        # Aplicamos filtros de entidades relacionadas, si no son valores especiales
        if proveedor and proveedor != 'all_providers':
            queryset = queryset.filter(proveedor_id=proveedor)
        if producto and producto != 'all':
            queryset = queryset.filter(producto_id=producto)
        if empresa and empresa != 'all_companies':
            queryset = queryset.filter(empresa_id=empresa)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas del historial de compras"""
        queryset = self.get_queryset()
        
        # Estadísticas generales
        total_compras = queryset.count()
        monto_total = queryset.aggregate(total=Sum('valor'))['total'] or 0
        iva_total = queryset.aggregate(total=Sum('iva'))['total'] or 0
        cantidad_total = queryset.aggregate(total=Sum('cantidad'))['total'] or 0
        
        # Compras por proveedor (top 5)
        compras_por_proveedor = queryset.values(
            'proveedor__id', 'proveedor__nombre'
        ).annotate(
            total=Sum('valor'),
            count=Count('id')
        ).order_by('-total')[:5]
        
        # Compras por producto (top 5)
        compras_por_producto = queryset.values(
            'producto__id', 'producto__nombre'
        ).annotate(
            total=Sum('valor'),
            count=Count('id'),
            cantidad=Sum('cantidad')
        ).order_by('-total')[:5]
        
        # Compras por empresa
        compras_por_empresa = queryset.values(
            'empresa__id', 'empresa__nombre'
        ).annotate(
            total=Sum('valor'),
            count=Count('id')
        ).order_by('-total')
        
        # Compras por mes (últimos 12 meses)
        from django.db.models.functions import TruncMonth
        
        compras_por_mes = queryset.annotate(
            mes=TruncMonth('fecha')
        ).values('mes').annotate(
            total=Sum('valor'),
            count=Count('id'),
            cantidad=Sum('cantidad')
        ).order_by('-mes')[:12]
        
        return Response({
            'total_compras': total_compras,
            'monto_total': monto_total,
            'iva_total': iva_total,
            'monto_total_con_iva': monto_total + iva_total,
            'cantidad_total': cantidad_total,
            'compras_por_proveedor': compras_por_proveedor,
            'compras_por_producto': compras_por_producto,
            'compras_por_empresa': compras_por_empresa,
            'compras_por_mes': compras_por_mes
        })

# ----------------------------------------------------------------------------
# Test Endpoints para diagnóstico
# ----------------------------------------------------------------------------
@api_view(['POST'])
def test_ventas_create(request):
    """Endpoint de prueba para diagnosticar problemas con historial-ventas"""
    try:
        print("=== TEST VENTAS CREATE ===")
        print("Datos recibidos:", request.data)
        
        # Convertir datos (mismo código que en el viewset)
        data = request.data.copy()
        
        # Validaciones básicas
        required_fields = ['producto', 'cliente', 'empresa', 'fecha', 'factura', 'valor']
        for field in required_fields:
            if field not in data or not data[field]:
                return Response(
                    {"error": f"El campo '{field}' es obligatorio."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Asegurar cantidad
        if 'cantidad' not in data:
            data['cantidad'] = 1
        
        # Conversión de tipos básica
        try:
            # Convertir IDs a enteros
            for field in ['producto', 'cliente', 'empresa']:
                if field in data and data[field]:
                    data[field] = int(str(data[field]))
            
            # Convertir valores numéricos
            if 'valor' in data and data['valor']:
                if isinstance(data['valor'], str):
                    data['valor'] = float(data['valor'].replace(',', '.'))
                else:
                    data['valor'] = float(data['valor'])
                    
            if 'iva' in data and data['iva']:
                if isinstance(data['iva'], str):
                    data['iva'] = float(data['iva'].replace(',', '.'))
                else:
                    data['iva'] = float(data['iva'])
                    
            if 'cantidad' in data and data['cantidad']:
                data['cantidad'] = int(data['cantidad'])
                
        except (ValueError, TypeError) as e:
            return Response(
                {"error": f"Error de conversión de tipos: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # No intentamos guardar, solo devolvemos los datos procesados
        return Response({
            "success": True,
            "message": "Los datos parecen estar correctos",
            "procesado": data
        })
        
    except Exception as e:
        print("ERROR en test_ventas_create:", str(e))
        print("Tipo de error:", type(e).__name__)
        import traceback
        traceback.print_exc()
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
@api_view(['POST'])
def test_compras_create(request):
    """Endpoint de prueba para diagnosticar problemas con historial-compras"""
    try:
        print("=== TEST COMPRAS CREATE ===")
        print("Datos recibidos:", request.data)
        
        # Convertir datos (mismo código que en el viewset)
        data = request.data.copy()
        
        # Validaciones básicas
        required_fields = ['producto', 'proveedor', 'empresa', 'fecha', 'factura', 'valor']
        for field in required_fields:
            if field not in data or not data[field]:
                return Response(
                    {"error": f"El campo '{field}' es obligatorio."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Asegurar cantidad
        if 'cantidad' not in data:
            data['cantidad'] = 1
        
        # Conversión de tipos básica
        try:
            # Convertir IDs a enteros
            for field in ['producto', 'proveedor', 'empresa']:
                if field in data and data[field]:
                    data[field] = int(str(data[field]))
            
            # Convertir valores numéricos
            if 'valor' in data and data['valor']:
                if isinstance(data['valor'], str):
                    data['valor'] = float(data['valor'].replace(',', '.'))
                else:
                    data['valor'] = float(data['valor'])
                    
            if 'iva' in data and data['iva']:
                if isinstance(data['iva'], str):
                    data['iva'] = float(data['iva'].replace(',', '.'))
                else:
                    data['iva'] = float(data['iva'])
                    
            if 'cantidad' in data and data['cantidad']:
                data['cantidad'] = int(data['cantidad'])
                
        except (ValueError, TypeError) as e:
            return Response(
                {"error": f"Error de conversión de tipos: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # No intentamos guardar, solo devolvemos los datos procesados
        return Response({
            "success": True,
            "message": "Los datos parecen estar correctos",
            "procesado": data
        })
        
    except Exception as e:
        print("ERROR en test_compras_create:", str(e))
        print("Tipo de error:", type(e).__name__)
        import traceback
        traceback.print_exc()
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

