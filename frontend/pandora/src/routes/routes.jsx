import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { AuthProvider } from '@/contexts/AuthProvider';

// LayOuts
import AuthLayout from '@/components/layout/AuthLayout';
import MainLayout from '@/components/layout/MainLayout';
import Login from '@/components/auth/Login';
import ErrorPage from '@/components/error/ErrorPage';

const DashboardPage = lazy(() => import('@/pages/Dashboard'));

// User
const ProfilePage = lazy(() => import('@/pages/user/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/user/SettingsPage'));

// Pandora - Modulo Bases Relacionales
const ZonasPage = lazy(() => import('@/pages/mbasic/ZonasPage'));
const CiudadesPage = lazy(() => import('@/pages/mbasic/CiudadesPage'));
const TipoClientePage = lazy(() => import('@/pages/mbasic/TipoClientePage'));
const CategoriasPage = lazy(() => import('@/pages/mbasic/CategoriasPage'));
const EspecialidadesPage = lazy(() => import('@/pages/mbasic/EspecialidadesPage'));
const MarcaPage = lazy(() => import('@/pages/mbasic/MarcaPage'));
const ProcedenciaPage = lazy(() => import('@/pages/mbasic/ProcedenciaPage'));
const UnidadesPage = lazy(() => import('@/pages/mbasic/UnidadesPage'));
const PandoraPage = lazy(() => import('@/pages/mbasic/PandoraPage'));
const TipoContratacionPage = lazy(() => import('@/pages/mbasic/TipoContratacionPage'));
const EmpresasClcPage = lazy(() => import('@/pages/mbasic/EmpresasclcPage'));
const ProcesosAuditadosPage = lazy(() => import('@/pages/mbasic/ProcesosAuditadosPage'));

// Pandora - Modulo Bases Generales
const ProveedoresPage = lazy(() => import('@/pages/madvance/ProveedoresPage'));
const AddProveedorPage = lazy(() => import('@/pages/madvance/AddProveedorPage'));
const ClientesPage = lazy(() => import('@/pages/madvance/ClientesPage'));
const AddClientePage = lazy(() => import('@/pages/madvance/AddClientePage'));
const VendedoresPage = lazy(() => import('@/pages/madvance/VendedoresPage'));
const AddVendedorPage = lazy(() => import('@/pages/madvance/AddVendedorPage'));
const ContactosPage = lazy(() => import('@/pages/madvance/Contactos'));
const AddContactoPage = lazy(() => import('@/pages/madvance/AddContactoPage'));
const RelacionesBlue = lazy(() => import('@/pages/madvance/RelacionesBlue'));
const PreciosSiePage = lazy(() => import('@/pages/madvance/PresiosSie/PreciosSiePage'));
const MsprefPage = lazy(() => import('@/pages/madvance/MsprefPage'));

// Productos
const ProductosDisponiblesPage = lazy(() => import('@/pages/products/ProductsDisp/ProductosDisponiblesPage'));
const ProductosOfertadosPage = lazy(() => import('@/pages/products/ProductsOfet/ProductosOfertadosPage'));
const VentasHistoricaProducto = lazy(() => import('@/pages/products/Historicos/VentasHistoricaProducto'));
const ComprasHistoricaProducto = lazy(() => import('@/pages/products/Historicos/ComprasHistoricaProducto'));

// Proformas
const OptimizedProformaView = lazy(() => import('@/pages/proformas/OptimizedProformaView'));
const DashboardProformas = lazy(() => import('@/pages/proformas/DashboardProformas'));
const ProformasGuardadas = lazy(() => import('@/pages/proformas/ProformasGuardadas'));

// Brief
const BriefsPage = lazy(() => import('@/pages/brief/BriefsPage'));
const AddBriefPage = lazy(() => import('@/pages/brief/AddBriefPage'));
const BriefDetailsPage = lazy(() => import('@/pages/brief/BriefDetailsPage'));
const EditBriefPage = lazy(() => import('@/pages/brief/EditBriefPage'));

// Invenrario
const InventarioPage = lazy(() => import('@/pages/inventario/InventorioPage'));
const Brief = lazy(() => import('@/pages/inventario/brief'));
const WizardForm = lazy(() => import('@/pages/inventario/wizardform'));

// Docmanager 
const GestorDocumentalPage = lazy(() => import('@/pages/docmanager/GestorDocumentalPage'));

// Páginas básicas que no necesitan carga diferida
import ConstructionPage from '@/pages/Varias/ConstructionPage';

// Legal Base
const EmpresaInfo = lazy(() => import('@/pages/legalbase/EmpresaInfo'));
const EmpresaInfo2 = lazy(() => import('@/pages/legalbase/EmpresaInfo2'));
const EmpresaInfo3 = lazy(() => import('@/pages/legalbase/EmpresaInfo3'));

// Módulo de importaciones
const MsprefImportPage = lazy(() => import('@/pages/import/MsprefImportPage'));
const ProductosOfertadosImportPage = lazy(() => import('@/pages/import/ProductosOfertadosImportPage'));

// Testing
const Testing1 = lazy(() => import('@/pages/test/Modelos/Testing1'));
const Testing2 = lazy(() => import('@/pages/test/Modelos/Testing2'));
const Testing3 = lazy(() => import('@/pages/test/Modelos/Testing3'));
const APITest = lazy(() => import('@/pages/test/Modelos/APITest'));
const AuthTest = lazy(() => import('@/pages/test/Modelos/AuthTest'));
const Testing4 = lazy(() => import('@/pages/test/Modelos/Testing4'));
const Testing5 = lazy(() => import('@/pages/test/Modelos/Testing5'));
const Testing6 = lazy(() => import('@/pages/test/Modelos/Testing6'));
const Testing7 = lazy(() => import('@/pages/test/Modelos/Testing7'));
const Testing8 = lazy(() => import('@/pages/test/Modelos/Testing8'));
const Testing9 = lazy(() => import('@/pages/test/Modelos/Testing9'));
const Testing10 = lazy(() => import('@/pages/test/Modelos/Testing10'));
const Testing11 = lazy(() => import('@/pages/test/Modelos/Testing11'));
const Testing12 = lazy(() => import('@/pages/test/Modelos/Testing12'));
const Testing13 = lazy(() => import('@/pages/test/Modelos/Testing13'));
const Testing14 = lazy(() => import('@/pages/test/Modelos/Testing14'));
const Testing15 = lazy(() => import('@/pages/test/Modelos/Testing15'));
const Testing16 = lazy(() => import('@/pages/test/Modelos/Testing16'));
const Testing17 = lazy(() => import('@/pages/test/Modelos/Testing17'));
const Testing18 = lazy(() => import('@/pages/test/Modelos/Testing18'));
const Testing19 = lazy(() => import('@/pages/test/Modelos/Testing19'));
const Testing20 = lazy(() => import('@/pages/test/Modelos/Testing20'));
const Testing21 = lazy(() => import('@/pages/test/Modelos/Testing21'));
const Testing22 = lazy(() => import('@/pages/test/Modelos/Testing22'));
const Testing23 = lazy(() => import('@/pages/test/Modelos/Testing23'));
const Testing24 = lazy(() => import('@/pages/test/Modelos/Testing24'));
const Testing25 = lazy(() => import('@/pages/test/Modelos/Testing25'));
const Testing26 = lazy(() => import('@/pages/test/Modelos/Testing26'));
const Testing27 = lazy(() => import('@/pages/test/Modelos/Testing27'));
const Testing28 = lazy(() => import('@/pages/test/Modelos/Testing28'));
const Testing29 = lazy(() => import('@/pages/test/Modelos/Testing29'));
const Testing30 = lazy(() => import('@/pages/test/Modelos/Testing30'));
const ExpenseControlForm = lazy(() => import('@/pages/test/ExpenseControlForm'));
const OP01 = lazy(() => import('@/pages/test/Opcionesia/01'));
const OP02 = lazy(() => import('@/pages/test/Opcionesia/02'));
const OP03 = lazy(() => import('@/pages/test/Opcionesia/03'));
const OP04 = lazy(() => import('@/pages/inventario/wizardform'));
const OP05 = lazy(() => import('@/pages/test/Opcionesia/05'));

// Componente de envoltura para manejo de carga y errores
const PageWrapper = ({ component: Component }) => (
  <ErrorBoundary>
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    }>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

PageWrapper.propTypes = {
  component: PropTypes.elementType.isRequired
};

// Configuración de rutas
export const routes = createBrowserRouter([
  {
    path: '/login',
    element: (
      <AuthProvider>
        <Login />
      </AuthProvider>
    ),
  },
  {
    path: '/',
    element: (
      <AuthProvider>
        <AuthLayout>
          <MainLayout />
        </AuthLayout>
      </AuthProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <PageWrapper component={DashboardPage} /> },
      
      // Usuario
      { path: 'profile', element: <PageWrapper component={ProfilePage} /> },
      { path: 'settings', element: <PageWrapper component={SettingsPage} /> },
      
      // Pandora - Módulo Bases Relacionales
      { path: 'zonas', element: <PageWrapper component={ZonasPage} /> },
      { path: 'ciudades', element: <PageWrapper component={CiudadesPage} /> },
      { path: 'tipocliente', element: <PageWrapper component={TipoClientePage} /> },
      { path: 'categorias', element: <PageWrapper component={CategoriasPage} /> },
      { path: 'especialidades', element: <PageWrapper component={EspecialidadesPage} /> },
      { path: 'marcas', element: <PageWrapper component={MarcaPage} /> },
      { path: 'procedencia', element: <PageWrapper component={ProcedenciaPage} /> },
      { path: 'unidades', element: <PageWrapper component={UnidadesPage} /> },
      { path: 'pandora', element: <PageWrapper component={PandoraPage} /> },
      { path: 'tipocontratacion', element: <PageWrapper component={TipoContratacionPage} /> },
      { path: 'empresasclc', element: <PageWrapper component={EmpresasClcPage} /> },
      { path: 'procesosauditados', element: <PageWrapper component={ProcesosAuditadosPage} /> },
      
      // Pandora - Módulo Bases Generales
      { path: 'proveedores', element: <PageWrapper component={ProveedoresPage} /> },
      { path: 'madvance/add-proveedor', element: <PageWrapper component={AddProveedorPage} /> },
      { path: 'clientes', element: <PageWrapper component={ClientesPage} /> },
      { path: 'madvance/add-cliente', element: <PageWrapper component={AddClientePage} /> },
      { path: 'vendedores', element: <PageWrapper component={VendedoresPage} /> },
      { path: 'vendedores/nuevo', element: <PageWrapper component={AddVendedorPage} /> },
      { path: 'contactos', element: <PageWrapper component={ContactosPage} /> },
      { path: 'contactos/nuevo', element: <PageWrapper component={AddContactoPage} /> },
      { path: 'relaciones-blue', element: <PageWrapper component={RelacionesBlue} /> },
      { path: 'preciossie', element: <PageWrapper component={PreciosSiePage} /> },
      { path: 'mspref', element: <PageWrapper component={MsprefPage} /> },
      
      // Productos
      { path: 'productosdisponibles', element: <PageWrapper component={ProductosDisponiblesPage} /> },
      { path: 'productosofertados', element: <PageWrapper component={ProductosOfertadosPage} /> },
      { path: 'historico-ventas', element: <PageWrapper component={VentasHistoricaProducto} /> },
      { path: 'historico-compras', element: <PageWrapper component={ComprasHistoricaProducto} /> },
      
      // Proformas
      { path: 'enhancedproforma', element: <PageWrapper component={OptimizedProformaView} /> },
      { path: 'dashboardproformas', element: <PageWrapper component={DashboardProformas} /> },
      { path: 'proformas-guardadas', element: <PageWrapper component={ProformasGuardadas} /> },
      // Redirector for compatibility with old routes
      { path: 'proformas', element: <Navigate to="/enhancedproforma" replace /> },
      
      // Brief
      { path: 'briefs', element: <PageWrapper component={BriefsPage} /> },
      { path: 'briefs/add', element: <PageWrapper component={AddBriefPage} /> },
      { path: 'briefs/view/:id', element: <PageWrapper component={BriefDetailsPage} /> },
      { path: 'briefs/edit/:id', element: <PageWrapper component={EditBriefPage} /> },

      //Inventerio
      { path: 'inventariopage', element: <PageWrapper component={InventarioPage} /> },
      { path: 'brief', element: <PageWrapper component={Brief} /> },
      { path: 'wizardform', element: <PageWrapper component={WizardForm} /> },

      
      { path: 'error', element: <ConstructionPage /> },
      
      // Legal Base
      { path: 'empresainfo', element: <PageWrapper component={EmpresaInfo} /> },
      { path: 'empresainfo2', element: <PageWrapper component={EmpresaInfo2} /> },
      { path: 'empresainfo3', element: <PageWrapper component={EmpresaInfo3} /> },


      // Modulo Docmanager
      { path: 'docmanager', element: <PageWrapper component={GestorDocumentalPage} /> },

      
      // Módulo de importaciones
      { path: 'msprefimport', element: <PageWrapper component={MsprefImportPage} /> },
      { path: 'productosofertadosimport', element: <PageWrapper component={ProductosOfertadosImportPage} /> },



      
      // Testing
      { path: 'testing1', element: <PageWrapper component={Testing1} /> },
      { path: 'testing2', element: <PageWrapper component={Testing2} /> },
      { path: 'testing3', element: <PageWrapper component={Testing3} /> },
      { path: 'api-test', element: <PageWrapper component={APITest} /> },
      { path: 'auth-test', element: <PageWrapper component={AuthTest} /> },
      { path: 'testing4', element: <PageWrapper component={Testing4} /> },
      { path: 'testing5', element: <PageWrapper component={Testing5} /> },
      { path: 'testing6', element: <PageWrapper component={Testing6} /> },
      { path: 'testing7', element: <PageWrapper component={Testing7} /> },
      { path: 'testing8', element: <PageWrapper component={Testing8} /> },
      { path: 'testing9', element: <PageWrapper component={Testing9} /> },
      { path: 'testing10', element: <PageWrapper component={Testing10} /> },
      { path: 'testing11', element: <PageWrapper component={Testing11} /> },
      { path: 'testing12', element: <PageWrapper component={Testing12} /> },
      { path: 'testing13', element: <PageWrapper component={Testing13} /> },
      { path: 'testing14', element: <PageWrapper component={Testing14} /> },
      { path: 'testing15', element: <PageWrapper component={Testing15} /> },
      { path: 'testing16', element: <PageWrapper component={Testing16} /> },
      { path: 'testing17', element: <PageWrapper component={Testing17} /> },
      { path: 'testing18', element: <PageWrapper component={Testing18} /> },
      { path: 'testing19', element: <PageWrapper component={Testing19} /> },
      { path: 'testing20', element: <PageWrapper component={Testing20} /> },
      { path: 'testing21', element: <PageWrapper component={Testing21} /> },
      { path: 'testing22', element: <PageWrapper component={Testing22} /> },
      { path: 'testing23', element: <PageWrapper component={Testing23} /> },
      { path: 'testing24', element: <PageWrapper component={Testing24} /> },
      { path: 'testing25', element: <PageWrapper component={Testing25} /> },
      { path: 'testing26', element: <PageWrapper component={Testing26} /> },
      { path: 'testing27', element: <PageWrapper component={Testing27} /> },
      { path: 'testing28', element: <PageWrapper component={Testing28} /> },
      { path: 'testing29', element: <PageWrapper component={Testing29} /> },
      { path: 'testing30', element: <PageWrapper component={Testing30} /> },
      { path: 'expense-control', element: <PageWrapper component={ExpenseControlForm} /> },
      { path: 'OP01', element: <PageWrapper component={OP01} /> },
      { path: 'OP02', element: <PageWrapper component={OP02} /> },
      { path: 'OP03', element: <PageWrapper component={OP03} /> },
      { path: 'OP04', element: <PageWrapper component={OP04} /> },
      { path: 'OP05', element: <PageWrapper component={OP05} /> },
    ],
  },
  {
    path: 'error',
    element: <ErrorPage />,
  },
  {
    path: '*',
    element: <Navigate to="/error" replace />,
  },
]);

export default routes;