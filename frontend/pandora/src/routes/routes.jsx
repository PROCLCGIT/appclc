// src/routes/routes.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
const ProductList = lazy(() => import('@/pages/products/ProductList'));
const ProductWizard = lazy(() => import('@/pages/products/ProductWizard'));
const PriceManagement = lazy(() => import('@/pages/products/PriceManagement'));
const PriceManagement2 = lazy(() => import('@/pages/products/PriceManagement2'));
const PriceCharts = lazy(() => import('@/pages/products/PriceCharts'));


// Importaciones de productos
const ProductosOfertadosPage = lazy(() => import('@/pages/products/ProductosOfertadosPage'));
const ProductosDisponiblesPage = lazy(() => import('@/pages/products/ProductosDisponiblesPage'));
const ProductosOfertadosPage2 = lazy(() => import('@/pages/products/claude'));
const ProductosOfertadosPage3 = lazy(() => import('@/pages/products/gpt'));
const ProductosOfertadosPage4 = lazy(() => import('@/pages/products/grok'));



// Layouts
import AuthLayout from '@/components/layout/AuthLayout';
import MainLayout from '@/components/layout/MainLayout';

// Páginas básicas que no necesitan carga diferida
import Login from '@/components/auth/Login';
import ErrorPage from '@/components/error/ErrorPage';
import ConstructionPage from '@/pages/Varias/ConstructionPage';
import EmpresaInfo from '@/pages/legalbase/EmpresaInfo';
import EmpresaInfo2 from '@/pages/legalbase/EmpresaInfo2';
import EmpresaInfo3 from '@/pages/legalbase/EmpresaInfo3';

// Carga diferida de componentes
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const Hola = lazy(() => import('@/pages/Hola'));

// Módulo básico
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

// Módulo avanzado
const ProveedoresPage = lazy(() => import('@/pages/madvance/ProveedoresPage'));
const ClientesPage = lazy(() => import('@/pages/madvance/ClientesPage'));
const CostosPandoraPage = lazy(() => import('@/pages/madvance/CostosPandoraPage'));
const VendedoresPage = lazy(() => import('@/pages/madvance/VendedoresPage'));
const PreciosSiePage = lazy(() => import('@/pages/madvance/PreciosSiePage'));
const MsprefPage = lazy(() => import('@/pages/madvance/MsprefPage'));

// Modulo de importaciones
const MsprefImportPage = lazy(() => import('@/pages/import/MsprefImportPage'));
const ProductosOfortadosImportPage = lazy(() => import('@/pages/import/ProductosOfertadosImportPage'));

//Varias paginas de prueba
const ProductPortfolioPage = lazy(() => import('@/pages/Varias/ProductPortfolioPage'));
const testpage1 = lazy(() => import('@/pages/test/testpage1'));



// Módulo Proformas
const BulkUploadProducts = lazy(() => import('@/pages/proformas/BulkUploadProducts'));
const ComparativeAnalysis = lazy(() => import('@/pages/proformas/ComparativeAnalysis'));
const NewProformaForm = lazy(() => import('@/pages/proformas/NewProformaForm'));
const PriceAlerts = lazy(() => import('@/pages/proformas/PriceAlerts'));
const PriceAnalysisTools = lazy(() => import('@/pages/proformas/PriceAnalysisTools'));
const PriceHistory = lazy(() => import('@/pages/proformas/PriceHistory'));
const PriceProjections = lazy(() => import('@/pages/proformas/PriceProjections'));
const ProformaDashboard = lazy(() => import('@/pages/proformas/ProformaDashboard'));
const ProformaForm = lazy(() => import('@/pages/proformas/ProformaForm'));
const ProformaGenerator = lazy(() => import('@/pages/proformas/ProformaGenerator'));
const ProformaList = lazy(() => import('@/pages/proformas/ProformaList'));
const ProformaPDF = lazy(() => import('@/pages/proformas/ProformaPDF'));
const ProformaPreview = lazy(() => import('@/pages/proformas/ProformaPreview'));
const ProformaSettings = lazy(() => import('@/pages/proformas/ProformaSettings'));
const ProformaTemplates = lazy(() => import('@/pages/proformas/ProformaTemplates'));





