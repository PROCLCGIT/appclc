"""
Configuraciones personalizadas de paginación para el módulo de proformas
"""
from rest_framework.pagination import PageNumberPagination, LimitOffsetPagination
import logging

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    """
    Paginador estándar por número de página para el módulo proformas
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        """
        Personaliza la respuesta de paginación para incluir más metadatos útiles
        """
        # Registrar información de paginación para debugging
        logger.debug(
            f"Paginación: página {self.page.number} de {self.page.paginator.num_pages}, "
            f"mostrando {len(data)} de {self.page.paginator.count} resultados"
        )
        
        response = super().get_paginated_response(data)
        response.data['current_page'] = self.page.number
        response.data['total_pages'] = self.page.paginator.num_pages
        response.data['page_size'] = self.page_size
        
        # Agregar URLs para primera y última página
        if self.page.has_previous():
            response.data['first_page'] = self.request.build_absolute_uri(
                self.get_first_link()
            )
        if self.page.has_next():
            response.data['last_page'] = self.request.build_absolute_uri(
                self.get_last_link()
            )
        
        return response
    
    def get_first_link(self):
        """Obtiene el enlace a la primera página"""
        url = self.request.build_absolute_uri()
        page_number = 1
        return self.replace_query_param(url, self.page_query_param, page_number)
    
    def get_last_link(self):
        """Obtiene el enlace a la última página"""
        url = self.request.build_absolute_uri()
        page_number = self.page.paginator.num_pages
        return self.replace_query_param(url, self.page_query_param, page_number)


class LargeResultsSetPagination(LimitOffsetPagination):
    """
    Paginador para conjuntos más grandes de datos con limit/offset
    Útil para obtener lotes grandes de datos o para scroll infinito
    """
    default_limit = 50
    limit_query_param = 'limit'
    offset_query_param = 'offset'
    max_limit = 500
    
    def get_paginated_response(self, data):
        """
        Personaliza la respuesta para incluir metadatos adicionales útiles para frontend
        """
        response = super().get_paginated_response(data)
        response.data['total_pages'] = (self.count + self.limit - 1) // self.limit if self.limit else 1
        response.data['current_page'] = (self.offset // self.limit) + 1 if self.limit else 1
        
        # Calcular páginas anterior y siguiente
        if self.offset > 0:
            previous_offset = max(0, self.offset - self.limit)
            previous_page = (previous_offset // self.limit) + 1
            response.data['previous_page'] = previous_page
        
        if self.offset + self.limit < self.count:
            next_offset = self.offset + self.limit
            next_page = (next_offset // self.limit) + 1
            response.data['next_page'] = next_page
        
        return response
