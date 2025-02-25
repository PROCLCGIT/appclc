# backend/proformas/permissions.py
from rest_framework import permissions
from django.utils import timezone

class BaseProformaPermission(permissions.BasePermission):
    """Permiso base para operaciones de proforma"""
    
    def has_permission(self, request, view):
        # Verificar que el usuario esté autenticado y activo
        return bool(request.user and request.user.is_authenticated and request.user.is_active)

class IsProformaUser(BaseProformaPermission):
    """
    Permiso principal para proformas que implementa las siguientes reglas:
    
    1. Permisos de Lectura:
       - Superusuarios: Pueden ver todas las proformas
       - Vendedores: Pueden ver sus proformas asignadas
       - Creadores: Pueden ver las proformas que crearon
       - Usuarios normales: Solo pueden ver proformas donde son creadores o vendedores
    
    2. Permisos de Creación:
       - Cualquier usuario autenticado puede crear proformas
       - Se verifica que el usuario tenga permisos para los clientes seleccionados
    
    3. Permisos de Edición:
       - Solo se pueden editar proformas en estado 'draft'
       - Solo el creador o el vendedor asignado pueden editar
       - Superusuarios pueden editar cualquier proforma
    
    4. Permisos de Eliminación:
       - Solo se pueden eliminar proformas en estado 'draft'
       - Solo el creador puede eliminar
       - Superusuarios pueden eliminar cualquier proforma
    
    5. Permisos para Acciones Especiales:
       - Aprobar: Solo vendedores asignados o supervisores
       - Rechazar: Solo vendedores asignados o supervisores
       - Enviar: Creadores o vendedores asignados
       - Expirar: Sistema automático o supervisores
    """

    def has_object_permission(self, request, view, obj):
        # Superusuarios tienen acceso total
        if request.user.is_superuser:
            return True

        # Acceso de solo lectura
        if request.method in permissions.SAFE_METHODS:
            return (obj.created_by == request.user or 
                   obj.sales_person == request.user)

        # Verificar si la proforma está expirada
        if obj.valid_until and obj.valid_until < timezone.now().date():
            if view.action != 'expire':
                return False

        # Acciones de modificación
        if request.method in ['PUT', 'PATCH']:
            # Solo se pueden modificar proformas en borrador
            if obj.status != 'draft':
                return False
            # Solo el creador o vendedor pueden modificar
            return (obj.created_by == request.user or 
                   obj.sales_person == request.user)

        # Eliminación
        if request.method == 'DELETE':
            # Solo se pueden eliminar proformas en borrador
            if obj.status != 'draft':
                return False
            # Solo el creador puede eliminar
            return obj.created_by == request.user

        # Acciones especiales
        if view.action in ['approve', 'reject']:
            # Solo vendedores asignados o supervisores pueden aprobar/rechazar
            return (obj.sales_person == request.user or 
                   request.user.has_perm('proformas.can_approve_proforma'))

        if view.action == 'send':
            # Solo creadores o vendedores pueden enviar
            return (obj.created_by == request.user or 
                   obj.sales_person == request.user)

        if view.action == 'expire':
            # Solo supervisores pueden expirar manualmente
            return request.user.has_perm('proformas.can_expire_proforma')

        return False

class CanManageProformaItems(BaseProformaPermission):
    """
    Permiso específico para gestionar items de proforma:
    - Solo se pueden modificar items de proformas en borrador
    - Solo creadores o vendedores pueden modificar items
    - Superusuarios pueden modificar cualquier item
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        proforma = obj.proforma
        
        # Solo lectura para todos los autorizados
        if request.method in permissions.SAFE_METHODS:
            return (proforma.created_by == request.user or 
                   proforma.sales_person == request.user)

        # Modificaciones solo en estado borrador
        if proforma.status != 'draft':
            return False

        # Solo creadores o vendedores pueden modificar items
        return (proforma.created_by == request.user or 
                proforma.sales_person == request.user)

class CanViewProformaHistory(BaseProformaPermission):
    """
    Permiso para ver el historial de proformas:
    - Superusuarios pueden ver todo el historial
    - Usuarios pueden ver el historial de sus proformas
    - Vendedores pueden ver el historial de sus proformas asignadas
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        proforma = obj.proforma
        return (proforma.created_by == request.user or 
                proforma.sales_person == request.user)