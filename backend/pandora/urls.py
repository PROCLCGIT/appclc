# blackend/pandora/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from . import views

app_name = 'pandora'

# Crear router para la API
router = DefaultRouter()

# Register ViewSets
router.register(r'zonas', views.ZonasViewSet, basename='zonas')
router.register(r'ciudades', views.CiudadesViewSet, basename='ciudades')
router.register(r'tipocliente', views.TipoClienteViewSet, basename='tipocliente')
router.register(r'clientes', views.ClientesViewSet, basename='clientes')
# router.register(r'pandora', views.PandoraViewSet, basename='pandora')
router.register(r'categorias', views.CategoriasViewSet, basename='categorias')
# router.register(r'especialidades', views.EspecialidadesViewSet, basename='especialidades')
# router.register(r'marca', views.MarcaViewSet, basename='marca')
# router.register(r'procedencia', views.ProcedenciaViewSet, basename='procedencia')
# router.register(r'tipocontratacion', views.TipoContratacionViewSet, basename='tipocontratacion')
# router.register(r'unidades', views.UnidadesViewSet, basename='unidades')
# router.register(r'empresasclc', views.EmpresaClcViewSet, basename='empresasclc')
# router.register(r'preciossie', views.PreciosSieViewSet, basename='preciossie')
# router.register(r'proveedores', views.ProveedoresViewSet, basename='proveedores')
# router.register(r'vendedores', views.VendedoresViewSet, basename='vendedores')
# router.register(r'procesosauditados', views.Procesos_auditadosViewSet, basename='procesosauditados')
# router.register(r'mspref', views.MsprefViewSet, basename='mspref')
# router.register(r'contactos', views.ContactosViewSet, basename='contactos')
# router.register(r'relacionesblue', views.RelacionesBlueViewSet, basename='relacionesblue')

# Nota: Estos ViewSets necesitan ser implementados en views.py
# para poder descomentar estas líneas

urlpatterns = [
    # Rutas del router principal
    path('', include(router.urls)),

    # Rutas de autenticación JWT
    path('auth/', include([
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    ])),

    # Extra routes for specific ViewSet actions
    path(
        'clientes/<int:pk>/historial/',
        views.ClientesViewSet.as_view({'get': 'historial'}),
        name='cliente-historial'
    ),
    path(
        'categorias/arbol/',
        views.CategoriasViewSet.as_view({'get': 'arbol'}),
        name='categorias-arbol'
    ),
    # path(
    #     'proveedores/<int:pk>/productos/',
    #     views.ProveedoresViewSet.as_view({'get': 'productos'}),
    #     name='proveedor-productos'
    # ),
    # path(
    #     'dashboard/resumen/',
    #     views.PandoraViewSet.as_view({'get': 'dashboard_resumen'}),
    #     name='dashboard-resumen'
    # ),
    # path(
    #     'estadisticas/general/',
    #     views.PandoraViewSet.as_view({'get': 'estadisticas_general'}),
    #     name='estadisticas-general'
    # ),
]
