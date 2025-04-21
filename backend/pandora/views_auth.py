"""
Vistas para autenticación y gestión de usuarios.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction

from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers_auth import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    UserProfileSerializer,
    UserDetailsSerializer,
)
from .logging import log_user_action

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    """Vista personalizada para obtener tokens JWT con info adicional"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Log de autenticación exitosa
            username = request.data.get('username', '')
            log_user_action(
                user=User.objects.filter(username=username).first(),
                action='login',
                resource_type='auth',
                details=f"Login exitoso desde IP: {self._get_client_ip(request)}"
            )
        
        return response
        
    def _get_client_ip(self, request):
        """Obtiene la IP real del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip

class LogoutView(APIView):
    """Vista para cerrar sesión (revocar token)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Obtener el token de refresco
            refresh_token = request.data.get('refresh_token')
            
            if not refresh_token:
                return Response(
                    {"error": "Se requiere el token de refresco"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Revocar el token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            # Log de cierre de sesión
            log_user_action(
                user=request.user,
                action='logout',
                resource_type='auth',
                details="Cierre de sesión exitoso"
            )
            
            return Response(
                {"message": "Sesión cerrada exitosamente"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Error al cerrar sesión: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

class RegisterView(generics.CreateAPIView):
    """Vista para registro de nuevos usuarios"""
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Crear usuario
        user = serializer.save()
        
        # Log de registro
        log_user_action(
            user=user,
            action='register',
            resource_type='user',
            resource_id=user.id,
            details="Registro de nuevo usuario"
        )
        
        # Generar tokens
        refresh = RefreshToken.for_user(user)
        
        # Devolver respuesta
        return Response(
            {
                "user": serializer.data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "message": "Usuario registrado exitosamente"
            },
            status=status.HTTP_201_CREATED
        )

class ChangePasswordView(generics.UpdateAPIView):
    """Vista para cambiar contraseña del usuario autenticado"""
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Actualizar contraseña
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Log de cambio de contraseña
        log_user_action(
            user=user,
            action='change_password',
            resource_type='user',
            resource_id=user.id,
            details="Cambio de contraseña"
        )
        
        return Response(
            {"message": "Contraseña actualizada exitosamente"},
            status=status.HTTP_200_OK
        )

class PasswordResetRequestView(generics.GenericAPIView):
    """Vista para solicitar reseteo de contraseña"""
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()
        
        if user:
            # Generar token para reseteo
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Construir URL de reseteo (frontend debería manejar esto)
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            
            # Enviar correo
            subject = "Reseteo de contraseña - AppCLC"
            message = f"""
            Hola {user.username},
            
            Has solicitado resetear tu contraseña. Usa el siguiente enlace:
            
            {reset_url}
            
            Este enlace es válido por 24 horas.
            
            Si no solicitaste este reseteo, ignora este correo.
            
            Saludos,
            Equipo AppCLC
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            # Log de solicitud de reseteo
            log_user_action(
                user=user,
                action='password_reset_request',
                resource_type='user',
                resource_id=user.id,
                details=f"Solicitud de reseteo de contraseña desde {request.META.get('REMOTE_ADDR', '')}"
            )
        
        # Siempre responder OK para no revelar si el email existe
        return Response(
            {"message": "Si existe una cuenta con este email, recibirás instrucciones para resetear tu contraseña."},
            status=status.HTTP_200_OK
        )

class PasswordResetConfirmView(generics.GenericAPIView):
    """Vista para confirmar reseteo de contraseña con token"""
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, uidb64, token):
        try:
            # Decodificar UID y obtener usuario
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            # Validar token
            if not default_token_generator.check_token(user, token):
                return Response(
                    {"error": "Token inválido o expirado"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar datos
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Actualizar contraseña
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Log de reseteo exitoso
            log_user_action(
                user=user,
                action='password_reset_confirm',
                resource_type='user',
                resource_id=user.id,
                details="Reseteo de contraseña exitoso"
            )
            
            return Response(
                {"message": "Contraseña restablecida exitosamente"},
                status=status.HTTP_200_OK
            )
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"error": "Enlace inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Vista para ver y actualizar perfil del usuario"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Log de actualización de perfil
        log_user_action(
            user=instance,
            action='update_profile',
            resource_type='user_profile',
            resource_id=instance.id,
            details="Actualización de perfil de usuario"
        )
        
        return Response(serializer.data)

class UserDetailsView(generics.RetrieveAPIView):
    """Vista para obtener detalles del usuario autenticado"""
    serializer_class = UserDetailsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
