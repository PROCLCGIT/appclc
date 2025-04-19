from rest_framework import serializers
from .models import (
    Category, Tag, Document, DocumentVersion,
    DocumentTag, DocumentActivity, DocumentPermission, DocumentComment,
    Collection, CollectionDocument, CollectionPermission, CollectionActivity,
    Group, GroupMember
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
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'file_type', 'file_size', 
                 'is_favorite', 'category', 'category_name', 'uploader', 
                 'uploader_username', 'tags', 'created_at', 'updated_at', 
                 'file', 'file_url']
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request is not None:
            return request.build_absolute_uri(obj.file.url)
        return None


class DocumentDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para vista detallada de documentos"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    uploader_username = serializers.CharField(source='uploader.username', read_only=True)
    tags = DocumentTagSerializer(source='documenttag_set', many=True, read_only=True)
    versions = DocumentVersionSerializer(many=True, read_only=True)
    permissions = DocumentPermissionSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'file_name', 'file_type', 
                 'file_size', 'file_path', 'file', 'file_url', 'is_favorite', 'category', 
                 'category_name', 'uploader', 'uploader_username', 'tags', 
                 'versions', 'permissions', 'comments', 'created_at', 
                 'updated_at', 'is_deleted', 'deleted_at']
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request is not None:
            return request.build_absolute_uri(obj.file.url)
        return None
    
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
        fields = ['title', 'description', 'file', 'category', 'group', 'tags', 'is_favorite']
    
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


class CollectionDocumentSerializer(serializers.ModelSerializer):
    """Serializer para relación entre colecciones y documentos"""
    document_title = serializers.CharField(source='document.title', read_only=True)
    document_type = serializers.CharField(source='document.file_type', read_only=True)
    document_size = serializers.IntegerField(source='document.file_size', read_only=True)
    document_file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CollectionDocument
        fields = ['id', 'collection', 'document', 'document_title', 'document_type', 
                  'document_size', 'document_file_url', 'order', 'notes', 'created_at']
        read_only_fields = ['created_at']
    
    def get_document_file_url(self, obj):
        request = self.context.get('request')
        if obj.document.file and request is not None:
            return request.build_absolute_uri(obj.document.file.url)
        return None


class CollectionPermissionSerializer(serializers.ModelSerializer):
    """Serializer para permisos de colecciones"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = CollectionPermission
        fields = ['id', 'collection', 'user', 'user_username', 'permission_type', 'created_at']
        read_only_fields = ['created_at']


class CollectionActivitySerializer(serializers.ModelSerializer):
    """Serializer para actividades de colecciones"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = CollectionActivity
        fields = ['id', 'collection', 'user', 'user_username', 'activity_type', 
                 'activity_type_display', 'details', 'created_at']
        read_only_fields = ['created_at']


class CollectionListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listados de colecciones"""
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    document_count = serializers.IntegerField(read_only=True)
    total_size = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Collection
        fields = ['id', 'name', 'description', 'icon', 'color_code', 'is_public',
                 'creator', 'creator_username', 'document_count', 'total_size',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CollectionDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para vista detallada de colecciones"""
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    documents = serializers.SerializerMethodField()
    permissions = CollectionPermissionSerializer(many=True, read_only=True)
    activities = CollectionActivitySerializer(many=True, read_only=True)
    total_size = serializers.IntegerField(read_only=True)
    document_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Collection
        fields = ['id', 'name', 'description', 'icon', 'cover_image', 'color_code',
                 'is_public', 'share_token', 'expiry_date', 'include_annotations',
                 'include_comments', 'creator', 'creator_username', 'documents',
                 'permissions', 'activities', 'total_size', 'document_count',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'share_token', 'created_at', 'updated_at']
    
    def get_documents(self, obj):
        collection_documents = CollectionDocument.objects.filter(collection=obj).order_by('order')
        serializer = CollectionDocumentSerializer(collection_documents, many=True, context=self.context)
        return serializer.data


class CollectionCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear colecciones"""
    documents = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.filter(is_deleted=False),
        many=True,
        required=False
    )
    
    class Meta:
        model = Collection
        fields = ['name', 'description', 'icon', 'cover_image', 'color_code',
                 'is_public', 'expiry_date', 'include_annotations',
                 'include_comments', 'documents']
    
    def create(self, validated_data):
        documents = validated_data.pop('documents', [])
        collection = Collection.objects.create(**validated_data)
        
        # Crear las relaciones con los documentos
        for index, document in enumerate(documents):
            CollectionDocument.objects.create(
                collection=collection,
                document=document,
                order=index
            )
        
        # Registrar la actividad de creación
        CollectionActivity.objects.create(
            collection=collection,
            user=validated_data.get('creator'),
            activity_type='create',
            details='Colección creada'
        )
        
        return collection


class GroupMemberSerializer(serializers.ModelSerializer):
    """Serializer para miembros de grupos"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = GroupMember
        fields = ['id', 'group', 'user', 'user_username', 'role', 'role_display', 'joined_at']
        read_only_fields = ['joined_at']


class GroupListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listados de grupos"""
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    document_count = serializers.IntegerField(read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'slug', 'icon', 'color_code', 'is_public',
                 'creator', 'creator_username', 'document_count', 'member_count',
                 'created_at', 'updated_at']
        read_only_fields = ['slug', 'created_at', 'updated_at']
    
    def get_member_count(self, obj):
        return obj.members.count()


class GroupDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para vista detallada de grupos"""
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    document_count = serializers.IntegerField(read_only=True)
    members = GroupMemberSerializer(source='members', many=True, read_only=True)
    documents = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'slug', 'icon', 'color_code', 'is_public',
                 'creator', 'creator_username', 'document_count', 'members', 'documents',
                 'created_at', 'updated_at']
        read_only_fields = ['slug', 'created_at', 'updated_at']
    
    def get_documents(self, obj):
        # Solo obtenemos documentos no eliminados para este grupo
        documents = Document.objects.filter(group=obj, is_deleted=False)
        serializer = DocumentListSerializer(documents, many=True, context=self.context)
        return serializer.data


class GroupCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear grupos"""
    
    class Meta:
        model = Group
        fields = ['name', 'description', 'icon', 'color_code', 'is_public']
        
    def create(self, validated_data):
        print("GroupCreateSerializer.create - datos validados:", validated_data)
        return Group.objects.create(**validated_data)