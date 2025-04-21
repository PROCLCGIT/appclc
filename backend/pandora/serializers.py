"""
Utilidades y clases base para serializers en toda la aplicación.
"""
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.conf import settings
import re

from .models import Categorias, Zonas, Ciudades, TipoCliente, Clientes, Pandora, Especialidades, Marca, Procedencia, TipoContratacion, Unidades, EmpresaClc, PreciosSie, Proveedores, Vendedores, Procesos_auditados, MsPref, Contactos, RelacionesBlue

class AuditedModelSerializer(serializers.ModelSerializer):
    """
    Serializer base para modelos con campos de auditoría.
    Maneja automáticamente los campos created_by, updated_by.
    """
    created_by_name = serializers.CharField(
        source='created_by.username', 
        read_only=True,
        default=None
    )
    created_at_formatted = serializers.SerializerMethodField()
    updated_by_name = serializers.CharField(
        source='updated_by.username', 
        read_only=True,
        default=None
    )
    updated_at_formatted = serializers.SerializerMethodField()
    
    def get_created_at_formatted(self, obj):
        if hasattr(obj, 'created_at') and obj.created_at:
            return obj.created_at.strftime("%d/%m/%Y %H:%M")
        return None
        
    def get_updated_at_formatted(self, obj):
        if hasattr(obj, 'updated_at') and obj.updated_at:
            return obj.updated_at.strftime("%d/%m/%Y %H:%M")
        return None
    
    def create(self, validated_data):
        # Obtener usuario de la petición desde el contexto
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
            validated_data['updated_by'] = request.user
            
        return super().create(validated_data)
        
    def update(self, instance, validated_data):
        # Obtener usuario de la petición desde el contexto
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['updated_by'] = request.user
            
        return super().update(instance, validated_data)
        
    class Meta:
        # Esta clase debe ser heredada, no usada directamente
        abstract = True
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']

class RecursiveSerializer(serializers.Serializer):
    """
    Serializer recursivo para estructuras jerárquicas.
    Ejemplo de uso: categorías con subcategorías.
    """
    def to_representation(self, instance):
        serializer = self.parent.parent.__class__(instance, context=self.context)
        return serializer.data

