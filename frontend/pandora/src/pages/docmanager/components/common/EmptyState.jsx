import React, { useState } from 'react';
import { FileText, Upload, HelpCircle, RefreshCw, Database, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/config/constants';

/**
 * Componente para mostrar cuando no hay documentos
 * @param {Object} props
 * @param {Function} props.onUploadClick - Función para manejar click en botón de subir
 */
const EmptyState = ({ onUploadClick, refreshData }) => {
  const [isLoading, setIsLoading] = useState(false);
  // Función para diagnóstico rápido
  const runDiagnostic = async () => {
    try {
      // Mostrar mensaje al usuario
      alert("Ejecutando diagnóstico. Por favor espere...");
      
      // Probar la conexión a la API
      const publicResponse = await fetch(`${API_BASE_URL}/docmanager/documents/`);
      const publicData = await publicResponse.json();
      
      // Verificar el token de autenticación
      const token = localStorage.getItem('auth-token');
      
      // Mostrar resultados
      alert(`
Diagnóstico completado:
- Estado conexión API: ${publicResponse.ok ? 'OK' : 'Error'}
- Número de documentos en API: ${publicData.count || 0}
- Token disponible: ${token ? 'Sí' : 'No'}
- URL API: ${API_BASE_URL}
      `);
      
      // Si hay documentos pero no se muestran, sugerir refrescar
      if (publicData.count > 0) {
        if (confirm("Se encontraron documentos en la API. ¿Desea refrescar la página?")) {
          window.location.reload();
        }
      }
    } catch (error) {
      alert(`Error en diagnóstico: ${error.message}`);
    }
  };
  
  return (
    <div className="text-center py-16 bg-white rounded-lg shadow-md">
      <FileText size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay documentos</h3>
      <p className="text-gray-500 mb-4">No se encontraron documentos que coincidan con tu búsqueda.</p>
      <div className="flex gap-3 justify-center flex-wrap">
        <button 
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
          onClick={onUploadClick}
        >
          <Upload className="mr-2" size={18} />
          Subir un documento
        </button>
        <button
          onClick={runDiagnostic}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
        >
          <HelpCircle size={18} className="mr-2" />
          Diagnóstico
        </button>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition"
        >
          <RefreshCw size={18} className="mr-2" />
          Refrescar
        </button>
        <button
          disabled={isLoading || !refreshData}
          onClick={async () => {
            if (!refreshData) {
              alert("Función de recarga no disponible");
              return;
            }
            setIsLoading(true);
            try {
              await refreshData();
              setIsLoading(false);
            } catch (error) {
              console.error("Error recargando datos:", error);
              setIsLoading(false);
              alert("Error al cargar datos: " + error.message);
            }
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Database size={18} className="mr-2" />
          {isLoading ? "Cargando..." : "Cargar datos manualmente"}
        </button>
      </div>
    </div>
  );
};

export default EmptyState;