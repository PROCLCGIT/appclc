// src/components/layout/MainLayout.jsx
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useNavigation } from 'react-router-dom';
import {
  Home,
  Users,
  Settings,
  Menu,
  Database,
  Bell,
  Search,
  User,
  LogOut,
  Activity,
  SearchCode,
  Workflow
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { 
    name: 'Dashboard', 
    path: '/', 
    icon: Home 
  },
  { 
    name: 'Testing',
    icon: SearchCode,
    children: [
      { name: 'SIE PRO', path: 'error' },
      { name: 'Proformas', path: 'proformaform' },
      { name: 'Portafolio de Porductos', path: 'productportfolio' },
      { name: 'Catalogos', path: 'error' },
      { name: 'Productos', path: 'products' },
      { name: 'Proveedores', path: 'proveedores' },
      { name: 'Clientes', path: 'clientes' },
      { name: 'Vendedores', path: 'vendedores' },
      { name: 'Precios Manager', path: 'priceManagement' },
      { name: 'Precios Manager 2', path: 'priceManagement2' },
      { name: 'Precios Charts', path: 'priceCharts' },
      { name: 'Productos wizard', path: 'productwizard' },
      { name: 'Proforma Form', path: 'proformaform' },
      { name: 'Info Empresas 2', path: 'empresainfo2' },
      { name: 'Info Empresas 3', path: 'empresainfo3' },
      { name: 'Productos Ofertados', path: 'productosofertados' },
      { name: 'Productos Disponibles', path: 'productosdisponibles' }
    ]
  },
  { 
    name: 'Proformas',
    icon: SearchCode,
    children: [
      { name: 'BulkUploadProducts', path: 'bulkuploadproducts' },
      { name: 'ComparativeAnalysis', path: 'comparativeanalysis' },
      { name: 'New Proforma', path: 'newproformaform' },
      { name: 'Price Alerts', path: 'pricealerts' },
      { name: 'Price Analysis Tools', path: 'priceanalysistools' },
      { name: 'Price History', path: 'pricehistory' },
      { name: 'Price Projections', path: 'priceprojections' },
      { name: 'Proforma Dashboard', path: 'proformadashboard' },
      { name: 'Proforma Form', path: 'proformaform' },
      { name: 'Proforma Generator', path: 'proformagenerator' },
      { name: 'Proforma List', path: 'proformalist' },
      { name: 'Proforma PDF', path: 'proformapdf' },
      { name: 'Proforma Preview', path: 'proformapreview' },
      { name: 'Proforma Settings', path: 'proformasettings' },
      { name: 'Proforma Template', path: 'proformatemplates' },
      { name: 'Error', path: 'error' }
    ]
  },
  { 
    name: 'Gestion',
    icon: Workflow,
    children: [
      { name: 'SIE PRO', path: 'error' },
      { name: 'Proformas', path: 'error' },
      { name: 'Catalogos', path: 'error' },
      { name: 'Catalogos', path: 'error' }
    ]
  },
  { 
    name: 'Analisis de Precios',
    icon: Activity,
    children: [
      { name: 'Precios SIE', path: '/preciossie' },
      { name: 'Costos Pandora', path: '/costospandora' },
      { name: 'Procesos Auditados', path: '/procesosauditados' },
      { name: 'MSP Referencia', path: '/mspref' }
    ]
  },
  { 
    name: 'Contactos',
    icon: Users,
    children: [
      { name: 'Clientes', path: '/clientes' },
      { name: 'Proveedores', path: '/proveedores' },
      { name: 'Vendedores', path: '/vendedores' }
    ]
  },
  {
    name: 'Config',
    icon: Database,
    children: [
      { name: 'DB Relacionales',
        children: [
          { name: 'Empresa CLC', path: '/empresasclc' },
          { name: 'Zonas', path: '/zonas' },
          { name: 'Ciudades', path: '/ciudades' },
          { name: 'Tipo de Cliente', path: '/tipocliente' },
          { name: 'Categorías', path: '/categorias' },
          { name: 'Especialidades', path: '/especialidades' },
          { name: 'Marcas', path: '/marcas' },
          { name: 'Procedencia', path: '/procedencia' },
          { name: 'Unidades', path: '/unidades' },
          { name: 'Pandora', path: '/pandora' },
          { name: 'Tipo de Contratacion', path: '/tipocontratacion' }
        ]
      },
      { name: 'Importar / Exportar',
        children: [
          { name: 'Importar Ref MSP', path: '/msprefimport' }
        ]
      }
    ]
  },
  { 
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'Empresa CLC', path: '/empresa-clc' },
      { name: 'Zonas', path: '/zonas' }
    ]
  }
];

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const navigationState = useNavigation();

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    navigate('/login');
  };

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const isChildActive = (children) => {
    return children?.some(child => child.path === location.pathname);
  };

  const renderNavItem = (item, level = 0, keyPrefix = '') => {
    if (item.children) {
      const isActive = isChildActive(item.children);
      const isOpen = openMenus[item.name];
      return (
        <div key={keyPrefix}>
          <button
            onClick={() => toggleMenu(item.name)}
            className={`
              w-full flex items-center justify-between px-3 py-2 rounded-lg
              transition-colors duration-200
              ${isActive ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}
              ml-${level * 4}
            `}
          >
            <div className="flex items-center space-x-2">
              {item.icon && <item.icon className="h-5 w-5" />}
              {isSidebarOpen && <span>{item.name}</span>}
            </div>
            {isSidebarOpen && (
              <svg
                className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          {isOpen && isSidebarOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child, idx) =>
                renderNavItem(child, level + 1, `${child.name}-${idx}`)
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={keyPrefix}
        to={item.path}
        className={({ isActive }) => `
          flex items-center space-x-2 px-3 py-2 rounded-lg
          transition-colors duration-200
          ${isActive ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}
          ml-${level * 4}
        `}
      >
        {item.icon && <item.icon className="h-5 w-5" />}
        {isSidebarOpen && <span>{item.name}</span>}
      </NavLink>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen overflow-y-auto
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          transition-all duration-300
          bg-white border-r
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            {isSidebarOpen && <span className="text-xl font-semibold">Pandora</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item, index) => renderNavItem(item, 0, `${item.name}-${index}`))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Navigation */}
        <header className="h-16 bg-white border-b px-6">
          <div className="h-full flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-80 pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>Admin User</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
