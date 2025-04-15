import React, { useState, useRef, useEffect } from 'react';
import './brief.css';

// Importa los componentes UI de tu librería
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Brief = () => {
  // Generar código automático BF-2025xx
  const generateBriefCode = () => {
    const date = new Date();
    const year = date.getFullYear();
    const sequentialNumber = Math.floor(1 + Math.random() * 99).toString().padStart(2, '0');
    return `BF-${year}${sequentialNumber}`;
  };

  // Estado para los datos del brief
  const [briefData, setBriefData] = useState({
    codigo: generateBriefCode(),
    fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
    fechaValidez: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0], // 15 días después
    cliente: {
      empresa: '',
      ruc: '',
      atencion: '',
      email: '',
      telefono: '',
      direccion: ''
    },
    formaPago: '50% anticipo, 50% contra entrega',
    tiempoEntrega: '5 días hábiles',
    observaciones: ''
  });

  // Estado para errores de validación del brief
  const [briefErrors, setBriefErrors] = useState({});

  // Para mostrar mensajes globales (éxito, error, etc.)
  const [submitStatus, setSubmitStatus] = useState(null);

  // Referencias para el focus inicial (opcional)
  const refs = {
    empresaRef: useRef(null)
  };

  useEffect(() => {
    // Focus en el campo empresa al cargar, si quisieras
    refs.empresaRef.current?.focus();
  }, []);

  // Validar y guardar el brief
  const handleSaveBrief = () => {
    const errors = {};
    // Validar campos obligatorios
    if (!briefData.cliente.empresa.trim()) {
      errors['cliente.empresa'] = 'La empresa es obligatoria';
    }
    if (!briefData.fecha) {
      errors.fecha = 'La fecha es obligatoria';
    }

    setBriefErrors(errors);

    if (Object.keys(errors).length === 0) {
      setSubmitStatus({
        type: 'success',
        message: `Brief ${briefData.codigo} guardado exitosamente`
      });
      // Aquí podrías limpiar campos o hacer otras acciones
    } else {
      setSubmitStatus({
        type: 'error',
        message: 'Por favor complete todos los campos obligatorios del brief'
      });
    }
  };

  // ----------------------------
  // Manejo de productos (tabla)
  // ----------------------------
  const [products, setProducts] = useState([
    { id: 1, codigo: 'P001', name: 'Producto 1', description: 'Descripción del producto 1', unit: 'Unidad', quantity: 4 },
    { id: 2, codigo: 'P002', name: 'Producto 2', description: 'Descripción del producto 2', unit: 'Kilogramo', quantity: 8 }
  ]);

  const [newProduct, setNewProduct] = useState({
    codigo: '',
    name: '',
    description: '',
    unit: 'UND',
    quantity: 0
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nombre');
  const [viewType, setViewType] = useState('full'); // 'full' o 'compact'

  // Cálculo de total de ítems
  const totalItems = products.reduce((sum, product) => sum + Number(product.quantity), 0);

  // Filtrado de productos por término de búsqueda
  const filteredProducts = products.filter(product => 
    product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validación y agregado de producto
  const validateForm = () => {
    const errors = {};
    if (!newProduct.codigo.trim()) {
      errors.codigo = 'El código es obligatorio';
    }
    if (!newProduct.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    if (!newProduct.description.trim()) {
      errors.description = 'La descripción es obligatoria';
      if (viewType === 'compact') {
        setSubmitStatus({
          type: 'error',
          message: 'Por favor ingrese una descripción para el producto'
        });
      }
    }
    if (!newProduct.unit.trim()) {
      errors.unit = 'La unidad es obligatoria';
    }
    if (!newProduct.quantity) {
      errors.quantity = 'La cantidad es obligatoria';
    } else if (Number(newProduct.quantity) <= 0) {
      errors.quantity = 'La cantidad debe ser mayor a 0';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProduct = (e) => {
    if (e) e.preventDefault();
    setSubmitStatus(null);
    if (!validateForm()) {
      setSubmitStatus({
        type: 'error',
        message: 'Por favor complete todos los campos requeridos'
      });
      return;
    }
    const product = {
      id: Date.now(),
      codigo: newProduct.codigo.trim(),
      name: newProduct.name.trim(),
      description: newProduct.description.trim(),
      unit: newProduct.unit.trim(),
      quantity: Number(newProduct.quantity)
    };
    setProducts([...products, product]);
    setNewProduct({ 
      codigo: '',
      name: '', 
      description: '', 
      unit: 'UND', 
      quantity: 0 
    });
    setValidationErrors({});
    setSubmitStatus({
      type: 'success',
      message: `Item "${product.name}" agregado exitosamente`
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value
    }));
  };

  const handleRemoveProduct = (id) => {
    const productToRemove = products.find(product => product.id === id);
    setProducts(products.filter(product => product.id !== id));
    setSubmitStatus({
      type: 'info',
      message: `Item "${productToRemove.name}" eliminado`
    });
  };

  // Ordenar productos
  const handleSort = (field) => {
    setSortField(field);
    const sortedProducts = [...products].sort((a, b) => {
      if (field === 'nombre') {
        return a.name.localeCompare(b.name);
      } else if (field === 'description') {
        return a.description.localeCompare(b.description);
      } else if (field === 'cantidad') {
        return a.quantity - b.quantity;
      } else if (field === 'codigo') {
        return a.codigo.localeCompare(b.codigo);
      }
      return 0;
    });
    setProducts(sortedProducts);
  };

  // Navegación con Enter en la fila de inputs
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Lógica de saltar entre campos
      // (omítela si ya no la necesitas en modo “sólo lectura”)
    }
  };

  return (
    <div className="bg-blue-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Header principal mejorado */}
          <div className="relative mb-8">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl h-28 -z-10"></div>
            
            {/* Línea decorativa superior */}
            <div className="absolute left-0 top-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600 rounded-t-xl"></div>
            
            <div className="pt-6 px-6 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Título y código */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <svg
                    className="w-8 h-8 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Brief</h1>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {briefData.codigo}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Formulario de requerimientos para clientes</p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-1 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {new Date(briefData.fecha).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>

              {/* Controles y estadísticas */}
              <div className="flex flex-wrap gap-3">
                {/* Contador de items */}
                <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center mr-3">
                    <svg 
                      className="w-5 h-5 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Total Items</div>
                    <div className="text-lg font-semibold text-gray-900">{totalItems}</div>
                  </div>
                </div>
                
                {/* Sin botones en el header */}
                <div></div>
              </div>
            </div>
          </div>

          {/* Secciones Cliente y Detalles (en modo solo lectura) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Card Info Brief */}
            <Card className="shadow-sm">
              <CardHeader className="pt-3 pb-2 bg-blue-50 flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20" fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span>Info Brief</span>
                  
                  {/* Íconos de herramientas - solo el historial */}
                  <div className="flex items-center ml-2 gap-1.5">
                    <button
                      className="p-0.5 text-gray-500 hover:text-amber-600 transition-colors"
                      title="Ver historial"
                    >
                      <svg
                        className="w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </CardTitle>
                
                {/* Elemento vacío para mantener el justify-between */}
                <div></div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium text-gray-500">Código:</span> {briefData.codigo || '—'}</p>
                  <p><span className="font-medium text-gray-500">Cliente:</span> {briefData.cliente.empresa || '—'}</p>
                  <p><span className="font-medium text-gray-500">Origen:</span> {briefData.origen || '—'}</p>
                  
                  {/* Botón para editar Cliente y Origen */}
                  <div className="mt-3">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full text-sm"
                      onClick={() => console.log('Editar Cliente y Origen')}
                    >
                      <svg 
                        className="w-4 h-4 mr-1" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Editar Datos de Cliente/Origen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Detalles de la Proforma */}
            <Card className="shadow-sm">
              <CardHeader className="pt-3 pb-2 bg-blue-50">
                <CardTitle className="text-lg flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 20 20" stroke="currentColor"
                  >
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H8z" clipRule="evenodd" />
                  </svg>
                  Detalles de la Proforma
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium text-gray-500">Código Brief:</span>{" "}
                    {briefData.codigo}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Fecha emisión:</span>{" "}
                    {briefData.fecha || '—'}
                    {/* Ícono de edición (opcional) */}
                    <button className="ml-2 text-blue-500 hover:text-blue-600" title="Editar fecha">
                      <svg
                        className="w-4 h-4 inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </p>
                    

                  <p>
                    <span className="font-medium text-gray-500">Observaciones:</span>{" "}
                    {briefData.observaciones || '—'}
                    <button className="ml-2 text-blue-500 hover:text-blue-600" title="Editar observaciones">
                      <svg
                        className="w-4 h-4 inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mensajes de estado (errores, info, éxito) */}
          {submitStatus && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                submitStatus.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : submitStatus.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              <div className="flex items-center">
                {submitStatus.type === 'success' && (
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {submitStatus.type === 'error' && (
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {submitStatus.type === 'info' && (
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 100 2h.01a1 1 0 100-2H10z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="font-medium">{submitStatus.message}</span>
                <button
                  className="ml-auto text-gray-500 hover:text-gray-700"
                  onClick={() => setSubmitStatus(null)}
                  aria-label="Cerrar notificación"
                >
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Sección de tabla de ítems */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-4">
                {/* Búsqueda */}
                <div className="relative w-64">
                  <input 
                    type="text" 
                    className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Buscar items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg
                    className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 20 20" stroke="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 
                         1110.89 3.476l4.817 4.817a1 1 0 
                         01-1.414 1.414l-4.816-4.816A6 6 
                         0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Botones para cambiar vista */}
                <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
                      viewType === 'full'
                        ? 'bg-white shadow-sm text-blue-700'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setViewType('full')}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20" fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 
                           110 2H4a1 1 0 01-1-1zm0 4a1 1 
                           0 011-1h12a1 1 0 110 2H4a1 1 
                           0 01-1-1zm0 4a1 1 0 011-1h12a1 
                           1 0 110 2H4a1 1 0 01-1-1zm0 4a1 
                           1 0 011-1h12a1 1 0 110 2H4a1 1 
                           0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Completa
                  </button>
                  <button
                    className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
                      viewType === 'compact'
                        ? 'bg-white shadow-sm text-blue-700'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setViewType('compact')}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20" fill="currentColor"
                    >
                      <path d="M5 3a2 2 0 
                               00-2 2v2a2 2 0 
                               002 2h2a2 2 0 
                               002-2V5a2 2 0 
                               00-2-2H5zM5 11a2 
                               2 0 00-2 2v2a2 2 
                               0 002 2h2a2 2 0 
                               002-2v-2a2 2 0 
                               00-2-2H5zM11 5a2 
                               2 0 012-2h2a2 2 
                               0 012 2v2a2 2 0 
                               01-2 2h-2a2 2 0 
                               01-2-2V5zM11 13a2 
                               2 0 012-2h2a2 2 
                               0 012 2v2a2 2 0 
                               01-2 2h-2a2 2 0 
                               01-2-2v-2z" />
                    </svg>
                    Compacta
                  </button>
                </div>
              </div>

              {/* Botones para ordenar */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Ordenar por:</span>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${
                    sortField === 'codigo'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleSort('codigo')}
                >
                  Código
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${
                    sortField === 'nombre'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleSort('nombre')}
                >
                  Nombre
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${
                    sortField === 'cantidad'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleSort('cantidad')}
                >
                  Cantidad
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de ítems */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="w-16 py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="w-36 py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Código
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Producto
                  </th>
                  {viewType === 'full' && (
                    <th
                      scope="col"
                      className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Descripción
                    </th>
                  )}
                  <th
                    scope="col"
                    className="w-36 py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Unidad
                  </th>
                  <th
                    scope="col"
                    className="w-36 py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Cantidad
                  </th>
                  <th
                    scope="col"
                    className="w-20 py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Fila para agregar un nuevo ítem */}
                <tr className="bg-blue-50">
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-xs text-blue-600 font-medium">
                      {filteredProducts.length + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      id="codigo"
                      name="codigo"
                      value={newProduct.codigo}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm py-2 px-3"
                      placeholder="Ingrese código"
                    />
                    {validationErrors.codigo && (
                      <div className="mt-1 text-xs text-red-600">{validationErrors.codigo}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newProduct.name}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        className="w-full text-sm rounded-md border-gray-300 shadow-sm py-2 px-3"
                        placeholder="Nombre del producto"
                      />
                      {validationErrors.name && (
                        <div className="mt-1 text-xs text-red-600">{validationErrors.name}</div>
                      )}
                    </div>
                    {viewType === 'compact' && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-1">
                          <label
                            htmlFor="description"
                            className="text-xs text-gray-500 flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-1 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20" fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 
                                   11-16 0 8 8 0 
                                   0116 0zm-7-4a1 1 
                                   0 11-2 0 1 1 0 
                                   012 0zm-1 7a1 1 
                                   0 100 2h.01a1 1 
                                   0 100-2H10z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Descripción:
                          </label>
                        </div>
                        <input
                          type="text"
                          id="description"
                          name="description"
                          value={newProduct.description}
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          className="w-full text-sm rounded-md border-gray-300 shadow-sm py-2 px-3 mt-1"
                          placeholder="Descripción del producto"
                        />
                        {validationErrors.description && (
                          <div className="mt-1 text-xs text-red-600">
                            {validationErrors.description}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  {viewType === 'full' && (
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        id="description"
                        name="description"
                        value={newProduct.description}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        className="w-full text-sm rounded-md border-gray-300 shadow-sm py-2 px-3"
                        placeholder="Descripción del producto"
                      />
                      {validationErrors.description && (
                        <div className="mt-1 text-xs text-red-600">{validationErrors.description}</div>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <select
                      id="unit"
                      name="unit"
                      value={newProduct.unit}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm py-2 pl-3 pr-8"
                    >
                      <option value="UND">UND</option>
                      <option value="KG">KG</option>
                      <option value="LT">LT</option>
                      <option value="MT">MT</option>
                    </select>
                    {validationErrors.unit && (
                      <div className="mt-1 text-xs text-red-600">{validationErrors.unit}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={newProduct.quantity}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      min="0"
                      step="0.01"
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm py-2 px-3"
                      placeholder="0.00"
                    />
                    {validationErrors.quantity && (
                      <div className="mt-1 text-xs text-red-600">{validationErrors.quantity}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={handleAddProduct}
                      className="inline-flex items-center justify-center p-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                      title="Agregar producto"
                    >
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20" fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 
                             8 8 0 000 16zm1-11a1 1 0 
                             10-2 0v2H7a1 1 0 100 2h2v2a1 
                             1 0 102 0v-2h2a1 1 0 
                             100-2h-2V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>

                {/* Listado de productos */}
                {filteredProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-xs text-blue-600 font-medium">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {product.codigo}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{product.name}</td>
                    {viewType === 'full' && (
                      <td className="px-4 py-3 text-gray-900">
                        {product.description}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 text-center">
                      {product.quantity}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleRemoveProduct(product.id)}
                        title="Eliminar este item"
                      >
                        <svg
                          className="w-5 h-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20" fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 
                               00-.894.553L7.382 4H4a1 1 0 
                               000 2v10a2 2 0 002 2h8a2 2 0 
                               002-2V6a1 1 0 
                               100-2h-3.382l-.724-1.447A1 1 0 
                               0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 
                               11-2 0V8zm5-1a1 1 0 00-1 
                               1v6a1 1 0 102 0V8a1 1 0 
                               00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={viewType === 'full' ? 7 : 6}
                      className="px-4 py-8 text-center text-gray-500 font-medium"
                    >
                      No hay items registrados aún
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredProducts.length > 0 && (
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td
                      colSpan={viewType === 'full' ? 5 : 4}
                      className="px-4 py-3 text-right text-sm font-medium text-gray-500"
                    >
                      Total Items:
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {totalItems}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>


          {/* Botones de acción en el footer */}
          <div className="mt-4 flex justify-end gap-3">
            {/* Botón de Vista Previa */}
            <Button
              variant="outline"
              className="inline-flex items-center gap-2"
              onClick={() => console.log('Vista Previa')}
            >
              <svg 
                className="w-4 h-4" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Vista Previa
            </Button>
            
            {/* Botón de Imprimir */}
            <Button
              variant="outline"
              className="inline-flex items-center gap-2"
              onClick={() => console.log('Imprimir')}
            >
              <svg 
                className="w-4 h-4" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Imprimir
            </Button>
            
            {/* Botón de Exportar PDF */}
            <Button
              variant="outline"
              className="inline-flex items-center gap-2"
              onClick={() => console.log('Exportar PDF')}
            >
              <svg 
                className="w-4 h-4" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Exportar PDF
            </Button>
            
            {/* Botón de Guardar Brief */}
            <Button
              variant="default"
              className="inline-flex items-center gap-2"
              onClick={handleSaveBrief}
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Guardar Brief
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brief;
