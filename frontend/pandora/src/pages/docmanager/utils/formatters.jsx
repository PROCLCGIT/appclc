import { FileText, FileImage, FileSpreadsheet, FileCheck } from 'lucide-react';
import React from 'react';

/**
 * Formatea una fecha ISO a formato legible
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha';
  
  try {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Fecha inválida';
  }
};

/**
 * Renderiza el icono adecuado según el tipo de archivo
 * @param {string} fileType - Tipo de archivo (pdf, docx, etc.)
 * @param {number} size - Tamaño del icono
 * @returns {JSX.Element} Elemento de icono
 */
export const renderFileIcon = (fileType, size = 24) => {
  if (!fileType) return <FileText size={size} />;
  
  const type = fileType.toLowerCase();
  
  // Documentos y PDFs
  if (type === 'pdf' || type === 'doc' || type === 'docx' || type === 'txt') {
    return <FileText size={size} className="text-blue-500" />;
  }
  
  // Imágenes
  if (type === 'jpg' || type === 'jpeg' || type === 'png' || type === 'gif' || type === 'webp') {
    return <FileImage size={size} className="text-green-500" />;
  }
  
  // Hojas de cálculo
  if (type === 'xls' || type === 'xlsx' || type === 'csv') {
    return <FileSpreadsheet size={size} className="text-indigo-500" />;
  }
  
  // Default para cualquier otro tipo
  return <FileText size={size} className="text-gray-500" />;
};

/**
 * Formatea el tamaño de archivo en KB, MB según corresponda
 * @param {number} sizeInBytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (sizeInBytes) => {
  if (!sizeInBytes && sizeInBytes !== 0) return 'Desconocido';
  
  // Convertir a KB
  const sizeInKB = sizeInBytes / 1024;
  
  // Si es menor a 1000 KB, mostrar en KB
  if (sizeInKB < 1000) {
    return sizeInKB.toFixed(1) + ' KB';
  }
  
  // Si es mayor a 1000 KB, mostrar en MB
  return (sizeInKB / 1024).toFixed(2) + ' MB';
};