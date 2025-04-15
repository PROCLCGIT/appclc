// src/pages/proformas/hooks/useProformaSync.js

import { useState, useEffect, useRef } from 'react';

/**
 * Hook para manejar la sincronización de datos entre la proforma 
 * y los estados locales (quote, client, items)
 */
export const useProformaSync = ({
  activeProformaId,
  proformas,
  updateProforma,
  loading
}) => {
  // Valores por defecto para cliente y cotización
  const defaultQuote = {
    number: '',
    name: '',
    date: new Date(),
    expiryDate: new Date(Date.now() + 30*24*60*60*1000),
    taxRate: 15,
    subtotal: 0,
    subtotalFormatted: '0.00',
    tax: 0,
    taxFormatted: '0.00',
    total: 0,
    totalFormatted: '0.00',
    paymentTerms: "50% anticipo, 50% contra entrega",
    deliveryTime: "5 días hábiles",
    notes: "Precios incluyen IVA. Entrega en sus oficinas sin costo adicional dentro del perímetro urbano."
  };
  
  const defaultClient = {
    name: "",
    attention: "",
    email: "",
    phone: "",
    address: "",
    ruc: ""
  };

  // Estados para items, cliente y cotización que dependen de la proforma activa
  const [items, setItems] = useState([]);
  const [client, setClient] = useState(defaultClient);
  const [quote, setQuote] = useState(defaultQuote);
  
  // Objeto para llevar el último valor de cada estado (al nivel superior del hook)
  const lastValues = useRef({
    client: null,
    quote: null,
    items: null,
    lastUpdateTime: 0
  });

  // Sincroniza cambios locales a la proforma activa con manejo mejorado para evitar bucles
  useEffect(() => {
    // Si no hay proforma activa o está cargando, no hacemos nada
    if (!activeProformaId || loading) return;
    
    // Referencia para comprobar si el componente sigue montado
    let isMounted = true;
    
    // Función para comprobar si hay cambios significativos que requieran actualización
    const hasSignificantChanges = () => {
      // Evitar actualizaciones muy frecuentes (mínimo 5 segundos entre cada una)
      const now = Date.now();
      if (now - lastValues.current.lastUpdateTime < 5000) {
        return false;
      }
      
      // Si no hay datos previos y actuales válidos para comparar, no actualizar
      if (!lastValues.current.client || !client || !lastValues.current.quote || !quote) {
        return false;
      }
      
      // Evitar actualizaciones si los valores son iguales
      // Para cliente, usamos comparación más estricta solo en campos específicos importantes
      let clientChanged = false;
      const clientKeysThatMatter = ['id', 'name', 'email', 'phone', 'address', 'ruc'];
      for (const key of clientKeysThatMatter) {
        if (lastValues.current.client[key] !== client[key]) {
          clientChanged = true;
          break;
        }
      }
      
      // Para quote, solo verificamos los campos que no son totales para evitar sobrescribir cálculos
      let quoteChanged = false;
      if (lastValues.current.quote && quote) {
        // Ignoramos los campos de cálculo y metadata al comparar
        const fieldsToIgnore = [
          'subtotal', 'subtotalFormatted', 'tax', 'taxFormatted',
          'total', 'totalFormatted', 'recalculatedAt', 'lastCalculation'
        ];
        
        // Definimos los campos que realmente importan para la comparación
        const keysThatMatter = ['number', 'name', 'date', 'expiryDate', 'taxRate', 
                                'paymentTerms', 'deliveryTime', 'notes'];
        
        // Comparación solo en campos importantes
        for (const key of keysThatMatter) {
          if (lastValues.current.quote[key] !== quote[key]) {
            quoteChanged = true;
            break;
          }
        }
      }
      
      // Para items, verificamos longitud primero y solo hacemos comparación completa si es necesario
      let itemsChanged = false;
      if (lastValues.current.items?.length !== items?.length) {
        itemsChanged = true;
      } else if (items && items.length > 0) {
        // Solo si la longitud es igual y hay items, hacer una comparación más profunda
        // pero limitada a un conjunto razonable de items para evitar cálculos costosos
        const maxItemsToCheck = Math.min(10, items.length);
        for (let i = 0; i < maxItemsToCheck; i++) {
          const currentItem = items[i];
          const prevItem = lastValues.current.items[i];
          
          if (!currentItem || !prevItem) {
            itemsChanged = true;
            break;
          }
          
          // Comparar campos clave
          if (currentItem.id !== prevItem.id ||
              currentItem.quantity !== prevItem.quantity ||
              currentItem.unitPrice !== prevItem.unitPrice ||
              currentItem.description !== prevItem.description) {
            itemsChanged = true;
            break;
          }
        }
      }
      
      console.log("Comprobando cambios:", {clientChanged, quoteChanged, itemsChanged});
      return clientChanged || quoteChanged || itemsChanged;
    };
    
    // Tenemos que esperar un tiempo considerable para evitar actualizaciones simultáneas
    const updateTimeout = setTimeout(() => {
      if (!isMounted) return;
      
      const currentProforma = proformas.find(p => p.id === activeProformaId);
      if (!currentProforma) return;
      
      // Solo actualizamos si hay cambios significativos y hay items
      if (hasSignificantChanges() && items && items.length > 0) {
        console.log("Sincronizando cambios locales a proforma", {
          quoteTotal: quote.total,
          itemsLength: items.length
        });
        
        // Obtenemos la proforma más reciente para verificar si tiene valores calculados recientes
        const latestProforma = proformas.find(p => p.id === activeProformaId);
        const hasRecentCalculation = latestProforma?.lastCalculation && 
                               (Date.now() - latestProforma.lastCalculation < 5000); // 5 segundos
        
        // Preparamos los campos a actualizar
        const updateFields = { client };
        
        // Para items, solo actualizamos si han cambiado
        if (itemsChanged) {
          updateFields.items = items;
        }
        
        // Para quote, excluimos campos relacionados con cálculos recientes
        if (quoteChanged) {
          const fieldsToExclude = ['subtotal', 'subtotalFormatted', 'tax', 'taxFormatted', 
                                  'total', 'totalFormatted', 'lastCalculation'];
          
          // Creamos una copia del quote excluyendo los campos de cálculos
          const safeQuote = { ...quote };
          
          // Si hay cálculos recientes, preservamos los totales de la proforma actual
          if (hasRecentCalculation && latestProforma.quote) {
            console.log("Preservando cálculos recientes en sincronización");
            
            // Preservar campos de totales de la proforma actual
            fieldsToExclude.forEach(field => {
              if (latestProforma.quote[field] !== undefined) {
                safeQuote[field] = latestProforma.quote[field];
              }
            });
          }
          
          updateFields.quote = safeQuote;
        }
        
        // Actualizamos datos en la proforma activa
        updateProforma(activeProformaId, updateFields);
        
        // Actualizar los valores de referencia
        lastValues.current = {
          client: {...client},
          quote: {...quote},
          items: [...items],
          lastUpdateTime: Date.now()
        };
        
        console.log('Actualización de proforma sincronizada con cambios locales', activeProformaId);
      }
    }, 5000); // Aumentado a 5 segundos para reducir actualizaciones significativamente
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(updateTimeout);
    };
  // El debounce evitará actualizaciones excesivas
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, quote, items]);

  // Actualiza los estados locales cuando cambia la proforma activa
  useEffect(() => {
    if (loading) return; // No actualizamos mientras se está cargando
    
    // Usamos una referencia estable para evitar dependencias circulares
    const currentActiveProforma = proformas.find(p => p.id === activeProformaId);
    if (!currentActiveProforma) return;
    
    console.log("Actualizando estados locales basados en proforma activa:", currentActiveProforma.id);
    
    try {
      // Actualizar la cotización
      if (currentActiveProforma.quote) {
        setQuote(currentActiveProforma.quote);
      } else {
        setQuote(defaultQuote);
      }
      
      // Actualizar el cliente, verificando si existe
      if (currentActiveProforma.client && Object.keys(currentActiveProforma.client).length > 0) {
        console.log("Estableciendo cliente desde proforma activa:", currentActiveProforma.client);
        setClient(currentActiveProforma.client);
      } else {
        console.log("No hay cliente en la proforma activa, usando cliente vacío");
        setClient(defaultClient);
      }
      
      // Siempre garantizamos que items sea un array, evitando que sea undefined o null
      const safeItems = Array.isArray(currentActiveProforma.items) ? [...currentActiveProforma.items] : [];
      setItems(safeItems);
    } catch (error) {
      console.error("Error al actualizar estados locales:", error);
    }
    
  // Solo se debe ejecutar cuando cambia el ID de la proforma activa
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProformaId, loading]);

  return {
    items,
    setItems,
    client,
    setClient,
    quote,
    setQuote,
    defaultQuote,
    defaultClient
  };
};

export default useProformaSync;