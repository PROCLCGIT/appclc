# backend/blegal/serializers.py
from rest_framework import serializers
from .models import Sri, Sercop, Supercom, OtrasInstituciones

class SriSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sri
        fields = '__all__'

class SercopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sercop
        fields = '__all__'

class SupercomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supercom
        fields = '__all__'

class OtrasInstitucionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = OtrasInstituciones
        fields = '__all__'
