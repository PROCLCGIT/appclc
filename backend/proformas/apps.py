from django.apps import AppConfig
import os


class ProformasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'proformas'
    
    def ready(self):
        """Importar señales cuando la aplicación está lista"""
        # Determinar qué versión de las señales cargar
        use_optimized = os.environ.get('USE_OPTIMIZED_PROFORMAS', 'False').lower() in ('true', 't', '1', 'yes')
        
        if use_optimized:
            import proformas.signals_optimized as signals
        else:
            import proformas.signals as signals