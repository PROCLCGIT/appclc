# auth_views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class NoThrottlePolicy:
    """
    Clase de throttling que no aplica límites
    """
    def allow_request(self, request, view):
        return True

class MyTokenObtainPairView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    throttle_classes = [NoThrottlePolicy]  # Desactivar throttling para esta vista
