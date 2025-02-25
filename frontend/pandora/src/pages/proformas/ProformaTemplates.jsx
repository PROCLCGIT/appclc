// src/components/proformas/ProformaTemplates.jsx
import { useState, useEffect } from 'react';

const ProformaTemplates = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/proforma-templates/');
      const data = await response.json();
      setTemplates(data.results || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsTemplate = async (proformaData) => {
    try {
      const response = await fetch('/api/proforma-templates/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTemplate,
          data: proformaData
        }),
      });

      if (response.ok) {
        setShowSaveDialog(false);
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const renderTemplateList = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map(template => (
        <div
          key={template.id}
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectTemplate(template)}
        >
          <h4 className="font-medium text-lg mb-2">{template.name}</h4>
          <p className="text-sm text-gray-600 mb-4">{template.description}</p>
          <div className="text-xs text-gray-500">
            Creado: {new Date(template.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSaveDialog = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Guardar como Plantilla</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({
                ...newTemplate,
                name: e.target.value
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({
                ...newTemplate,
                description: e.target.value
              })}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={() => setShowSaveDialog(false)}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              onClick={() => handleSaveAsTemplate()}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Plantillas de Proforma</h3>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          onClick={() => setShowSaveDialog(true)}
        >
          Guardar como Plantilla
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando plantillas...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay plantillas guardadas
        </div>
      ) : (
        renderTemplateList()
      )}

      {showSaveDialog && renderSaveDialog()}
    </div>
  );
};

export default ProformaTemplates;