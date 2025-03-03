import React from 'react';

function ProductDetails({
  detailItem,
  marcas,
  categorias,
  productosOfertados,
  getRatingColor,
  setActiveTab,
}) {
  if (!detailItem) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-gray-500">No se ha seleccionado ningún producto.</p>
      </div>
    );
  }

  const marca = marcas.find((m) => m.id === detailItem.id_marca);
  const categoria = categorias.find((c) => c.id === detailItem.id_categoria);
  const ofertado = productosOfertados.find(
    (p) => p.id === detailItem.id_producto_ofertado
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-md">
      {/* Título Principal */}
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        Detalles del Producto
      </h3>

      {/* Sección: Información General */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
          Información General
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p>
              <span className="font-medium text-gray-600">Código:</span>{' '}
              {detailItem.code}
            </p>
            <p>
              <span className="font-medium text-gray-600">Nombre:</span>{' '}
              {detailItem.nombre}
            </p>
            <p>
              <span className="font-medium text-gray-600">Producto Ofertado:</span>{' '}
              {ofertado ? ofertado.nombre : 'N/A'}
            </p>
            <p>
              <span className="font-medium text-gray-600">Categoría:</span>{' '}
              {categoria ? categoria.nombre : 'N/A'}
            </p>
          </div>
          <div className="space-y-2">
            <p>
              <span className="font-medium text-gray-600">Marca:</span>{' '}
              {marca ? marca.nombre : 'N/A'}
            </p>
            <p>
              <span className="font-medium text-gray-600">Modelo:</span>{' '}
              {detailItem.modelo || 'N/A'}
            </p>
            <p>
              <span className="font-medium text-gray-600">Presentación:</span>{' '}
              {detailItem.presentacion || 'N/A'}
            </p>
            <p>
              <span className="font-medium text-gray-600">Referencia:</span>{' '}
              {detailItem.referencia || 'N/A'}
            </p>
          </div>
        </div>
        <p className="mt-4">
          <span className="font-medium text-gray-600">Estado:</span>{' '}
          {detailItem.is_active ? (
            <span className="inline-block px-2 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
              Activo
            </span>
          ) : (
            <span className="inline-block px-2 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
              Inactivo
            </span>
          )}
        </p>
      </div>

      {/* Sección: Precios */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
          Precios
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p>
              <span className="font-medium text-gray-600">Costo Referencial:</span>{' '}
              {detailItem.costo_referencial != null
                ? `$${parseFloat(detailItem.costo_referencial).toFixed(2)}`
                : 'N/A'}
            </p>
            <p>
              <span className="font-medium text-gray-600">
                Precio SIE Referencial:
              </span>{' '}
              {detailItem.precio_sie_referencial != null
                ? `$${parseFloat(detailItem.precio_sie_referencial).toFixed(2)}`
                : 'N/A'}
            </p>
          </div>
          <div className="space-y-2">
            <p>
              <span className="font-medium text-gray-600">
                Precio SIE Tipo B:
              </span>{' '}
              {detailItem.precio_sie_tipob != null
                ? `$${parseFloat(detailItem.precio_sie_tipob).toFixed(2)}`
                : 'N/A'}
            </p>
            <p>
              <span className="font-medium text-gray-600">
                Precio Venta Privado:
              </span>{' '}
              {detailItem.precio_venta_privado != null
                ? `$${parseFloat(detailItem.precio_venta_privado).toFixed(2)}`
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Sección: Calificaciones */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
          Calificaciones
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <p>
            <span className="font-medium text-gray-600">Oferta:</span>{' '}
            <span className={getRatingColor(detailItem.tz_oferta)}>
              {detailItem.tz_oferta}
            </span>
          </p>
          <p>
            <span className="font-medium text-gray-600">Demanda:</span>{' '}
            <span className={getRatingColor(detailItem.tz_demanda)}>
              {detailItem.tz_demanda}
            </span>
          </p>
          <p>
            <span className="font-medium text-gray-600">Inflación:</span>{' '}
            <span className={getRatingColor(detailItem.tz_inflacion)}>
              {detailItem.tz_inflacion}
            </span>
          </p>
          <p>
            <span className="font-medium text-gray-600">Calidad:</span>{' '}
            <span className={getRatingColor(detailItem.tz_calidad)}>
              {detailItem.tz_calidad}
            </span>
          </p>
          <p>
            <span className="font-medium text-gray-600">Eficiencia:</span>{' '}
            <span className={getRatingColor(detailItem.tz_eficiencia)}>
              {detailItem.tz_eficiencia}
            </span>
          </p>
          <p>
            <span className="font-medium text-gray-600">Referencial:</span>{' '}
            <span className={getRatingColor(detailItem.tz_referencial)}>
              {detailItem.tz_referencial}
            </span>
          </p>
        </div>
      </div>

      {/* Sección: Imágenes */}
      {detailItem.imagenes && detailItem.imagenes.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
            Imágenes
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {detailItem.imagenes.map((img, index) => (
              <div
                key={index}
                className="group relative border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-shadow"
              >
                <a href={img.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={img.url}
                    alt={img.descripcion || `Imagen ${index + 1}`}
                    className="w-full h-32 object-cover group-hover:opacity-90"
                  />
                </a>
                {img.descripcion && (
                  <p className="p-2 text-sm text-center truncate bg-gray-50">
                    {img.descripcion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección: Documentos */}
      {detailItem.documentos && detailItem.documentos.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
            Documentos
          </h4>
          <div className="space-y-3">
            {detailItem.documentos.map((doc, index) => (
              <div
                key={index}
                className="border border-gray-200 p-4 rounded-md hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📄</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-700">{doc.titulo}</p>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Descargar
                      </a>
                    </div>
                    <p className="text-sm text-gray-500">
                      {doc.tipo_documento_display}
                    </p>
                    {doc.descripcion && (
                      <p className="text-sm mt-1 text-gray-600">
                        {doc.descripcion}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {doc.extension?.toUpperCase()} - {doc.tamano} MB
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón para volver al listado */}
      <div className="flex justify-end">
        <button
          onClick={() => setActiveTab('listado')}
          className="inline-flex items-center px-5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Volver al Listado
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;
