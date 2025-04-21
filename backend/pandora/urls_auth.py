"""
Configuración de URLs para autenticación.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views_auth import (
    CustomTokenObtainPairView,
    LogoutView,
    RegisterView,
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    UserProfileView,
    UserDetailsView,
)

urlpatterns = [
    # Autenticación con JWT
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    
    # Registro de usuarios
    path('register/', RegisterView.as_view(), name='auth_register'),
    
    # Gestión de contraseñas
    path('password/change/', ChangePasswordView.as_view(), name='password_change'),
    path('password/reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/<str:uidb64>/<str:token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Perfil y detalles de usuario
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('me/', UserDetailsView.as_view(), name='user_details'),
]
