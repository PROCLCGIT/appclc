# backend/blegal/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SriViewSet, SercopViewSet, SupercomViewSet, OtrasInstitucionesViewSet

router = DefaultRouter()
router.register(r'sri', SriViewSet)
router.register(r'sercop', SercopViewSet)
router.register(r'supercom', SupercomViewSet)
router.register(r'otrasinstituciones', OtrasInstitucionesViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
