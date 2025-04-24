"""
Permisos personalizados para el módulo de proformas.

Define clases de permisos para controlar el acceso a las diferentes acciones
sobre proformas según el rol del usuario.
"""
from rest_framework import permissions
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from .models import Proforma


class RoleBasedPermission(permissions.BasePermission):
    """
    Base para permisos basados en roles.
    Verifica si el usuario pertenece a un grupo específico.
    """
    required_groups = []  # Lista de grupos permitidos

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Los superusuarios tienen todos los permisos
        if request.user.is_superuser:
            return True
            
        # Verificar pertenencia a grupos requeridos
        if self.required_groups:
            return request.user.groups.filter(name__in=self.required_groups).exists()
            
        return False


class CanViewProformas(RoleBasedPermission):
    """Permiso para ver cualquier proforma."""
    required_groups = ['Vendedor', 'Supervisor', 'Administrativo']
    
    def has_permission(self, request, view):
        # Solo permitir métodos de lectura (GET, HEAD, OPTIONS)
        if request.method not in permissions.SAFE_METHODS:
            return False
            
        return super().has_permission(request, view)


class CanCreateProformas(RoleBasedPermission):
    """Permiso para crear proformas."""
    required_groups = ['Vendedor', 'Supervisor']
    
    def has_permission(self, request, view):
        # Solo permitir método POST
        if request.method != 'POST':
            return False
            
        return super().has_permission(request, view)


class ProformaAccessPermission(permissions.BasePermission):
    """
    Permisos detallados para proformas basados en el estado actual
    y la relación del usuario con la proforma.
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Verifica permisos a nivel de objeto (proforma específica).
        
        Las reglas son:
        - Superusuarios tienen acceso completo
        - Creadores tienen acceso completo a sus proformas
        - Supervisores tienen acceso completo a todas las proformas
        - Administrativos pueden ver todas las proformas pero no editarlas
        - Vendedores pueden editar proformas en borrador y ver las demás
        """
        user = request.user
        
        # Superusuarios tienen acceso completo
        if user.is_superuser:
            return True
            
        # El creador tiene acceso completo a sus propias proformas
        if obj.created_by == user:
            return True
            
        # Verificar rol del usuario
        is_supervisor = user.groups.filter(name='Supervisor').exists()
        is_admin = user.groups.filter(name='Administrativo').exists()
        is_vendedor = user.groups.filter(name='Vendedor').exists()
        
        # Supervisor tiene acceso completo
        if is_supervisor:
            return True
            
        # Administrativo solo puede ver
        if is_admin:
            return request.method in permissions.SAFE_METHODS
        
        # Vendedor puede editar borradores y ver el resto
        if is_vendedor:
            if request.method in permissions.SAFE_METHODS:
                return True
            # Solo puede editar/eliminar proformas en estado borrador
            return obj.estado == 'borrador'
            
        return False


class CanApproveProformas(permissions.BasePermission):
    """Permiso para aprobar proformas."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Solo supervisores y administrativos pueden aprobar
        return request.user.is_superuser or request.user.groups.filter(
            name__in=['Supervisor', 'Administrativo']
        ).exists()
    
    def has_object_permission(self, request, view, obj):
        """Solo se pueden aprobar proformas en estado 'enviada'"""
        if not self.has_permission(request, view):
            return False
            
        # Solo se pueden aprobar proformas enviadas
        return obj.estado == 'enviada'


class CanRejectProformas(permissions.BasePermission):
    """Permiso para rechazar proformas."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Solo supervisores y administrativos pueden rechazar
        return request.user.is_superuser or request.user.groups.filter(
            name__in=['Supervisor', 'Administrativo']
        ).exists()
    
    def has_object_permission(self, request, view, obj):
        """Solo se pueden rechazar proformas en estado 'enviada'"""
        if not self.has_permission(request, view):
            return False
            
        # Solo se pueden rechazar proformas enviadas
        return obj.estado == 'enviada'


