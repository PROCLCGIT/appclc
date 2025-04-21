// src/pages/proformas/handlers/itemsHandlers.js

import React, { useCallback } from "react";
import { toast } from "sonner";

/**
 * Conjunto de funciones para manejar los items de una proforma
 */
export const useItemsHandlers = ({
  activeProformaId,
  proformas,
  updateProforma,
  setItems,
  recalculateTotals
}) => {
  // Agregar nuevo ítem manual
  const addItem = () => {
    // Encontrar la proforma activa
    const activeProforma = proformas.find(p => p.id === activeProformaId);
    if (!activeProforma) return;
    
    // Asegurarnos que items es un array
    const currentItems = Array.isArray(activeProforma.items) ? activeProforma.items : [];
    
    const newItem = {
      id: Date.now(), // Usar timestamp como ID único
      code: "",
      description: "",
      unit: "Unidad",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0
    };
    
    const updatedItems = [...currentItems, newItem];
    
    // Actualizar los items locales primero
    setItems(updatedItems);
    
    // Actualizar la proforma con los items actualizados
    updateProforma(activeProformaId, { items: updatedItems });
    
    // Recalcular totales después de la actualización
    recalculateTotals();
  };

  // Actualizar un ítem
  const updateItem = (id, field, value) => {
    // Encontrar la proforma activa
    const activeProforma = proformas.find(p => p.id === activeProformaId);
    if (!activeProforma) return;
    
    // Asegurarnos que items es un array
    const currentItems = Array.isArray(activeProforma.items) ? activeProforma.items : [];
    
    const updatedItems = currentItems.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalcular total
        if (["quantity", "unitPrice", "discount"].includes(field)) {
          // Asegurarnos de que todos los valores son números válidos
          // Usando parseFloat para mejor precisión y verificando el tipo explícitamente
          let qty, price, disc;
          
          // Para cantidad, usar el nuevo valor si estamos modificando ese campo, o el valor actual
          if (field === "quantity") {
            qty = typeof value === 'number' ? value : parseFloat(value) || 0;
          } else {
            qty = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0;
          }
          
          // Para precio unitario
          if (field === "unitPrice") {
            price = typeof value === 'number' ? value : parseFloat(value) || 0;
          } else {
            price = typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(item.unitPrice) || 0;
          }
          
          // Para descuento
          if (field === "discount") {
            disc = typeof value === 'number' ? value : parseFloat(value) || 0;
          } else {
            disc = typeof item.discount === 'number' ? item.discount : parseFloat(item.discount) || 0;
          }
          
          // Validar que los valores estén en rangos razonables
          qty = Math.max(0, qty); // No permitir cantidades negativas
          price = Math.max(0, price); // No permitir precios negativos
          disc = Math.min(100, Math.max(0, disc)); // Descuento entre 0 y 100%
          
          // Registrar valores para debugging
          console.log(`Calculando total para ítem:
            - Cantidad: ${qty}
            - Precio: ${price}
            - Descuento: ${disc}%`);
          
          // Calcular con precisión y mantener números como números hasta el último momento
          const subtotalItem = price * qty;
          const discountAmount = (subtotalItem * disc) / 100;
          const totalItem = subtotalItem - discountAmount;
          
          console.log(`Resultados:
            - Subtotal: ${subtotalItem}
            - Monto descuento: ${discountAmount}
            - Total: ${totalItem}`);
          
          // Guardar como número, no como string, para evitar problemas con las sumas
          updatedItem.quantity = qty;
          updatedItem.unitPrice = price;
          updatedItem.discount = disc;
          updatedItem.total = totalItem; // Guardamos el valor exacto, no redondeado
        }
        return updatedItem;
      }
      return item;
    });
    
    // Actualizar los items locales
    setItems(updatedItems);
    
    // Recalcular totales INMEDIATAMENTE usando los items actualizados (no esperar a que se actualice la proforma)
    const updatedQuote = recalculateTotals(updatedItems);
    
    if (updatedQuote) {
      // Actualizar la proforma con los items Y los totales calculados en una sola operación
      updateProforma(activeProformaId, { 
        items: updatedItems,
        quote: updatedQuote,
        // Marca de tiempo para identificar esta actualización de cálculo
        lastCalculation: new Date().getTime()
      });
      
      console.log("UpdateItem: Totales recalculados - nuevo total:", updatedQuote.total);
    } else {
      // Si falló el cálculo, solo actualizamos los items
      updateProforma(activeProformaId, { items: updatedItems });
      console.warn("UpdateItem: No se pudo calcular totales, solo se actualizaron items");
    }
  };

  // Eliminar ítem
  const removeItem = (id) => {
    // Encontrar la proforma activa
    const activeProforma = proformas.find(p => p.id === activeProformaId);
    if (!activeProforma) return;
    
    // Asegurarnos que items es un array
    const currentItems = Array.isArray(activeProforma.items) ? activeProforma.items : [];
    
    const updatedItems = currentItems.filter((item) => item.id !== id);
    
    // Actualizar los items locales primero
    setItems(updatedItems);
    
    // Recalcular totales INMEDIATAMENTE usando los items actualizados (no esperar a que se actualice la proforma)
    const updatedQuote = recalculateTotals(updatedItems);
    
    if (updatedQuote) {
      // Actualizar la proforma con los items Y los totales calculados en una sola operación
      updateProforma(activeProformaId, { 
        items: updatedItems,
        quote: updatedQuote,
        // Marca de tiempo para identificar esta actualización de cálculo
        lastCalculation: new Date().getTime()
      });
      
      console.log("RemoveItem: Totales recalculados - nuevo total:", updatedQuote.total);
    } else {
      // Si falló el cálculo, solo actualizamos los items
      updateProforma(activeProformaId, { items: updatedItems });
      console.warn("RemoveItem: No se pudo calcular totales, solo se actualizaron items");
    }
  };

  // Buscar productos con la API
  const searchProducts = async (term, source = "ofertados", proformasService) => {
    try {
      // Si no hay término de búsqueda y es "ofertados", cargamos los últimos 5 productos ofertados
      const searchQuery = (!term || term.length < 2) ? "" : term;
      
      console.log(`Buscando "${searchQuery}" en la fuente: ${source}`);
      
      // Utilizar el servicio real en lugar de datos simulados
      const response = await proformasService.buscarProductos(searchQuery, source);
      
      // Transformar la respuesta del API a un formato uniforme para nuestro componente
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
          // Reconstruimos un objeto "original" con los datos necesarios para el backend
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
      
      // Limitar a máximo 5 resultados para mostrar en la vista
      const limitedResults = results.slice(0, 5);
      
      return limitedResults;
    } catch (error) {
      console.error("Error al buscar productos:", error);
      toast.error("No se pudieron cargar los productos. Verifica tu conexión.");
      return [];
    }
  };

  // Agregar producto desde búsqueda a la proforma
  const addProductFromSearch = (product) => {
    // Encontrar la proforma activa
    const activeProforma = proformas.find(p => p.id === activeProformaId);
    if (!activeProforma) return;
    
    // Asegurarnos que items es un array
    const currentItems = Array.isArray(activeProforma.items) ? activeProforma.items : [];
    
    // Crear nuevo ítem con información completa del producto
    // Asegurarnos de que los valores numéricos se manejen correctamente
    const quantity = 1;
    const unitPrice = parseFloat(product.price) || 0;
    const discount = 0;
    
    // Calcular el total directamente como número
    const itemTotal = quantity * unitPrice;
    
    const newItem = {
      id: Date.now(), // Usar timestamp como ID único
      code: product.code,
      description: product.description,
      unit: product.unit,
      quantity: quantity,
      unitPrice: unitPrice,
      discount: discount,
      total: itemTotal, // Guardar como número para que las sumas funcionen correctamente
      // Guardar información del origen del producto para el backend
      source: product.source,
      productId: product.realId || product.id, // Usar el ID real si está disponible
      original: product.original // Guardar objeto completo para referencia futura
    };
    
    // Agregar a los ítems y actualizar el estado local
    const updatedItems = [...currentItems, newItem];
    setItems(updatedItems);
    
    // Actualizar la proforma con los items actualizados
    updateProforma(activeProformaId, { items: updatedItems });
    
    // Recalcular totales después de la actualización
    recalculateTotals();
    
    // Notificar al usuario
    toast.success(`${product.description} agregado a la proforma #${activeProforma.quote.number}`);
  };

  return {
    addItem,
    updateItem,
    removeItem,
    searchProducts,
    addProductFromSearch,
  };
};
