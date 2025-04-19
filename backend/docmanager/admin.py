from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Tag, Document, DocumentVersion,
    DocumentTag, DocumentActivity, DocumentPermission, DocumentComment,
    Group, GroupMember, Collection, CollectionDocument, CollectionPermission, CollectionActivity
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'document_count', 'color_display', 'created_at')
    list_filter = ('parent',)
    search_fields = ('name', 'description')
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 5px; border-radius: 3px; color: white;">{}</span>',
            obj.color_code, obj.color_code
        )
    color_display.short_description = 'Color'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'color_display', 'document_count', 'created_at')
    search_fields = ('name',)
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 5px; border-radius: 3px; color: white;">{}</span>',
            obj.color_code, obj.color_code
        )
    color_display.short_description = 'Color'
    
    def document_count(self, obj):
        return obj.documents.count()
    document_count.short_description = 'Documentos'


class DocumentVersionInline(admin.TabularInline):
    model = DocumentVersion
    extra = 0
    readonly_fields = ('created_at',)
    fields = ('version_number', 'file', 'file_size', 'change_notes', 'created_by', 'created_at')


class DocumentTagInline(admin.TabularInline):
    model = DocumentTag
    extra = 1


class DocumentPermissionInline(admin.TabularInline):
    model = DocumentPermission
    extra = 1


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'file_type', 'file_size_display', 'is_favorite', 'uploader', 'updated_at', 'is_deleted')
    list_filter = ('is_favorite', 'is_deleted', 'file_type', 'category')
    search_fields = ('title', 'description', 'file_name')
    readonly_fields = ('created_at', 'updated_at', 'deleted_at')
    actions = ['mark_as_favorite', 'mark_as_not_favorite', 'soft_delete', 'restore']
    inlines = [DocumentTagInline, DocumentVersionInline, DocumentPermissionInline]
    
    fieldsets = (
        ('Información básica', {
            'fields': ('title', 'description', 'category', 'is_favorite')
        }),
        ('Archivo', {
            'fields': ('file', 'file_name', 'file_type', 'file_size', 'file_path')
        }),
        ('Metadatos', {
            'fields': ('uploader', 'created_at', 'updated_at')
        }),
        ('Estado', {
            'fields': ('is_deleted', 'deleted_at')
        }),
    )
    
    def file_size_display(self, obj):
        # Convertir bytes a KB, MB según sea necesario
        if obj.file_size < 1024:
            return f"{obj.file_size} bytes"
        elif obj.file_size < 1024 * 1024:
            return f"{obj.file_size / 1024:.1f} KB"
        else:
            return f"{obj.file_size / (1024 * 1024):.1f} MB"
    file_size_display.short_description = 'Tamaño'
    
    def mark_as_favorite(self, request, queryset):
        queryset.update(is_favorite=True)
    mark_as_favorite.short_description = "Marcar documentos seleccionados como favoritos"
    
    def mark_as_not_favorite(self, request, queryset):
        queryset.update(is_favorite=False)
    mark_as_not_favorite.short_description = "Desmarcar documentos seleccionados como favoritos"
    
    def soft_delete(self, request, queryset):
        for doc in queryset:
            doc.soft_delete()
    soft_delete.short_description = "Eliminar documentos seleccionados (soft delete)"
    
    def restore(self, request, queryset):
        for doc in queryset:
            doc.restore()
    restore.short_description = "Restaurar documentos eliminados"


@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ('document', 'version_number', 'file_size_display', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('document__title', 'version_number', 'change_notes')
    
    def file_size_display(self, obj):
        # Convertir bytes a KB, MB según sea necesario
        if obj.file_size < 1024:
            return f"{obj.file_size} bytes"
        elif obj.file_size < 1024 * 1024:
            return f"{obj.file_size / 1024:.1f} KB"
        else:
            return f"{obj.file_size / (1024 * 1024):.1f} MB"
    file_size_display.short_description = 'Tamaño'


@admin.register(DocumentActivity)
class DocumentActivityAdmin(admin.ModelAdmin):
    list_display = ('document', 'activity_type', 'user', 'created_at')
    list_filter = ('activity_type', 'created_at')
    search_fields = ('document__title', 'user__username', 'details')
    readonly_fields = ('document', 'user', 'activity_type', 'details', 'created_at')
    
    def has_add_permission(self, request):
        return False  # No permitir añadir actividades manualmente


@admin.register(DocumentPermission)
class DocumentPermissionAdmin(admin.ModelAdmin):
    list_display = ('document', 'user', 'permission_type', 'created_at')
    list_filter = ('permission_type', 'created_at')
    search_fields = ('document__title', 'user__username')


@admin.register(DocumentComment)
class DocumentCommentAdmin(admin.ModelAdmin):
    list_display = ('document', 'user', 'is_reply_display', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('document__title', 'user__username', 'content')
    
    def is_reply_display(self, obj):
        return "Respuesta" if obj.is_reply else "Comentario principal"
    is_reply_display.short_description = 'Tipo'


class GroupMemberInline(admin.TabularInline):
    model = GroupMember
    extra = 1


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'color_display', 'document_count', 'is_public', 'creator', 'created_at')
    list_filter = ('is_public', 'created_at')
    search_fields = ('name', 'description')
    inlines = [GroupMemberInline]
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 5px; border-radius: 3px; color: white;">{}</span>',
            obj.color_code, obj.color_code
        )
    color_display.short_description = 'Color'


@admin.register(GroupMember)
class GroupMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'group', 'role', 'joined_at')
    list_filter = ('role', 'joined_at')
    search_fields = ('user__username', 'group__name')


class CollectionDocumentInline(admin.TabularInline):
    model = CollectionDocument
    extra = 1


class CollectionPermissionInline(admin.TabularInline):
    model = CollectionPermission
    extra = 1


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'color_display', 'document_count', 'is_public', 'creator', 'created_at')
    list_filter = ('is_public', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'share_token', 'created_at', 'updated_at')
    inlines = [CollectionDocumentInline, CollectionPermissionInline]
    
    fieldsets = (
        ('Información básica', {
            'fields': ('id', 'name', 'description', 'color_code', 'icon')
        }),
        ('Presentación', {
            'fields': ('cover_image',)
        }),
        ('Compartición', {
            'fields': ('is_public', 'share_token', 'expiry_date')
        }),
        ('Opciones de exportación', {
            'fields': ('include_annotations', 'include_comments')
        }),
        ('Metadatos', {
            'fields': ('creator', 'created_at', 'updated_at')
        }),
    )
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 5px; border-radius: 3px; color: white;">{}</span>',
            obj.color_code, obj.color_code
        )
    color_display.short_description = 'Color'


@admin.register(CollectionDocument)
class CollectionDocumentAdmin(admin.ModelAdmin):
    list_display = ('document', 'collection', 'order', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('document__title', 'collection__name', 'notes')


@admin.register(CollectionPermission)
class CollectionPermissionAdmin(admin.ModelAdmin):
    list_display = ('collection', 'user', 'permission_type', 'created_at')
    list_filter = ('permission_type', 'created_at')
    search_fields = ('collection__name', 'user__username')


@admin.register(CollectionActivity)
class CollectionActivityAdmin(admin.ModelAdmin):
    list_display = ('collection', 'activity_type', 'user', 'created_at')
    list_filter = ('activity_type', 'created_at')
    search_fields = ('collection__name', 'user__username', 'details')
    readonly_fields = ('collection', 'user', 'activity_type', 'details', 'created_at')
    
    def has_add_permission(self, request):
        return False  # No permitir añadir actividades manualmente