import React, { useState } from "react";
import "./gestioninventarios.css";
// Icono del carrito
import { FaShoppingCart } from "react-icons/fa";

const GestionInventarios = () => {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");

  // Agregar producto
  const handleAddProduct = () => {
    // Validar campos básicos
    if (!productName || !price || !quantity) return;

    const newProduct = {
      id: Date.now(),
      name: productName,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category: category || "General",
    };

    setProducts([...products, newProduct]);
    // Limpiar campos
    setProductName("");
    setPrice("");
    setQuantity("");
    setCategory("");
  };

  // Eliminar producto
  const handleDeleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  // Cálculo de totales
  const totalItems = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalValue = products.reduce((acc, p) => acc + p.price * p.quantity, 0);

  return (
    <div className="gestion-container">
      {/* Encabezado */}
      <div className="header">
        <h1 className="title">Gestión de Inventario</h1>
        <div className="cart-info">
          <FaShoppingCart className="cart-icon" />
          <div className="cart-details">
            <p className="items-count">Total Items: {totalItems}</p>
            <p className="total-value">Valor Total: ${totalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Tarjeta para agregar producto */}
      <div className="inventory-card">
        <div className="form-group">
          <input
            type="text"
            placeholder="Nombre del Producto"
            className="product-input"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Precio"
            className="product-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Cantidad"
            className="product-input"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <input
            type="text"
            placeholder="Categoría (opcional)"
            className="product-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <button className="add-button" onClick={handleAddProduct}>
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Tarjeta con tabla de productos */}
      <div className="table-card">
        <input
          type="text"
          placeholder="Buscar productos o categorías..."
          className="search-input"
        />
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Categoría</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.quantity}</td>
                <td>{p.category}</td>
                <td>${(p.price * p.quantity).toFixed(2)}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteProduct(p.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Totales al final */}
        <div className="totals">
          <p className="totals-text">Total General: ${totalValue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default GestionInventarios;
