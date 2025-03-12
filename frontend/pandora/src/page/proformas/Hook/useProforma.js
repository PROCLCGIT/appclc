// src/page/proformas/Hook/useProforma.js
import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { DEFAULT_TAX_RATE, TEMPLATE_TYPES } from '../Utils/constants';
import { calculateSubtotal } from '../Utils/formatCurrency';

/**
 * Hook personalizado para manejar toda la lógica de proformas
 */
const useProforma = () => {
  // Estado para la información de la empresa
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Mi Empresa S.A.',
    email: 'contacto@miempresa.com',
    phone: '+593 98-765-4321',
    address: 'Av. Principal 123, Ciudad',
    logo: '/company-logo.png',
    taxRate: DEFAULT_TAX_RATE,
    currency: 'USD',
    locale: 'es-EC',
  });

  // Estado para la información del cliente
  const [clientInfo, setClientInfo] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
  });

  // Estado para los detalles de la proforma
  const [proformaDetails, setProformaDetails] = useState({
    number: generateProformaNumber(),
    date: new Date(),
    expiryDate: addDays(new Date(), 30),
    paymentTerms: '50% anticipo, 50% contra entrega',
    deliveryTime: '10 días hábiles',
    notes: 'Precios incluyen IVA. Validez de la oferta 30 días.',
    template: TEMPLATE_TYPES.MODERN,
  });

  // Estado para los items de la proforma
  const [items, setItems] = useState([]);

  // Estado para el producto seleccionado actualmente
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Estado para cálculos financieros
  const [financials, setFinancials] = useState({
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
  });

  // Generar número de proforma único
  function generateProformaNumber() {
    const prefix = 'PRO';
    const date = format(new Date(), 'yyyyMMdd');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${date}-${random}`;
  }

  // Agregar un nuevo item a la proforma
  const addItem = (product = null) => {
    const newItem = product
      ? {
          id: product.id || `item-${Date.now()}`,
          code: product.id || '',
          description: product.name || '',
          unit: product.unit || 'unit',
          quantity: 1,
          unitPrice: product.price || 0,
          discount: product.discount || 0,
          total: calculateItemTotal(1, product.price || 0, product.discount || 0),
        }
      : {
          id: `item-${Date.now()}`,
          code: '',
          description: '',
          unit: 'unit',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          total: 0,
        };

    setItems([...items, newItem]);
  };

  // Calcular el total de un item
  const calculateItemTotal = (quantity, unitPrice, discountPercentage) => {
    const discountAmount = (unitPrice * quantity * discountPercentage) / 100;
    return (unitPrice * quantity) - discountAmount;
  };

  // Actualizar un item existente
  const updateItem = (id, field, value) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalcular el total si cambia cantidad, precio o descuento
        if (['quantity', 'unitPrice', 'discount'].includes(field)) {
          const quantity = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
          const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : item.unitPrice;
          const discount = field === 'discount' ? parseFloat(value) || 0 : item.discount;
          
          updatedItem.total = calculateItemTotal(quantity, unitPrice, discount);
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setItems(updatedItems);
  };

  // Eliminar un item
  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Recalcular financieros cuando cambian los items o la tasa de impuesto
  useEffect(() => {
    const subtotal = calculateSubtotal(items);
    const tax = subtotal * companyInfo.taxRate;
    const total = subtotal + tax - (financials.discount || 0);
    
    setFinancials({
      ...financials,
      subtotal,
      tax,
      total,
    });
  }, [items, companyInfo.taxRate, financials.discount]);

  return {
    companyInfo,
    setCompanyInfo,
    clientInfo,
    setClientInfo,
    proformaDetails,
    setProformaDetails,
    items,
    setItems,
    addItem,
    updateItem,
    removeItem,
    selectedProduct,
    setSelectedProduct,
    financials,
    setFinancials,
  };
};

export default useProforma;