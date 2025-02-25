//src/pages/Varias/ConstructionPage.jsx

import { 
  Construction, 
  Hammer, 
  Clock, 
  Mail, 
  Github,
  Rocket
} from 'lucide-react';

const ConstructionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Construction className="w-20 h-20 text-purple-500 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800">
            ¡Sitio en Construcción!
          </h1>
          <p className="text-xl text-gray-600">
            Estamos trabajando en algo increíble para ti
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 py-8">
          <div className="flex items-center space-x-4 bg-purple-50 p-6 rounded-xl">
            <Rocket className="w-12 h-12 text-purple-500" />
            <div>
              <h3 className="font-bold text-gray-800">Características Increíbles</h3>
              <p className="text-gray-600">Preparando nuevas funcionalidades asombrosas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 bg-pink-50 p-6 rounded-xl">
            <Hammer className="w-12 h-12 text-pink-500" />
            <div>
              <h3 className="font-bold text-gray-800">Trabajo en Progreso</h3>
              <p className="text-gray-600">Construyendo con las últimas tecnologías</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-blue-50 p-6 rounded-xl">
            <Clock className="w-12 h-12 text-blue-500" />
            <div>
              <h3 className="font-bold text-gray-800">Lanzamiento Próximo</h3>
              <p className="text-gray-600">Muy pronto estaremos en línea</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-green-50 p-6 rounded-xl">
            <Mail className="w-12 h-12 text-green-500" />
            <div>
              <h3 className="font-bold text-gray-800">Mantente Informado</h3>
              <p className="text-gray-600">Suscríbete para recibir actualizaciones</p>
            </div>
          </div>
        </div>

        {/* Email Subscription */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="email"
            placeholder="tu@email.com"
            className="flex-1 px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button className="px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-300">
            Notifícame
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-center space-x-6 pt-8">
          <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
            <Github className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
            <Mail className="w-6 h-6" />
          </a>
        </div>

        {/* Progress Bar Animation */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 w-3/4 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ConstructionPage;