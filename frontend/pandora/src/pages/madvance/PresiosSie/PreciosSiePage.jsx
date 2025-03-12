// src/pages/PreciosSie/PreciosSiePage.jsx
import { useState, useEffect } from 'react';
import { pandoraService, clientesService, procesosAuditadosService,
         preciosSieService, productosOfertadosService, productosDisponiblesService,
} from '@/services/api';

// Importamos los componentes que crearemos
import PreciosSieFilters from './components/PreciosSieFilters';
import PreciosSieTable from './components/PreciosSieTable';
import PreciosSieFormModal from './components/PreciosSieFormModal';

const PreciosSiePage = () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1) Estados y variables
  // ─────────────────────────────────────────────────────────────────────────────
  const [preciosSie, setPreciosSie] = useState([]);
  const [pandoras, setPandoras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [procesosAuditados, setProcesosAuditados] = useState([]);
  const [productosOfertados, setProductosOfertados] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrecioSie, setCurrentPrecioSie] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Notificaciones
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });

  // Datos del formulario
  const [formData, setFormData] = useState({
    pandora: '',
    cliente: '',
    detalle_sie: '',
    precio: '',
    nota: '',
    fecha_sie: '',
    producto_ofertado: '',
    producto_disponible: '',
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) Efectos iniciales (carga de datos)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchPreciosSie();
    fetchPandoras();
    fetchClientes();
    fetchProcesosAuditados();
    fetchProductosOfertados();
    fetchProductosDisponibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3) Funciones de notificación
  // ─────────────────────────────────────────────────────────────────────────────
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 4) Funciones de carga de datos
  // ─────────────────────────────────────────────────────────────────────────────
  const fetchPandoras = async () => {
    try {
      const response = await pandoraService.getAll();
      setPandoras(response.results || []);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar los pandoras', 'error');
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await clientesService.getAll();
      setClientes(response.results || []);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar los clientes', 'error');
    }
  };

  const fetchProcesosAuditados = async () => {
    try {
      const response = await procesosAuditadosService.getAll();
      setProcesosAuditados(response.results || []);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar los procesos auditados', 'error');
    }
  };

  const fetchProductosOfertados = async () => {
    try {
      const response = await productosOfertadosService.getAll();
      setProductosOfertados(response.results || []);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar los productos ofertados', 'error');
    }
  };

  const fetchProductosDisponibles = async () => {
    try {
      const response = await productosDisponiblesService.getAll();
      setProductosDisponibles(response.results || []);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar los productos disponibles', 'error');
    }
  };

  const fetchPreciosSie = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        search: searchTerm,
      };
      const response = await preciosSieService.getAll(params);

      setPreciosSie(response.results || []);
      setTotalPages(response.total_pages || 0);
      if (response.current_page) {
        setCurrentPage(response.current_page);
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar los precios SIE', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 5) Handlers (crear, editar, eliminar)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentPrecioSie) {
        // Modo edición
        await preciosSieService.update(currentPrecioSie.id, formData);
        showNotification('Precio SIE actualizado exitosamente');
      } else {
        // Modo creación
        await preciosSieService.create(formData);
        showNotification('Precio SIE creado exitosamente');
      }
      setIsModalOpen(false);
      resetForm();

      // Recarga la tabla
      setTimeout(() => {
        fetchPreciosSie();
      }, 100);
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Error al procesar la solicitud', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este precio SIE?')) {
      try {
        await preciosSieService.delete(id);
        showNotification('Precio SIE eliminado exitosamente');
        fetchPreciosSie();
      } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar el precio SIE', 'error');
      }
    }
  };

  const handleEdit = (precioSie) => {
    setCurrentPrecioSie(precioSie);
    setFormData({
      pandora: precioSie.pandora,
      cliente: precioSie.cliente,
      detalle_sie: precioSie.detalle_sie,
      precio: precioSie.precio,
      nota: precioSie.nota || '',
      fecha_sie: precioSie.fecha_sie || '',
      producto_ofertado: precioSie.producto_ofertado || '',
      producto_disponible: precioSie.producto_disponible || '',
    });
    setIsModalOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 6) Utilidades
  // ─────────────────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setCurrentPrecioSie(null);
    setFormData({
      pandora: '',
      cliente: '',
      detalle_sie: '',
      precio: '',
      nota: '',
      fecha_sie: '',
      producto_ofertado: '',
      producto_disponible: '',
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 7) Render principal
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notificación */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Cabecera + filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Precios SIE</h1>

        {/* Componente con barra de búsqueda y botón “Nuevo” */}
        <PreciosSieFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onNew={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        />
      </div>

      {/* Tabla */}
      <PreciosSieTable
        preciosSie={preciosSie}
        loading={loading}
        pandoras={pandoras}
        clientes={clientes}
        procesosAuditados={procesosAuditados}
        productosOfertados={productosOfertados}
        productosDisponibles={productosDisponibles}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      {/* Modal de Formulario */}
      <PreciosSieFormModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        currentPrecioSie={currentPrecioSie}
        formData={formData}
        setFormData={setFormData}
        pandoras={pandoras}
        clientes={clientes}
        procesosAuditados={procesosAuditados}
        productosOfertados={productosOfertados}
        productosDisponibles={productosDisponibles}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
      />
    </div>
  );
};

export default PreciosSiePage;
