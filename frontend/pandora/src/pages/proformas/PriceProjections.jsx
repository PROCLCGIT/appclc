// src/components/proformas/PriceProjections.jsx
import { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, ComposedChart 
} from 'recharts';

const PriceProjections = ({ 
  productId, 
  historicalData,
  onProjectionChange,
  initialSettings
}) => {
  // Estados
  const [projections, setProjections] = useState({
    linear: [],
    seasonal: [],
    competitive: []
  });
  
  const [settings, setSettings] = useState({
    projectionMonths: initialSettings?.projectionMonths || 6,
    confidenceInterval: initialSettings?.confidenceInterval || 95,
    includeSeasonal: initialSettings?.includeSeasonal ?? true,
    includeCompetitive: initialSettings?.includeCompetitive ?? true,
    // Nuevas opciones
    considerInflation: initialSettings?.considerInflation ?? false,
    useWeightedHistory: initialSettings?.useWeightedHistory ?? true,
    minMarginRequired: initialSettings?.minMarginRequired || 15
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efecto para calcular proyecciones
  useEffect(() => {
    if (historicalData?.length > 0) {
      calculateProjections();
    }
  }, [historicalData, settings]);

  // Cálculo de proyecciones
  const calculateProjections = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/price-projections/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          settings,
          historicalData
        }),
      });

      if (!response.ok) {
        throw new Error('Error al calcular proyecciones');
      }

      const data = await response.json();
      setProjections(data);
      
      // Notificar cambios en las proyecciones
      if (onProjectionChange) {
        onProjectionChange(data);
      }
    } catch (error) {
      console.error('Error calculating projections:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos derivados
  const priceRange = useMemo(() => {
    if (!historicalData?.length) return { min: 0, max: 0 };
    
    const allPrices = [
      ...historicalData.map(d => d.price),
      ...projections.linear.map(p => p.projectedPrice),
      ...projections.linear.map(p => p.upperBound || 0),
      ...projections.linear.map(p => p.lowerBound || 0)
    ].filter(Boolean);

    return {
      min: Math.min(...allPrices),
      max: Math.max(...allPrices)
    };
  }, [historicalData, projections]);

  const renderCustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: S/ {entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  };

  const renderProjectionChart = () => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Proyección de Precios</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={[...historicalData, ...projections.linear]}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis 
              domain={[
                Math.floor(priceRange.min * 0.95),
                Math.ceil(priceRange.max * 1.05)
              ]}
            />
            <Tooltip content={renderCustomTooltip} />
            <Legend />

            {/* Datos históricos */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              strokeWidth={2}
              name="Precio Histórico"
              dot={{ r: 3 }}
            />

            {/* Intervalo de confianza */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="#8884d8"
              fillOpacity={0.1}
              name="Intervalo Superior"
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="none"
              fill="#8884d8"
              fillOpacity={0.1}
              name="Intervalo Inferior"
            />

            {/* Proyección lineal */}
            <Line
              type="monotone"
              dataKey="projectedPrice"
              stroke="#82ca9d"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Proyección"
              dot={{ r: 3 }}
            />

            {/* Proyecciones adicionales */}
            {settings.includeSeasonal && (
              <Line
                type="monotone"
                dataKey="seasonalPrice"
                stroke="#ffc658"
                strokeWidth={2}
                strokeDasharray="3 3"
                name="Proyección Estacional"
                dot={{ r: 3 }}
              />
            )}

            {settings.includeCompetitive && (
              <Line
                type="monotone"
                dataKey="competitivePrice"
                stroke="#ff7300"
                strokeWidth={2}
                strokeDasharray="3 3"
                name="Proyección Competitiva"
                dot={{ r: 3 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderProjectionSettings = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium mb-4">Configuración de Proyecciones</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meses a Proyectar
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={settings.projectionMonths}
            onChange={(e) => setSettings({
              ...settings,
              projectionMonths: parseInt(e.target.value)
            })}
          >
            <option value={3}>3 meses</option>
            <option value={6}>6 meses</option>
            <option value={12}>12 meses</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Margen Mínimo Requerido (%)
          </label>
          <input
            type="number"
            className="w-full p-2 border rounded-md"
            value={settings.minMarginRequired}
            onChange={(e) => setSettings({
              ...settings,
              minMarginRequired: parseFloat(e.target.value)
            })}
            min="0"
            max="100"
            step="0.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Intervalo de Confianza
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={settings.confidenceInterval}
            onChange={(e) => setSettings({
              ...settings,
              confidenceInterval: parseInt(e.target.value)
            })}
          >
            <option value={90}>90%</option>
            <option value={95}>95%</option>
            <option value={99}>99%</option>
          </select>
        </div>

        <div className="col-span-2 space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.includeSeasonal}
              onChange={(e) => setSettings({
                ...settings,
                includeSeasonal: e.target.checked
              })}
              className="rounded border-gray-300 text-purple-600"
            />
            <span className="text-sm text-gray-700">
              Incluir Ajuste Estacional
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.includeCompetitive}
              onChange={(e) => setSettings({
                ...settings,
                includeCompetitive: e.target.checked
              })}
              className="rounded border-gray-300 text-purple-600"
            />
            <span className="text-sm text-gray-700">
              Incluir Análisis Competitivo
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.considerInflation}
              onChange={(e) => setSettings({
                ...settings,
                considerInflation: e.target.checked
              })}
              className="rounded border-gray-300 text-purple-600"
            />
            <span className="text-sm text-gray-700">
              Considerar Inflación
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.useWeightedHistory}
              onChange={(e) => setSettings({
                ...settings,
                useWeightedHistory: e.target.checked
              })}
              className="rounded border-gray-300 text-purple-600"
            />
            <span className="text-sm text-gray-700">
              Usar Historial Ponderado
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderProjectionStats = () => {
    if (!projections.statistics) return null;

    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">
            Tendencia Proyectada
          </h4>
          <div className="mt-2">
            <div className={`text-2xl font-bold ${
              projections.statistics.trend > 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {projections.statistics.trend > 0 ? '+' : ''}
              {projections.statistics.trend.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              próximos {settings.projectionMonths} meses
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">
            Precio Proyectado
          </h4>
          <div className="mt-2">
            <div className="text-2xl font-bold">
              S/ {projections.statistics.projectedPrice.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              al final del período
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">
            Confiabilidad
          </h4>
          <div className="mt-2">
            <div className="text-2xl font-bold">
              {projections.statistics.reliability.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              índice de confiabilidad
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
        <p className="font-medium">Error al calcular proyecciones</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderProjectionSettings()}
      {renderProjectionStats()}
      {renderProjectionChart()}
      {projections.recommendations && renderRecommendations()}
    </div>
  );
};

export default PriceProjections;