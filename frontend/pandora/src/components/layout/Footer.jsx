// src/components/layout/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#e0e2e7] p-4 text-center text-gray-600 text-sm mt-auto shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto">
        Copyright © {new Date().getFullYear()} 
        <strong> PANDORA</strong>&nbsp; 
        Fue diseñado con <span className="text-red-500">♥</span> por <strong>CLC</strong>.  
        Todos los derechos reservados.
      </div>
    </footer>
  );
}
