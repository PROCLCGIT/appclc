// src/pages/proformas/hooks/useDialogControl.js

import { useState } from 'react';

/**
 * Hook personalizado para controlar diálogos y modales en la aplicación
 */
export const useDialogControl = () => {
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
   * Muestra el diálogo de búsqueda de clientes
   */
  const openClientSearch = () => {
    setShowClientSearch(true);
  };

  /**
   * Cierra el diálogo de búsqueda de clientes
   */
  const closeClientSearch = () => {
    setShowClientSearch(false);
  };

  /**
   * Muestra el diálogo de proformas guardadas
   */
  const openProformasDialog = () => {
    setShowProformasDialog(true);
  };

  /**
   * Cierra el diálogo de proformas guardadas
   */
  const closeProformasDialog = () => {
    setShowProformasDialog(false);
  };

  /**
   * Configura y muestra el diálogo de guardado con un tipo, título y mensaje
   */
  const showSaveConfirmation = (type, title, message, details = "", proformaId = null) => {
    setSaveDialogType(type);
    setSaveDialogTitle(title);
    setSaveDialogMessage(message);
    setSaveDialogDetails(details);
    if (proformaId) {
      setSavedProformaId(proformaId);
    }
    setShowSaveDialog(true);
  };

  /**
   * Cierra el diálogo de guardado
   */
  const closeSaveDialog = () => {
    setShowSaveDialog(false);
  };

  /**
   * Muestra un mensaje de error en el diálogo de guardado
   */
  const showErrorDialog = (title, message, details = "") => {
    showSaveConfirmation("error", title, message, details);
  };

  /**
   * Muestra un mensaje de advertencia en el diálogo de guardado
   */
  const showWarningDialog = (title, message, details = "") => {
    showSaveConfirmation("warning", title, message, details);
  };

  /**
   * Muestra un mensaje de éxito en el diálogo de guardado
   */
  const showSuccessDialog = (title, message, details = "", proformaId = null) => {
    showSaveConfirmation("success", title, message, details, proformaId);
  };

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
