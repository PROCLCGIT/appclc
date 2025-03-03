// src/pages/products/PriceManagement.jsx
import { useState } from 'react';

const PriceManagement = () => {
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

  const renderPricingTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Precios por Segmento</h3>
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio Minorista
          </label>
          <input 
            type="number"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={priceData.retail}
            onChange={(e) => setPriceData({...priceData, retail: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio Mayorista
          </label>
          <input 
            type="number"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={priceData.wholesale}
            onChange={(e) => setPriceData({...priceData, wholesale: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio Distribuidor
          </label>
          <input 
            type="number"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={priceData.distributor}
            onChange={(e) => setPriceData({...priceData, distributor: e.target.value})}
          />
        </div>
      </div>
    </div>
  );

  const renderCompetitiveTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Análisis Competitivo</h3>
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Competidor Principal
          </label>
          <input 
            type="number"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={priceData.competitorA}
            onChange={(e) => setPriceData({...priceData, competitorA: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Competidor Secundario
          </label>
          <input 
            type="number"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={priceData.competitorB}
            onChange={(e) => setPriceData({...priceData, competitorB: e.target.value})}
          />
        </div>
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
      </div>

      {/* Análisis automático */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium mb-2">Análisis de Mercado</h4>
        <div className="text-sm text-gray-600">
          <p>Precio promedio del mercado: ${calculateMarketAverage()}</p>
          <p>Posicionamiento sugerido: ${calculateSuggestedPrice()}</p>
          <p>Margen estimado: {calculateEstimatedMargin()}%</p>
        </div>
      </div>
    </div>
  );

  const renderPromotionsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Gestión de Promociones</h3>
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descuento (%)
          </label>
          <input 
            type="number"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={priceData.discountPercentage}
            onChange={(e) => setPriceData({...priceData, discountPercentage: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Válido Hasta
          </label>
          <input 
            type="date"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={priceData.validUntil}
            onChange={(e) => setPriceData({...priceData, validUntil: e.target.value})}
          />
        </div>
      </div>
    </div>
  );

  // Funciones de cálculo
  const calculateMarketAverage = () => {
    const prices = [
      Number(priceData.competitorA) || 0,
      Number(priceData.competitorB) || 0
    ].filter(price => price > 0);
    
    if (prices.length === 0) return 0;
    return (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
  };

  const calculateSuggestedPrice = () => {
    const avgPrice = Number(calculateMarketAverage());
    const targetMargin = Number(priceData.targetMargin) || 0;
    return (avgPrice * (1 + targetMargin / 100)).toFixed(2);
  };

  const calculateEstimatedMargin = () => {
    const suggestedPrice = Number(calculateSuggestedPrice());
    const cost = Number(priceData.cost) || 0;
    if (cost === 0) return 0;
    return ((suggestedPrice - cost) / cost * 100).toFixed(2);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">Gestión de Precios</h2>
      </div>

      {/* Tabs */}
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
            Precios
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'competitive' 
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('competitive')}
          >
            Competencia
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
        {activeTab === 'competitive' && renderCompetitiveTab()}
        {activeTab === 'promotions' && renderPromotionsTab()}
        
        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            onClick={() => {
              // Aquí iría la lógica de guardado
              console.log('Guardar configuración de precios:', priceData);
            }}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceManagement;