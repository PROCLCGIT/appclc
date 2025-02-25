// src/components/proformas/PriceAlerts.jsx
import { useState, useEffect } from 'react';

const PriceAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [settings, setSettings] = useState({
    priceChangeThreshold: 5, // porcentaje
    competitorChangeThreshold: 5,
    marketShareAlert: true,
    marginAlert: true,
    minimumMargin: 15, // porcentaje
    emailNotifications: true,
    emailFrequency: 'daily'
  });

  const [statistics, setStatistics] = useState({
    totalAlerts: 0,
    criticalAlerts: 0,
    resolvedAlerts: 0
  });

  useEffect(() => {
    fetchAlerts();
    fetchSettings();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/price-alerts/');
      const data = await response.json();
      setAlerts(data.alerts);
      setStatistics(data.statistics);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/price-alerts/settings/');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await fetch('/api/price-alerts/settings/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleAlertAction = async (alertId, action) => {
    try {
      await fetch(`/api/price-alerts/${alertId}/${action}/`, {
        method: 'POST'
      });
      fetchAlerts(); // Recargar alertas
    } catch (error) {
      console.error('Error handling alert action:', error);
    }
  };

  const renderStatistics = () => (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500">Alertas Totales</h4>
        <div className="mt-2">
          <div className="text-2xl font-bold">{statistics.totalAlerts}</div>
          <div className="text-sm text-gray-500">últimos 30 días</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500">Alertas Críticas</h4>
        <div className="mt-2">
          <div className="text-2xl font-bold text-red-600">
            {statistics.criticalAlerts}
          </div>
          <div className="text-sm text-gray-500">requieren atención</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500">Alertas Resueltas</h4>
        <div className="mt-2">
          <div className="text-2xl font-bold text-green-600">
            {statistics.resolvedAlerts}
          </div>
          <div className="text-sm text-gray-500">último mes</div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium mb-4">Configuración de Alertas</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Umbral de Cambio de Precio (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full p-2 border rounded-md"
              value={settings.priceChangeThreshold}
              onChange={(e) => setSettings({
                ...settings,
                priceChangeThreshold: parseFloat(e.target.value)
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Umbral de Cambio Competencia (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full p-2 border rounded-md"
              value={settings.competitorChangeThreshold}
              onChange={(e) => setSettings({
                ...settings,
                competitorChangeThreshold: parseFloat(e.target.value)
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Margen Mínimo (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full p-2 border rounded-md"
              value={settings.minimumMargin}
              onChange={(e) => setSettings({
                ...settings,
                minimumMargin: parseFloat(e.target.value)
              })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.marketShareAlert}
                onChange={(e) => setSettings({
                  ...settings,
                  marketShareAlert: e.target.checked
                })}
                className="rounded border-gray-300 text-purple-600"
              />
              <span className="text-sm text-gray-700">
                Alertas de Participación de Mercado
              </span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.marginAlert}
                onChange={(e) => setSettings({
                  ...settings,
                  marginAlert: e.target.checked
                })}
                className="rounded border-gray-300 text-purple-600"
              />
              <span className="text-sm text-gray-700">
                Alertas de Margen
              </span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({
                  ...settings,
                  emailNotifications: e.target.checked
                })}
                className="rounded border-gray-300 text-purple-600"
              />
              <span className="text-sm text-gray-700">
                Notificaciones por Email
              </span>
            </label>
          </div>

          {settings.emailNotifications && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia de Email
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={settings.emailFrequency}
                onChange={(e) => setSettings({
                  ...settings,
                  emailFrequency: e.target.value
                })}
              >
                <option value="realtime">Tiempo Real</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          onClick={() => updateSettings(settings)}
        >
          Guardar Configuración
        </button>
      </div>
    </div>
  );

  const renderAlertsList = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Alertas Activas</h3>
      </div>

      <div className="divide-y">
        {alerts.map(alert => (
          <div key={alert.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${
                    alert.severity === 'high' 
                      ? 'bg-red-600' 
                      : alert.severity === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                  }`} />
                  <h4 className="font-medium">{alert.title}</h4>
                </div>
                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(alert.created_at).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                  onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                >
                  Reconocer
                </button>
                <button
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                  onClick={() => handleAlertAction(alert.id, 'resolve')}
                >
                  Resolver
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderStatistics()}
      {renderSettings()}
      {renderAlertsList()}
    </div>
  );
};

export default PriceAlerts;