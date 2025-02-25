// src/components/proformas/PriceHistory.jsx
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PriceHistory = ({ clientId, productId }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    showCompetitors: false
  });

  useEffect(() => {
    fetchPriceHistory();
  }, [clientId, productId, filters]);

  const fetchPriceHistory = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        client: clientId,
        product: productId,
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
        include_competitors: filters.showCompetitors
      });

      const response = await fetch(`/api/price-history/?${queryParams}`);
      const data = await response.json();
      setHistoryData(data.results || []);
    } catch (error) {
      console.error('Error fetching price history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPriceChart = () => (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={historyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#8884d8" 
            name="Precio Proforma"
            strokeWidth={2}
          />
          {filters.showCompetitors && (
            <Line 
              type="monotone" 
              dataKey="competitor_price" 
              stroke="#82ca9d" 
              name="Precio Competencia"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderPriceTable = () => (
    <div className="mt-6 overflow-hidden border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Fecha
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Precio
            </th>
            {filters.showCompetitors && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Precio Competencia
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Proforma
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Notas
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {historyData.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(record.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                S/ {record.price.toFixed(2)}
              </td>
              {filters.showCompetitors && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {record.competitor_price ? `S/ ${record.competitor_price.toFixed(2)}` : '-'}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <a 
                  href={`/proformas/${record.proforma_id}`}
                  className="text-purple-600 hover:text-purple-900"
                >
                  #{record.proforma_number}
                </a>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {record.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderStatistics = () => {
    if (historyData.length === 0) return null;

    const prices = historyData.map(record => record.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const lastPrice = prices[prices.length - 1];

    return (
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Precio Promedio</div>
          <div className="text-lg font-medium">S/ {avgPrice.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Precio Mínimo</div>
          <div className="text-lg font-medium">S/ {minPrice.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Precio Máximo</div>
          <div className="text-lg font-medium">S/ {maxPrice.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Último Precio</div>
          <div className="text-lg font-medium">S/ {lastPrice.toFixed(2)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-medium">Historial de Precios</h3>
        
        {/* Filtros */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                checked={filters.showCompetitors}
                onChange={(e) => setFilters({...filters, showCompetitors: e.target.checked})}
              />
              <span className="text-sm text-gray-700">Mostrar Competencia</span>
            </label>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando historial...</p>
          </div>
        ) : historyData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay registros de precios para mostrar
          </div>
        ) : (
          <>
            {renderStatistics()}
            {renderPriceChart()}
            {renderPriceTable()}
          </>
        )}
      </div>
    </div>
  );
};

export default PriceHistory;