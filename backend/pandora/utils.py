# pandora/utils.py

def get_history(obj):
    """
    Returns the history of changes for a given object
    """
    return {
        'created_at': obj.created_at,
        'updated_at': obj.updated_at,
        'last_modified': obj.updated_at - obj.created_at
    }