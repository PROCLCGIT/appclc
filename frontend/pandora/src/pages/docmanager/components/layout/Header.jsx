import React from 'react';
import { FilePlus } from 'lucide-react';

/**
 * Componente de cabecera del gestor documental
 * @param {Object} props
 * @param {Function} props.onUploadClick - Función para manejar click en botón de subir
 */
const Header = ({ onUploadClick }) => {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md">
      <div className="container mx-auto px-6 py-5 flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-white">Gestor Documental</h1>
        <button 
          className="flex items-center bg-white text-indigo-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          onClick={onUploadClick}
        >
          <FilePlus size={18} className="mr-2" />
          Subir Documento
        </button>
      </div>
    </header>
  );
};

export default Header;