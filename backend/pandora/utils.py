"""
Utilidades generales para toda la aplicación.
Funciones comunes que pueden ser usadas en cualquier módulo.
"""
import os
import uuid
import datetime
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from django.utils.text import slugify
from django.db import connection
from functools import wraps

def procesar_imagen(image, max_size=(1500, 1500), format='JPEG', quality=80):
    """
    Procesa una imagen: redimensiona, convierte formato y optimiza.
    
    Args:
        image: Archivo de imagen a procesar
        max_size: Tuple con dimensiones máximas (ancho, alto)
        format: Formato de salida ('JPEG', 'PNG', etc.)
        quality: Calidad de compresión (1-100)
        
    Returns:
        ContentFile: Archivo procesado
    """
    if not image:
        return None
        
    try:
        # Abrir la imagen
        img = Image.open(image)
        
        # Convertir a RGB (si es necesario)
        if img.mode != 'RGB' and format == 'JPEG':
            img = img.convert('RGB')
            
        # Redimensionar manteniendo proporciones
        img.thumbnail(max_size)
        
        # Guardar en buffer
        output = BytesIO()
        img.save(output, format=format, quality=quality)
        output.seek(0)
        
        # Crear ContentFile con el mismo nombre
        filename = os.path.splitext(os.path.basename(image.name))[0]
        extension = format.lower()
        new_name = f"{filename}.{extension}"
        
        return ContentFile(output.read(), name=new_name)
    except Exception as e:
        import logging
        logging.error(f"Error al procesar imagen: {str(e)}")
        return image  # En caso de error, devolver la imagen original

def generar_nombre_archivo(instance, filename, tipo='documento', base_path=None):
    """
    Genera un nombre de archivo único para upload de archivos.
    
    Args:
        instance: Instancia del modelo
        filename: Nombre original del archivo
        tipo: Tipo de archivo (documento, imagen, etc.)
        base_path: Ruta base para almacenar archivos
        
    Returns:
        str: Ruta completa para el archivo
    """
    # Obtener extensión
    ext = filename.split('.')[-1]
    
    # Crear ID único
    unique_id = uuid.uuid4()
    
    # Crear slug del nombre original para mantener legibilidad
    basename = os.path.splitext(filename)[0]
    slug = slugify(basename)
    
    # Crear nombre final
    new_filename = f"{slug}_{unique_id}.{ext}"
    
    # Determinar directorio según el tipo de instancia
    if not base_path:
        # Tratar de determinar el directorio automáticamente
        model_name = instance.__class__.__name__.lower()
        base_path = os.path.join(model_name, tipo)
    
    # Si la instancia tiene ID, usarlo para organizar archivos
    if hasattr(instance, 'id') and instance.id:
        return os.path.join(base_path, str(instance.id), new_filename)
    else:
        # Para instancias nuevas, usar temp y luego mover el archivo
        return os.path.join(base_path, 'temp', new_filename)

def mover_archivos_temporales(instance, campo_archivo, base_path):
    """
    Mueve archivos de la carpeta temp a la carpeta definitiva con ID.
    Para usar en el método save() después de guardar una nueva instancia.
    
    Args:
        instance: Instancia del modelo
        campo_archivo: Nombre del campo FileField/ImageField
        base_path: Ruta base donde están los archivos
    """
    archivo = getattr(instance, campo_archivo)
    if not archivo:
        return
        
    # Verificar si el archivo está en la carpeta temp
    if '/temp/' in archivo.name:
        # Obtener nombre del archivo
        filename = os.path.basename(archivo.name)
        
        # Crear nueva ruta con ID
        nueva_ruta = os.path.join(base_path, str(instance.id), filename)
        
        # Guardar la ruta actual
        ruta_actual = archivo.path
        
        # Asignar nueva ruta
        archivo.name = nueva_ruta
        
        # Guardar instancia para actualizar campo
        instance.save(update_fields=[campo_archivo])
        
        # Asegurar que exista el directorio
        os.makedirs(os.path.dirname(archivo.path), exist_ok=True)
        
        # Mover archivo físicamente
        if os.path.exists(ruta_actual):
            import shutil
            shutil.move(ruta_actual, archivo.path)