// Componente de envoltura para el manejo de carga y errores
const PageWrapper = ({ component: Component }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
};

// Configuración de rutas
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <AuthLayout>
          <MainLayout />
        </AuthLayout>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <PageWrapper component={DashboardPage} /> },
      { path: 'hola', element: <PageWrapper component={Hola} /> },
      
      // Módulo básico
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
      
      // Módulo avanzado
      { path: 'proveedores', element: <PageWrapper component={ProveedoresPage} /> },
      { path: 'clientes', element: <PageWrapper component={ClientesPage} /> },
      { path: 'costospandora', element: <PageWrapper component={CostosPandoraPage} /> },
      { path: 'vendedores', element: <PageWrapper component={VendedoresPage} /> },
      { path: 'preciossie', element: <PageWrapper component={PreciosSiePage} /> },
      { path: 'mspref', element: <PageWrapper component={MsprefPage} /> },

      // Módulo Importaciones Excel
      { path: 'msprefimport', element: <PageWrapper component={MsprefImportPage} /> },
      { path: 'productosofertadosimport', element: <PageWrapper component={ProductosOfortadosImportPage} /> },


      //Pruebas rapidas
      { path: 'test1', element: <PageWrapper component={testpage1} /> },

      //Varias paginas de prueba
      { path: 'productportfolio', element: <PageWrapper component={ProductPortfolioPage} /> },
      { path: 'proformaform', element: <PageWrapper component={ProformaForm} /> },
      { path: 'empresainfo', element: <PageWrapper component={EmpresaInfo} /> },  
      { path: 'empresainfo2', element: <PageWrapper component={EmpresaInfo2} /> },
      { path: 'empresainfo3', element: <PageWrapper component={EmpresaInfo3} /> },
      { path: 'products', element: <PageWrapper component={ProductList} /> },
      { path: 'productwizard', element: <PageWrapper component={ProductWizard} /> },
      { path: 'priceManagement', element: <PageWrapper component={PriceManagement} /> },
      { path: 'priceManagement2', element: <PageWrapper component={PriceManagement2} /> },
      { path: 'priceCharts', element: <PageWrapper component={PriceCharts} /> },
      { path: 'proformaform', element: <PageWrapper component={ProformaForm} /> },
      { path: 'grok', element: <PageWrapper component={ProductosOfertadosPage4} /> },
      { path: 'gpt', element: <PageWrapper component={ProductosOfertadosPage3} /> },
      { path: 'claude', element: <PageWrapper component={ProductosOfertadosPage2} /> },


       // Módulo Proformas
       { path: 'bulkuploadproducts', element: <PageWrapper component={BulkUploadProducts} /> },
       { path: 'comparativeanalysis', element: <PageWrapper component={ComparativeAnalysis} /> },
       { path: 'newproformaform', element: <PageWrapper component={NewProformaForm} /> },
       { path: 'pricealerts', element: <PageWrapper component={PriceAlerts} /> },
       { path: 'priceanalysistools', element: <PageWrapper component={PriceAnalysisTools} /> },
       { path: 'pricehistory', element: <PageWrapper component={PriceHistory} /> },
       { path: 'priceprojections', element: <PageWrapper component={PriceProjections} /> },
       { path: 'proformadashboard', element: <PageWrapper component={ProformaDashboard} /> },
       { path: 'proformaform', element: <PageWrapper component={ProformaForm} /> },
       { path: 'proformagenerator', element: <PageWrapper component={ProformaGenerator} /> },
       { path: 'proformalist', element: <PageWrapper component={ProformaList} /> },
       { path: 'proformapdf', element: <PageWrapper component={ProformaPDF} /> },
       { path: 'proformapreview', element: <PageWrapper component={ProformaPreview} /> },
       { path: 'proformasettings', element: <PageWrapper component={ProformaSettings} /> },
       { path: 'proformatemplates', element: <PageWrapper component={ProformaTemplates} /> },
       { path: 'error', element: <ConstructionPage /> },
       { path: 'productosofertados', element: <PageWrapper component={ProductosOfertadosPage} /> },
       { path: 'productosdisponibles', element: <PageWrapper component={ProductosDisponiblesPage} /> },





    ],
  },
  {
    path: '*',
    element: <Navigate to="/error" replace />,
  },
]);