# backend/blegal/views.py
from rest_framework import viewsets, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Sri, Sercop, Supercom, OtrasInstituciones
from .serializers import SriSerializer, SercopSerializer, SupercomSerializer, OtrasInstitucionesSerializer

class SriViewSet(viewsets.ModelViewSet):
    queryset = Sri.objects.all()
    serializer_class = SriSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

class SercopViewSet(viewsets.ModelViewSet):
    queryset = Sercop.objects.all()
    serializer_class = SercopSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

class SupercomViewSet(viewsets.ModelViewSet):
    queryset = Supercom.objects.all()
    serializer_class = SupercomSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

class OtrasInstitucionesViewSet(viewsets.ModelViewSet):
    queryset = OtrasInstituciones.objects.all()
    serializer_class = OtrasInstitucionesSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
