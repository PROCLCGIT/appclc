import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus } from 'lucide-react';

const ProformaForm = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState({
    cliente: '',
    validez: 15,
    observaciones: '',
    detalles: []
  });

  useEffect(() => {
    // Aquí cargarías los clientes y productos de tu API
  }, []);

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, {
        producto: '',
        cantidad: 1,
        precio_unitario: 0,
        descuento: 0,
        subtotal: 0
      }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  const calcularSubtotal = (detalle) => {
    const subtotal = detalle.cantidad * detalle.precio_unitario;
    const descuento = subtotal * (detalle.descuento / 100);
    return subtotal - descuento;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Nueva Proforma</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Información del cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <select 
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.cliente}
              onChange={(e) => setFormData({...formData, cliente: e.target.value})}
            >
              <option value="">Seleccione un cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Detalles de la proforma */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Productos</h3>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus size={16} />
                Agregar Producto
              </button>
            </div>

            <div className="space-y-4">
              {formData.detalles.map((detalle, index) => (
                <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-md">
                  <div className="flex-1">
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={detalle.producto}
                      onChange={(e) => {
                        const newDetalles = [...formData.detalles];
                        newDetalles[index].producto = e.target.value;
                        setFormData({...formData, detalles: newDetalles});
                      }}
                    >
                      <option value="">Seleccione un producto</option>
                      {productos.map(producto => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="number"
                    className="w-24 rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={detalle.cantidad}
                    onChange={(e) => {
                      const newDetalles = [...formData.detalles];
                      newDetalles[index].cantidad = parseInt(e.target.value);
                      newDetalles[index].subtotal = calcularSubtotal(newDetalles[index]);
                      setFormData({...formData, detalles: newDetalles});
                    }}
                    min="1"
                  />
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-600 hover:text-red-700 focus:outline-none"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows="3"
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Save size={16} />
              Guardar Proforma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProformaForm;