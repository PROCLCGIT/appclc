# pandora/utils.py

def get_history(obj):
    """
    Returns the history of changes for a given object
    """
    # Convertir las fechas al formato ISO para que sean serializables
    created_at = obj.created_at.isoformat() if obj.created_at else None
    updated_at = obj.updated_at.isoformat() if obj.updated_at else None
    
    # Calcular la diferencia de tiempo de forma segura
    last_modified = None
    if obj.created_at and obj.updated_at:
        # Devolver la diferencia en segundos
        last_modified = (obj.updated_at - obj.created_at).total_seconds()
    
    return {
        'created_at': created_at,
        'updated_at': updated_at,
        'last_modified': last_modified
    }