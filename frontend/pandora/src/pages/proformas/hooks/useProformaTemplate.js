// src/pages/proformas/hooks/useProformaTemplate.js

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { proformasService } from '@/services/api';
import pandoraLogo from '@/assets/pandora.png';

/**
 * Hook personalizado para gestionar el estado de la plantilla de proforma
 * y sus elementos de configuración
 */
export default function useProformaTemplate() {
  // Estados para configuración de proformas y opciones
  const [proformaConfig, setProformaConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  
  // Opciones de pago y entrega
  const [formasPago, setFormasPago] = useState([
    "50% anticipo, 50% contra entrega",
    "Pago total anticipado",
    "15 días después de entrega",
    "30 días después de entrega",
    "Pago al contado contra entrega"
  ]);

  const [tiemposEntrega, setTiemposEntrega] = useState([
    "Inmediato",
    "3 días hábiles",
    "5 días hábiles",
    "7 días hábiles",
    "15 días hábiles",
    "30 días"
  ]);

  // Configuración general con valores predeterminados
  const [config, setConfig] = useState({
    showLogo: true, // Siempre debe ser true para mostrar el logo
    showDiscount: true,
    showTax: true,
    footerText: "Gracias por su preferencia. Esta proforma no constituye una factura.",
    currencySymbol: "$",
    decimalPlaces: 2,
    showItemCodes: true
  });

  // Datos de la empresa (podrían venir del backend en una implementación completa)
  const [company] = useState({
    name: "Su Empresa S.A.",
    email: "comercial@suempresa.com",
    phone: "+593 98-765-4321",
    address: "Centro Empresarial El Ducado, Torre B, Oficina 405",
    ruc: "0987654321001",
    logo: pandoraLogo, // Usar la imagen pandora.png importada directamente desde assets
    website: "www.suempresa.com"
  });

  // Estado para el modo preview
  const [previewMode, setPreviewMode] = useState(false);

  // Cargar datos de configuración de proformas
  useEffect(() => {
    loadProformaConfig();
  }, []);

  /**
   * Carga la configuración de proformas desde el backend
   */
  const loadProformaConfig = async () => {
    setLoadingConfig(true);
    try {
      // Check if the function exists before calling it
      if (typeof proformasService.obtenerConfiguracion !== 'function') {
        console.warn('proformasService.obtenerConfiguracion is not implemented yet, using default values');
        
        // Use default configuration
        const defaultConfig = {
          formas_pago: formasPago,
          tiempos_entrega: tiemposEntrega,
          configuracion_visual: {
            ...config,
            showLogo: true // Forzar showLogo a true
          }
        };
        
        setProformaConfig(defaultConfig);
        return;
      }
      
      const configData = await proformasService.obtenerConfiguracion();
      
      // Asegurarse de que showLogo siempre sea true
      if (configData.configuracion_visual) {
        configData.configuracion_visual.showLogo = true;
      }
      
      setProformaConfig(configData);
      console.log("Configuración de proformas cargada:", configData);
      
      // Si hay formas de pago en la configuración
      if (configData.formas_pago && Array.isArray(configData.formas_pago) && configData.formas_pago.length > 0) {
        setFormasPago(configData.formas_pago);
      }
      
      // Si hay tiempos de entrega en la configuración
      if (configData.tiempos_entrega && Array.isArray(configData.tiempos_entrega) && configData.tiempos_entrega.length > 0) {
        setTiemposEntrega(configData.tiempos_entrega);
      }
      
    } catch (error) {
      console.error("Error al cargar configuración de proformas:", error);
      // Don't show a toast error for a missing API method
      if (error.message !== "proformasService.obtenerConfiguracion is not a function") {
        toast.error("No se pudo cargar la configuración de proformas");
      }
    } finally {
      setLoadingConfig(false);
    }
  };

  /**
   * Actualiza una configuración específica
   */
  const updateConfig = (field, value) => {
    // Si intentan cambiar showLogo a false, ignorarlo
    if (field === 'showLogo' && value === false) {
      console.warn('No se permite cambiar showLogo a false');
      return;
    }
    
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Guarda la configuración en el backend
   */
  const saveConfig = async () => {
    try {
      setLoadingConfig(true);
      
      // Preparar datos para el backend
      const configToSave = {
        ...proformaConfig,
        formas_pago: formasPago,
        tiempos_entrega: tiemposEntrega,
        configuracion_visual: {
          ...config,
          showLogo: true // Forzar showLogo a true para garantizar que se mantenga visible
        }
      };
      
      // Check if the function exists before calling it
      if (typeof proformasService.guardarConfiguracion !== 'function') {
        console.warn('proformasService.guardarConfiguracion is not implemented yet');
        // Just save locally and show a simulated success message
        setProformaConfig(configToSave);
        toast.success("Configuración guardada en memoria (API no implementada)");
        return;
      }
      
      await proformasService.guardarConfiguracion(configToSave);
      toast.success("Configuración guardada correctamente");
      
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      // Don't show a toast error for a missing API method
      if (error.message !== "proformasService.guardarConfiguracion is not a function") {
        toast.error("Error al guardar la configuración");
      }
    } finally {
      setLoadingConfig(false);
    }
  };

  return {
    config,
    setConfig,
    updateConfig,
    company,
    previewMode,
    setPreviewMode,
    formasPago,
    setFormasPago,
    tiemposEntrega,
    setTiemposEntrega,
    loadingConfig,
    proformaConfig,
    loadProformaConfig,
    saveConfig
  };
};