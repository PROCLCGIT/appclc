from django.apps import AppConfig


class ProformasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'proformas'
    
    def ready(self):
        """Importar señales cuando la aplicación está lista"""
        import proformas.signals  # noqa
