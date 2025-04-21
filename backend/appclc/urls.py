"""
Configuración de URLs principal del proyecto.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Configuración de Swagger/OpenAPI
schema_view = get_schema_view(
    openapi.Info(
        title="AppCLC API",
        default_version='v1',
        description="API para el sistema de gestión empresarial AppCLC",
        terms_of_service="https://www.appclc.com/terms/",
        contact=openapi.Contact(email="contact@appclc.com"),
        license=openapi.License(name="Licencia Privada"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny if settings.DEBUG else permissions.IsAuthenticated],
)

# URLs para Swagger/OpenAPI
swagger_urls = [
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# URLs del proyecto
urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Redirección desde la raíz al swagger
    path('', RedirectView.as_view(url='/swagger/', permanent=False)),
    
    # Documentación API
    *swagger_urls,
    
    # API endpoints
    path('api/auth/', include('pandora.urls_auth')),
    path('api/core/', include('pandora.urls')),
    path('api/products/', include('products.urls')),
    path('api/proformas/', include('proformas.urls')),
    path('api/blegal/', include('blegal.urls')),
    path('api/brief/', include('brief.urls')),
    path('api/docmanager/', include('docmanager.urls')),
    
    # API versionada (si se implementa en el futuro)
    # path('api/v1/', include([
    #     path('auth/', include('pandora.urls_auth')),
    #     path('core/', include('pandora.urls')),
    #     path('products/', include('products.urls')),
    #     ...
    # ])),
]

# Configuración para servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # URLs de debug
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
