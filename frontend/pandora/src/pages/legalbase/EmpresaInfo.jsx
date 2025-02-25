import React from "react";
import { Clipboard } from "lucide-react";

const EmpresaInfo = () => {
  // Datos de ejemplo, si necesitas cargarlos dinámicamente, podemos hacerlo con una API
  const empresa = {
    nombre: "Ejemplo S.A.C.",
    ruc: "12345678901",
    usuario: "admin",
    contraseña: "********"
  };

  const copiarAlPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto);
    alert("Copiado al portapapeles: " + texto);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

     
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Información de la Empresa</h1>
        <p className="text-lg">
          <strong>Nombre:</strong> {empresa.nombre}
        </p>
        <p className="text-lg flex justify-between items-center">
          <strong>RUC:</strong> {empresa.ruc}
          <button 
            onClick={() => copiarAlPortapapeles(empresa.ruc)} 
            className="ml-2 p-1 rounded hover:bg-gray-200">
            <Clipboard size={18} />
          </button>
        </p>
        <p className="text-lg flex justify-between items-center">
          <strong>Usuario:</strong> {empresa.usuario}
          <button 
            onClick={() => copiarAlPortapapeles(empresa.usuario)} 
            className="ml-2 p-1 rounded hover:bg-gray-200">
            <Clipboard size={18} />
          </button>
        </p>
        <p className="text-lg flex justify-between items-center">
          <strong>Contraseña:</strong> {empresa.contraseña}
          <button 
            onClick={() => copiarAlPortapapeles(empresa.contraseña)} 
            className="ml-2 p-1 rounded hover:bg-gray-200">
            <Clipboard size={18} />
          </button>
        </p>
      </div>
      




    </div>
    
  );
};

export default EmpresaInfo;