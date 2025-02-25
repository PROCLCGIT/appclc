// src/components/proformas/ComparativeAnalysis.jsx
import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

const ComparativeAnalysis = ({ productId, competitors = true }) => {
  const [analysisData, setAnalysisData] = useState({
    priceComparison: [],
    marketShare: [],
    priceEvolution: [],
    statistics: {}
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: '6M', // 6M, 1Y, ALL
    includeCompetitors: competitors,
    region: 'all'
  });

  useEffect(() => {
    fetchAnalysisData();
  }, [productId, filters]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analysis/comparative/${productId}?${new URLSearchParams(filters)}`);
      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPriceComparisonChart = () => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Comparación de Precios</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analysisData.priceComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="competitor" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="price" fill="#8884d8" name="Precio Base" />
            <Bar dataKey="minPrice" fill="#82ca9d" name="Precio Mínimo" />
            <Bar dataKey="maxPrice" fill="#ffc658" name="Precio Máximo" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderPriceEvolutionChart = () => (
    <div className="bg-white p-4 rounded-lg shadow mt-6">
      <h3 className="text-lg font-medium mb-4">Evolución de Precios</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analysisData.priceEvolution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="ourPrice" 
              stroke="#8884d8" 
              name="Nuestro Precio" 
            />
            <Line 
              type="monotone" 
              dataKey="avgMarketPrice" 
              stroke="#82ca9d" 
              name="Precio Promedio Mercado"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderStatistics = () => (
    <div className="grid grid-cols-3 gap-4 mt-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500">Posición en el Mercado</h4>
        <div className="mt-2">
          <div className="text-2xl font-bold">
            {analysisData.statistics.marketPosition}º
          </div>
          <div className="text-sm text-gray-500">
            de {analysisData.statistics.totalCompetitors} competidores
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500">Diferencia vs Promedio</h4>
        <div className="mt-2">
          <div className={`text-2xl font-bold ${
            analysisData.statistics.priceDifference > 0 
              ? 'text-red-600' 
              : 'text-green-600'
          }`}>
            {analysisData.statistics.priceDifference > 0 ? '+' : ''}
            {analysisData.statistics.priceDifference}%
          </div>
          <div className="text-sm text-gray-500">
            vs precio promedio del mercado
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500">Competitividad</h4>
        <div className="mt-2">
          <div className="text-2xl font-bold">
            {analysisData.statistics.competitiveScore}/10
          </div>
          <div className="text-sm text-gray-500">
            índice de competitividad
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="bg-white p-4 rounded-lg shadow mt-6">
      <h3 className="text-lg font-medium mb-4">Recomendaciones</h3>
      <div className="space-y-4">
        {analysisData.statistics.recommendations?.map((rec, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              rec.priority === 'high' 
                ? 'bg-red-100 text-red-600' 
                : rec.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-blue-100 text-blue-600'
            }`}>
              <span className="text-sm font-medium">{index + 1}</span>
            </div>
            <div>
              <h4 className="font-medium">{rec.title}</h4>
              <p className="text-sm text-gray-600">{rec.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="mb-6 flex space-x-4">
      <select
        className="border rounded-md px-3 py-2"
        value={filters.period}
        onChange={(e) => setFilters({...filters, period: e.target.value})}
      >
        <option value="6M">Últimos 6 meses</option>
        <option value="1Y">Último año</option>
        <option value="ALL">Todo el historial</option>
      </select>

      <select
        className="border rounded-md px-3 py-2"
        value={filters.region}
        onChange={(e) => setFilters({...filters, region: e.target.value})}
      >
        <option value="all">Todas las regiones</option>
        <option value="north">Norte</option>
        <option value="south">Sur</option>
        <option value="east">Este</option>
        <option value="west">Oeste</option>
      </select>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={filters.includeCompetitors}
          onChange={(e) => setFilters({
            ...filters, 
            includeCompetitors: e.target.checked
          })}
          className="rounded border-gray-300 text-purple-600"
        />
        <span>Incluir competidores</span>
      </label>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      {renderFilters()}
      {renderPriceComparisonChart()}
      {renderPriceEvolutionChart()}
      {renderStatistics()}
      {renderRecommendations()}
    </div>
  );
};

export default ComparativeAnalysis;