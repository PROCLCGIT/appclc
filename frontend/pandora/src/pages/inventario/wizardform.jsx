import React, { useState, useRef, useEffect } from 'react';

function WizardForm() {
  const [formData, setFormData] = useState({
    codigo: '',
    producto: '',
    unidad: 'UND',
    cantidad: 0
  });

  const [items, setItems] = useState([]);
  
  const refs = {
    codigoRef: useRef(null),
    productoRef: useRef(null),
    unidadRef: useRef(null),
    cantidadRef: useRef(null)
  };

  useEffect(() => {
    refs.codigoRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que los campos requeridos estén completos
    if (!formData.codigo || !formData.producto || formData.cantidad <= 0) {
      return;
    }
    
    // Agregar el item a la lista
    setItems(prevItems => [...prevItems, { 
      ...formData,
      unidad: formData.unidad || 'UND'
    }]);
    
    // Resetear el formulario
    setFormData({
      codigo: '',
      producto: '',
      unidad: 'UND',
      cantidad: 0
    });
    
    // Enfocar nuevamente el campo de código
    refs.codigoRef.current?.focus();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad' ? Number(value) : value
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentElement = e.target;
      
      switch (currentElement.id) {
        case 'codigo':
          refs.productoRef.current?.focus();
          break;
        case 'producto':
          refs.unidadRef.current?.focus();
          break;
        case 'unidad':
          refs.cantidadRef.current?.focus();
          break;
        case 'cantidad':
          handleSubmit(e);
          break;
      }
    }
  };

  return (
    <div className="bg-blue-50 min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Registro de Items</h1>
                <p className="text-sm text-gray-500">Gestión de inventario</p>
              </div>
            </div>

            {/* Counter */}
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Total Items</div>
                <div className="text-base font-semibold text-gray-900">{items.length}</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Header */}
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-16 py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th scope="col" className="w-36 py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th scope="col" className="w-36 py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                  <th scope="col" className="w-36 py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th scope="col" className="w-20 py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {/* Input Form Row */}
                <tr className="bg-blue-50">
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-xs text-blue-600 font-medium">
                      {items.length + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      ref={refs.codigoRef}
                      type="text"
                      id="codigo"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm py-2 px-3"
                      placeholder="Ingrese código"
                      required
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      ref={refs.productoRef}
                      type="text"
                      id="producto"
                      name="producto"
                      value={formData.producto}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm py-2 px-3"
                      placeholder="Nombre del producto"
                      required
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      ref={refs.unidadRef}
                      id="unidad"
                      name="unidad"
                      value={formData.unidad}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm py-2 pl-3 pr-8"
                      required
                    >
                      <option value="UND">UND</option>
                      <option value="KG">KG</option>
                      <option value="LT">LT</option>
                      <option value="MT">MT</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      ref={refs.cantidadRef}
                      type="number"
                      id="cantidad"
                      name="cantidad"
                      value={formData.cantidad}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      min="0"
                      step="0.01"
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm py-2 px-3"
                      placeholder="0.00"
                      required
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={handleSubmit}
                      className="inline-flex items-center justify-center p-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>

                {/* Items List */}
                {items.map((item, index) => (
                  <tr 
                    key={index} 
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-xs text-blue-600 font-medium">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.codigo}</td>
                    <td className="px-4 py-3 text-gray-900">{item.producto}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.unidad}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 text-center">
                      {item.cantidad}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-red-600 hover:text-red-900" title="Eliminar este item">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 font-medium">
                      No hay items registrados aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Save Button */}
          {items.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
                Guardar Inventario
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WizardForm;