"""
Serializadores para autenticación y gestión de usuarios.
"""
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer personalizado para obtener tokens JWT.
    Añade información adicional como rol, permisos y datos de usuario.
    """
    
    @classmethod
    def get_token(cls, user):
        """Añade claims personalizados al token JWT"""
        token = super().get_token(user)
        
        # Añadir claims personalizados
        token['username'] = user.username
        token['email'] = user.email
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        
        # Añadir grupos/roles si se utilizan
        token['groups'] = list(user.groups.values_list('name', flat=True))
        
        # Para formato uniforme en respuestas
        token['user_id'] = user.id
        
        return token
    
    def validate(self, attrs):
        """Valida credenciales y añade datos de usuario a la respuesta"""
        data = super().validate(attrs)
        
        # Añadir datos de usuario a la respuesta
        user = self.user
        data.update({
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'groups': list(user.groups.values_list('name', flat=True))
        })
        
        return data

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer para registrar nuevos usuarios"""
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }
    
    def validate(self, attrs):
        """Valida que las contraseñas coincidan y que el email sea único"""
        # Verificar que las contraseñas coincidan
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {"password_confirm": _("Las contraseñas no coinciden")}
            )
        
        # Verificar que el email no esté en uso
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                {"email": _("Este email ya está en uso")}
            )
            
        # Validar política de contraseñas
        try:
            validate_password(attrs['password'])
        except Exception as e:
            raise serializers.ValidationError({"password": list(e)})
        
        return attrs
    
    def create(self, validated_data):
        """Crea un nuevo usuario"""
        # Eliminar campo de confirmación
        validated_data.pop('password_confirm')
        
        # Crear usuario
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_active=True
        )
        
        # Establecer contraseña
        user.set_password(validated_data['password'])
        user.save()
        
        return user

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer para cambiar contraseña"""
    current_password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Valida contraseña actual y que las nuevas coincidan"""
        user = self.context['request'].user
        
        # Verificar contraseña actual
        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError(
                {"current_password": _("Contraseña actual incorrecta")}
            )
            
        # Verificar que la nueva contraseña no sea igual a la actual
        if attrs['current_password'] == attrs['new_password']:
            raise serializers.ValidationError(
                {"new_password": _("La nueva contraseña debe ser diferente a la actual")}
            )
        
        # Verificar que las nuevas contraseñas coincidan
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {"confirm_password": _("Las nuevas contraseñas no coinciden")}
            )
            
        # Validar política de contraseñas
        try:
            validate_password(attrs['new_password'], user=user)
        except Exception as e:
            raise serializers.ValidationError({"new_password": list(e)})
        
        return attrs

class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer para solicitar reseteo de contraseña"""
    email = serializers.EmailField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer para confirmar reseteo de contraseña"""
    new_password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Valida que las contraseñas coincidan"""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {"confirm_password": _("Las contraseñas no coinciden")}
            )
            
        # Validar política de contraseñas
        try:
            validate_password(attrs['new_password'])
        except Exception as e:
            raise serializers.ValidationError({"new_password": list(e)})
        
        return attrs

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer para ver y editar perfil de usuario"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'username', 'email']
        
    def validate_email(self, value):
        """Verificar que el email no esté en uso por otro usuario"""
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError(_("Este email ya está en uso"))
        return value

class UserDetailsSerializer(serializers.ModelSerializer):
    """Serializer para detalles de usuario (solo lectura)"""
    full_name = serializers.SerializerMethodField()
    groups = serializers.StringRelatedField(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'full_name', 'is_staff', 'is_superuser', 'groups', 
                 'date_joined', 'last_login']
        read_only_fields = fields
    
    def get_full_name(self, obj):
        """Obtiene el nombre completo del usuario"""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.username
