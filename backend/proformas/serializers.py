# //backend/appclc/proformas/serializers.py
from rest_framework import serializers
from .models import Proforma, ProformaItem, ProformaHistory
from products.serializers import ProductSerializer
from pandora.serializers import ClientesSerializer

class ProformaItemSerializer(serializers.ModelSerializer):
    """Serializer para los ítems de la proforma"""
    product_detail = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = ProformaItem
        fields = [
            'id', 'product', 'product_detail', 'description', 
            'quantity', 'unit_price', 'discount_percentage', 'total'
        ]
        read_only_fields = ['total']

    def validate(self, data):
        # Validaciones a nivel de serializer
        if data['quantity'] <= 0:
            raise serializers.ValidationError({
                "quantity": "La cantidad debe ser mayor a 0."
            })
        if data['unit_price'] <= 0:
            raise serializers.ValidationError({
                "unit_price": "El precio unitario debe ser mayor a 0."
            })
        discount = data.get('discount_percentage', 0)
        if discount < 0 or discount > 100:
            raise serializers.ValidationError({
                "discount_percentage": "El descuento debe estar entre 0 y 100."
            })
        return data

class ProformaHistorySerializer(serializers.ModelSerializer):
    """Serializer para el historial de cambios"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ProformaHistory
        fields = ['id', 'created_at', 'user', 'user_name', 'action', 'details']
        read_only_fields = ['created_at', 'user']

class ProformaSerializer(serializers.ModelSerializer):
    """Serializer principal para proformas"""
    items = ProformaItemSerializer(many=True, required=False)
    history = ProformaHistorySerializer(many=True, read_only=True)
    client_detail = ClientesSerializer(source='client', read_only=True)
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    sales_person_name = serializers.CharField(source='sales_person.username', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Proforma
        fields = [
            'id', 'number', 'date', 'valid_until',
            'client', 'client_detail',
            'payment_terms', 'delivery_time',
            'sales_person', 'sales_person_name',
            'subtotal', 'tax', 'total',
            'status', 'status_display',
            'notes', 'terms_conditions',
            'items', 'history',
            'created_at', 'updated_at',
            'created_by', 'created_by_name'
        ]
        read_only_fields = [
            'number', 'subtotal', 'tax', 'total',
            'created_at', 'updated_at', 'created_by'
        ]

    def create(self, validated_data):
        """
        Creación de la proforma y sus ítems.
        """
        # Extraer ítems embebidos (si los hay)
        items_data = validated_data.pop('items', [])

        # Crear la proforma en DB
        proforma = Proforma.objects.create(**validated_data)

        # Crear cada ítem de la proforma
        for item_data in items_data:
            ProformaItem.objects.create(proforma=proforma, **item_data)

        # En la lógica actual, `ProformaItem.save()` ya recalcula los totales
        # pero si deseas forzar el cálculo de totales aquí:
        proforma.calculate_totals()
        proforma.save()

        # Registrar creación en el historial
        # Nota: "created_by" llega desde perform_create en la View (proforma.created_by = request.user).
        ProformaHistory.objects.create(
            proforma=proforma,
            user=proforma.created_by,  # O self.context['request'].user si lo deseas
            action='created',
            details='Proforma creada'
        )
        return proforma

    def update(self, instance, validated_data):
        """
        Actualización de la proforma y recreación de ítems si es necesario.
        """
        items_data = validated_data.pop('items', None)

        # Actualizar campos de la proforma
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Si se envían ítems, se eliminan los existentes y se crean los nuevos
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                ProformaItem.objects.create(proforma=instance, **item_data)

            # Recalcular totales
            instance.calculate_totals()
            instance.save()

            # Registrar en el historial
            ProformaHistory.objects.create(
                proforma=instance,
                user=self.context['request'].user,  # Quien hace la modificación
                action='updated',
                details='Items de proforma actualizados'
            )
        return instance

    def validate(self, data):
        """
        Validaciones adicionales a nivel de Proforma completa.
        """
        # Validar que valid_until sea posterior a date (si se cambian ambos)
        proforma_date = data.get(
            'date',
            self.instance.date if self.instance else None
        )
        if 'valid_until' in data and data['valid_until'] < proforma_date:
            raise serializers.ValidationError({
                "valid_until": "La fecha de validez debe ser posterior a la fecha de emisión."
            })

        # Validar que exista al menos un item en creación
        if not self.instance and not self.initial_data.get('items', []):
            raise serializers.ValidationError({
                "items": "La proforma debe tener al menos un ítem."
            })
        return data
