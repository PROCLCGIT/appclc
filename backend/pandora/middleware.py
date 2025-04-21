"""
Middlewares personalizados para la aplicación.
Incluye monitoreo de rendimiento, logging, y manejo de Headers.
"""
import time
import logging
import re
import json
from django.utils.deprecation import MiddlewareMixin
from django.db import connection, reset_queries
from django.conf import settings

# Configurar logger
logger = logging.getLogger('appclc')

class PerformanceMonitorMiddleware(MiddlewareMixin):
    """
    Middleware para monitorear el rendimiento de las peticiones.
    Registra tiempo de ejecución y consultas a la base de datos.
    """
    
    def process_request(self, request):
        """Inicializa contadores y timers"""
        request.start_time = time.time()
        
        # Resetear contadores de DB en modo DEBUG
        if settings.DEBUG:
            reset_queries()
            
        return None
    
    def process_response(self, request, response):
        """Calcula métricas y las registra"""
        # Solo procesar si hay tiempo de inicio
        if not hasattr(request, 'start_time'):
            return response
            
        # Calcular tiempo de respuesta
        duration = time.time() - request.start_time
        
        # Determinar si es una llamada a la API
        is_api_call = request.path.startswith('/api/')
        
        # Registrar en el log si la petición tarda demasiado
        threshold = 1.0  # segundos
        
        if duration > threshold:
            # Datos para el log
            log_data = {
                'path': request.path,
                'method': request.method,
                'duration': f"{duration:.3f}s",
                'status': response.status_code,
                'user': str(request.user) if hasattr(request, 'user') else 'Anonymous',
            }
            
            # Añadir datos de consultas en modo DEBUG
            if settings.DEBUG:
                queries_count = len(connection.queries)
                queries_time = sum(float(q['time']) for q in connection.queries if 'time' in q)
                
                log_data.update({
                    'queries_count': queries_count,
                    'queries_time': f"{queries_time:.3f}s",
                })
                
                # Detectar problemas N+1
                if queries_count > 10:
                    # Contar consultas repetidas
                    queries = [q['sql'] for q in connection.queries]
                    duplicates = {}
                    
                    for q in queries:
                        # Normalizar consulta (quitar valores)
                        normalized = re.sub(r'\'.*?\'|[0-9]+', 'X', q)
                        duplicates[normalized] = duplicates.get(normalized, 0) + 1
                    
                    # Informar de posibles N+1
                    n_plus_1 = {q: count for q, count in duplicates.items() if count > 3}
                    if n_plus_1:
                        log_data['n_plus_1_detected'] = True
                        log_data['duplicated_queries'] = n_plus_1
            
            # Registrar según la gravedad
            if duration > 3.0:
                logger.warning(f"Petición lenta: {request.path}", extra=log_data)
            else:
                logger.info(f"Petición demorada: {request.path}", extra=log_data)
            
        # Añadir header con tiempo de respuesta para API
        if is_api_call:
            response['X-Response-Time'] = f"{duration:.3f}s"
            
            # Añadir datos de consultas en modo DEBUG
            if settings.DEBUG:
                queries_count = len(connection.queries)
                response['X-Queries-Count'] = str(queries_count)
                
        return response

class RequestLoggerMiddleware(MiddlewareMixin):
    """
    Middleware para registrar todas las peticiones en modo DEBUG.
    """
    
    def process_request(self, request):
        """Registra detalles de la petición en modo DEBUG"""
        if settings.DEBUG:
            # Preparar datos para el log
            log_data = {
                'path': request.path,
                'method': request.method,
                'client_ip': self._get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', '-'),
                'user': str(request.user) if hasattr(request, 'user') and request.user.is_authenticated else 'Anonymous',
            }
            
            # Incluir GET/POST data (con cuidado para no exponer info sensible)
            if request.method == 'GET':
                log_data['query_params'] = dict(request.GET)
            elif request.method in ('POST', 'PUT', 'PATCH'):
                # Determinar si es multipart (archivos) o data normal
                if request.content_type and 'multipart/form-data' in request.content_type:
                    log_data['data'] = 'Multipart form data (files)'
                else:
                    # Intentar obtener datos pero sanitizar info sensible
                    data = self._sanitize_data(request.POST or {})
                    log_data['data'] = data
            
            # Registrar la petición
            logger.debug(f"Petición: {request.method} {request.path}", extra=log_data)
            
        return None
    
    def _get_client_ip(self, request):
        """Obtiene la IP real del cliente considerando proxies"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip
    
    def _sanitize_data(self, data):
        """Sanitiza datos sensibles antes de registrarlos"""
        sensitive_fields = ['password', 'token', 'key', 'secret', 'passwd', 
                           'authorization', 'credit_card', 'cc_number']
        
        # Convertir a dict si es QueryDict u otro tipo
        if hasattr(data, 'dict'):
            data = data.dict()
        
        # Sanitizar campos sensibles
        sanitized = {}
        for key, value in data.items():
            if any(pattern in key.lower() for pattern in sensitive_fields):
                sanitized[key] = '******'
            else:
                sanitized[key] = value
                
        return sanitized

class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware para añadir headers de seguridad a las respuestas.
    """
    
    def process_response(self, request, response):
        """Añade diversos headers de seguridad"""
        # Content Security Policy
        if not response.has_header('Content-Security-Policy'):
            response['Content-Security-Policy'] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data:; "
                "font-src 'self'; "
                "connect-src 'self'"
            )
        
        # X-Content-Type-Options
        response['X-Content-Type-Options'] = 'nosniff'
        
        # X-Frame-Options
        response['X-Frame-Options'] = 'DENY'
        
        # X-XSS-Protection
        response['X-XSS-Protection'] = '1; mode=block'
        
        # Referrer-Policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Feature-Policy / Permissions-Policy
        response['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
        
        return response
