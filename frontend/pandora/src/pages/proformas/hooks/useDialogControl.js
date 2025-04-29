// src/pages/proformas/hooks/useDialogControl.js

import { useState, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';

/**
 * Hook personalizado para controlar diálogos y modales en la aplicación
 * @param {Object} options - Opciones de configuración y funciones externas
 * @param {Function} options.loadSavedProformas - Función para cargar proformas guardadas
 */
export const useDialogControl = (options = {}) => {
  // Extraer la función de carga de proformas, si existe
  const { loadSavedProformas } = options;
  // Diálogo para búsqueda de clientes
  const [showClientSearch, setShowClientSearch] = useState(false);
  
  // Diálogo para proformas guardadas
  const [showProformasDialog, setShowProformasDialog] = useState(false);
  
  // Diálogo de confirmación para guardar proforma
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveDialogType, setSaveDialogType] = useState("success"); // success, error, warning
  const [saveDialogTitle, setSaveDialogTitle] = useState("");
  const [saveDialogMessage, setSaveDialogMessage] = useState("");
  const [saveDialogDetails, setSaveDialogDetails] = useState("");
  const [savedProformaId, setSavedProformaId] = useState(null);

  /**
   * Muestra el diálogo de búsqueda de clientes (con debounce para evitar múltiples aperturas)
   */
  const openClientSearch = useMemo(
    () =>
      debounce(() => {
        console.log('Abriendo diálogo de búsqueda de clientes (debounced)');
        // Asegurarnos de que se actualiza la UI
        setTimeout(() => {
          setShowClientSearch(true);
          // Verificar que realmente se estableció el estado
          console.log('Estado del diálogo de clientes:', { value: true, visible: 'should be visible now' });
        }, 0);
      }, 150), // Reducido a 150ms para mayor responsividad
    []
  );

  /**
   * Cierra el diálogo de búsqueda de clientes
   */
  const closeClientSearch = () => {
    setShowClientSearch(false);
  };

  /**
   * Muestra el diálogo de proformas guardadas (con debounce para evitar múltiples aperturas)
   * Opcionalmente carga proformas si se proporciona una función loadSavedProformas
   */
  const openProformasDialog = useMemo(
    () =>
      debounce(() => {
        console.log('Abriendo diálogo de proformas guardadas (debounced)');
        
        setShowProformasDialog(true);
        
        // Si tenemos una función para cargar proformas, la ejecutamos
        if (typeof loadSavedProformas === 'function') {
          console.log('useDialogControl: Ejecutando loadSavedProformas desde openProformasDialog');
          
          // Pequeño retraso para que primero se abra el diálogo
          setTimeout(() => {
            loadSavedProformas({
              showToasts: true,
              forceRefresh: true,
              itemsLimit: 10
            }).catch(err => {
              console.error('Error al cargar proformas:', err);
            });
          }, 100);
        }
      }, 300),
    [loadSavedProformas]
  );

  /**
   * Cierra el diálogo de proformas guardadas
   */
  const closeProformasDialog = () => {
    setShowProformasDialog(false);
  };

  /**
   * Configura y muestra el diálogo de guardado con un tipo, título y mensaje (con debounce)
   */
  const showSaveConfirmation = useMemo(
    () =>
      debounce((type, title, message, details = "", proformaId = null) => {
        console.log(`Mostrando diálogo de tipo ${type} (debounced)`);
        setSaveDialogType(type);
        setSaveDialogTitle(title);
        setSaveDialogMessage(message);
        setSaveDialogDetails(details);
        if (proformaId) {
          setSavedProformaId(proformaId);
        }
        setShowSaveDialog(true);
      }, 300),
    []
  );

  /**
   * Cierra el diálogo de guardado
   */
  const closeSaveDialog = () => {
    setShowSaveDialog(false);
  };

  /**
   * Muestra un mensaje de error en el diálogo de guardado
   */
  const showErrorDialog = useMemo(
    () =>
      debounce((title, message, details = "") => {
        showSaveConfirmation("error", title, message, details);
      }, 300),
    [showSaveConfirmation]
  );

  /**
   * Muestra un mensaje de advertencia en el diálogo de guardado
   */
  const showWarningDialog = useMemo(
    () =>
      debounce((title, message, details = "") => {
        showSaveConfirmation("warning", title, message, details);
      }, 300),
    [showSaveConfirmation]
  );

  /**
   * Muestra un mensaje de éxito en el diálogo de guardado
   */
  const showSuccessDialog = useMemo(
    () =>
      debounce((title, message, details = "", proformaId = null) => {
        showSaveConfirmation("success", title, message, details, proformaId);
      }, 300),
    [showSaveConfirmation]
  );

  // Limpiar las funciones debounced al desmontar para evitar fugas de memoria
  useEffect(() => {
    return () => {
      openClientSearch.cancel();
      openProformasDialog.cancel();
      showSaveConfirmation.cancel();
      showErrorDialog.cancel();
      showWarningDialog.cancel();
      showSuccessDialog.cancel();
    };
  }, [
    openClientSearch,
    openProformasDialog,
    showSaveConfirmation,
    showErrorDialog,
    showWarningDialog,
    showSuccessDialog
  ]);

  return {
    // Estados
    showClientSearch,
    showProformasDialog,
    showSaveDialog,
    saveDialogType,
    saveDialogTitle,
    saveDialogMessage,
    saveDialogDetails,
    savedProformaId,
    
    // Acciones para diálogo de clientes
    openClientSearch,
    closeClientSearch,
    
    // Acciones para diálogo de proformas
    openProformasDialog,
    closeProformasDialog,
    
    // Acciones para diálogo de guardado/confirmación
    showErrorDialog,
    showWarningDialog,
    showSuccessDialog,
    closeSaveDialog
  };
};

export default useDialogControl;
