# Implementación de Mejoras en el Sistema de Proformas - Fase 2

## Separación de Lógica de Negocio de Modelos

### Problema Identificado:
Los modelos `Proforma` y `ProformaItem` contenían demasiada lógica de negocio en sus métodos `save()`. Esto generaba:
- Alta complejidad y acoplamiento en los modelos
- Dificultad para pruebas unitarias
- Lógica de negocio difícil de reutilizar
- Mayor riesgo de bugs al modificar modelos

### Solución Implementada:
Se aplicó el patrón **Service Layer** combinado con **Django Signals** para separar la lógica de negocio de los modelos.

1. **ProformaService**: Clase de servicio que encapsula toda la lógica de negocio
2. **Signals**: Receptores de señales que escuchan eventos de los modelos y delegan al servicio
3. **Modelos simplificados**: Solo contienen la estructura de datos y validaciones básicas

### Ventajas de esta Implementación:

1. **Modelos más limpios y enfocados en datos**
   - Eliminación de métodos sobrecargados como `save()`, `calcular_montos()` y `generar_numero()`
   - Reducción del acoplamiento entre las diferentes partes del sistema

2. **Lógica centralizada en servicios**
   - Mayor cohesión al agrupar comportamientos relacionados
   - Mejor reutilización de código
   - Más fácil de testear de forma unitaria

3. **Transacciones atómicas**
   - Operaciones más robustas con manejo de transacciones a nivel de servicio
   - Mejor manejo de errores y situaciones excepcionales

4. **Separación de responsabilidades**
   - Los modelos solo son responsables de la estructura de datos
   - Los signals conectan eventos del modelo con comportamientos
   - Los servicios implementan comportamientos complejos

## Componentes Principales:

### 1. Servicio: ProformaService

Clase estática que contiene todos los métodos que implementan la lógica de negocio:

- `generate_number`: Generación atómica de números secuenciales
- `calculate_amounts`: Cálculo de montos (subtotal, impuesto, total)
- `calculate_item_total`: Cálculo del total de un ítem
- `complete_item_data`: Autocompletado de datos desde productos relacionados
- `save_proforma`: Guardar proforma con todas las operaciones asociadas
- `save_proforma_item`: Guardar ítem con actualización de proforma
- `delete_proforma_item`: Eliminar ítem con recálculo de proforma
- `change_proforma_state`: Cambiar estado con actualización de historial

### 2. Signals: Conectores entre eventos y servicios

- `pre_save` para Proforma: 
  - Verificación de vencimiento
  - Generación de número

- `post_save` para Proforma:
  - Creación de historial

- `post_save` para ProformaItem:
  - Actualización de totales en proforma

- `post_delete` para ProformaItem:
  - Actualización de totales tras eliminar ítem

### 3. Modelos: Simplificados y enfocados en datos

Los modelos ahora solo contienen:
- Definición de campos
- Validaciones básicas con `clean()`
- Método `__str__()` para representación

## Ejemplo concreto de mejora:

### Antes:

```python
# En ProformaItem
def save(self, *args, **kwargs):
    # 1. Validar datos
    self.full_clean()
    
    # 2. Calcular el total antes de guardar
    self.calcular_total()
    
    # 3. Si hay un producto asociado, tomar sus datos
    if self.tipo_item == 'producto_ofertado' and self.producto_ofertado:
        # Completar datos desde el producto
        if not self.codigo:
            self.codigo = self.producto_ofertado.code
        # ... más lógica ...
        
    # Guardar el ítem
    super().save(*args, **kwargs)
    
    # 4. Actualizar los totales de la proforma
    if self.proforma:
        self.proforma.calcular_montos()
        self.proforma.save(update_fields=['subtotal', 'impuesto', 'total'])
```

### Después:

```python
# En signals.py
@receiver(post_save, sender=ProformaItem)
def actualizar_totales_proforma(sender, instance, created, **kwargs):
    try:
        # Evitar recálculos innecesarios
        if hasattr(instance, '_totales_actualizados'):
            return
            
        # Actualizar totales usando el servicio
        proforma = instance.proforma
        ProformaService.calculate_amounts(proforma, save=True)
        
        # Marcar para evitar recálculos
        instance._totales_actualizados = True
    except Exception as e:
        logger.error(f"Error al actualizar totales: {str(e)}")
```

```python
# En services.py
@staticmethod
def save_proforma_item(item, validate=True, calculate_amounts=True):
    with transaction.atomic():
        # 1. Validar si se solicita
        if validate:
            item.full_clean()
            
        # 2. Completar datos basados en el producto
        ProformaService.complete_item_data(item)
            
        # 3. Calcular total del ítem
        item.total = ProformaService.calculate_item_total(item)
            
        # 4. Guardar el ítem
        item.save()
            
        # 5. Actualizar montos de la proforma si se solicita
        if calculate_amounts and item.proforma:
            ProformaService.calculate_amounts(item.proforma, save=True)
            
        return item
```

## Rutas de los Archivos:

1. **Servicio**: `/proformas/services.py` - Contiene toda la lógica de negocio
2. **Signals**: `/proformas/signals_improved.py` - Conecta eventos de modelos con servicios
3. **Modelos**: `/proformas/models_improved.py` - Versiones limpias de los modelos

## Pasos para Implementar los Cambios

### 1. Reemplazar el archivo de modelos

```bash
# Hacer una copia de seguridad del archivo actual (si no se ha hecho ya)
cp proformas/models.py proformas/models_backup.py

# Reemplazar el archivo con la versión mejorada
cp proformas/models_improved.py proformas/models.py
```

### 2. Actualizar el archivo de signals

```bash
# Hacer una copia de seguridad del archivo actual (si no se ha hecho ya)
cp proformas/signals.py proformas/signals_backup.py

# Reemplazar el archivo con la versión mejorada
cp proformas/signals_improved.py proformas/signals.py
```

### 3. Asegurar que el servicio está en su lugar

El archivo `services.py` contiene la lógica de negocio extraída de los modelos.

### 4. Iniciar la aplicación y verificar funcionamiento

Ejecute las pruebas para verificar que todo funciona correctamente:

```bash
python manage.py test proformas
```

## Consideraciones Adicionales:

1. **Manejo de transacciones**: Operaciones complejas están protegidas por transacciones
2. **Logging**: Registro extensivo para diagnóstico y seguimiento de operaciones
3. **Manejo de excepciones**: Todas las operaciones capturan y registran excepciones
4. **Optimizaciones**: Uso de `update_fields` y `select_for_update` para mejor rendimiento
5. **Prevención de recursión**: Marcado de instancias para evitar recalculos y recursión infinita

## Pruebas Recomendadas:

1. **Creación de Proformas**:
   - Crear una proforma sin especificar número (debe generarse automáticamente)
   - Verificar que se delega al servicio para generar el número

2. **Validaciones**:
   - Probar validaciones básicas en los modelos
   - Verificar que la lógica de validación compleja está en los servicios

3. **Actualización de Totales**:
   - Añadir/modificar/eliminar ítems
   - Verificar que los totales se recalculan correctamente a través de signals

4. **Cambios de Estado**:
   - Cambiar el estado de una proforma
   - Verificar que se crea la entrada de historial correctamente

## Conclusión:

La refactorización ha logrado una clara separación de responsabilidades que:
- Mejora la mantenibilidad del código
- Facilita la implementación de pruebas unitarias
- Reduce la duplicación de código
- Centraliza la lógica de negocio en servicios específicos
- Mantiene los modelos enfocados en representar datos