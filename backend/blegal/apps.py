from django.apps import AppConfig


class BlegalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'blegal'
    verbose_name = 'Base Legal'  # Nombre visible en el panel de administración
