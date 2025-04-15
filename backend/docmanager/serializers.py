from rest_framework import serializers
from .models import (
    Category, Tag, Document, DocumentVersion,
    DocumentTag, DocumentActivity, DocumentPermission, DocumentComment
)


class CategorySerializer(serializers.ModelSerializer):
    document_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'color_code', 'parent', 'document_count', 'created_at', 'updated_at']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color_code', 'created_at', 'updated_at']


class DocumentTagSerializer(serializers.ModelSerializer):
    tag_name = serializers.CharField(source='tag.name', read_only=True)
    tag_color = serializers.CharField(source='tag.color_code', read_only=True)
    
    class Meta:
        model = DocumentTag
        fields = ['id', 'tag', 'tag_name', 'tag_color', 'created_at']


class DocumentVersionSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = DocumentVersion
        fields = ['id', 'document', 'version_number', 'file', 'file_path', 'file_size', 
                 'change_notes', 'created_by', 'created_by_username', 'created_at']
        read_only_fields = ['file_path', 'file_size', 'created_at']


class DocumentCommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    is_reply = serializers.BooleanField(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentComment
        fields = ['id', 'document', 'user', 'user_username', 'content', 
                 'parent_comment', 'is_reply', 'replies', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.parent_comment is None:  # Solo para comentarios principales
            replies = DocumentComment.objects.filter(parent_comment=obj)
            return DocumentCommentSerializer(replies, many=True, context=self.context).data
        return []


class DocumentPermissionSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = DocumentPermission
        fields = ['id', 'document', 'user', 'user_username', 'permission_type', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class DocumentActivitySerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = DocumentActivity
        fields = ['id', 'document', 'user', 'user_username', 'activity_type', 
                 'activity_type_display', 'details', 'created_at']
        read_only_fields = ['created_at']


class DocumentListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listados de documentos"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    uploader_username = serializers.CharField(source='uploader.username', read_only=True)
    tags = DocumentTagSerializer(source='documenttag_set', many=True, read_only=True)
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'file_type', 'file_size', 
                 'is_favorite', 'category', 'category_name', 'uploader', 
                 'uploader_username', 'tags', 'created_at', 'updated_at']


class DocumentDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para vista detallada de documentos"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    uploader_username = serializers.CharField(source='uploader.username', read_only=True)
    tags = DocumentTagSerializer(source='documenttag_set', many=True, read_only=True)
    versions = DocumentVersionSerializer(many=True, read_only=True)
    permissions = DocumentPermissionSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'file_name', 'file_type', 
                 'file_size', 'file_path', 'file', 'is_favorite', 'category', 
                 'category_name', 'uploader', 'uploader_username', 'tags', 
                 'versions', 'permissions', 'comments', 'created_at', 
                 'updated_at', 'is_deleted', 'deleted_at']
    
    def get_comments(self, obj):
        # Solo obtener comentarios principales (no respuestas)
        comments = DocumentComment.objects.filter(document=obj, parent_comment=None)
        return DocumentCommentSerializer(comments, many=True, context=self.context).data


class DocumentCreateSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        required=False
    )
    
    class Meta:
        model = Document
        fields = ['title', 'description', 'file', 'category', 'tags', 'is_favorite']
    
    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        document = Document.objects.create(**validated_data)
        
        # Crear las relaciones con las etiquetas
        for tag in tags:
            DocumentTag.objects.create(document=document, tag=tag)
        
        # Registrar la actividad de creación
        DocumentActivity.objects.create(
            document=document,
            user=validated_data.get('uploader'),
            activity_type='create',
            details='Documento creado'
        )
        
        # Crear la primera versión del documento
        DocumentVersion.objects.create(
            document=document,
            version_number='1.0',
            file=document.file,
            file_path=document.file_path,
            file_size=document.file_size,
            created_by=validated_data.get('uploader'),
            change_notes='Versión inicial'
        )
        
        return document