# appclc/urls.py
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from appclc.auth_views import MyTokenObtainPairView

schema_view = get_schema_view(
    openapi.Info(
        title="Pandora API",
        default_version='v1',
        description="API para el sistema Pandora",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@pandora.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # API URLs (incluyendo autenticación)
    path('api/v1/', include([
        path('pandora/', include('pandora.urls')),
        path('products/', include('products.urls')),
        path('proformas/', include('proformas.urls', namespace='proformas')),
        path('blegal/', include('blegal.urls')),
        path('brief/', include('brief.urls')),
        path('docmanager/', include('docmanager.urls')),
        path('auth/', include([
            path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
            path('login/', MyTokenObtainPairView.as_view(), name='login_no_throttle'),  # Ruta adicional para login sin limitaciones
            path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
            path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
            ])),
    ])),    

    path('api-auth/', include('rest_framework.urls')),

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]



if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

admin.site.site_header = "Pandora Admin"
admin.site.site_title = "Portal de Administración Pandora"
admin.site.index_title = "Bienvenido al Portal de Administración de Pandora"