class CanSendProformas(permissions.BasePermission):
    """Permiso para enviar proformas a clientes."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Vendedores y supervisores pueden enviar proformas
        return request.user.is_superuser or request.user.groups.filter(
            name__in=['Vendedor', 'Supervisor']
        ).exists()
    
    def has_object_permission(self, request, view, obj):
        """
        Solo se pueden enviar proformas en estado 'borrador'.
        El creador o un supervisor pueden enviar la proforma.
        """
        if not self.has_permission(request, view):
            return False
            
        # Solo se pueden enviar proformas en borrador
        if obj.estado != 'borrador':
            return False
            
        # El creador siempre puede enviar sus propias proformas
        if obj.created_by == request.user:
            return True
            
        # Supervisores pueden enviar cualquier proforma
        return request.user.groups.filter(name='Supervisor').exists()


class CanConvertProformas(permissions.BasePermission):
    """Permiso para convertir proformas a órdenes."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Solo supervisores pueden convertir proformas a órdenes
        return request.user.is_superuser or request.user.groups.filter(
            name='Supervisor'
        ).exists()
    
    def has_object_permission(self, request, view, obj):
        """Solo se pueden convertir proformas en estado 'aprobada'"""
        if not self.has_permission(request, view):
            return False
            
        # Solo se pueden convertir proformas aprobadas
        return obj.estado == 'aprobada'


class CanManageProformaItems(permissions.BasePermission):
    """Permiso para gestionar ítems de proformas."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Todos los usuarios autenticados pueden ver ítems
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Solo vendedores y supervisores pueden añadir/editar ítems
        return request.user.is_superuser or request.user.groups.filter(
            name__in=['Vendedor', 'Supervisor']
        ).exists()
    
    def has_object_permission(self, request, view, obj):
        """
        Solo se pueden gestionar ítems de proformas en borrador.
        El vendedor solo puede editar sus propias proformas.
        """
        user = request.user
        
        # Superusuarios tienen acceso completo
        if user.is_superuser:
            return True
            
        # Solo métodos seguros para proformas no en borrador
        if obj.proforma.estado != 'borrador':
            return request.method in permissions.SAFE_METHODS
            
        # Supervisores tienen acceso completo a proformas en borrador
        if user.groups.filter(name='Supervisor').exists():
            return True
            
        # Vendedores solo pueden editar sus propias proformas
        if user.groups.filter(name='Vendedor').exists():
            return obj.proforma.created_by == user


# Utilidad para crear los grupos de permisos necesarios
def setup_proforma_permissions():
    """
    Crea los grupos y permisos necesarios para el sistema de proformas.
    Esta función debe ejecutarse manualmente o en una migración.
    """
    # Crear los grupos si no existen
    vendedor_group, _ = Group.objects.get_or_create(name='Vendedor')
    supervisor_group, _ = Group.objects.get_or_create(name='Supervisor')
    admin_group, _ = Group.objects.get_or_create(name='Administrativo')
    
    # Obtener ContentTypes
    proforma_ct = ContentType.objects.get_for_model(Proforma)
    
    # Crear permisos específicos
    view_proforma_perm, _ = Permission.objects.get_or_create(
        codename='view_proforma',
        name='Can view proforma',
        content_type=proforma_ct
    )
    
    create_proforma_perm, _ = Permission.objects.get_or_create(
        codename='add_proforma',
        name='Can add proforma',
        content_type=proforma_ct
    )
    
    change_proforma_perm, _ = Permission.objects.get_or_create(
        codename='change_proforma',
        name='Can change proforma',
        content_type=proforma_ct
    )
    
    delete_proforma_perm, _ = Permission.objects.get_or_create(
        codename='delete_proforma',
        name='Can delete proforma',
        content_type=proforma_ct
    )
    
    # Crear permisos personalizados adicionales
    approve_proforma_perm, _ = Permission.objects.get_or_create(
        codename='approve_proforma',
        name='Can approve proforma',
        content_type=proforma_ct
    )
    
    reject_proforma_perm, _ = Permission.objects.get_or_create(
        codename='reject_proforma',
        name='Can reject proforma',
        content_type=proforma_ct
    )
    
    send_proforma_perm, _ = Permission.objects.get_or_create(
        codename='send_proforma',
        name='Can send proforma',
        content_type=proforma_ct
    )
    
    convert_proforma_perm, _ = Permission.objects.get_or_create(
        codename='convert_proforma',
        name='Can convert proforma',
        content_type=proforma_ct
    )
    
    # Asignar permisos a los grupos
    
    # Vendedor: CRUD básico para sus propias proformas y envío
    vendedor_group.permissions.add(
        view_proforma_perm,
        create_proforma_perm, 
        change_proforma_perm,
        send_proforma_perm
    )
    
    # Supervisor: todos los permisos
    supervisor_group.permissions.add(
        view_proforma_perm,
        create_proforma_perm,
        change_proforma_perm,
        delete_proforma_perm,
        approve_proforma_perm,
        reject_proforma_perm,
        send_proforma_perm,
        convert_proforma_perm
    )
    
    # Administrativo: ver, aprobar, rechazar
    admin_group.permissions.add(
        view_proforma_perm,
        approve_proforma_perm,
        reject_proforma_perm
    )