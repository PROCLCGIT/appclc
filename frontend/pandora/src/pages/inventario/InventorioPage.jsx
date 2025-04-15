import React, { useState, useRef, useEffect } from 'react';
import './InventarioPage.css';

const InventoryManagement = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'dssd', category: '343', price: 3.00, quantity: 4, total: 12.00, unidad: 'UND' },
    { id: 2, name: 'erer', category: 'General', price: 5.00, quantity: 4, total: 20.00, unidad: 'UND' }
  ]);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    category: '',
    unidad: 'UND' // Valor predeterminado "UND"
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nombre');
  const [validationErrors, setValidationErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  
  // Referencias para manejo de enfoque
  const nameInputRef = useRef(null);
  
  // Enfocar el primer campo al cargar
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Calculate totals - safely handle invalid values
  const totalItems = products.reduce((sum, product) => {
    const quantity = typeof product.quantity === 'number' ? product.quantity : parseInt(product.quantity) || 0;
    return sum + quantity;
  }, 0);
  
  const totalValue = products.length > 0 ? 
    products.reduce((sum, product) => {
      // Parse the total string value to number or use direct number
      const total = typeof product.total === 'string' ? parseFloat(product.total) || 0 : product.total || 0;
      return sum + total;
    }, 0).toFixed(2) : 
    "0.00";

  // Validar el formulario
  const validateForm = () => {
    const errors = {};
    
    if (!newProduct.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
      errors.price = 'El precio debe ser mayor que 0';
    }
    
    if (!newProduct.quantity || parseInt(newProduct.quantity) <= 0) {
      errors.quantity = 'La cantidad debe ser mayor que 0';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle adding a new product
  const handleAddProduct = () => {
    // Resetear el estado de envío anterior
    setSubmitStatus(null);
    
    // Asegurarse de que la unidad sea "UND" si está vacía
    const submittingData = {
      ...newProduct,
      unidad: newProduct.unidad && newProduct.unidad.trim() !== '' ? newProduct.unidad : 'UND'
    };
    
    console.log("Datos a enviar:", submittingData);
    
    // Validar que los campos requeridos estén completos
    if (!validateForm()) {
      setSubmitStatus({
        type: 'error',
        message: 'Por favor complete todos los campos requeridos'
      });
      return;
    }
    
    // Convertir valores y asegurar que sean números válidos
    const price = parseFloat(submittingData.price) || 0;
    const quantity = parseInt(submittingData.quantity) || 0;
    const total = (price * quantity).toFixed(2);
    
    const product = {
      id: Date.now(),
      name: submittingData.name.trim(),
      price: price,
      quantity: quantity,
      category: submittingData.category || '',
      unidad: submittingData.unidad, // Incluir la unidad
      total: total
    };
    
    // Agregar el producto a la lista
    setProducts(prevProducts => {
      const newProducts = [...prevProducts, product];
      console.log("Nueva lista de productos:", newProducts);
      return newProducts;
    });
    
    // Mostrar mensaje de éxito
    setSubmitStatus({
      type: 'success',
      message: `Producto "${product.name}" agregado exitosamente`
    });
    
    // Resetear el formulario pero mantener la unidad como "UND"
    setNewProduct({
      name: '',
      price: '',
      quantity: '',
      category: '',
      unidad: 'UND' // Mantener "UND" como valor predeterminado al resetear
    });
    
    // Enfocar nuevamente el campo de nombre
    nameInputRef.current?.focus();
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Tratamiento especial para el campo 'unidad'
    if (name === 'unidad' && value === '') {
      // Si intentan establecer un valor vacío para unidad, mantener 'UND'
      setNewProduct(prev => ({
        ...prev,
        unidad: 'UND'
      }));
      return;
    }
    
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores de validación al cambiar un campo
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle pressing Enter key in form fields
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddProduct();
    }
  };

  // Handle removing a product
  const handleRemoveProduct = (id) => {
    const productToRemove = products.find(product => product.id === id);
    setProducts(products.filter(product => product.id !== id));
    
    // Mostrar mensaje de información
    setSubmitStatus({
      type: 'info',
      message: `Producto "${productToRemove.name}" eliminado`
    });
  };

  // Handle sorting
  const handleSort = (field) => {
    setSortField(field);
    
    // Ordenar productos basados en el campo seleccionado
    const sortedProducts = [...products].sort((a, b) => {
      if (field === 'nombre') {
        return a.name.localeCompare(b.name);
      } else if (field === 'precio') {
        return a.price - b.price;
      } else if (field === 'cantidad') {
        return a.quantity - b.quantity;
      }
      return 0;
    });
    
    setProducts(sortedProducts);
  };

  // Filter products by search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <div className="inventory-title">
          <svg className="box-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8V21H3V8"></path>
            <path d="M3 4h18v4H3z"></path>
            <path d="M12 12v6"></path>
            <path d="M8 12v6"></path>
            <path d="M16 12v6"></path>
          </svg>
          <h1>Gestión de Inventario</h1>
        </div>
        
        <div className="inventory-summary">
          <div className="summary-card">
            <svg className="cart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <div className="summary-details">
              <span className="summary-label">Total Items</span>
              <span className="summary-value">{totalItems}</span>
            </div>
          </div>
          
          <div className="summary-card">
            <svg className="dollar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1v22"></path>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <div className="summary-details">
              <span className="summary-label">Valor Total</span>
              <span className="summary-value">${totalValue}</span>
            </div>
          </div>
          
          <div className="summary-card">
            <svg className="box-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"></path>
              <path d="M8 3h6l4 4v10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V3z"></path>
            </svg>
            <div className="summary-details">
              <span className="summary-label">Total Productos</span>
              <span className="summary-value">{products.length}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Messages */}
      {submitStatus && (
        <div className={`status-message ${submitStatus.type}`}>
          {submitStatus.type === 'success' && (
            <svg className="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          )}
          
          {submitStatus.type === 'error' && (
            <svg className="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          
          {submitStatus.type === 'info' && (
            <svg className="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          )}
          
          <span>{submitStatus.message}</span>
          <button 
            className="close-status" 
            onClick={() => setSubmitStatus(null)}
            aria-label="Cerrar notificación"
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="add-product-section">
        <div className="input-row">
          <div className={`input-group ${validationErrors.name ? 'has-error' : ''}`}>
            <label>Nombre del Producto <span className="required">*</span></label>
            <input 
              type="text" 
              placeholder="Ingrese el nombre" 
              value={newProduct.name}
              onChange={(e) => handleChange({ target: { name: 'name', value: e.target.value } })}
              onKeyDown={handleKeyDown}
              ref={nameInputRef}
            />
            {validationErrors.name && <div className="error-message">{validationErrors.name}</div>}
          </div>
          
          <div className={`input-group ${validationErrors.price ? 'has-error' : ''}`}>
            <label>Precio <span className="required">*</span></label>
            <div className="price-input">
              <span className="dollar-sign">$</span>
              <input 
                type="number" 
                placeholder="0.00" 
                value={newProduct.price}
                onChange={(e) => handleChange({ target: { name: 'price', value: e.target.value } })}
                onKeyDown={handleKeyDown}
                min="0.01"
                step="0.01"
              />
            </div>
            {validationErrors.price && <div className="error-message">{validationErrors.price}</div>}
          </div>
          
          <div className={`input-group ${validationErrors.quantity ? 'has-error' : ''}`}>
            <label>Cantidad <span className="required">*</span></label>
            <input 
              type="number" 
              placeholder="0" 
              value={newProduct.quantity}
              onChange={(e) => handleChange({ target: { name: 'quantity', value: e.target.value } })}
              onKeyDown={handleKeyDown}
              min="1"
            />
            {validationErrors.quantity && <div className="error-message">{validationErrors.quantity}</div>}
          </div>
          
          <div className="input-group">
            <label>Unidad</label>
            <select
              name="unidad"
              value={newProduct.unidad || 'UND'}
              defaultValue="UND"
              onChange={(e) => handleChange({ target: { name: 'unidad', value: e.target.value } })}
              onKeyDown={handleKeyDown}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-medium"
            >
              <option value="UND">UND</option>
              <option value="KG">KG</option>
              <option value="LT">LT</option>
              <option value="MT">MT</option>
            </select>
          </div>
          
          <div className="input-group">
            <label>Categoría</label>
            <input 
              type="text" 
              placeholder="Categoría (opcional)" 
              value={newProduct.category}
              onChange={(e) => handleChange({ target: { name: 'category', value: e.target.value } })}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        
        <button 
          className="add-button" 
          onClick={handleAddProduct}
          title="Agregar nuevo producto al inventario"
        >
          <svg className="plus-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Agregar Producto
        </button>
      </div>
      
      <div className="products-list-section">
        <div className="search-sort-bar">
          <div className="search-box">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar por nombre, descripción o unidad..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="sort-buttons">
            <button 
              className={sortField === 'nombre' ? 'active' : ''}
              onClick={() => handleSort('nombre')}
              title="Ordenar por nombre"
            >
              Nombre {sortField === 'nombre' ? '↑' : ''}
            </button>
            
            <button 
              className={sortField === 'precio' ? 'active' : ''}
              onClick={() => handleSort('precio')}
              title="Ordenar por precio"
            >
              Precio
            </button>
            
            <button 
              className={sortField === 'cantidad' ? 'active' : ''}
              onClick={() => handleSort('cantidad')}
              title="Ordenar por cantidad"
            >
              Cantidad
            </button>
          </div>
        </div>
        
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th className="w-16">ID</th>
                <th>PRODUCTO</th>
                <th>CATEGORÍA</th>
                <th>UNIDAD</th>
                <th>PRECIO</th>
                <th>CANTIDAD</th>
                <th>TOTAL</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => {
                // Asegurarse de que unidad siempre tenga un valor y sea "UND" por defecto
                const displayUnit = product.unidad && product.unidad.trim() !== '' ? product.unidad : 'UND';
                
                return (
                  <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="text-center">
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-gray-800 font-medium">
                        {index + 1}
                      </span>
                    </td>
                    <td>{product.name}</td>
                    <td>
                      <span className="category-tag">{product.category}</span>
                    </td>
                    <td>
                      <span className="category-tag font-medium">{displayUnit}</span>
                    </td>
                    <td>${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</td>
                    <td>
                      <span className="quantity-circle">{product.quantity}</span>
                    </td>
                    <td>${product.total || '0.00'}</td>
                    <td>
                      <button 
                        className="trash-button" 
                        onClick={() => handleRemoveProduct(product.id)}
                        title="Eliminar producto"
                      >
                        <svg className="trash-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="6" className="total-label">Total General:</td>
                <td className="total-amount">${totalValue}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;