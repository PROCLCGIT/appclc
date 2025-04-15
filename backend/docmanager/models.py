from django.db import models
from django.conf import settings
from django.utils import timezone


class Category(models.Model):
    """Categorías para clasificar documentos"""
    name = models.CharField(max_length=100, verbose_name="Nombre")
    description = models.TextField(blank=True, verbose_name="Descripción")
    color_code = models.CharField(max_length=20, default='#3B82F6', verbose_name="Código de color")
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subcategories', verbose_name="Categoría padre")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['name']
    
    def __str__(self):
        if self.parent:
            return f"{self.parent} > {self.name}"
        return self.name
    
    @property
    def document_count(self):
        """Retorna el número de documentos en esta categoría"""
        return self.documents.filter(is_deleted=False).count()


class Tag(models.Model):
    """Etiquetas para clasificación transversal de documentos"""
    name = models.CharField(max_length=50, unique=True, verbose_name="Nombre")
    color_code = models.CharField(max_length=20, default='#4F46E5', verbose_name="Código de color")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        verbose_name = "Etiqueta"
        verbose_name_plural = "Etiquetas"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Document(models.Model):
    """Modelo principal para documentos"""
    title = models.CharField(max_length=255, verbose_name="Título")
    description = models.TextField(blank=True, verbose_name="Descripción")
    file_name = models.CharField(max_length=255, verbose_name="Nombre del archivo")
    file_type = models.CharField(max_length=20, verbose_name="Tipo de archivo")
    file_size = models.IntegerField(default=0, verbose_name="Tamaño (bytes)")
    file_path = models.CharField(max_length=500, verbose_name="Ruta del archivo")
    is_favorite = models.BooleanField(default=False, verbose_name="Favorito")
    
    # Relaciones
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL, related_name='documents', verbose_name="Categoría")
    tags = models.ManyToManyField(Tag, through='DocumentTag', related_name='documents', verbose_name="Etiquetas")
    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_documents', verbose_name="Subido por")
    
    # Control temporal
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de eliminación")
    is_deleted = models.BooleanField(default=False, verbose_name="Eliminado")
    
    # Campo para almacenar el archivo
    file = models.FileField(upload_to='documents/%Y/%m/%d/', verbose_name="Archivo", null=True)
    
    class Meta:
        verbose_name = "Documento"
        verbose_name_plural = "Documentos"
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title
    
    def soft_delete(self):
        """Elimina el documento de forma lógica"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """Restaura un documento eliminado lógicamente"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()
    
    @property
    def current_version(self):
        """Retorna la versión actual del documento"""
        return self.versions.order_by('-created_at').first()
    
    def save(self, *args, **kwargs):
        """Sobrescribe el método save para actualizar file_size si hay archivo"""
        if self.file and not self.file_size:
            self.file_size = self.file.size
            
        # Si no hay file_path pero hay file, usar la ruta del file
        if self.file and not self.file_path:
            self.file_path = self.file.name
            
        # Si no hay file_name pero hay file, usar el nombre del file
        if self.file and not self.file_name:
            self.file_name = self.file.name.split('/')[-1]
            
        # Si no hay file_type pero hay file_name, inferir del nombre
        if self.file_name and not self.file_type:
            extension = self.file_name.split('.')[-1] if '.' in self.file_name else ''
            self.file_type = extension.lower()
            
        super().save(*args, **kwargs)


class DocumentVersion(models.Model):
    """Versiones de un documento para control de cambios"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions', verbose_name="Documento")
    version_number = models.CharField(max_length=20, verbose_name="Número de versión")
    file_path = models.CharField(max_length=500, verbose_name="Ruta del archivo")
    file_size = models.IntegerField(default=0, verbose_name="Tamaño (bytes)")
    change_notes = models.TextField(blank=True, verbose_name="Notas de cambio")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='document_versions', verbose_name="Creado por")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    
    # Campo para almacenar el archivo de esta versión
    file = models.FileField(upload_to='document_versions/%Y/%m/%d/', verbose_name="Archivo", null=True)
    
    class Meta:
        verbose_name = "Versión de documento"
        verbose_name_plural = "Versiones de documentos"
        ordering = ['-created_at']
        unique_together = ('document', 'version_number')
    
    def __str__(self):
        return f"{self.document.title} - v{self.version_number}"
    
    def save(self, *args, **kwargs):
        """Sobrescribe el método save para actualizar file_size si hay archivo"""
        if self.file and not self.file_size:
            self.file_size = self.file.size
            
        # Si no hay file_path pero hay file, usar la ruta del file
        if self.file and not self.file_path:
            self.file_path = self.file.name
            
        super().save(*args, **kwargs)


class DocumentTag(models.Model):
    """Relación entre documentos y etiquetas"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, verbose_name="Documento")
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, verbose_name="Etiqueta")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    
    class Meta:
        verbose_name = "Etiqueta de documento"
        verbose_name_plural = "Etiquetas de documentos"
        unique_together = ('document', 'tag')
    
    def __str__(self):
        return f"{self.document.title} - {self.tag.name}"


class DocumentActivity(models.Model):
    """Registro de actividades realizadas sobre documentos"""
    ACTIVITY_TYPES = [
        ('view', 'Visualización'),
        ('download', 'Descarga'),
        ('edit', 'Edición'),
        ('share', 'Compartir'),
        ('delete', 'Eliminación'),
        ('restore', 'Restauración'),
        ('version', 'Nueva versión'),
        ('comment', 'Comentario'),
    ]
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='activities', verbose_name="Documento")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='document_activities', verbose_name="Usuario")
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES, verbose_name="Tipo de actividad")
    details = models.TextField(blank=True, verbose_name="Detalles")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    
    class Meta:
        verbose_name = "Actividad de documento"
        verbose_name_plural = "Actividades de documentos"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_activity_type_display()} de {self.document.title} por {self.user.username}"


class DocumentPermission(models.Model):
    """Permisos de acceso a documentos por usuario"""
    PERMISSION_TYPES = [
        ('view', 'Visualización'),
        ('edit', 'Edición'),
        ('admin', 'Administración'),
    ]
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='permissions', verbose_name="Documento")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='document_permissions', verbose_name="Usuario")
    permission_type = models.CharField(max_length=20, choices=PERMISSION_TYPES, default='view', verbose_name="Tipo de permiso")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        verbose_name = "Permiso de documento"
        verbose_name_plural = "Permisos de documentos"
        unique_together = ('document', 'user', 'permission_type')
    
    def __str__(self):
        return f"{self.document.title} - {self.get_permission_type_display()} para {self.user.username}"


class DocumentComment(models.Model):
    """Comentarios sobre documentos"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='comments', verbose_name="Documento")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='document_comments', verbose_name="Usuario")
    content = models.TextField(verbose_name="Contenido")
    parent_comment = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies', verbose_name="Comentario padre")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        verbose_name = "Comentario"
        verbose_name_plural = "Comentarios"
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comentario de {self.user.username} en {self.document.title}"
    
    @property
    def is_reply(self):
        """Indica si el comentario es una respuesta a otro comentario"""
        return self.parent_comment is not None