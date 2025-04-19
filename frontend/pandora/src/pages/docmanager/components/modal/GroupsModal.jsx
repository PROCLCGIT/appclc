import React, { useState, useEffect } from 'react';
import { PlusCircle, Users, Folder, Trash2, UsersRound, FolderPlus } from 'lucide-react';
import { documentService } from '@/services/classes';
import { useToast } from "@/components/ui/use-toast";

/**
 * Modal para gestionar grupos en el gestor documental
 * @param {Object} props
 * @param {boolean} props.show - Controla la visibilidad del modal
 * @param {function} props.onClose - Función para cerrar el modal
 * @param {Array} props.groups - Lista de grupos disponibles
 * @param {function} props.onCreateGroup - Función para crear un nuevo grupo
 * @param {function} props.onSelectGroup - Función para seleccionar un grupo
 * @param {function} props.onDeleteGroup - Función para eliminar un grupo
 * @param {Object} props.selectedGroup - Grupo seleccionado actualmente
 * @returns {JSX.Element}
 */
const GroupsModal = ({
  show,
  onClose,
  groups = [],
  onCreateGroup,
  onSelectGroup,
  onDeleteGroup,
  selectedGroup
}) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [groupColor, setGroupColor] = useState('#3b82f6');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  // Filtrar grupos por nombre
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(filter.toLowerCase())
  );

  // Crear un nuevo grupo
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Debe ingresar un nombre para el grupo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Intentando crear grupo:", {
        name: newGroupName,
        description: newGroupDescription || '',
        color_code: groupColor
      });
      
      // Asegurarnos de que onCreateGroup es una función
      if (typeof onCreateGroup !== 'function') {
        console.error('onCreateGroup no es una función:', onCreateGroup);
        throw new Error('Error interno: manejador de creación no válido');
      }
      
      // Llamamos a la función de creación pasada como prop
      const result = await onCreateGroup({
        name: newGroupName,
        description: newGroupDescription || '',
        color_code: groupColor
      });
      
      console.log("Resultado de creación de grupo:", result);
      
      // Reiniciamos los campos solo si la creación fue exitosa
      setNewGroupName('');
      setNewGroupDescription('');
      setGroupColor('#3b82f6');
      setShowAddForm(false);
      
      toast({
        title: "Grupo creado",
        description: `El grupo "${newGroupName}" ha sido creado exitosamente.`,
      });
    } catch (error) {
      console.error('Error al crear grupo:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el grupo: " + (error.message || 'Error desconocido'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Si el modal no está visible, no renderizar nada
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <UsersRound className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Grupos de documentos</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Buscador */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Buscar grupos..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <button
                className="absolute right-3 top-2.5 text-indigo-600 hover:text-indigo-800"
                onClick={() => setShowAddForm(!showAddForm)}
                title={showAddForm ? "Cancelar" : "Nuevo grupo"}
              >
                {showAddForm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <PlusCircle className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Formulario para crear grupo */}
          {showAddForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-3">Crear nuevo grupo</h3>
              <form onSubmit={handleCreateGroup}>
                <div className="mb-4">
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="groupName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="groupDescription"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    rows={3}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="groupColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="groupColor"
                      className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                      value={groupColor}
                      onChange={(e) => setGroupColor(e.target.value)}
                    />
                    <span className="text-sm text-gray-500">{groupColor}</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading || !newGroupName.trim()}
                  >
                    {loading ? "Creando..." : "Crear grupo"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de grupos */}
          <div className="space-y-2">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-8">
                <FolderPlus className="h-12 w-12 mx-auto text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  {filter
                    ? "No se encontraron grupos con ese nombre"
                    : "No hay grupos disponibles"}
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear nuevo grupo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-4 border rounded-lg transition-colors cursor-pointer flex justify-between ${
                      selectedGroup && selectedGroup.id === group.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => onSelectGroup(group)}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: group.color_code || '#3b82f6' }}
                      >
                        <Folder className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{group.name}</h4>
                        {group.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{group.description}</p>
                        )}
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          <span>{group.member_count || 0} miembros</span>
                          <span className="mx-2">•</span>
                          <span>{group.document_count || 0} documentos</span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="text-gray-400 hover:text-red-500 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`¿Seguro que desea eliminar el grupo "${group.name}"?`)) {
                          onDeleteGroup(group.id);
                        }
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupsModal;