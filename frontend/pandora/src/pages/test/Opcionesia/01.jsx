import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2, X, List, Grid, Package, Truck, Archive, ArrowDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { proformasService } from "@/services/api";
import "./ProductSearchPage.css";

export default function ProductSearchPage() {
  // Estados para la búsqueda de productos
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSource, setSearchSource] = useState("ofertados"); // Por defecto buscar en productos ofertados
  const [searchResults, setSearchResults] = useState([]);
  const [viewType, setViewType] = useState("grid"); // o "list"
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Estados para los productos seleccionados
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Config
  const [config] = useState({
    currencySymbol: "$",
    decimalPlaces: 2,
    showItemCodes: true
  });
  
  // Cargar productos iniciales
  useEffect(() => {
    const loadInitialProducts = async () => {
      try {
        // Cargar productos ofertados recientes para mostrar inicialmente
        await searchProducts("", "ofertados");
      } catch (error) {
        console.error("Error al cargar productos iniciales:", error);
      }
    };
    
    loadInitialProducts();
  }, []);

  // Buscar productos con la API
  const searchProducts = async (term, source = "ofertados") => {
    try {
      setLoadingProducts(true);
      
      // Si no hay término de búsqueda y es "ofertados", cargamos los últimos 5-10 productos ofertados
      const searchQuery = (!term || term.length < 2) ? "" : term;
      
      console.log(`Buscando "${searchQuery}" en la fuente: ${source}`);
      
      // Llamar al servicio de búsqueda de productos
      const response = await proformasService.buscarProductos(searchQuery, source);
      
      console.log("Respuesta de búsqueda:", response);
      
      // Transformar la respuesta del API a un formato uniforme
      const results = response.map(product => {
        // Determinar el tipo de fuente y aplicar etiquetas visuales
        let sourceType = product.source || 'personalizado';
        let sourceLabel = '';
        
        if (sourceType === 'ofertados') {
          sourceLabel = 'Producto Ofertado';
        } else if (sourceType === 'disponibles') {
          sourceLabel = 'Producto Disponible';
        } else if (sourceType === 'inventario') {
          sourceLabel = 'Inventario';
        }
        
        // Extraer el ID real para cada tipo de producto
        let realId;
        if (product.id && typeof product.id === 'string') {
          // El backend puede devolver IDs en formato "of-123" o "disp-456"
          const parts = product.id.split('-');
          if (parts.length > 1) {
            realId = parseInt(parts[1], 10);
          } else {
            realId = product.id;
          }
        } else {
          realId = product.id;
        }
        
        return {
          id: product.id, // ID formateado que devuelve el backend
          realId: realId, // ID numérico extraído
          code: product.code || '',
          description: product.description || '',
          source: sourceType,
          sourceLabel: sourceLabel,
          price: parseFloat(product.price || 0),
          unit: product.unit || 'Unidad',
          stock: product.stock || 'Disponible',
          // Objeto original con datos para el backend
          original: {
            id: realId,
            tipo: sourceType,
            codigo: product.code || '',
            descripcion: product.description || '',
            precio: parseFloat(product.price || 0),
            unidad: product.unit || 'Unidad'
          }
        };
      });
      
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error("Error al buscar productos:", error);
      toast.error("No se pudieron cargar los productos. Verifica tu conexión.");
      setSearchResults([]);
      return [];
    } finally {
      setLoadingProducts(false);
    }
  };

  // Agregar producto desde búsqueda a la lista de seleccionados
  const addProductFromSearch = (product) => {
    const newItem = {
      id: selectedItems.length > 0 ? Math.max(...selectedItems.map((it) => it.id || 0)) + 1 : 1,
      code: product.code,
      description: product.description,
      unit: product.unit,
      quantity: 1,
      unitPrice: product.price,
      discount: 0,
      total: product.price,
      // Guardar información del origen del producto para el backend
      source: product.source,
      productId: product.realId || product.id,
      original: product.original // Guardar objeto completo para referencia futura
    };
    
    // Agregar a los ítems seleccionados
    setSelectedItems([...selectedItems, newItem]);
    
    // Notificar al usuario
    toast.success(`${product.description} agregado a la lista`);
  };

  // Actualizar un ítem seleccionado
  const updateItem = (id, field, value) => {
    const updatedItems = selectedItems.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalcular total si es necesario
        if (["quantity", "unitPrice", "discount"].includes(field)) {
          const qty = field === "quantity" ? Number(value) || 0 : Number(item.quantity) || 0;
          const price = field === "unitPrice" ? Number(value) || 0 : Number(item.unitPrice) || 0;
          const disc = field === "discount" ? Number(value) || 0 : Number(item.discount) || 0;
          
          const discountAmount = (price * qty * disc) / 100;
          updatedItem.total = Number(((price * qty) - discountAmount).toFixed(config.decimalPlaces));
        }
        return updatedItem;
      }
      return item;
    });
    
    setSelectedItems(updatedItems);
  };

  // Eliminar ítem seleccionado
  const removeItem = (id) => {
    const updatedItems = selectedItems.filter((item) => item.id !== id);
    setSelectedItems(updatedItems);
  };

  // Cambiar fuente de búsqueda
  const handleSourceChange = (source) => {
    setSearchSource(source);
    searchProducts(searchTerm, source);
  };

  // Formatear moneda
  const formatCurrency = (value) => {
    const numValue = typeof value === 'number' ? value : Number(value) || 0;
    return `${config.currencySymbol}${numValue.toFixed(config.decimalPlaces)}`;
  };

  // Manejar cambios en la búsqueda
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Búsqueda automática si hay al menos 2 caracteres o si se borra la búsqueda
    if (value.length >= 2 || value === '') {
      searchProducts(value, searchSource);
    }
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    searchProducts('', searchSource);
  };

  // Limpiar selección
  const handleClearSelection = () => {
    if (selectedItems.length > 0 && window.confirm('¿Está seguro de eliminar todos los productos seleccionados?')) {
      setSelectedItems([]);
      toast.info("Se han eliminado todos los productos seleccionados");
    }
  };

  return (
    <div className="product-search-container">
      <div className="search-header">
        <h1 className="search-title">Productos y Servicios</h1>
        
        <div className="search-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-button ${viewType === 'list' ? 'active' : ''}`}
              onClick={() => setViewType('list')}
              title="Vista de lista"
            >
              <List size={18} />
            </button>
            <button 
              className={`toggle-button ${viewType === 'grid' ? 'active' : ''}`}
              onClick={() => setViewType('grid')}
              title="Vista de cuadrícula"
            >
              <Grid size={18} />
            </button>
          </div>
          
          <div className="source-selector">
            <button 
              className={`source-button ${searchSource === 'ofertados' ? 'active' : ''}`}
              onClick={() => handleSourceChange('ofertados')}
            >
              <Package size={16} />
              <span>Ofertados</span>
            </button>
            <button 
              className={`source-button ${searchSource === 'disponibles' ? 'active' : ''}`}
              onClick={() => handleSourceChange('disponibles')}
            >
              <Truck size={16} />
              <span>Disponibles</span>
            </button>
            <button 
              className={`source-button ${searchSource === 'inventario' ? 'active' : ''}`}
              onClick={() => handleSourceChange('inventario')}
            >
              <Archive size={16} />
              <span>Inventario</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="search-bar">
        <div className="search-input-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar productos por nombre, código..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={handleClearSearch}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      
      <div className="product-content">
        <div className="product-results">
          <Card>
            <CardHeader className="results-header">
              <CardTitle>Resultados de búsqueda</CardTitle>
              {loadingProducts && <span className="loading-indicator">Buscando...</span>}
            </CardHeader>
            <CardContent>
              {searchResults.length === 0 ? (
                <div className="no-results">
                  {loadingProducts ? (
                    <div className="loading-animation">
                      <div className="spinner"></div>
                      <p>Cargando productos...</p>
                    </div>
                  ) : (
                    <p>No se encontraron productos. Intente con otra búsqueda.</p>
                  )}
                </div>
              ) : (
                <div className={`results-container ${viewType}`}>
                  {searchResults.map((product) => (
                    <div key={product.id} className="product-item">
                      <div className="product-details">
                        <div className="product-code">{product.code}</div>
                        <div className="product-description">{product.description}</div>
                        <div className="product-meta">
                          <span className="product-price">{formatCurrency(product.price)}</span>
                          <span className="product-unit">{product.unit}</span>
                          <span className={`product-source source-${product.source}`}>
                            {product.sourceLabel}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="add-product-btn"
                        onClick={() => addProductFromSearch(product)}
                      >
                        <Plus size={16} />
                        Agregar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="selected-items">
          <Card>
            <CardHeader className="selected-header">
              <CardTitle>Productos seleccionados ({selectedItems.length})</CardTitle>
              {selectedItems.length > 0 && (
                <button className="clear-all-btn" onClick={handleClearSelection}>
                  Limpiar todo
                </button>
              )}
            </CardHeader>
            <CardContent>
              {selectedItems.length === 0 ? (
                <div className="no-items">
                  <p>No hay productos seleccionados</p>
                  <p className="hint">Busque y seleccione productos para agregarlos a la lista</p>
                </div>
              ) : (
                <div className="items-list">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.code}</td>
                          <td>{item.description}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                              className="quantity-input"
                            />
                          </td>
                          <td>{formatCurrency(item.unitPrice)}</td>
                          <td>{formatCurrency(item.total)}</td>
                          <td>
                            <button 
                              className="remove-item-btn"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="5" className="total-label">Total:</td>
                        <td className="total-value">
                          {formatCurrency(
                            selectedItems.reduce((sum, item) => sum + Number(item.total || 0), 0)
                          )}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="action-buttons">
        <Button
          variant="outline"
          onClick={() => {
            // Exportar a Excel o CSV
            toast.info("Exportación a Excel disponible próximamente");
          }}
        >
          Exportar lista
        </Button>
        
        <Button
          variant="primary"
          onClick={() => {
            if (selectedItems.length === 0) {
              toast.error("Debe seleccionar al menos un producto");
              return;
            }
            
            // Enviar productos seleccionados al módulo correspondiente
            // Por ahora solo mostramos un mensaje
            toast.success(`Lista con ${selectedItems.length} productos guardada`);
            
            // En un caso real, aquí se enviaría al backend o se usaría en otro componente
            console.log("Productos seleccionados:", selectedItems);
          }}
        >
          Guardar lista
        </Button>
      </div>
    </div>
  );
}