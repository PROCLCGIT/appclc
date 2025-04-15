# /backend/brief/models.py

from django.db import models
from pandora.models import TimeStampedModel, Clientes, Unidades


class Brief(TimeStampedModel):
    """
    Model to store brief information for projects
    """
    codigo = models.CharField(max_length=50, unique=True)
    origen = models.CharField(max_length=100)
    fecha = models.DateField()
    presupuestoref = models.DecimalField(max_digits=10, decimal_places=2)
    observaciones = models.TextField(blank=True, null=True)
    cliente = models.ForeignKey(Clientes, on_delete=models.PROTECT)

    class Meta:
        verbose_name = "Brief"
        verbose_name_plural = "Briefs"
        ordering = ['-fecha', 'codigo']

    def __str__(self):
        return f"{self.codigo} - {self.cliente.nombre} ({self.fecha})"


class BriefItems(TimeStampedModel):
    """
    Model to store items associated with a brief
    """
    id_brief = models.ForeignKey(Brief, on_delete=models.PROTECT, related_name='items')
    cudim = models.CharField(max_length=50)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    unidad = models.ForeignKey(Unidades, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = "Brief Item"
        verbose_name_plural = "Brief Items"
        ordering = ['id_brief', 'nombre']

    def __str__(self):
        return f"{self.id_brief.codigo} - {self.nombre} ({self.cantidad})"