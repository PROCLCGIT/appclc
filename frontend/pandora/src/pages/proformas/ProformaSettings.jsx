// src/components/proformas/ProformaSettings.jsx
import { useState, useEffect } from 'react';

const ProformaSettings = () => {
  const [settings, setSettings] = useState({
    defaultValidityDays: 30,
    defaultPaymentTerms: '',
    defaultDeliveryTime: '',
    defaultTermsConditions: '',
    autoNumbering: true,
    numberingPrefix: 'PRO',
    numberingDigits: 6,
    requireApproval: true,
    sendEmailNotifications: true,
    allowDiscounts: true,
    maxDiscountPercentage: 20,
    roundingDecimals: 2
  });

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchTemplates();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/proforma-settings/');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/proforma-templates/');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/proforma-settings/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error saving settings:', error);
      // Mostrar mensaje de error
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const method = selectedTemplate?.id ? 'PUT' : 'POST';
      const url = selectedTemplate?.id 
        ? `/api/proforma-templates/${selectedTemplate.id}/`
        : '/api/proforma-templates/';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedTemplate),
      });

      setIsEditing(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('¿Está seguro de eliminar esta plantilla?')) return;

    try {
      await fetch(`/api/proforma-templates/${templateId}/`, {
        method: 'DELETE',
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const renderGeneralSettings = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium mb-4">Configuración General</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Días de Validez por Defecto
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded-md"
            value={settings.defaultValidityDays}
            onChange={(e) => setSettings({
              ...settings,
              defaultValidityDays: parseInt(e.target.value)
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Términos de Pago por Defecto
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={settings.defaultPaymentTerms}
            onChange={(e) => setSettings({
              ...settings,
              defaultPaymentTerms: e.target.value
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiempo de Entrega por Defecto
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={settings.defaultDeliveryTime}
            onChange={(e) => setSettings({
              ...settings,
              defaultDeliveryTime: e.target.value
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Decimales para Redondeo
          </label>
          <input
            type="number"
            min="0"
            max="4"
            className="w-full p-2 border rounded-md"
            value={settings.roundingDecimals}
            onChange={(e) => setSettings({
              ...settings,
              roundingDecimals: parseInt(e.target.value)
            })}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Términos y Condiciones por Defecto
          </label>
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            value={settings.defaultTermsConditions}
            onChange={(e) => setSettings({
              ...settings,
              defaultTermsConditions: e.target.value
            })}
          />
        </div>
      </div>
    </div>
  );

  const renderNumberingSettings = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium mb-4">Configuración de Numeración</h3>
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-purple-600 mr-2"
            checked={settings.autoNumbering}
            onChange={(e) => setSettings({
              ...settings,
              autoNumbering: e.target.checked
            })}
          />
          <label className="text-sm text-gray-700">
            Numeración Automática
          </label>
        </div>

        {settings.autoNumbering && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prefijo
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={settings.numberingPrefix}
                onChange={(e) => setSettings({
                  ...settings,
                  numberingPrefix: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dígitos
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full p-2 border rounded-md"
                value={settings.numberingDigits}
                onChange={(e) => setSettings({
                  ...settings,
                  numberingDigits: parseInt(e.target.value)
                })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderApprovalSettings = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium mb-4">Configuración de Aprobaciones</h3>
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-purple-600 mr-2"
            checked={settings.requireApproval}
            onChange={(e) => setSettings({
              ...settings,
              requireApproval: e.target.checked
            })}
          />
          <label className="text-sm text-gray-700">
            Requerir Aprobación
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-purple-600 mr-2"
            checked={settings.sendEmailNotifications}
            onChange={(e) => setSettings({
              ...settings,
              sendEmailNotifications: e.target.checked
            })}
          />
          <label className="text-sm text-gray-700">
            Enviar Notificaciones por Email
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-purple-600 mr-2"
            checked={settings.allowDiscounts}
            onChange={(e) => setSettings({
              ...settings,
              allowDiscounts: e.target.checked
            })}
          />
          <label className="text-sm text-gray-700">
            Permitir Descuentos
          </label>
        </div>

        {settings.allowDiscounts && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Porcentaje Máximo de Descuento
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full p-2 border rounded-md"
              value={settings.maxDiscountPercentage}
              onChange={(e) => setSettings({
                ...settings,
                maxDiscountPercentage: parseInt(e.target.value)
              })}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Plantillas</h3>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            onClick={() => {
              setSelectedTemplate({
                name: '',
                description: '',
                content: ''
              });
              setIsEditing(true);
            }}
          >
            Nueva Plantilla
          </button>
        </div>
      </div>

      <div className="divide-y">
        {templates.map(template => (
          <div key={template.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="text-purple-600 hover:text-purple-900"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setIsEditing(true);
                  }}
                >
                  Editar
                </button>
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edición de Plantilla */}
      {isEditing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium mb-4">
              {selectedTemplate?.id ? 'Editar' : 'Nueva'} Plantilla
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={selectedTemplate?.name}
                  onChange={(e) => setSelectedTemplate({
                    ...selectedTemplate,
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
                  rows={2}
                  value={selectedTemplate?.description}
                  onChange={(e) => setSelectedTemplate({
                    ...selectedTemplate,
                    description: e.target.value
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenido
                </label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={8}
                  value={selectedTemplate?.content}
                  onChange={(e) => setSelectedTemplate({
                    ...selectedTemplate,
                    content: e.target.value
                  })}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  onClick={handleSaveTemplate}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configuración de Proformas</h2>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          onClick={handleSaveSettings}
        >
          Guardar Cambios
        </button>
      </div>

      {renderGeneralSettings()}
      {renderNumberingSettings()}
      {renderApprovalSettings()}
      {renderTemplates()}
    </div>
  );
};

export default ProformaSettings;