"""
Serializadores para los modelos principales del módulo Pandora.
"""
from rest_framework import serializers
from .models import (
    Categorias, Zonas, Ciudades, TipoCliente, Marca, 
    Procedencia, TipoContratacion, Unidades, Clientes,
    EmpresaClc, Proveedores, Pandora, Procesos_auditados,
    MsPref, Vendedores, Contactos, RelacionesBlue
)
from .serializers import AuditedModelSerializer, RecursiveSerializer

class CategoriasSerializer(AuditedModelSerializer):
    """Serializer para modelo Categorias"""
    children = RecursiveSerializer(many=True, read_only=True)
    parent_name = serializers.CharField(source='parent.nombre', read_only=True)
    
    class Meta:
        model = Categorias
        fields = ['id', 'nombre', 'code', 'parent', 'parent_name', 
                  'level', 'path', 'is_active', 'children',
                  'created_at', 'updated_at']

class ZonasSerializer(AuditedModelSerializer):
    """Serializer para modelo Zonas"""
    class Meta:
        model = Zonas
        fields = ['id', 'nombre', 'code', 'cobertura',
                  'created_at', 'updated_at']

class CiudadesSerializer(AuditedModelSerializer):
    """Serializer para modelo Ciudades"""
    class Meta:
        model = Ciudades
        fields = ['id', 'nombre', 'provincia', 'code',
                  'created_at', 'updated_at']

class TipoClienteSerializer(AuditedModelSerializer):
    """Serializer para modelo TipoCliente"""
    class Meta:
        model = TipoCliente
        fields = ['id', 'nombre', 'created_at', 'updated_at']

class MarcaSerializer(AuditedModelSerializer):
    """Serializer para modelo Marca"""
    class Meta:
        model = Marca
        fields = ['id', 'nombre', 'code', 'description', 'proveedores',
                  'country_origin', 'website', 'contact_info', 'is_active',
                  'created_at', 'updated_at']

class ProcedenciaSerializer(AuditedModelSerializer):
    """Serializer para modelo Procedencia"""
    class Meta:
        model = Procedencia
        fields = ['id', 'nombre', 'code', 'created_at', 'updated_at']

class TipoContratacionSerializer(AuditedModelSerializer):
    """Serializer para modelo TipoContratacion"""
    class Meta:
        model = TipoContratacion
        fields = ['id', 'nombre', 'code', 'created_at', 'updated_at']

class UnidadesSerializer(AuditedModelSerializer):
    """Serializer para modelo Unidades"""
    class Meta:
        model = Unidades
        fields = ['id', 'nombre', 'code', 'created_at', 'updated_at']

class ClientesSerializer(AuditedModelSerializer):
    """Serializer para modelo Clientes"""
    zona_nombre = serializers.CharField(source='zona.nombre', read_only=True)
    ciudad_nombre = serializers.CharField(source='ciudad.nombre', read_only=True)
    tipo_cliente_nombre = serializers.CharField(source='tipo_cliente.nombre', read_only=True)
    
    class Meta:
        model = Clientes
        fields = ['id', 'zona', 'zona_nombre', 'ciudad', 'ciudad_nombre', 
                  'tipo_cliente', 'tipo_cliente_nombre', 'nombre', 'alias',
                  'razon_social', 'ruc', 'email', 'telefono', 'direccion',
                  'nota', 'activo', 'created_at', 'updated_at']

class EmpresaClcSerializer(AuditedModelSerializer):
    """Serializer para modelo EmpresaClc"""
    class Meta:
        model = EmpresaClc
        fields = ['id', 'nombre', 'razon_social', 'code', 'ruc',
                  'direccion', 'telefono', 'correo', 'representante_legal',
                  'created_at', 'updated_at']

class ProveedoresSerializer(AuditedModelSerializer):
    """Serializer para modelo Proveedores"""
    class Meta:
        model = Proveedores
        fields = ['id', 'ruc', 'razon_social', 'nombre', 'direccion1',
                  'direccion2', 'correo', 'telefono', 'tipo_primario',
                  'activo', 'created_at', 'updated_at']

class PandoraSerializer(AuditedModelSerializer):
    """Serializer para modelo Pandora"""
    class Meta:
        model = Pandora
        fields = ['id', 'nombre', 'code', 'created_at', 'updated_at']

class ProcesosAuditadosSerializer(AuditedModelSerializer):
    """Serializer para modelo Procesos_auditados"""
    class Meta:
        model = Procesos_auditados
        fields = ['id', 'nombre', 'description', 'objeto', 
                  'created_at', 'updated_at']

class MsPrefSerializer(AuditedModelSerializer):
    """Serializer para modelo MsPref"""
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    especialidad_nombre = serializers.CharField(source='especialidad.nombre', read_only=True)
    
    class Meta:
        model = MsPref
        fields = ['id', 'sku', 'nombre_generico', 'categoria', 'categoria_nombre',
                  'especialidad', 'especialidad_nombre', 'normada',
                  'referencias_tecnica', 'aplicaciones', 'created_at', 'updated_at']

class VendedoresSerializer(AuditedModelSerializer):
    """Serializer para modelo Vendedores"""
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    
    class Meta:
        model = Vendedores
        fields = ['id', 'proveedor', 'proveedor_nombre', 'nombre', 
                  'correo', 'telefono', 'observacion', 'activo',
                  'created_at', 'updated_at']

class ContactosSerializer(AuditedModelSerializer):
    """Serializer para modelo Contactos"""
    class Meta:
        model = Contactos
        fields = ['id', 'nombre', 'alias', 'telefono', 'telefono2',
                  'email', 'direccion', 'obserbacion', 'ingerencia',
                  'created_at', 'updated_at']

class RelacionesBlueSerializer(AuditedModelSerializer):
    """Serializer para modelo RelacionesBlue"""
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    contacto_nombre = serializers.CharField(source='contacto.nombre', read_only=True)
    
    class Meta:
        model = RelacionesBlue
        fields = ['id', 'cliente', 'cliente_nombre', 'contacto', 'contacto_nombre',
                  'nivel', 'created_at', 'updated_at']
