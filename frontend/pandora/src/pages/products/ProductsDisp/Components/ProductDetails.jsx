//src/pages/products/ProductsDisp/Components/ProductDetails.jsx
import React from 'react';

function ProductDetails({
  detailItem,
  marcas,
  categorias,
  unidades,
  productosOfertados,
  getRatingColor,
  setActiveTab
}) {
  if (!detailItem) {
    return (
      <div className="flex items-center justify-center p-12 rounded-lg bg-gray-50">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <p className="mt-4 text-lg text-gray-500 font-medium">No se ha seleccionado ningún producto.</p>
          <button 
            onClick={() => setActiveTab('listado')}
            className="mt-6 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Volver al Listado
          </button>
        </div>
      </div>
    );
  }

  const marca = marcas.find((m) => m.id === detailItem.id_marca);
  const unidad = unidades.find((u) => u.id === detailItem.presentacion);
  const categoria = categorias.find((c) => c.id === detailItem.id_categoria);
  const ofertado = productosOfertados.find(
    (p) => p.id === detailItem.id_producto_ofertado
  );

  // Función para generar barras de progreso para las calificaciones
  const RatingBar = ({ value, label }) => {
    const ratingValue = parseFloat(value) || 0;
    const percentage = Math.min(Math.max(ratingValue * 10, 0), 100);
    const colorClass = getRatingColor(value);
    
    return (
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="font-medium text-sm">{label}</span>
          <span className={`text-sm font-bold ${colorClass}`}>{value || 'N/A'}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${colorClass.includes('green') ? 'bg-green-500' : 
              colorClass.includes('yellow') ? 'bg-yellow-500' : 
              colorClass.includes('red') ? 'bg-red-500' : 'bg-blue-500'}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {detailItem.nombre}
            <span className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${detailItem.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'}`}>
              {detailItem.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </h2>
          <button
            onClick={() => setActiveTab('listado')}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Listado
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Código: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{detailItem.code}</span>
        </p>
      </div>

      {/* Contenido principal - Layout de 2 columnas en pantallas grandes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna izquierda (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Información básica */}
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <span className="text-gray-500 min-w-32">Producto Ofertado:</span>
                <span className="font-medium ml-2">{ofertado ? ofertado.nombre : 'N/A'}</span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 min-w-32">Categoría:</span>
                <span className="font-medium ml-2">{categoria ? categoria.nombre : 'N/A'}</span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 min-w-32">Marca:</span>
                <span className="font-medium ml-2">{marca ? marca.nombre : 'N/A'}</span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 min-w-32">Modelo:</span>
                <span className="font-medium ml-2">{detailItem.modelo || 'N/A'}</span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 min-w-32">Presentación:</span>
                <span className="font-medium ml-2">{unidad ? unidad.nombre : 'N/A'}</span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 min-w-32">Referencia:</span>
                <span className="font-medium ml-2">{detailItem.referencia || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Imágenes */}
          {detailItem.imagenes && detailItem.imagenes.length > 0 && (
            <div className="p-5 rounded-lg bg-white border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Galería de Imágenes
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {detailItem.imagenes.map((img, index) => (
                  <div key={index} className="group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <a href={img.url} target="_blank" rel="noopener noreferrer" className="block aspect-square">
                      <img
                        src={img.url}
                        alt={img.descripcion || `Imagen ${index + 1}`}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      />
                      {img.descripcion && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex items-end transition-opacity">
                          <p className="p-2 text-sm text-white">{img.descripcion}</p>
                        </div>
                      )}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documentos */}
          {detailItem.documentos && detailItem.documentos.length > 0 && (
            <div className="p-5 rounded-lg bg-white border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentos
              </h3>
              <div className="space-y-3">
                {detailItem.documentos.map((doc, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-12 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-bold">{doc.extension?.toUpperCase() || 'DOC'}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{doc.titulo}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {doc.tipo_documento_display} • {doc.tamano} MB
                        </p>
                        {doc.descripcion && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doc.descripcion}</p>
                        )}
                      </div>
                      <div className="ml-4">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Descargar
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha (1/3) */}
        <div className="space-y-6">
          
          {/* Panel de precios */}
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Información de Precios
            </h3>
            <div className="space-y-4">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-600">Costo Referencial</p>
                <p className="text-lg font-bold text-gray-900">
                  {detailItem.costo_referencial != null
                    ? `$${parseFloat(detailItem.costo_referencial).toFixed(2)}`
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-600">Precio SIE Referencial</p>
                <p className="text-lg font-bold text-gray-900">
                  {detailItem.precio_sie_referencial != null
                    ? `$${parseFloat(detailItem.precio_sie_referencial).toFixed(2)}`
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-600">Precio SIE Tipo B</p>
                <p className="text-lg font-bold text-gray-900">
                  {detailItem.precio_sie_tipob != null
                    ? `$${parseFloat(detailItem.precio_sie_tipob).toFixed(2)}`
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-600">Precio Venta Privado</p>
                <p className="text-lg font-bold text-gray-900">
                  {detailItem.precio_venta_privado != null
                    ? `$${parseFloat(detailItem.precio_venta_privado).toFixed(2)}`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Panel de calificaciones */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Calificaciones
            </h3>
            <div className="space-y-2">
              <RatingBar value={detailItem.tz_oferta} label="Oferta" />
              <RatingBar value={detailItem.tz_demanda} label="Demanda" />
              <RatingBar value={detailItem.tz_inflacion} label="Inflación" />
              <RatingBar value={detailItem.tz_calidad} label="Calidad" />
              <RatingBar value={detailItem.tz_eficiencia} label="Eficiencia" />
              <RatingBar value={detailItem.tz_referencial} label="Referencial" />
            </div>
          </div>
        </div>
      </div>

      {/* Botón para volver al listado (versión móvil - visible solo en pantallas pequeñas) */}
      <div className="mt-8 lg:hidden">
        <button
          className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center"
          onClick={() => setActiveTab('listado')}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Listado
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;