# backend/brief/serializers.py
from rest_framework import serializers
from .models import Brief, BriefItems
from pandora.serializers import AuditedModelSerializer as BaseModelSerializer


class BriefItemsSerializer(BaseModelSerializer):
    unidad_nombre = serializers.ReadOnlyField(source='unidad.nombre')

    class Meta:
        model = BriefItems
        fields = [
            'id',
            'id_brief',
            'nombre',
            'cudim',
            'descripcion',
            'unidad',
            'unidad_nombre',
            'cantidad',
            'created_at',
            'updated_at',
            'history',
        ]
        
    def to_representation(self, instance):
        """Asegura que unidad_nombre se maneje correctamente aunque unidad sea None"""
        representation = super().to_representation(instance)
        
        # Verificar que unidad existe antes de intentar acceder a su nombre
        if instance.unidad is None:
            representation['unidad_nombre'] = None
            
        return representation


class BriefSerializer(BaseModelSerializer):
    cliente_nombre = serializers.ReadOnlyField(source='cliente.nombre')
    items = BriefItemsSerializer(many=True, read_only=True)
    
    class Meta:
        model = Brief
        fields = [
            'id',
            'codigo',
            'origen',
            'fecha',
            'presupuestoref',
            'observaciones',
            'cliente',
            'cliente_nombre',
            'items',
            'created_at',
            'updated_at',
            'history',
        ]
        
    def to_representation(self, instance):
        """Asegura que cliente_nombre se maneje correctamente aunque cliente sea None"""
        representation = super().to_representation(instance)
        
        # Verificar que cliente existe antes de intentar acceder a su nombre
        if instance.cliente is None:
            representation['cliente_nombre'] = None
            
        return representation