class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    Serializer que permite seleccionar campos dinámicamente.
    Uso: ?fields=id,name,description
    """
    def __init__(self, *args, **kwargs):
        # Extraer los campos solicitados
        fields = kwargs.pop('fields', None)
        
        # Inicializar normalmente
        super().__init__(*args, **kwargs)
        
        if fields is not None and fields:
            # Convertir una cadena en lista si es necesario
            if isinstance(fields, str):
                fields = fields.split(',')
                
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

class NestedModelSerializer(serializers.ModelSerializer):
    """
    Serializer que permite actualizar modelos relacionados.
    Util para crear/actualizar objetos relacionados en una sola petición.
    """
    def create(self, validated_data):
        # Extraer datos anidados para relaciones 'many'
        nested_data = {}
        for field_name, relation_info in self._get_relations():
            # Solo procesar relaciones de varios
            if relation_info.to_many:
                data = validated_data.pop(field_name, [])
                nested_data[field_name] = data
                
        # Crear el objeto principal
        instance = super().create(validated_data)
        
        # Crear los objetos anidados y relacionarlos
        self._create_nested_relations(instance, nested_data)
        
        return instance
        
    def update(self, instance, validated_data):
        # Extraer datos anidados para relaciones 'many'
        nested_data = {}
        for field_name, relation_info in self._get_relations():
            # Solo procesar relaciones de varios
            if relation_info.to_many:
                data = validated_data.pop(field_name, None)
                if data is not None:
                    nested_data[field_name] = data
                    
        # Actualizar el objeto principal
        instance = super().update(instance, validated_data)
        
        # Actualizar los objetos anidados
        for field_name, data in nested_data.items():
            self._update_nested_relation(instance, field_name, data)
            
        return instance
    
    def _get_relations(self):
        """Obtiene todas las relaciones del modelo"""
        for field_name, field in self.fields.items():
            if isinstance(field, serializers.ListSerializer) and isinstance(field.child, serializers.ModelSerializer):
                yield field_name, field
                
    def _create_nested_relations(self, instance, nested_data):
        """Crea los objetos de relaciones anidadas"""
        for field_name, data in nested_data.items():
            field = self.fields[field_name]
            serializer = field.child.__class__(data=data, context=self.context, many=True)
            serializer.is_valid(raise_exception=True)
            
            # Obtener el nombre del campo en el modelo relacionado que apunta a este modelo
            related_field = None
            for field_info in serializer.child.Meta.model._meta.fields:
                if field_info.related_model == instance.__class__:
                    related_field = field_info.name
                    break
                    
            if related_field:
                for item in serializer.validated_data:
                    item[related_field] = instance
                    
            serializer.save()
            
    def _update_nested_relation(self, instance, field_name, data):
        """Actualiza los objetos de una relación anidada"""
        field = self.fields[field_name]
        model = field.child.Meta.model
        
        # Obtener relación
        manager = getattr(instance, field_name)
        
        # Obtener IDs existentes
        existing_ids = list(manager.values_list('id', flat=True))
        
        # Preparar listas de diferentes operaciones
        ids_to_keep = []
        data_to_create = []
        data_to_update = []
        
        # Clasificar cada item
        for item in data:
            item_id = item.get('id')
            if item_id and item_id in existing_ids:
                ids_to_keep.append(item_id)
                data_to_update.append(item)
            else:
                data_to_create.append(item)
                
        # Eliminar los objetos que no se mantienen
        manager.exclude(id__in=ids_to_keep).delete()
        
        # Actualizar los existentes
        for item in data_to_update:
            obj = manager.get(id=item['id'])
            serializer = field.child.__class__(obj, data=item, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
        # Crear los nuevos
        for item in data_to_create:
            # Obtener el nombre del campo en el modelo relacionado
            related_field = None
            for field_info in model._meta.fields:
                if field_info.related_model == instance.__class__:
                    related_field = field_info.name
                    break
                    
            if related_field:
                item[related_field] = instance
                
            serializer = field.child.__class__(data=item)
            serializer.is_valid(raise_exception=True)
            serializer.save()

class FileSerializerMixin:
    """
    Mixin para manejar subida y validación de archivos con metadatos adicionales.
    """
    
    def validate_file(self, file, max_size=None, allowed_extensions=None, mime_types=None):
        """
        Valida un archivo según tamaño y tipo.
        
        Args:
            file: El archivo a validar
            max_size: Tamaño máximo en bytes
            allowed_extensions: Lista de extensiones permitidas
            mime_types: Lista de tipos MIME permitidos
        
        Raises:
            ValidationError: Si el archivo no cumple los requisitos
        """
        if not file:
            return file
            
        # Validar tamaño
        if max_size and file.size > max_size:
            max_size_mb = max_size / (1024 * 1024)
            raise ValidationError(
                _('El archivo excede el tamaño máximo permitido de %(max_size)s MB.'),
                params={'max_size': max_size_mb}
            )
            
        # Validar extensión
        if allowed_extensions:
            ext = self._get_file_extension(file.name).lower()
            if ext not in [e.lower() for e in allowed_extensions]:
                raise ValidationError(
                    _('Extensión no permitida. Use: %(extensions)s'),
                    params={'extensions': ', '.join(allowed_extensions)}
                )
                
        # Validar tipo MIME (requiere python-magic)
        if mime_types:
            try:
                import magic
                file_type = magic.from_buffer(file.read(1024), mime=True)
                file.seek(0)  # Resetear la posición del archivo
                
                if file_type not in mime_types:
                    raise ValidationError(
                        _('Tipo de archivo no permitido. Use: %(types)s'),
                        params={'types': ', '.join(mime_types)}
                    )
            except ImportError:
                pass  # Si python-magic no está instalado, omitimos esta validación
                
        return file
    
    def _get_file_extension(self, filename):
        """Obtiene la extensión de un archivo"""
        return filename.split('.')[-1] if '.' in filename else ''

class CustomValidationMixin:
    """
    Mixin con validaciones comunes para serializers.
    """
    
    def validate_email(self, value):
        """Valida que un email tenga formato correcto y dominio válido"""
        if not value:
            return value
            
        # Expresión regular para validar emails
        pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(_('Email con formato inválido.'))
            
        # Validar dominio (opcional)
        domain = value.split('@')[-1]
        if settings.EMAIL_DOMAIN_BLACKLIST and domain.lower() in settings.EMAIL_DOMAIN_BLACKLIST:
            raise serializers.ValidationError(_('Dominio de email no permitido.'))
            
        return value
        
    def validate_phone(self, value):
        """Valida un número de teléfono en varios formatos"""
        if not value:
            return value
            
        # Limpiar el valor
        value = re.sub(r'[\s\-\(\)]', '', value)
        
        # Validar formato internacional
        if not re.match(r'^\+?[0-9]{8,15}$', value):
            raise serializers.ValidationError(_('Número de teléfono inválido.'))
            
        return value
        
    def validate_url(self, value):
        """Valida una URL"""
        if not value:
            return value
            
        # Validar protocolo
        if not value.startswith(('http://', 'https://')):
            value = 'https://' + value
            
        # Validar formato
        pattern = r'^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(_('URL con formato inválido.'))
            
        return value


# Serializers para modelos específicos

class CategoriasSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Categorias.
    Incluye la representación de las categorías padre e hijas.
    """
    children = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.nombre', read_only=True, allow_null=True)
    
    class Meta:
        model = Categorias
        fields = ['id', 'nombre', 'code', 'parent', 'parent_name', 'level', 'path', 'is_active', 'children', 'created_at', 'updated_at']
        read_only_fields = ['level', 'path']
    
    def get_children(self, obj):
        """Obtiene las categorías hijas"""
        # Solo devolver hijos si estamos en una petición de detalle para reducir datos
        if self.context.get('detail_view', False):
            children = Categorias.objects.filter(parent=obj.id, is_active=True)
            serializer = CategoriasSerializer(
                children, 
                many=True, 
                context={'detail_view': False}  # Evita recursión infinita
            )
            return serializer.data
        return []


class TipoClienteSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo TipoCliente.
    """
    class Meta:
        model = TipoCliente
        fields = ['id', 'nombre', 'created_at', 'updated_at']


class ZonasSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Zonas.
    """
    class Meta:
        model = Zonas
        fields = ['id', 'nombre', 'code', 'cobertura', 'created_at', 'updated_at']


class CiudadesSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Ciudades.
    """
    class Meta:
        model = Ciudades
        fields = ['id', 'nombre', 'provincia', 'code', 'created_at', 'updated_at']


class ClientesSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Clientes.
    Incluye información relacionada de zona, ciudad y tipo de cliente.
    """
    zona_nombre = serializers.CharField(source='zona.nombre', read_only=True)
    ciudad_nombre = serializers.CharField(source='ciudad.nombre', read_only=True)
    tipo_cliente_nombre = serializers.CharField(source='tipo_cliente.nombre', read_only=True)
    
    class Meta:
        model = Clientes
        fields = [
            'id', 'zona', 'zona_nombre', 'ciudad', 'ciudad_nombre', 
            'tipo_cliente', 'tipo_cliente_nombre', 'nombre', 'alias', 
            'razon_social', 'ruc', 'email', 'telefono', 'direccion', 
            'nota', 'activo', 'created_at', 'updated_at'
        ]
