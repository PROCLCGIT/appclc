# backend/brief/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'brief'

# Crear router para la API
router = DefaultRouter()

# Registrar los viewsets
router.register(r'briefs', views.BriefViewSet, basename='briefs')
router.register(r'briefitems', views.BriefItemsViewSet, basename='briefitems')

urlpatterns = [
    # Rutas del router principal
    path('', include(router.urls)),
    
    # Rutas adicionales que llaman acciones específicas en los ViewSets
    path(
        'briefs/<int:pk>/items/',
        views.BriefViewSet.as_view({'get': 'items'}),
        name='brief-items'
    ),
    path(
        'briefs/stats/',
        views.BriefViewSet.as_view({'get': 'stats'}),
        name='brief-stats'
    ),
]