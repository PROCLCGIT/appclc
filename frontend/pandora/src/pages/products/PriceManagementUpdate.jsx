// En tu PriceManagement.jsx, actualiza la sección de renderPricingTab:
const renderPricingTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-6">
        {/* Mantener la sección de inputs de precios */}
        <div>
          <h3 className="text-lg font-medium mb-4">Precios por Segmento</h3>
          {/* ... (mantener los inputs existentes) ... */}
        </div>
  
        <div>
          <h3 className="text-lg font-medium mb-4">Configuración de Márgenes</h3>
          {/* ... (mantener la configuración de márgenes) ... */}
        </div>
      </div>
  
      {/* Agregar los gráficos */}
      <div className="mt-8">
        <PriceCharts />
      </div>
    </div>
  );