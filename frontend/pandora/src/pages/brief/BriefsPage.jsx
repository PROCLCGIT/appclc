import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

import {
  briefService,
  clientesService,
} from '@/services/api';

// Pagination helper function
function getVisiblePages(currentPage, totalPages, maxVisible = 5) {
  const pages = [];
  const half = Math.floor(maxVisible / 2);
  let start = currentPage - half;
  let end = currentPage + half;

  if (start < 1) {
    start = 1;
    end = maxVisible;
  }

  if (end > totalPages) {
    end = totalPages;
    start = totalPages - maxVisible + 1;
    if (start < 1) start = 1;
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (start > 1) {
    if (start > 2) {
      pages.unshift('...');
    }
    pages.unshift(1);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  return pages;
}

const BriefsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    briefs: [],
    clients: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [briefsResponse, clientsResponse] = await Promise.all([
        briefService.getAll({
          page: currentPage,
          search: searchTerm,
        }),
        clientesService.getAll(),
      ]);

      setData({
        briefs: briefsResponse.results || [],
        clients: clientsResponse.results || [],
      });

      setTotalPages(briefsResponse.total_pages || 0);

      if (briefsResponse.current_page) {
        setCurrentPage(briefsResponse.current_page);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification(error.message || 'Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentPage, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este brief?')) {
      try {
        setLoading(true);
        await briefService.delete(id);
        showNotification('Brief eliminado exitosamente');
        await fetchAllData();
      } catch (error) {
        console.error('Error al eliminar:', error);
        showNotification(error.message || 'Error al eliminar el brief', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/briefs/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/briefs/view/${id}`);
  };

  // Use formatDate from utils.js

  // Format currency as $X,XXX.XX
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading && !data.briefs.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Briefs</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar brief..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Link 
            to="/briefs/add" 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Presupuesto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.briefs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No se encontraron briefs
                </td>
              </tr>
            ) : (
              data.briefs.map((brief) => (
                <tr key={brief.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{brief.codigo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {data.clients.find((c) => c.id === brief.cliente)?.nombre || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(brief.fecha)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{brief.origen}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(brief.presupuestoref)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(brief.id)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(brief.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(brief.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? 'cursor-not-allowed text-gray-400'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>
            {getVisiblePages(currentPage, totalPages, 5).map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={index}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-400"
                  >
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages
                  ? 'cursor-not-allowed text-gray-400'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default BriefsPage;