import React, { useState } from "react";
import { Clipboard, PlusCircle } from "lucide-react";

const EmpresaInfo2 = () => {
  const [empresas, setEmpresas] = useState([
    { nombre: "Ejemplo S.A.C.", ruc: "12345678901", usuario: "admin", contraseña: "********" },
    { nombre: "Empresa 2", ruc: "98765432109", usuario: "user2", contraseña: "********" },
    { nombre: "Empresa 3", ruc: "45612378902", usuario: "user3", contraseña: "********" },
    { nombre: "Empresa 4", ruc: "32198765408", usuario: "user4", contraseña: "********" },
    { nombre: "Ejemplo S.A.C.", ruc: "12345678901", usuario: "admin", contraseña: "********" },
    { nombre: "Empresa 2", ruc: "98765432109", usuario: "user2", contraseña: "********" },
    { nombre: "Empresa 3", ruc: "45612378902", usuario: "user3", contraseña: "********" },
    { nombre: "Empresa 2", ruc: "98765432109", usuario: "user2", contraseña: "********" },
    { nombre: "Empresa 3", ruc: "45612378902", usuario: "user3", contraseña: "********" },
    { nombre: "Empresa 4", ruc: "32198765408", usuario: "user4", contraseña: "********" }
  ]);

  const copiarAlPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto);
    alert("Copiado al portapapeles: " + texto);
  };

  const agregarEmpresa = () => {
    setEmpresas([...empresas, { nombre: "Nueva Empresa", ruc: "", usuario: "", contraseña: "" }]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Información de Empresas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {empresas.map((empresa, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center">
            <p className="text-lg"><strong>Nombre:</strong> {empresa.nombre}</p>
            <p className="text-lg flex justify-between items-center">
              <strong>RUC:</strong> {empresa.ruc}
              <button onClick={() => copiarAlPortapapeles(empresa.ruc)} className="ml-2 p-1 rounded hover:bg-gray-200">
                <Clipboard size={18} />
              </button>
            </p>
            <p className="text-lg flex justify-between items-center">
              <strong>Usuario:</strong> {empresa.usuario}
              <button onClick={() => copiarAlPortapapapeles(empresa.usuario)} className="ml-2 p-1 rounded hover:bg-gray-200">
                <Clipboard size={18} />
              </button>
            </p>
            <p className="text-lg flex justify-between items-center">
              <strong>Contraseña:</strong> {empresa.contraseña}
              <button onClick={() => copiarAlPortapapeles(empresa.contraseña)} className="ml-2 p-1 rounded hover:bg-gray-200">
                <Clipboard size={18} />
              </button>
            </p>
          </div>
        ))}
      </div>
      <button onClick={agregarEmpresa} className="mt-4 flex items-center bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600">
        <PlusCircle className="mr-2" size={20} /> Agregar Empresa
      </button>
    </div>
  );
};

export default EmpresaInfo2;