def formatear_fecha(fecha, formato='%d/%m/%Y'):
    """
    Formatea una fecha en un formato específico.
    
    Args:
        fecha: Objeto date/datetime
        formato: Formato de salida
        
    Returns:
        str: Fecha formateada
    """
    if not fecha:
        return ''
        
    if isinstance(fecha, str):
        try:
            fecha = datetime.datetime.strptime(fecha, '%Y-%m-%d').date()
        except ValueError:
            return fecha
    
    return fecha.strftime(formato)

def formatear_numero(numero, decimales=2, separador_miles='.', separador_decimal=','):
    """
    Formatea un número con separadores localizados.
    
    Args:
        numero: Número a formatear
        decimales: Cantidad de decimales
        separador_miles: Caracter para separar miles
        separador_decimal: Caracter para separar decimales
        
    Returns:
        str: Número formateado
    """
    if numero is None:
        return ''
        
    try:
        numero = float(numero)
    except (ValueError, TypeError):
        return str(numero)
        
    # Formatear con cantidad fija de decimales
    formato = f"{{:,.{decimales}f}}"
    formateado = formato.format(numero)
    
    # Reemplazar separadores según configuración regional
    if separador_miles != ',' or separador_decimal != '.':
        # Primero reemplazamos la coma por un placeholder
        formateado = formateado.replace(',', '__COMMA__')
        # Luego reemplazamos el punto por el separador decimal
        formateado = formateado.replace('.', separador_decimal)
        # Finalmente reemplazamos el placeholder por el separador de miles
        formateado = formateado.replace('__COMMA__', separador_miles)
        
    return formateado

def ejecutar_query_raw(query, params=None):
    """
    Ejecuta una consulta SQL raw y devuelve los resultados como diccionarios.
    NOTA: Usar con precaución por riesgo de SQL Injection.
    
    Args:
        query: String con consulta SQL
        params: Parámetros para la consulta (lista o diccionario)
        
    Returns:
        list: Lista de diccionarios con los resultados
    """
    with connection.cursor() as cursor:
        cursor.execute(query, params or [])
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]

def truncar_texto(texto, longitud=100, sufijo='...'):
    """
    Trunca un texto a una longitud máxima.
    
    Args:
        texto: Texto a truncar
        longitud: Longitud máxima
        sufijo: Texto a añadir al final si se trunca
        
    Returns:
        str: Texto truncado
    """
    if not texto:
        return ''
        
    texto = str(texto)
    if len(texto) <= longitud:
        return texto
        
    return texto[:longitud].rsplit(' ', 1)[0] + sufijo

def limpiar_texto(texto, permitir_html=False):
    """
    Limpia un texto de caracteres no deseados o contenido malicioso.
    
    Args:
        texto: Texto a limpiar
        permitir_html: Si es True, no elimina etiquetas HTML
        
    Returns:
        str: Texto limpio
    """
    if not texto:
        return ''
        
    texto = str(texto)
    
    # Eliminar espacios extras
    texto = ' '.join(texto.split())
    
    # Si no permitimos HTML, eliminamos etiquetas
    if not permitir_html:
        import re
        texto = re.sub(r'<[^>]*>', '', texto)
        
    return texto

def optimizar_query(func):
    """
    Decorador para optimizar y medir consultas en una función o método.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        from django.db import connection, reset_queries
        from django.conf import settings
        import time
        
        # Solo realizar esto en modo DEBUG
        debug = settings.DEBUG
        if debug:
            reset_queries()
            start = time.time()
            
        # Ejecutar la función original
        result = func(*args, **kwargs)
        
        if debug:
            # Calcular métricas
            elapsed = time.time() - start
            queries_count = len(connection.queries)
            queries_time = sum(float(q['time']) for q in connection.queries if 'time' in q)
            
            # Identificar consultas duplicadas
            queries = [q['sql'] for q in connection.queries]
            duplicates = [(q, queries.count(q)) for q in set(queries) if queries.count(q) > 1]
            
            # Imprimir estadísticas
            name = func.__name__
            print(f"[QUERY STATS] {name}")
            print(f"  Tiempo: {elapsed:.3f}s, Consultas: {queries_count}, DB: {queries_time:.3f}s")
            
            if duplicates:
                print("  CONSULTAS DUPLICADAS DETECTADAS:")
                for query, count in duplicates:
                    print(f"    {count}x: {query[:100]}...")
                    
        return result
    return wrapper
