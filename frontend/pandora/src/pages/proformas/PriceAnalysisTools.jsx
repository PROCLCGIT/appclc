// src/components/proformas/PriceAnalysisTools.jsx
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PriceAnalysisTools = ({ historyData = [], productName, clientName }) => {
  const [comparativeData, setComparativeData] = useState(null);
  const [showProjections, setShowProjections] = useState(false);

  // Exportación a Excel
  const exportToExcel = () => {
    const exportData = historyData.map(record => ({
      Fecha: new Date(record.date).toLocaleDateString(),
      Producto: productName,
      Cliente: clientName,
      'Precio Proforma': record.price,
      'Precio Competencia': record.competitor_price || '-',
      'Número Proforma': record.proforma_number,
      Notas: record.notes || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial de Precios');

    // Ajustar anchos de columna
    const colWidths = [
      { wch: 12 }, // Fecha
      { wch: 30 }, // Producto
      { wch: 30 }, // Cliente
      { wch: 15 }, // Precio Proforma
      { wch: 15 }, // Precio Competencia
      { wch: 15 }, // Número Proforma
      { wch: 40 }  // Notas
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `historial_precios_${productName}_${clientName}.xlsx`);
  };

  // Análisis de Variación de Precios
  const analyzePriceVariation = () => {
    if (historyData.length === 0) return [];
    const variations = historyData.map((record, index) => {
      if (index === 0) return { ...record, variation: 0, percentageChange: 0 };

      const previousPrice = historyData[index - 1].price;
      const variation = record.price - previousPrice;
      const percentageChange = (variation / previousPrice) * 100;

      return {
        ...record,
        variation,
        percentageChange
      };
    });

    return variations;
  };

  // Proyección de Precios
  const calculatePriceProjection = () => {
    if (historyData.length === 0) return [];

    // Usando regresión lineal simple para proyección
    const n = historyData.length;
    const prices = historyData.map(record => record.price);
    const dates = historyData.map(record => new Date(record.date).getTime());

    // Calcular medias
    const avgPrice = prices.reduce((a, b) => a + b, 0) / n;
    const avgDate = dates.reduce((a, b) => a + b, 0) / n;

    // Calcular pendiente y término independiente
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (dates[i] - avgDate) * (prices[i] - avgPrice);
      denominator += Math.pow(dates[i] - avgDate, 2);
    }

    const slope = numerator / denominator;
    const intercept = avgPrice - slope * avgDate;

    // Generar proyecciones para los próximos 3 meses
    const lastDate = new Date(historyData[n - 1].date);
    const projections = [];

    for (let i = 1; i <= 3; i++) {
      const projectedDate = new Date(lastDate);
      projectedDate.setMonth(lastDate.getMonth() + i);
      
      const projectedPrice = slope * projectedDate.getTime() + intercept;
      
      projections.push({
        date: projectedDate.toISOString(),
        projectedPrice: projectedPrice,
        isProjection: true
      });
    }

    return [...historyData, ...projections];
  };

  // Alertas de Variación
  const generatePriceAlerts = () => {
    const variations = analyzePriceVariation();
    const alerts = [];

    variations.forEach((record, index) => {
      if (index === 0) return;

      if (Math.abs(record.percentageChange) > 10) {
        alerts.push({
          date: record.date,
          message: `Variación significativa de precio: ${record.percentageChange.toFixed(2)}%`,
          type: record.percentageChange > 0 ? 'increase' : 'decrease'
        });
      }
    });

    return alerts;
  };

  return (
    <div className="space-y-6">
      {/* Barra de Herramientas */}
      <div className="flex justify-between items-center">
        <div className="space-x-4">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Exportar a Excel
          </button>
          <button
            onClick={() => setShowProjections(!showProjections)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showProjections ? 'Ocultar Proyecciones' : 'Mostrar Proyecciones'}
          </button>
        </div>
      </div>

      {/* Alertas de Variación */}
      {generatePriceAlerts().map((alert, index) => (
        <div
          key={index}
          className={`p-4 rounded-md ${
            alert.type === 'increase' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {alert.type === 'increase' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">
                {new Date(alert.date).toLocaleDateString()}: {alert.message}
              </h3>
            </div>
          </div>
        </div>
      ))}

      {/* Gráfico con Proyecciones */}
      {showProjections && (
        <div className="mt-6">
          <h4 className="text-lg font-medium mb-4">Proyección de Precios</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calculatePriceProjection()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [`S/ ${value.toFixed(2)}`, 'Precio']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Precio Histórico"
                />
                <Line
                  type="monotone"
                  dataKey="projectedPrice"
                  stroke="#82ca9d"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Precio Proyectado"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Análisis Comparativo */}
      <div className="mt-6">
        <h4 className="text-lg font-medium mb-4">Análisis de Variación</h4>
        <div className="grid grid-cols-3 gap-4">
          {analyzePriceVariation().slice(-3).map((variation, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">
                {new Date(variation.date).toLocaleDateString()}
              </div>
              <div className="mt-1">
                <div className="text-lg font-medium">
                  S/ {variation.price.toFixed(2)}
                </div>
                <div className={`text-sm ${
                  variation.percentageChange > 0 
                    ? 'text-red-600' 
                    : variation.percentageChange < 0 
                      ? 'text-green-600' 
                      : 'text-gray-600'
                }`}>
                  {variation.percentageChange !== 0 && (
                    <>
                      {variation.percentageChange > 0 ? '↑' : '↓'}
                      {Math.abs(variation.percentageChange).toFixed(2)}%
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriceAnalysisTools;
