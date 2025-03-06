// src/routes/routes.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// LayOuts
import AuthLayout from '@/components/layout/AuthLayout';
import MainLayout from '@/components/layout/MainLayout';
const DashboardPage = lazy(() => import('@/pages/Dashboard'));

// Pandora
// Modulo Bases Relacionales
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

// Modulo Bases Generales
const ProveedoresPage = lazy(() => import('@/pages/madvance/ProveedoresPage'));
const ClientesPage = lazy(() => import('@/pages/madvance/ClientesPage'));
const CostosPandoraPage = lazy(() => import('@/pages/madvance/CostosPandoraPage'));
const VendedoresPage = lazy(() => import('@/pages/madvance/VendedoresPage'));
const PreciosSiePage = lazy(() => import('@/pages/madvance/PreciosSiePage'));
const MsprefPage = lazy(() => import('@/pages/madvance/MsprefPage'));

// Productos
// Productos Disponibles
const ProductosDisponiblesPage = lazy(() => import('@/pages/products/ProductsDisp/ProductosDisponiblesPage'));

//Productos Ofertados
const ProductosOfertadosPage = lazy(() => import('@/pages/products/ProductsOfet/ProductosOfertadosPage'));

// Históricos
const VentasHistoricaProducto = lazy(() => import('@/pages/products/Historicos/VentasHistoricaProducto'));
const ComprasHistoricaProducto = lazy(() => import('@/pages/products/Historicos/ComprasHistoricaProducto'));


//Proformas
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



// Páginas básicas que no necesitan carga diferida
import Login from '@/components/auth/Login';
import ErrorPage from '@/components/error/ErrorPage';
import ConstructionPage from '@/pages/Varias/ConstructionPage';

// Legal Base
import EmpresaInfo from '@/pages/legalbase/EmpresaInfo';
import EmpresaInfo2 from '@/pages/legalbase/EmpresaInfo2';
import EmpresaInfo3 from '@/pages/legalbase/EmpresaInfo3';

// Modulo de importaciones
const MsprefImportPage = lazy(() => import('@/pages/import/MsprefImportPage'));
const ProductosOfortadosImportPage = lazy(() => import('@/pages/import/ProductosOfertadosImportPage'));

//Testing
const Testing1 = lazy(() => import('@/pages/test/Testing1'));
const Testing2 = lazy(() => import('@/pages/test/Testing2'));
const Testing3 = lazy(() => import('@/pages/test/Testing3'));
const gpt = lazy(() => import('@/pages/test/gpt'));
const claude = lazy(() => import('@/pages/test/claude'));
const grok = lazy(() => import('@/pages/test/grok'));

// Componente de envoltura para el manejo de carga y errores
const PageWrapper = ({ component: Component }) => {
  // Maneja errores de carga diferida con un límite de tiempo
  return (
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
};

// PropTypes para validación
PageWrapper.propTypes = {
  component: PropTypes.elementType.isRequired
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
            
      // Módulo Proformas


      // LayOuts


      // Pandora
      // Modulo Bases Relacionales
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

      // Modulo Bases Generales
      { path: 'proveedores', element: <PageWrapper component={ProveedoresPage} /> },
      { path: 'clientes', element: <PageWrapper component={ClientesPage} /> },
      { path: 'costospandora', element: <PageWrapper component={CostosPandoraPage} /> },
      { path: 'vendedores', element: <PageWrapper component={VendedoresPage} /> },
      { path: 'preciossie', element: <PageWrapper component={PreciosSiePage} /> },
      { path: 'mspref', element: <PageWrapper component={MsprefPage} /> },

      // Productos
      // Productos Disponibles
      { path: 'productosdisponibles', element: <PageWrapper component={ProductosDisponiblesPage} /> },
        
      //Productos Ofertados
      { path: 'productosofertados', element: <PageWrapper component={ProductosOfertadosPage} /> },
      
      // Históricos
      { path: 'historico-ventas', element: <PageWrapper component={VentasHistoricaProducto} /> },
      { path: 'historico-compras', element: <PageWrapper component={ComprasHistoricaProducto} /> },

     
      //Proformas
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

      //Legal Base
      { path: 'empresainfo', element: <PageWrapper component={EmpresaInfo} /> },  
      { path: 'empresainfo2', element: <PageWrapper component={EmpresaInfo2} /> },
      { path: 'empresainfo3', element: <PageWrapper component={EmpresaInfo3} /> },

      
      { path: 'proformaform', element: <PageWrapper component={ProformaForm} /> },
  
    // Modulo de importaciones
      { path: 'msprefimport', element: <PageWrapper component={MsprefImportPage} /> },
      { path: 'productosofertadosimport', element: <PageWrapper component={ProductosOfortadosImportPage} /> },


      //_____________________________________________________________________
      //Testing
      //_____________________________________________________________________
      { path: 'testing1', element: <PageWrapper component={Testing1} /> },
      { path: 'testing2', element: <PageWrapper component={Testing2} /> },
      { path: 'testing3', element: <PageWrapper component={Testing3} /> },
      { path: 'gpt', element: <PageWrapper component={gpt} /> },
      { path: 'claude', element: <PageWrapper component={claude} /> },
      { path: 'grok', element: <PageWrapper component={grok} /> },

    
      { path: 'proformaform', element: <PageWrapper component={ProformaForm} /> },


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