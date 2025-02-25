# backend/appclc/pandora/models.py
from django.db import models

class TimeStampedModel(models.Model):
    """Abstract model to add created and modified timestamps"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Procesos_auditados(TimeStampedModel):
    nombre = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    objeto = models.CharField(max_length=200)

    class Meta:
        verbose_name_plural = "Procesos Auditados"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class Categorias(TimeStampedModel):
    nombre = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=20, unique=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    level = models.IntegerField(default=0)
    path = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Categorías"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre
    
    def save(self, *args, **kwargs):
        if self.parent:
            self.level = self.parent.level + 1
            self.path = f"{self.parent.path}/{self.code}"
        else:
            self.level = 0
            self.path = self.code
        super().save(*args, **kwargs)

class Ciudades(TimeStampedModel):
    nombre = models.CharField(max_length=50, unique=True)
    provincia = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name_plural = "Ciudades"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class EmpresaClc(TimeStampedModel):
    nombre = models.CharField(max_length=150, unique=True)
    razon_social = models.CharField(max_length=150, unique=True)
    code = models.CharField(max_length=50, unique=True)
    ruc = models.CharField(max_length=13, unique=True)
    direccion = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(max_length=100)
    representante_legal = models.CharField(max_length=150)

    class Meta:
        verbose_name = "Empresa CLC"
        verbose_name_plural = "Empresas CLC"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class Especialidades(TimeStampedModel):
    nombre = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name_plural = "Especialidades"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class Marca(TimeStampedModel):
    nombre = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    proveedores = models.CharField(max_length=100, blank=True)
    country_origin = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)
    contact_info = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class Procedencia(TimeStampedModel):
    nombre = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name_plural = "Procedencias"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class TipoCliente(TimeStampedModel):
    nombre = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name = "Tipo de Cliente"
        verbose_name_plural = "Tipos de Cliente"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class TipoContratacion(TimeStampedModel):
    nombre = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name = "Tipo de Contratación"
        verbose_name_plural = "Tipos de Contratación"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class Unidades(TimeStampedModel):
    nombre = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name_plural = "Unidades"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class Zonas(TimeStampedModel):
    nombre = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=20, unique=True)
    cobertura = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Zonas"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class Pandora(TimeStampedModel):
    nombre = models.CharField(max_length=250, unique=True)
    code = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class Clientes(TimeStampedModel):
    zona = models.ForeignKey(Zonas, on_delete=models.CASCADE)
    ciudad = models.ForeignKey(Ciudades, on_delete=models.CASCADE)
    tipo_cliente = models.ForeignKey(TipoCliente, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=80, unique=True)
    alias = models.CharField(max_length=30, unique=True)
    razon_social = models.CharField(max_length=255)
    ruc = models.CharField(max_length=13)
    email = models.EmailField(max_length=50)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.CharField(max_length=100)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Clientes"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class PreciosSie(TimeStampedModel):
    pandora = models.ForeignKey(Pandora, on_delete=models.CASCADE)
    cliente = models.ForeignKey(Clientes, on_delete=models.CASCADE)
    detalle_sie = models.ForeignKey(Procesos_auditados, on_delete=models.CASCADE)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    nota = models.TextField(blank=True, null=True)
    fecha_sie = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = "Precio SIE"
        verbose_name_plural = "Precios SIE"
        ordering = ['-fecha_sie', 'pandora']

    def __str__(self):
        return f"{self.pandora} - {self.cliente} - {self.precio} - {self.detalle_sie}"

class MsPref(TimeStampedModel):
    sku = models.CharField(max_length=50)
    nombre_generico = models.CharField(max_length=250)
    categoria = models.ForeignKey(Categorias, on_delete=models.CASCADE)
    especialidad = models.ForeignKey(Especialidades, on_delete=models.CASCADE)
    normada = models.BooleanField()
    referencias_tecnica = models.TextField()
    aplicaciones = models.TextField()

    class Meta:
        verbose_name = "MS Pref"
        verbose_name_plural = "MS Prefs"
        ordering = ['sku']

    def __str__(self):
        return f"{self.sku} - {self.nombre_generico}"

class Proveedores(TimeStampedModel):
    ruc = models.CharField(max_length=20, unique=True)
    razon_social = models.CharField(max_length=255)
    nombre = models.CharField(max_length=255, unique=True)
    direccion1 = models.TextField()
    direccion2 = models.TextField(blank=True, null=True)
    correo = models.EmailField(blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    tipo_primario = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Proveedores"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class CostosPandora(TimeStampedModel):
    pandora = models.ForeignKey(Pandora, on_delete=models.CASCADE)
    proveedor = models.ForeignKey(Proveedores, on_delete=models.CASCADE)
    marca = models.ForeignKey(Marca, on_delete=models.CASCADE)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    nota = models.TextField(blank=True, null=True)
    fecha = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = "Costo Pandora"
        verbose_name_plural = "Costos Pandora"
        ordering = ['-fecha', 'pandora']

    def __str__(self):
        return f"{self.pandora} - {self.proveedor} - {self.precio}"

class Vendedores(TimeStampedModel):
    proveedor = models.ForeignKey(Proveedores, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    correo = models.EmailField(max_length=50, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    observacion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre
