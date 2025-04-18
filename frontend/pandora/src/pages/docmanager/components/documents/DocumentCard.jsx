import React from 'react';
import { Star, MoreHorizontal, Folder, Clock, Eye, Download, Tag, ExternalLink, Printer, Share2 } from 'lucide-react';
import { renderFileIcon, formatDate, formatFileSize } from '../../utils/formatters.jsx';
import { API_BASE_URL } from '@/config/constants';

/**
 * Componente de tarjeta de documento para vista de grid
 * @param {Object} props
 * @param {Object} props.document - Datos del documento
 * @param {Function} props.onToggleFavorite - Función para marcar/desmarcar favorito
 * @param {Function} props.onDownload - Función para descargar documento
 * @param {Function} props.onView - Función para visualizar documento
 * @param {Function} props.onManageTags - Función para administrar etiquetas
 */
const DocumentCard = ({ document, onToggleFavorite, onDownload, onView, onManageTags }) => {
  // Verificar que el documento existe y tiene los campos mínimos necesarios
  if (!document || !document.id || !document.title) {
    console.error("Documento inválido:", document);
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500">Documento inválido o incompleto</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 transform hover:scale-105">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-indigo-100 p-3 rounded-lg">
            {renderFileIcon(document.file_type)}
          </div>
          <div className="flex space-x-1">
            <button 
              className="text-gray-400 hover:text-yellow-500 transition"
              onClick={() => onToggleFavorite(document.id, document.is_favorite)}
            >
              <Star 
                size={18} 
                className={document.is_favorite ? "fill-current text-yellow-500" : ""}
              />
            </button>
            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {document.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {document.description || 'Sin descripción'}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {document.tags && document.tags.map((tag) => (
            <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {tag.name}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center">
            <Folder size={14} className="mr-1" />
            {document.category ? 
              (typeof document.category === 'object' ? document.category.name : document.category_name) : 
              'Sin categoría'}
          </span>
          <span className="flex items-center">
            <Clock size={14} className="mr-1" />
            {formatDate(document.updated_at || document.created_at)}
          </span>
        </div>
      </div>
      
      <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
              {document.file_type}
            </span>
            <span className="text-xs text-gray-500">
              {formatFileSize(document.file_size)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-1 text-gray-400 hover:text-indigo-600 transition"
              title="Ver documento"
              onClick={() => onView(document)}
            >
              <Eye size={18} />
            </button>
            <button 
              className="p-1 text-gray-400 hover:text-indigo-600 transition"
              title="Descargar documento"
              onClick={() => onDownload(document)}
            >
              <Download size={18} />
            </button>
            <button 
              className="p-1 text-gray-400 hover:text-purple-600 transition"
              title="Imprimir documento"
              onClick={() => {
                // Utilizar el endpoint público primero para obtener la URL
                const publicUrl = `${API_BASE_URL}/docmanager/documents/${document.id}/public-download/`;
                
                fetch(publicUrl)
                  .then(response => response.json())
                  .then(data => {
                    if (data.file_url) {
                      // Abrir el documento y mostrar diálogo de impresión
                      const printWindow = window.open(data.file_url, '_blank');
                      if (printWindow) {
                        printWindow.addEventListener('load', () => {
                          printWindow.print();
                        });
                      } else {
                        alert('Por favor, permita las ventanas emergentes para imprimir este documento');
                      }
                    } else {
                      alert("Error: No se pudo obtener la URL del documento para imprimir");
                    }
                  })
                  .catch(error => {
                    console.error("Error al preparar documento para impresión:", error);
                    alert("Error al preparar la impresión: " + error.message);
                  });
              }}
            >
              <Printer size={18} />
            </button>
            <button 
              className="p-1 text-gray-400 hover:text-blue-600 transition"
              title="Compartir documento"
              onClick={() => {
                // Primero obtener la URL pública para compartir
                const publicUrl = `${API_BASE_URL}/docmanager/documents/${document.id}/public-download/`;
                
                fetch(publicUrl)
                  .then(response => response.json())
                  .then(data => {
                    if (data.file_url) {
                      // Verificar si la API Web Share está disponible
                      if (navigator.share) {
                        navigator.share({
                          title: document.title,
                          text: document.description || 'Compartir documento',
                          url: data.file_url,
                        })
                        .catch(error => console.log('Error compartiendo documento:', error));
                      } else {
                        // Fallback: Copiar al portapapeles
                        const tempInput = document.createElement('input');
                        document.body.appendChild(tempInput);
                        tempInput.value = data.file_url;
                        tempInput.select();
                        document.execCommand('copy');
                        document.body.removeChild(tempInput);
                        alert('Enlace copiado al portapapeles');
                      }
                    } else {
                      alert("Error: No se pudo obtener la URL del documento para compartir");
                    }
                  })
                  .catch(error => {
                    console.error("Error al preparar documento para compartir:", error);
                    alert("Error al preparar para compartir: " + error.message);
                  });
              }}
            >
              <Share2 size={18} />
            </button>
            <button 
              className="p-1 text-gray-400 hover:text-red-600 transition"
              title="Abrir públicamente"
              onClick={() => {
                // Utilizar el endpoint público
                const publicUrl = `${API_BASE_URL}/docmanager/documents/${document.id}/public-download/`;
                console.log("Abriendo URL pública:", publicUrl);
                
                // Solicitar la URL pública
                fetch(publicUrl)
                  .then(response => response.json())
                  .then(data => {
                    if (data.file_url) {
                      window.open(data.file_url, '_blank');
                    } else {
                      console.error("No se encontró URL pública:", data);
                      alert("Error: No se pudo obtener la URL pública del documento");
                    }
                  })
                  .catch(error => {
                    console.error("Error al obtener URL pública:", error);
                    alert("Error al obtener URL pública: " + error.message);
                  });
              }}
            >
              <ExternalLink size={18} />
            </button>
            <button 
              className="p-1 text-gray-400 hover:text-yellow-600 transition"
              title="Administrar etiquetas"
              onClick={() => onManageTags && onManageTags(document)}
            >
              <Tag size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;