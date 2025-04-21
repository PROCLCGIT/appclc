"""
Sistema de manejo de excepciones y errores para toda la aplicación.
"""
import logging
import traceback
from django.db import IntegrityError, DataError, OperationalError
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException, ValidationError, NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework import status

# Configurar logger
logger = logging.getLogger('appclc.errors')

class ApplicationError(APIException):
    """
    Excepción base para errores de la aplicación.
    Permite crear errores específicos con código y mensaje.
    """
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = "Se produjo un error en la aplicación."
    
    def __init__(self, detail=None, code=None, status_code=None):
        if detail is None:
            detail = self.default_detail
            
        if status_code is not None:
            self.status_code = status_code
            
        super().__init__(detail, code)

class InvalidInputError(ApplicationError):
    """Error para datos de entrada inválidos"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Los datos proporcionados son inválidos."
    
class ResourceExistsError(ApplicationError):
    """Error para recurso ya existente (duplicado)"""
    status_code = status.HTTP_409_CONFLICT
    default_detail = "El recurso ya existe."
    
class ResourceNotFoundError(ApplicationError):
    """Error para recurso no encontrado"""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "El recurso solicitado no existe."
    
class DatabaseError(ApplicationError):
    """Error para problemas de base de datos"""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = "Error en la base de datos."
    
class OperationNotAllowedError(ApplicationError):
    """Error para operación no permitida por reglas de negocio"""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "La operación solicitada no está permitida."

def custom_exception_handler(exc, context):
    """
    Manejador personalizado de excepciones para toda la API.
    Unifica formato de respuesta y maneja excepciones específicas.
    
    Args:
        exc: Excepción capturada
        context: Contexto de la solicitud
        
    Returns:
        Response: Respuesta con formato unificado de error
    """
    # Primero intenta el manejador estándar
    response = exception_handler(exc, context)
    
    # Obtener detalles del contexto
    request = context.get('request')
    view = context.get('view')
    view_name = view.__class__.__name__ if view else 'Unknown'
    
    # Datos para logging
    log_data = {
        'exception_type': exc.__class__.__name__,
        'view': view_name,
        'method': request.method if request else 'Unknown',
        'path': request.path if request else 'Unknown',
        'user': str(request.user) if request and hasattr(request, 'user') else 'Anonymous',
    }
    
    # Si ya tenemos respuesta del manejador estándar
    if response is not None:
        # Añadir más contexto si es ValidationError
        if isinstance(exc, ValidationError):
            # Formatear errores de validación
            response.data = {
                'error': 'Datos inválidos',
                'detail': response.data,
                'code': 'validation_error'
            }
            logger.warning("Validation error", extra=log_data)
            
        elif isinstance(exc, NotFound) or isinstance(exc, Http404):
            response.data = {
                'error': 'Recurso no encontrado',
                'detail': str(exc),
                'code': 'not_found'
            }
            logger.info("Resource not found", extra=log_data)
            
        elif isinstance(exc, PermissionDenied):
            response.data = {
                'error': 'Permiso denegado',
                'detail': str(exc),
                'code': 'permission_denied'
            }
            logger.warning("Permission denied", extra=log_data)
            
        else:
            # Para otras excepciones manejadas por DRF
            error_msg = 'Error en la aplicación'
            if hasattr(exc, 'default_detail'):
                error_msg = exc.default_detail
                
            error_code = 'api_error'
            if hasattr(exc, 'default_code'):
                error_code = exc.default_code
                
            response.data = {
                'error': error_msg,
                'detail': response.data,
                'code': error_code
            }
            
        return response
        
    # Manejar excepciones no capturadas por DRF
    
    # Excepciones de la base de datos
    if isinstance(exc, IntegrityError):
        error_data = {
            'error': 'Error de integridad en la base de datos',
            'detail': str(exc),
            'code': 'integrity_error'
        }
        log_data['error_detail'] = str(exc)
        logger.error("Database integrity error", extra=log_data)
        return Response(error_data, status=status.HTTP_400_BAD_REQUEST)
        
    elif isinstance(exc, DataError):
        error_data = {
            'error': 'Error en los datos para la base de datos',
            'detail': str(exc),
            'code': 'data_error'
        }
        log_data['error_detail'] = str(exc)
        logger.error("Database data error", extra=log_data)
        return Response(error_data, status=status.HTTP_400_BAD_REQUEST)
        
    elif isinstance(exc, OperationalError):
        error_data = {
            'error': 'Error operacional en la base de datos',
            'detail': 'Se produjo un error al procesar la solicitud',
            'code': 'operational_error'
        }
        log_data['error_detail'] = str(exc)
        logger.critical("Database operational error", extra=log_data)
        return Response(error_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # Excepciones de validación de Django
    elif isinstance(exc, DjangoValidationError):
        error_detail = exc.message_dict if hasattr(exc, 'message_dict') else {'error': exc.messages}
        error_data = {
            'error': 'Error de validación',
            'detail': error_detail,
            'code': 'validation_error'
        }
        log_data['error_detail'] = str(exc)
        logger.warning("Django validation error", extra=log_data)
        return Response(error_data, status=status.HTTP_400_BAD_REQUEST)
        
    # Para nuestras excepciones personalizadas
    elif isinstance(exc, ApplicationError):
        error_data = {
            'error': str(exc.detail),
            'detail': getattr(exc, 'extra_detail', None),
            'code': getattr(exc, 'default_code', 'application_error')
        }
        log_data['error_detail'] = str(exc)
        logger.error(f"Application error: {exc.__class__.__name__}", extra=log_data)
        return Response(error_data, status=exc.status_code)
        
    # Manejar cualquier otra excepción no capturada
    # En producción, no mostrar detalles de excepción no manejada para evitar fugas de seguridad
    error_data = {
        'error': 'Error interno del servidor',
        'detail': str(exc) if settings.DEBUG else 'Se produjo un error inesperado',
        'code': 'server_error'
    }
    
    # Obtener el traceback para el log
    log_data['error_detail'] = str(exc)
    log_data['traceback'] = traceback.format_exc()
    logger.critical("Unhandled exception", extra=log_data)
    
    return Response(error_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def log_api_error(exc, view_name=None, request=None, user=None, extra_data=None):
    """
    Registra un error de API en los logs.
    Función auxiliar para usar en bloques try/except.
    
    Args:
        exc: Excepción capturada
        view_name: Nombre de la vista o componente
        request: Objeto request opcional
        user: Usuario opcional
        extra_data: Datos adicionales para incluir en el log
    """
    log_data = {
        'exception_type': exc.__class__.__name__,
        'view': view_name or 'Unknown',
        'error_detail': str(exc),
        'traceback': traceback.format_exc()
    }
    
    # Añadir información de la petición si está disponible
    if request:
        log_data.update({
            'method': request.method,
            'path': request.path,
            'user': str(request.user) if hasattr(request, 'user') else 'Anonymous',
            'data': str(request.data) if hasattr(request, 'data') else None
        })
    elif user:
        log_data['user'] = str(user)
    
    # Añadir datos extra
    if extra_data:
        log_data.update(extra_data)
    
    # Determinar el nivel de log según el tipo de excepción
    if isinstance(exc, (ValidationError, DjangoValidationError, InvalidInputError)):
        logger.warning(f"API Error: {exc.__class__.__name__}", extra=log_data)
    elif isinstance(exc, (NotFound, Http404, ResourceNotFoundError)):
        logger.info(f"API Error: {exc.__class__.__name__}", extra=log_data)
    elif isinstance(exc, (PermissionDenied, OperationNotAllowedError)):
        logger.warning(f"API Error: {exc.__class__.__name__}", extra=log_data)
    elif isinstance(exc, (IntegrityError, DataError)):
        logger.error(f"Database Error: {exc.__class__.__name__}", extra=log_data)
    elif isinstance(exc, OperationalError):
        logger.critical(f"Database Operational Error", extra=log_data)
    else:
        logger.error(f"Unhandled API Error: {exc.__class__.__name__}", extra=log_data)
