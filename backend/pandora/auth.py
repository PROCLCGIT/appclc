"""
Módulo de autenticación y seguridad mejorada.
Contiene implementaciones y extensiones para JWT y manejo de permisos.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import jwt
from jwt.exceptions import InvalidTokenError

class EnhancedJWTAuthentication(JWTAuthentication):
    """Autenticación JWT con validaciones y seguridad adicional"""
    
    def authenticate(self, request):
        """Método sobreescrito para agregar validaciones adicionales"""
        # Primero hacemos la autenticación básica de JWT
        auth_result = super().authenticate(request)
        
        if auth_result is None:
            # No se proporcionó token, dejamos que la cadena de autenticación siga
            return None
            
        user, token = auth_result
        
        # Verificar si el usuario está activo
        if not user.is_active:
            raise AuthenticationFailed('El usuario ha sido desactivado')
            
        # Validar roles y permisos específicos aquí si es necesario
        
        # Se podría validar IP contra la almacenada en el token para
        # prevenir reutilización de tokens en otros dispositivos
        client_ip = self.get_client_ip(request)
        token_ip = token.get('client_ip', None)
        
        # Un sistema más robusto debería validar el IP almacenado en el token
        # por razones de demostración, solo lo loggeamos
        if token_ip and client_ip != token_ip:
            # Importante: En un escenario real podrías invalidar el token aquí
            import logging
            logger = logging.getLogger('appclc.security')
            logger.warning(
                f"Token posiblemente reutilizado por otra IP. Token: {token_ip}, Cliente: {client_ip}"
            )
            
        return auth_result
        
    def get_client_ip(self, request):
        """Obtiene la IP real del cliente, considerando proxies"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
        if x_forwarded_for:
            # Si pasa por un proxy, la primera IP es la del cliente
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip

def get_tokens_for_user(user, request=None):
    """
    Genera tokens JWT para un usuario con metadata adicional
    
    Args:
        user: Usuario para el que se generan los tokens
        request: Objeto request opcional para obtener metadata del contexto
    
    Returns:
        Dict: Diccionario con tokens de acceso y refresco
    """
    refresh = RefreshToken.for_user(user)
    
    # Añadir claims adicionales al token
    refresh['username'] = user.username
    refresh['user_id'] = user.id
    
    # Si hay roles o permisos personalizados, los añadiríamos aquí
    if hasattr(user, 'role'):
        refresh['role'] = user.role
        
    # Si tenemos acceso al request, podemos añadir información del contexto
    if request:
        refresh['client_ip'] = get_client_ip(request)
        refresh['user_agent'] = request.META.get('HTTP_USER_AGENT', '')

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def get_client_ip(request):
    """Obtiene la IP real del cliente, considerando proxies"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '')
    return ip

class HasModulePermission(BasePermission):
    """
    Permite acceso solo si el usuario tiene permiso para un módulo específico.
    Pensado para controlar acceso a nivel de módulo de la aplicación.
    """
    message = "No tiene permisos para acceder a este módulo."
    
    def __init__(self, module_name):
        self.module_name = module_name
        self.permission_name = f'access_{module_name}'
    
    def has_permission(self, request, view):
        # Verificar si el usuario está autenticado
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Si es superusuario, siempre tiene permiso
        if request.user.is_superuser:
            return True
            
        # Verificar permiso específico de módulo en el modelo de usuario
        # (esto asume que has añadido esta funcionalidad)
        if hasattr(request.user, 'has_module_permission'):
            return request.user.has_module_permission(self.module_name)
            
        # Fallback al sistema de permisos de Django
        return request.user.has_perm(f'appclc.{self.permission_name}')

class IsOwnerOrAdmin(BasePermission):
    """
    Comprueba si el usuario es dueño del objeto o un administrador.
    Para modelos que tienen un campo 'created_by' o 'user'.
    """
    message = "Solo el creador o un administrador puede acceder a este recurso."
    
    def has_object_permission(self, request, view, obj):
        # Los administradores siempre tienen acceso
        if request.user.is_superuser:
            return True
            
        # Verificar si el usuario es el creador
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
            
        # Si no tiene ningún campo de propiedad, denegar acceso
        return False

def verify_token(token):
    """
    Verifica un token JWT sin utilizar DRF, útil para webhooks o sistemas externos.
    
    Args:
        token: Token JWT a verificar
        
    Returns:
        Tuple: (is_valid, payload) - is_valid es booleano, payload es el contenido del token
    """
    try:
        # Decodificar token con la clave secreta de Django
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=['HS256']
        )
        return True, payload
    except InvalidTokenError:
        return False, None
