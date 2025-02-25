// src/pages/products/PriceManagement.jsx
import { useState } from 'react';

const PriceManagement2 = () => {
  const [activeTab, setActiveTab] = useState('pricing');
  const [priceData, setPriceData] = useState({
    // Precios por segmento
    retail: '',
    wholesale: '',
    distributor: '',
    
    // Análisis competitivo
    competitorA: '',
    competitorB: '',
    
    // Márgenes
    targetMargin: '',
    minimumMargin: '',
    
    // Promociones
    discountPercentage: '',
    validUntil: ''
  });

  const renderPriceHistory = () => (
    <div className="mt-6 bg-white p-4 rounded-lg shadow">
      <h4 className="text-lg font-medium mb-4">Histórico de Precios</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Mes</th>
              <th className="px-4 py-2 text-right">Minorista</th>
              <th className="px-4 py-2 text-right">Mayorista</th>
              <th className="px-4 py-2 text-right">Competencia</th>
              <th className="px-4 py-2 text-right">Margen</th>
            </tr>
          </thead>
          <tbody>
            {[
              { month: 'Enero', retail: 100, wholesale: 85, competitor: 95 },
              { month: 'Febrero', retail: 102, wholesale: 86, competitor: 96 },
              { month: 'Marzo', retail: 101, wholesale: 85, competitor: 94 },
              { month: 'Abril', retail: 103, wholesale: 87, competitor: 97 },
              { month: 'Mayo', retail: 105, wholesale: 89, competitor: 98 }
            ].map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="px-4 py-2">{item.month}</td>
                <td className="px-4 py-2 text-right">${item.retail}</td>
                <td className="px-4 py-2 text-right">${item.wholesale}</td>
                <td className="px-4 py-2 text-right">${item.competitor}</td>
                <td className="px-4 py-2 text-right">
                  {((item.retail - item.wholesale) / item.retail * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMarginAnalysis = () => (
    <div className="grid grid-cols-3 gap-4 mt-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Margen Minorista</h4>
        <div className="text-2xl font-bold text-purple-600">
          {calculateMargin(priceData.retail)}%
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Meta: {priceData.targetMargin}%
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Margen Mayorista</h4>
        <div className="text-2xl font-bold text-purple-600">
          {calculateMargin(priceData.wholesale)}%
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Meta: {priceData.targetMargin}%
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Margen Distribuidor</h4>
        <div className="text-2xl font-bold text-purple-600">
          {calculateMargin(priceData.distribuidor)}%
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Meta: {priceData.targetMargin}%
        </div>
      </div>
    </div>
  );

  const renderPricingTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Precios por Segmento</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Minorista
              </label>
              <div className="flex">
                <input 
                  type="number"
                  className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={priceData.retail}
                  onChange={(e) => setPriceData({...priceData, retail: e.target.value})}
                />
                <button 
                  className="px-4 py-2 bg-gray-100 border-t border-r border-b rounded-r-md text-gray-600 hover:bg-gray-200"
                  onClick={() => applyMargin('retail')}
                >
                  Aplicar Margen
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Mayorista
              </label>
              <div className="flex">
                <input 
                  type="number"
                  className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={priceData.wholesale}
                  onChange={(e) => setPriceData({...priceData, wholesale: e.target.value})}
                />
                <button 
                  className="px-4 py-2 bg-gray-100 border-t border-r border-b rounded-r-md text-gray-600 hover:bg-gray-200"
                  onClick={() => applyMargin('wholesale')}
                >
                  Aplicar Margen
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Distribuidor
              </label>
              <div className="flex">
                <input 
                  type="number"
                  className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={priceData.distributor}
                  onChange={(e) => setPriceData({...priceData, distributor: e.target.value})}
                />
                <button 
                  className="px-4 py-2 bg-gray-100 border-t border-r border-b rounded-r-md text-gray-600 hover:bg-gray-200"
                  onClick={() => applyMargin('distributor')}
                >
                  Aplicar Margen
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Configuración de Márgenes</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margen Objetivo (%)
              </label>
              <input 
                type="number"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={priceData.targetMargin}
                onChange={(e) => setPriceData({...priceData, targetMargin: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margen Mínimo (%)
              </label>
              <input 
                type="number"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={priceData.minimumMargin}
                onChange={(e) => setPriceData({...priceData, minimumMargin: e.target.value})}
              />
            </div>
          </div>

          {renderMarginAlerts()}
        </div>
      </div>

      {renderMarginAnalysis()}
      {renderPriceHistory()}
    </div>
  );

  const renderMarginAlerts = () => {
    const alerts = [];
    const minMargin = Number(priceData.minimumMargin) || 0;

    ['retail', 'wholesale', 'distributor'].forEach(type => {
      const margin = calculateMargin(priceData[type]);
      if (margin < minMargin) {
        alerts.push(`Margen bajo en precio ${type}: ${margin}%`);
      }
    });

    if (alerts.length === 0) return null;

    return (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <h4 className="text-sm font-medium text-red-800 mb-2">Alertas de Margen</h4>
        {alerts.map((alert, index) => (
          <p key={index} className="text-sm text-red-600">{alert}</p>
        ))}
      </div>
    );
  };

  // Funciones auxiliares
  const calculateMargin = (price) => {
    const cost = 80; // Esto debería venir de los datos del producto
    if (!price || !cost) return 0;
    return (((price - cost) / cost) * 100).toFixed(1);
  };

  const applyMargin = (type) => {
    const cost = 80; // Esto debería venir de los datos del producto
    const margin = Number(priceData.targetMargin) || 0;
    const newPrice = cost * (1 + margin / 100);
    setPriceData(prev => ({ ...prev, [type]: newPrice.toFixed(2) }));
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gestión de Precios</h2>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            onClick={() => {
              console.log('Guardar configuración de precios:', priceData);
            }}
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="border-b">
        <div className="flex">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'pricing' 
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('pricing')}
          >
            Precios y Márgenes
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'competitive' 
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('competitive')}
          >
            Análisis Competitivo
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'promotions' 
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('promotions')}
          >
            Promociones
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {activeTab === 'pricing' && renderPricingTab()}
        {/* Mantener los otros tabs del componente original */}
      </div>
    </div>
  );
};

export default PriceManagement2;