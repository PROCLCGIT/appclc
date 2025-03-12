import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { navigation } from './Navigation';
import SideNav from './SideNav';
import Header from './Header';
import Footer from './Footer';
import useAuthStore from '../../store/authStore';

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    // Usar la función de logout del store de Zustand
    logout();
    
    // Redirigir a login
    console.log('Logout completo, redirigiendo a login');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#F2F3F7]">
      {/* Sidebar */}
      <SideNav isSidebarOpen={isSidebarOpen} navigation={navigation} />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        } transition-all duration-300 flex flex-col min-h-screen`}
      >
        {/* Top Navigation */}
        <Header toggleSidebar={toggleSidebar} handleLogout={handleLogout} />

        {/* Contenido principal */}
        <main className="p-6 flex-grow">
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.03)] p-6">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default MainLayout;
