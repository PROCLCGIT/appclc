import React from 'react';
import { FileText, Printer, Image, Download, Calculator, ClipboardList, FileCheck, FileQuestion, BookOpen, Code } from 'lucide-react';

const CanvaLikeHeader = () => {
  return (
    <div className="w-full">
      {/* Header con gradiente */}
      <div className="w-full rounded-xl overflow-hidden shadow-md bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-6 mb-6">
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold tracking-wide mb-2">¿Qué vas a Generar?</h1>
          <div className="h-1 w-24 bg-white/40 rounded-full mx-auto mt-2 mb-4"></div>
        </div>
      </div>
      
      {/* Iconos sobre fondo blanco */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 max-w-6xl mx-auto">
          <CategoryButton icon={<Calculator size={22} />} label="Costos" color="text-teal-500" />
          <CategoryButton icon={<ClipboardList size={22} />} label="Proformas" color="text-green-500" />
          <CategoryButton icon={<FileQuestion size={22} />} label="Brief" color="text-orange-500" />
          <CategoryButton icon={<FileCheck size={22} />} label="Acta de entrega" color="text-red-500" />
          <CategoryButton icon={<FileText size={22} />} label="Pedido de cotización" color="text-purple-500" />
          <CategoryButton icon={<Printer size={22} />} label="Impresiones" color="text-blue-500" />
          <CategoryButton icon={<BookOpen size={22} />} label="Catálogos" color="text-indigo-500" />
          <CategoryButton icon={<Download size={22} />} label="Exportar Registros" color="text-cyan-500" />
          <CategoryButton icon={<Code size={22} />} label="Lógica 1" color="text-gray-500" />
        </div>
      </div>
    </div>
  );
};

const CategoryButton = ({ icon, label, color }) => {
  return (
    <button className="group transition-all duration-300 ease-in-out">
      <div className="flex flex-col items-center">
        <div className={`w-14 h-14 ${color} bg-${color.replace('text-', '')}/10 rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transform group-hover:-translate-y-1 transition-all duration-300`}>
          <div className={`${color} group-hover:${color.replace('-500', '-600')} transition-colors duration-300`}>
            {icon}
          </div>
        </div>
        <span className="text-gray-700 text-xs font-medium max-w-24 text-center">
          {label}
        </span>
      </div>
    </button>
  );
};

export default CanvaLikeHeader;