import React, { useState } from 'react';
import './InventoryManagement.css';

const InventoryManagement = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'dssd', category: '343', price: 3.00, quantity: 4, total: 12.00 },
    { id: 2, name: 'erer', category: 'General', price: 5.00, quantity: 4, total: 20.00 }
  ]);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    category: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nombre');

  // Calculate totals
  const totalItems = products.reduce((sum, product) => sum + product.quantity, 0);
  const totalValue = products.reduce((sum, product) => sum + product.total, 0).toFixed(2);

  // Handle adding a new product
  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price && newProduct.quantity) {
      const product = {
        id: Date.now(),
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity),
        category: newProduct.category || '',
        total: (parseFloat(newProduct.price) * parseInt(newProduct.quantity)).toFixed(2)
      };
      
      setProducts([...products, product]);
      setNewProduct({ name: '', price: '', quantity: '', category: '' });
    }
  };

  // Handle removing a product
  const handleRemoveProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  // Handle sorting
  const handleSort = (field) => {
    setSortField(field);
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
        </div>
      </div>
      
      <div className="add-product-section">
        <div className="input-row">
          <div className="input-group">
            <label>Nombre del Producto</label>
            <input 
              type="text" 
              placeholder="Ingrese el nombre" 
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
          </div>
          
          <div className="input-group">
            <label>Precio</label>
            <div className="price-input">
              <span className="dollar-sign">$</span>
              <input 
                type="number" 
                placeholder="0.00" 
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Cantidad</label>
            <input 
              type="number" 
              placeholder="0" 
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
            />
          </div>
          
          <div className="input-group">
            <label>Categoría</label>
            <input 
              type="text" 
              placeholder="Categoría (opcional)" 
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
            />
          </div>
        </div>
        
        <button className="add-button" onClick={handleAddProduct}>
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
              placeholder="Buscar productos o categorías..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="sort-buttons">
            <button 
              className={sortField === 'nombre' ? 'active' : ''}
              onClick={() => handleSort('nombre')}
            >
              Nombre {sortField === 'nombre' ? '↑' : ''}
            </button>
            
            <button 
              className={sortField === 'precio' ? 'active' : ''}
              onClick={() => handleSort('precio')}
            >
              Precio
            </button>
            
            <button 
              className={sortField === 'cantidad' ? 'active' : ''}
              onClick={() => handleSort('cantidad')}
            >
              Cantidad
            </button>
          </div>
        </div>
        
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>PRODUCTO</th>
                <th>CATEGORÍA</th>
                <th>PRECIO</th>
                <th>CANTIDAD</th>
                <th>TOTAL</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>
                    <span className="category-tag">{product.category}</span>
                  </td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    <span className="quantity-circle">{product.quantity}</span>
                  </td>
                  <td>${product.total}</td>
                  <td>
                    <button className="trash-button" onClick={() => handleRemoveProduct(product.id)}>
                      <svg className="trash-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="total-label">Total General:</td>
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