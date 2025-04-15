// src/pages/proformas/hooks/useProformaTemplate.js

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { proformasService } from '@/services/api';

/**
 * Hook personalizado para gestionar el estado de la plantilla de proforma
 * y sus elementos de configuración
 */
export const useProformaTemplate = () => {
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
    showLogo: true,
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
    logo: "/company-logo.png",
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
      const config = await proformasService.obtenerConfiguracion();
      setProformaConfig(config);
      console.log("Configuración de proformas cargada:", config);
      
      // Si hay formas de pago en la configuración
      if (config.formas_pago && Array.isArray(config.formas_pago) && config.formas_pago.length > 0) {
        setFormasPago(config.formas_pago);
      }
      
      // Si hay tiempos de entrega en la configuración
      if (config.tiempos_entrega && Array.isArray(config.tiempos_entrega) && config.tiempos_entrega.length > 0) {
        setTiemposEntrega(config.tiempos_entrega);
      }
      
    } catch (error) {
      console.error("Error al cargar configuración de proformas:", error);
      toast.error("No se pudo cargar la configuración de proformas");
    } finally {
      setLoadingConfig(false);
    }
  };

  /**
   * Actualiza una configuración específica
   */
  const updateConfig = (field, value) => {
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
        configuracion_visual: config
      };
      
      await proformasService.guardarConfiguracion(configToSave);
      toast.success("Configuración guardada correctamente");
      
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      toast.error("Error al guardar la configuración");
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

export default useProformaTemplate;