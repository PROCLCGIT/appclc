from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class CategoryRateThrottle(UserRateThrottle):
    rate = '20/minute'  # Más permisivo para usuarios autenticados
    scope = 'categories'

class TagRateThrottle(UserRateThrottle):
    rate = '20/minute'  # Más permisivo para usuarios autenticados
    scope = 'tags'

class DocumentRateThrottle(UserRateThrottle):
    rate = '30/minute'  # Límite para operaciones con documentos
    scope = 'documents'

class CategoryAnonRateThrottle(AnonRateThrottle):
    rate = '5/minute'  # Más restrictivo para usuarios anónimos
    scope = 'categories_anon'

class TagAnonRateThrottle(AnonRateThrottle):
    rate = '5/minute'  # Más restrictivo para usuarios anónimos
    scope = 'tags_anon'

class DocumentAnonRateThrottle(AnonRateThrottle):
    rate = '10/minute'  # Límite para operaciones anónimas con documentos
    scope = 'documents_anon'