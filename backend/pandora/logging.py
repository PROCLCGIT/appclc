"""
Configuración y utilidades de logging avanzado para la aplicación.
"""
import logging
import time
import functools

class QueryCountHandler(logging.Handler):
    """Handler personalizado para contar y registrar consultas a la base de datos"""
    def __init__(self, level=logging.DEBUG):
        super().__init__(level)
        self.queries = []
        self.count = 0
        
    def emit(self, record):
        if hasattr(record, 'duration'):
            self.count += 1
            self.queries.append({
                'sql': record.sql,
                'duration': record.duration,
                'params': record.params
            })
    
    def reset(self):
        self.queries = []
        self.count = 0

def get_query_handler():
    """Obtiene o crea un handler de conteo de consultas para DB"""
    logger = logging.getLogger('django.db.backends')
    
    # Buscar si ya existe un handler del tipo QueryCountHandler
    for handler in logger.handlers:
        if isinstance(handler, QueryCountHandler):
            return handler
    
    # Si no existe, crear uno nuevo y agregarlo
    handler = QueryCountHandler()
    logger.addHandler(handler)
    return handler

def log_execution_time(logger=None, level=logging.INFO):
    """
    Decorador que registra el tiempo de ejecución de una función.
    
    Args:
        logger: Logger a usar (si no se especifica, usa el de la aplicación)
        level: Nivel de logging a usar
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Obtener el logger correcto
            _logger = logger or logging.getLogger(func.__module__)
            
            # Medir tiempo de ejecución
            start_time = time.time()
            
            # Monitorear consultas de DB
            query_handler = get_query_handler()
            query_handler.reset()
            old_level = logging.getLogger('django.db.backends').level
            logging.getLogger('django.db.backends').setLevel(logging.DEBUG)
            
            try:
                result = func(*args, **kwargs)
                elapsed = time.time() - start_time
                
                # Registrar tiempo y consultas
                _logger.log(
                    level,
                    f"{func.__name__} executed in {elapsed:.3f}s with {query_handler.count} queries"
                )
                
                if query_handler.count > 10:  # Umbral para alerta de N+1
                    _logger.warning(
                        f"Possible N+1 issue: {func.__name__} executed {query_handler.count} queries"
                    )
                
                return result
            finally:
                logging.getLogger('django.db.backends').setLevel(old_level)
        return wrapper
    return decorator

def setup_audit_logging():
    """Configura el logging para auditoría de acciones de usuarios"""
    audit_logger = logging.getLogger('appclc.audit')
    
    # Crear handler para archivo de auditoría si no existe
    if not any(isinstance(h, logging.FileHandler) for h in audit_logger.handlers):
        import os
        from logging.handlers import RotatingFileHandler
        from django.conf import settings
        
        log_dir = os.path.join(settings.BASE_DIR, 'logs')
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
            
        handler = RotatingFileHandler(
            os.path.join(log_dir, 'audit.log'),
            maxBytes=5*1024*1024,  # 5MB
            backupCount=10,
            encoding='utf-8'
        )
        
        formatter = logging.Formatter(
            '%(asctime)s [%(levelname)s] %(message)s',
            '%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        audit_logger.addHandler(handler)
        audit_logger.setLevel(logging.INFO)

def log_user_action(user, action, resource_type, resource_id=None, details=None):
    """
    Registra una acción de usuario para auditoría.
    
    Args:
        user: Usuario que realizó la acción
        action: Acción realizada (create, update, delete, view, etc.)
        resource_type: Tipo de recurso afectado (modelo)
        resource_id: ID del recurso (opcional)
        details: Detalles adicionales (opcional)
    """
    setup_audit_logging()
    logger = logging.getLogger('appclc.audit')
    
    user_id = getattr(user, 'id', 'anonymous')
    username = getattr(user, 'username', 'anonymous')
    
    message = f"User {user_id} ({username}) {action} {resource_type}"
    if resource_id:
        message += f" {resource_id}"
    if details:
        message += f": {details}"
        
    logger.info(message)
