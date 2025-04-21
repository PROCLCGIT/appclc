"""
Filtros avanzados para toda la aplicación.
Proporciona filtros reutilizables para todos los módulos.
"""
from django_filters import rest_framework as filters
from django.db.models import Q
import datetime
import re

class MultipleFieldFilter(filters.CharFilter):
    """
    Filtro que busca en múltiples campos de texto.
    Realiza búsqueda por coincidencia (LIKE) en cualquiera de los campos configurados.
    """
    def __init__(self, field_names, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.field_names = field_names
        
    def filter(self, qs, value):
        if not value:
            return qs
            
        # Construir Q objects para cada campo
        # Ejemplo: Q(campo1__icontains=value) | Q(campo2__icontains=value) ...
        query = Q()
        for field in self.field_names:
            query |= Q(**{f"{field}__icontains": value})
            
        return qs.filter(query).distinct()

class DateRangeFilter(filters.Filter):
    """
    Filtro para buscar en un rango de fechas con formato flexible.
    Ejemplos de uso: 
    - '2023-01-01:2023-12-31'
    - 'last_week'
    - 'current_month'
    - 'yesterday'
    """
    def filter(self, qs, value):
        if not value:
            return qs
            
        # Manejar rangos especiales
        today = datetime.date.today()
        
        # Patrones normalizados
        if value == 'today':
            start_date = today
            end_date = today
        elif value == 'yesterday':
            start_date = today - datetime.timedelta(days=1)
            end_date = start_date
        elif value == 'current_week':
            start_date = today - datetime.timedelta(days=today.weekday())
            end_date = today
        elif value == 'last_week':
            current_week_start = today - datetime.timedelta(days=today.weekday())
            start_date = current_week_start - datetime.timedelta(days=7)
            end_date = current_week_start - datetime.timedelta(days=1)
        elif value == 'current_month':
            start_date = today.replace(day=1)
            end_date = today
        elif value == 'last_month':
            last_month = today.month - 1 if today.month > 1 else 12
            last_month_year = today.year if today.month > 1 else today.year - 1
            last_month_day = min(
                today.day,
                (datetime.date(last_month_year, last_month + 1, 1) - datetime.timedelta(days=1)).day
            )
            start_date = datetime.date(last_month_year, last_month, 1)
            end_date = datetime.date(last_month_year, last_month, last_month_day)
        elif value == 'last_30_days':
            start_date = today - datetime.timedelta(days=30)
            end_date = today
        elif value == 'last_90_days':
            start_date = today - datetime.timedelta(days=90)
            end_date = today
        elif value == 'current_year':
            start_date = today.replace(month=1, day=1)
            end_date = today
        elif value == 'last_year':
            start_date = datetime.date(today.year - 1, 1, 1)
            end_date = datetime.date(today.year - 1, 12, 31)
        else:
            # Intentar parsear un rango en formato 'fecha_inicio:fecha_fin'
            date_parts = value.split(':')
            if len(date_parts) == 2:
                try:
                    from django.utils.dateparse import parse_date
                    start_date = parse_date(date_parts[0])
                    end_date = parse_date(date_parts[1])
                except (TypeError, ValueError):
                    return qs
            else:
                # Intentar parsear como fecha única
                try:
                    from django.utils.dateparse import parse_date
                    date_obj = parse_date(value)
                    if date_obj:
                        start_date = end_date = date_obj
                    else:
                        return qs
                except (TypeError, ValueError):
                    return qs
                    
        # Filtrar el queryset con el rango de fechas
        if start_date and end_date:
            return qs.filter(**{
                f"{self.field_name}__gte": start_date,
                f"{self.field_name}__lte": end_date
            })
            
        return qs

class RelatedFieldFilter(filters.Filter):
    """
    Filtro para campos relacionados que permite filtrar por propiedades de objetos relacionados.
    Ejemplo: Filtrar productos por el nombre de su categoría.
    """
    def __init__(self, relation_field, lookup_field, *args, **kwargs):
        """
        Args:
            relation_field: Campo de la relación (ej: 'categoria')
            lookup_field: Campo del objeto relacionado (ej: 'nombre')
        """
        self.relation_field = relation_field
        self.lookup_field = lookup_field
        super().__init__(*args, **kwargs)
    
    def filter(self, qs, value):
        if not value:
            return qs
            
        # Construir la consulta
        lookup = f"{self.relation_field}__{self.lookup_field}__icontains"
        return qs.filter(**{lookup: value})

class ProductoDisponibleFilter(filters.FilterSet):
    """FilterSet específico para el modelo ProductoDisponible"""
    # Ejemplo de uso de MultipleFieldFilter para búsqueda en varios campos
    search = MultipleFieldFilter(
        field_names=['code', 'nombre', 'modelo', 'referencia'],
        label='Búsqueda general'
    )
    
    # Filtros por rangos para calificaciones
    rating_min = filters.NumberFilter(
        field_name='tz_referencial', 
        lookup_expr='gte',
        label='Calificación mínima'
    )
    rating_max = filters.NumberFilter(
        field_name='tz_referencial', 
        lookup_expr='lte',
        label='Calificación máxima'
    )
    
    # Filtro por rango de precios
    price_min = filters.NumberFilter(
        field_name='precio_sie_referencial', 
        lookup_expr='gte',
        label='Precio mínimo'
    )
    price_max = filters.NumberFilter(
        field_name='precio_sie_referencial', 
        lookup_expr='lte',
        label='Precio máximo'
    )
    
    # Filtro por nombre de categoría (relación)
    categoria_nombre = RelatedFieldFilter(
        relation_field='id_categoria',
        lookup_field='nombre',
        label='Nombre de categoría'
    )
    
    # Filtro por nombre de marca (relación)
    marca_nombre = RelatedFieldFilter(
        relation_field='id_marca',
        lookup_field='nombre',
        label='Nombre de marca'
    )
    
    # Filtro por fecha de creación
    created_range = DateRangeFilter(
        field_name='created_at',
        label='Rango de creación'
    )
    
    class Meta:
        # Este es solo un ejemplo, debes definir el modelo real cuando uses este filtro
        fields = {
            'id_categoria': ['exact'],
            'id_marca': ['exact'],
            'is_active': ['exact'],
            'tz_oferta': ['gte', 'lte'],
            'tz_demanda': ['gte', 'lte'],
            'tz_inflacion': ['gte', 'lte'],
            'tz_calidad': ['gte', 'lte'],
            'tz_eficiencia': ['gte', 'lte'],
        }

class ProductoOfertadoFilter(filters.FilterSet):
    """FilterSet específico para el modelo ProductoOfertado"""
    # Ejemplo de uso de MultipleFieldFilter para búsqueda en varios campos
    search = MultipleFieldFilter(
        field_names=['code', 'nombre', 'descripcion', 'especialidad'],
        label='Búsqueda general'
    )
    
    # Filtro por nombre de categoría (relación)
    categoria_nombre = RelatedFieldFilter(
        relation_field='id_categoria',
        lookup_field='nombre',
        label='Nombre de categoría'
    )
    
    # Filtro por fecha de creación
    created_range = DateRangeFilter(
        field_name='created_at',
        label='Rango de creación'
    )
    
    class Meta:
        # Este es solo un ejemplo, debes definir el modelo real cuando uses este filtro
        fields = {
            'id_categoria': ['exact'],
            'is_active': ['exact'],
            'especialidad': ['exact', 'icontains'],
        }

class HistorialTransaccionesFilter(filters.FilterSet):
    """
    FilterSet base para historiales de ventas y compras.
    Clase abstracta para compartir filtros comunes.
    """
    # Rango de fechas
    fecha_range = DateRangeFilter(
        field_name='fecha',
        label='Rango de fechas'
    )
    
    # Rango de valor
    valor_min = filters.NumberFilter(field_name='valor', lookup_expr='gte')
    valor_max = filters.NumberFilter(field_name='valor', lookup_expr='lte')
    
    # Búsqueda en factura
    factura_contains = filters.CharFilter(
        field_name='factura',
        lookup_expr='icontains'
    )
    
    # Rango de cantidad
    cantidad_min = filters.NumberFilter(field_name='cantidad', lookup_expr='gte')
    cantidad_max = filters.NumberFilter(field_name='cantidad', lookup_expr='lte')
