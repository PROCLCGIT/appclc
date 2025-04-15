import React from 'react';
import { Upload, X, FileText } from 'lucide-react';

/**
 * Componente modal para subir documentos
 * @param {Object} props
 * @param {boolean} props.show - Mostrar/ocultar modal
 * @param {Object} props.selectedFile - Archivo seleccionado
 * @param {Function} props.setSelectedFile - Función para establecer archivo seleccionado
 * @param {Function} props.onClose - Función para cerrar modal
 * @param {Function} props.onUpload - Función para subir archivo
 */
const UploadModal = ({ show, selectedFile, setSelectedFile, onClose, onUpload }) => {
  if (!show) return null;

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-black opacity-50 transition" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full z-10 transform transition-all p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Subir un nuevo documento</h3>
        {!selectedFile ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 cursor-pointer transition-colors"
            onClick={() => document.getElementById('file-upload').click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="mx-auto text-gray-400 mb-4" size={36} />
            <p className="text-gray-500">Haz clic para seleccionar un archivo o arrastra y suelta aquí</p>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              onChange={handleFileSelect} 
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg mr-3">
                <FileText className="text-indigo-600" size={24} />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{selectedFile.name}</h4>
                <p className="text-gray-500 text-sm">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button 
              className="text-gray-400 hover:text-red-500 transition"
              onClick={() => setSelectedFile(null)}
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button 
            type="button" 
            className={`inline-flex justify-center rounded-md px-4 py-2 font-medium transition ${
              selectedFile ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={onUpload}
            disabled={!selectedFile}
          >
            Subir documento
          </button>
          <button 
            type="button" 
            className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 transition"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;