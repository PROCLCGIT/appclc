from django.db import models
from django.utils import timezone

# Modelo abstracto con los campos comunes
class EmpresaBase(models.Model):
    empresa = models.CharField(max_length=255, verbose_name="Empresa")
    ruc = models.CharField(max_length=13, unique=True, verbose_name="RUC")
    usuario = models.CharField(max_length=255, verbose_name="Usuario")
    contrasena = models.CharField(max_length=255, verbose_name="Contraseña")  # Usamos 'contrasena' sin ñ
    correo = models.EmailField(verbose_name="Correo Electrónico")
    telefono = models.CharField(max_length=20, verbose_name="Teléfono")
    representante = models.CharField(max_length=255, verbose_name="Representante")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="Última Actualización")

    class Meta:
        abstract = True

    def __str__(self):
        return self.empresa

# Tabla SRI
class Sri(EmpresaBase):
    class Meta:
        verbose_name = "SRI"
        verbose_name_plural = "SRI"
        ordering = ['-fecha_actualizacion']

# Tabla SERCOP
class Sercop(EmpresaBase):
    class Meta:
        verbose_name = "SERCOP"
        verbose_name_plural = "SERCOP"
        ordering = ['-fecha_actualizacion']

# Tabla SUPERCOM
class Supercom(EmpresaBase):
    class Meta:
        verbose_name = "SUPERCOM"
        verbose_name_plural = "SUPERCOM"
        ordering = ['-fecha_actualizacion']

# Tabla OTRAS INSTITUCIONES, que extiende de EmpresaBase e incluye campos adicionales
class OtrasInstituciones(EmpresaBase):
    institucion = models.CharField(max_length=255, verbose_name="Institución")
    url = models.URLField(verbose_name="URL")

    class Meta:
        verbose_name = "Otra Institución"
        verbose_name_plural = "Otras Instituciones"
        ordering = ['institucion', '-fecha_actualizacion']

    def __str__(self):
        return f"{self.empresa} - {self.institucion}"
