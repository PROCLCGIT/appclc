# Sistema de Permisos para el Módulo de Proformas

Este documento describe el sistema de permisos implementado para el módulo de proformas, permitiendo un control granular del acceso basado en roles y estados de proforma.

## Roles definidos

El sistema de proformas define tres roles principales:

1. **Vendedor**:
   - Puede crear proformas
   - Puede editar sus propias proformas cuando están en estado "borrador"
   - Puede ver todas las proformas
   - Puede enviar proformas a clientes (cambiar estado a "enviada")
   - No puede aprobar/rechazar proformas

2. **Supervisor**:
   - Tiene acceso completo a todas las proformas
   - Puede crear, editar y eliminar cualquier proforma
   - Puede aprobar o rechazar proformas
   - Puede convertir proformas aprobadas a órdenes
   - Puede gestionar proformas de cualquier vendedor

3. **Administrativo**:
   - Puede ver todas las proformas
   - Puede aprobar o rechazar proformas
   - No puede crear ni editar proformas
   - No puede convertir proformas a órdenes

## Permisos y Estados

Los permisos también están vinculados al estado actual de la proforma:

| Estado | Creador (Vendedor) | Supervisor | Administrativo |
|--------|-------------------|------------|----------------|
| borrador | Edición completa | Edición completa | Solo lectura |
| enviada | Solo lectura | Edición/Aprobación/Rechazo | Aprobación/Rechazo |
| aprobada | Solo lectura | Conversión a orden | Solo lectura |
| rechazada | Puede volver a borrador | Edición completa | Solo lectura |
| convertida | Solo lectura | Solo lectura | Solo lectura |
| vencida | Solo lectura | Solo lectura | Solo lectura |

## Clases de Permisos Implementadas

1. **ProformaAccessPermission**: Permisos generales por rol
2. **CanViewProformas**: Permiso para ver proformas
3. **CanCreateProformas**: Permiso para crear proformas
4. **CanApproveProformas**: Permiso para aprobar proformas
5. **CanRejectProformas**: Permiso para rechazar proformas
6. **CanSendProformas**: Permiso para enviar proformas a clientes
7. **CanConvertProformas**: Permiso para convertir proformas a órdenes
8. **CanManageProformaItems**: Permiso para gestionar ítems de proformas

## Implementación de Permisos

Los permisos se aplican en tres niveles:

1. **Nivel de Clase**: Configurados en `permission_classes = [...]` del ViewSet
2. **Nivel de Acción**: Configurados en el método `get_permissions()` del ViewSet
3. **Nivel de Objeto**: A través del método `has_object_permission()` de cada clase de permiso

## Configuración Inicial

Para configurar los permisos, ejecute el siguiente comando:

```bash
python manage.py setup_proforma_permissions
```

Este comando crea los grupos de permisos necesarios y les asigna los permisos correspondientes.

## Desarrollo y Ampliación

Para añadir nuevos permisos, siga estos pasos:

1. Defina una nueva clase de permiso en `permissions.py`
2. Registre el permiso en la función `setup_proforma_permissions()`
3. Aplique el permiso en el ViewSet correspondiente

## Pruebas

El sistema incluye pruebas unitarias para los permisos en `tests.py`. Ejecute las pruebas para asegurarse de que los permisos funcionan correctamente:

```bash
python manage.py test proformas.tests.ProformaPermissionTest
```