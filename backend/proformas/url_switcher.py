"""
Módulo para alternar entre URLs originales y optimizadas.

Este módulo proporciona una forma flexible de seleccionar entre las URLs originales
y las URLs optimizadas basado en configuración de entorno, facilitando pruebas y
despliegue progresivo.
"""
import os


def get_proformas_urlpatterns():
    """
    Determina qué módulo de URLs utilizar basado en la variable de entorno.
    
    Returns:
        Un objeto urlpatterns que incluye las URLs de proformas apropiadas.
    """
    use_optimized = os.environ.get('USE_OPTIMIZED_PROFORMAS', 'False').lower() in ('true', 't', '1', 'yes')
    
    if use_optimized:
        from proformas.urls_optimized import urlpatterns
    else:
        from proformas.urls import urlpatterns
    
    return urlpatterns


# Función auxiliar para acceder a las URLs desde el exterior
def include_proformas_urls():
    """
    Incluye las URLs de proformas con el namespace adecuado.
    
    Returns:
        Un tuple (urlpatterns, app_namespace) para incluir en urlpatterns principales.
    """
    return (get_proformas_urlpatterns(), 'proformas')