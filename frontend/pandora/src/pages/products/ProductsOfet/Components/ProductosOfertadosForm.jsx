// src/pages/productos/components/ProductosOfertadosForm.jsx

import React from 'react';
import { Upload, Image, X } from 'lucide-react';

const ProductosOfertadosForm = ({
  error,
  formData,
  setFormData,
  isSubmitting,
  categorias,
  onSubmit,
  onCancel,
  fileInputRef
}) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        imagenes_referencia: [...prev.imagenes_referencia, ...files]
      }));
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      imagenes_referencia: prev.imagenes_referencia.filter((_, index) => index !== indexToRemove)
    }));
  };

  return (
    <form
      id="productoOfertadoForm"
      onSubmit={onSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md error-message">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna 1 */}
        <div>
          <h3 className="text-lg font-medium mb-4">Información Básica</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código * <span className="text-xs text-blue-600">(Generado automáticamente: OFP-XXXX)</span>
              </label>
              <input
                type="text"
                name="code"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-100"
                value={formData.code}
                onChange={handleInputChange}
                readOnly
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CUDIM
              </label>
              <input
                type="text"
                name="cudim"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.cudim}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad
              </label>
              <input
                type="text"
                name="especialidad"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.especialidad}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Columna 2 */}
        <div>
          <h3 className="text-lg font-medium mb-4">Configuración</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                name="id_categoria"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.id_categoria}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
              />
              <label
                htmlFor="is_active"
                className="ml-2 block text-sm text-gray-700"
              >
                Producto Activo
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción y Referencias */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            rows="3"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.descripcion}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Referencias
          </label>
          <textarea
            name="referencias"
            rows="3"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.referencias}
            onChange={handleInputChange}
          ></textarea>
        </div>

        {/* Imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imágenes de Referencia
          </label>
          <div className="mt-1 flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              <Upload size={16} />
              <span>Subir imágenes</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </div>
          
          {formData.imagenes_referencia.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.imagenes_referencia.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="w-full h-24 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                    {file instanceof File ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Imagen ${index + 1}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : file.url ? (
                      <img
                        src={file.url}
                        alt={`Imagen ${index + 1}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-500 flex flex-col items-center">
                        <Image size={24} />
                        <span className="text-xs mt-1">No preview</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 
                               opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-sm text-sm font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
        </button>
      </div>
    </form>
  );
};

export default ProductosOfertadosForm;
