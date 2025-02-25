# backend/pandora/serializers.py
from rest_framework import serializers
from .models import (
    Zonas, Ciudades, TipoCliente, Clientes, Pandora,
    Categorias, Especialidades, Marca, Procedencia,
    TipoContratacion, Unidades, EmpresaClc, Procesos_auditados,
    PreciosSie, MsPref, Proveedores, CostosPandora, Vendedores
)
from .utils import get_history  # Asegúrate de que este archivo exista y defina get_history


class BaseModelSerializer(serializers.ModelSerializer):
    """
    Serializer base que incluye el campo 'history'
    a través de SerializerMethodField.
    """
    history = serializers.SerializerMethodField()

    def get_history(self, obj):
        return get_history(obj)


class ZonasSerializer(BaseModelSerializer):
    class Meta:
        model = Zonas
        fields = [
            'id',
            'nombre',
            'code',
            'cobertura',
            'created_at',
            'updated_at',
            'history',
        ]


class CiudadesSerializer(BaseModelSerializer):
    class Meta:
        model = Ciudades
        fields = [
            'id',
            'nombre',
            'provincia',
            'code',
            'created_at',
            'updated_at',
            'history',
        ]


class TipoClienteSerializer(BaseModelSerializer):
    class Meta:
        model = TipoCliente
        fields = [
            'id',
            'nombre',
            'created_at',
            'updated_at',
            'history',
        ]


class ClientesSerializer(BaseModelSerializer):
    # Campos extra de solo lectura para mostrar los nombres
    zona_nombre = serializers.ReadOnlyField(source='zona.nombre')
    ciudad_nombre = serializers.ReadOnlyField(source='ciudad.nombre')
    tipo_cliente_nombre = serializers.ReadOnlyField(source='tipo_cliente.nombre')

    class Meta:
        model = Clientes
        fields = [
            'id',
            'zona',
            'zona_nombre',
            'ciudad',
            'ciudad_nombre',
            'tipo_cliente',
            'tipo_cliente_nombre',
            'nombre',
            'alias',
            'razon_social',
            'ruc',
            'email',
            'telefono',
            'direccion',
            'activo',
            'created_at',
            'updated_at',
            'history',
        ]


class PandoraSerializer(BaseModelSerializer):
    class Meta:
        model = Pandora
        fields = [
            'id',
            'nombre',
            'code',
            'created_at',
            'updated_at',
            'history',
        ]


class CategoriasSerializer(BaseModelSerializer):
    class Meta:
        model = Categorias
        fields = [
            'id',
            'nombre',
            'code',
            'parent',
            'level',
            'path',
            'is_active',
            'created_at',
            'updated_at',
            'history',
        ]


class EspecialidadesSerializer(BaseModelSerializer):
    class Meta:
        model = Especialidades
        fields = [
            'id',
            'nombre',
            'code',
            'created_at',
            'updated_at',
            'history',
        ]


class MarcaSerializer(BaseModelSerializer):
    class Meta:
        model = Marca
        fields = [
            'id',
            'nombre',
            'code',
            'description',
            'proveedores',
            'country_origin',
            'website',
            'contact_info',
            'is_active',
            'created_at',
            'updated_at',
            'history',
        ]


class ProcedenciaSerializer(BaseModelSerializer):
    class Meta:
        model = Procedencia
        fields = [
            'id',
            'nombre',
            'code',
            'created_at',
            'updated_at',
            'history',
        ]


class TipoContratacionSerializer(BaseModelSerializer):
    class Meta:
        model = TipoContratacion
        fields = [
            'id',
            'nombre',
            'code',
            'created_at',
            'updated_at',
            'history',
        ]


class UnidadesSerializer(BaseModelSerializer):
    class Meta:
        model = Unidades
        fields = [
            'id',
            'nombre',
            'code',
            'created_at',
            'updated_at',
            'history',
        ]


class EmpresaClcSerializer(BaseModelSerializer):
    class Meta:
        model = EmpresaClc
        fields = [
            'id',
            'nombre',
            'razon_social',
            'code',
            'ruc',
            'direccion',
            'telefono',
            'correo',
            'representante_legal',
            'created_at',
            'updated_at',
            'history',
        ]


class Procesos_auditadosSerializer(BaseModelSerializer):
    class Meta:
        model = Procesos_auditados
        fields = [
            'id',
            'nombre',
            'description',
            'objeto',
            'created_at',
            'updated_at',
            'history',
        ]


class PreciosSieSerializer(BaseModelSerializer):
    pandora_nombre = serializers.ReadOnlyField(source='pandora.nombre')
    cliente_nombre = serializers.ReadOnlyField(source='cliente.nombre')
    detalle_sie_nombre = serializers.ReadOnlyField(source='detalle_sie.nombre')

    class Meta:
        model = PreciosSie
        fields = [
            'id',
            'pandora',
            'pandora_nombre',
            'cliente',
            'cliente_nombre',
            'detalle_sie',
            'detalle_sie_nombre',
            'precio',
            'nota',
            'fecha_sie',
            'created_at',
            'updated_at',
            'history',
        ]


class MsPrefSerializer(BaseModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    especialidad_nombre = serializers.ReadOnlyField(source='especialidad.nombre')

    class Meta:
        model = MsPref
        fields = [
            'id',
            'sku',
            'nombre_generico',
            'categoria',
            'categoria_nombre',
            'especialidad',
            'especialidad_nombre',
            'normada',
            'referencias_tecnica',
            'aplicaciones',
            'created_at',
            'updated_at',
            'history',
        ]


class ProveedoresSerializer(BaseModelSerializer):
    class Meta:
        model = Proveedores
        fields = [
            'id',
            'ruc',
            'razon_social',
            'nombre',
            'direccion1',
            'direccion2',
            'correo',
            'telefono',
            'tipo_primario',
            'activo',
            'created_at',
            'updated_at',
            'history',
        ]


class CostosPandoraSerializer(BaseModelSerializer):
    pandora_nombre = serializers.ReadOnlyField(source='pandora.nombre')
    proveedor_nombre = serializers.ReadOnlyField(source='proveedor.nombre')
    marca_nombre = serializers.ReadOnlyField(source='marca.nombre')

    class Meta:
        model = CostosPandora
        fields = [
            'id',
            'pandora',
            'pandora_nombre',
            'proveedor',
            'proveedor_nombre',
            'marca',
            'marca_nombre',
            'precio',
            'nota',
            'fecha',
            'created_at',
            'updated_at',
            'history',
        ]


class VendedoresSerializer(BaseModelSerializer):
    proveedor_nombre = serializers.ReadOnlyField(source='proveedor.nombre')

    class Meta:
        model = Vendedores
        fields = [
            'id',
            'proveedor',
            'proveedor_nombre',
            'nombre',
            'correo',
            'telefono',
            'observacion',
            'activo',
            'created_at',
            'updated_at',
            'history',
        ]
