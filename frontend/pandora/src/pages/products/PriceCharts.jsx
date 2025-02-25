import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';

const PriceCharts = () => {
  // Datos simulados para los gráficos
  const priceHistory = [
    { month: 'Ene', retail: 100, wholesale: 85, competitor: 95, margin: 15 },
    { month: 'Feb', retail: 102, wholesale: 86, competitor: 96, margin: 16 },
    { month: 'Mar', retail: 101, wholesale: 85, competitor: 94, margin: 16 },
    { month: 'Abr', retail: 103, wholesale: 87, competitor: 97, margin: 16 },
    { month: 'May', retail: 105, wholesale: 89, competitor: 98, margin: 16 },
    { month: 'Jun', retail: 104, wholesale: 88, competitor: 96, margin: 16 }
  ];

  const marginComparison = [
    { category: 'Electrónicos', actual: 25, target: 30 },
    { category: 'Accesorios', actual: 35, target: 32 },
    { category: 'Periféricos', actual: 28, target: 30 },
    { category: 'Software', actual: 40, target: 35 },
    { category: 'Servicios', actual: 45, target: 40 }
  ];

  const renderPriceTrends = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">Tendencias de Precios</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="retail" 
              stroke="#8884d8" 
              name="Minorista"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="wholesale" 
              stroke="#82ca9d" 
              name="Mayorista"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="competitor" 
              stroke="#ff7300" 
              name="Competencia"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderMarginAnalysis = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-medium mb-4">Análisis de Márgenes por Categoría</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={marginComparison} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="actual" fill="#8884d8" name="Margen Actual" />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#ff7300" 
              name="Margen Objetivo"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderMarginDistribution = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-medium mb-4">Distribución de Márgenes</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={priceHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="margin" fill="#8884d8" name="Margen %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-6">
        {renderPriceTrends()}
        {renderMarginAnalysis()}
        {renderMarginDistribution()}
      </div>
    </div>
  );
};

export default PriceCharts;