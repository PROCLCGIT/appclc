// src/pages/proformas/ProformaList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useProforma from '../../hooks/useProforma';
import { toast } from 'react-toastify';

const ProformaList = () => {
  const [proformas, setProformas] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const navigate = useNavigate();
  const { loading, error, fetchProformas } = useProforma();

  const loadProformas = async () => {
    try {
      const data = await fetchProformas(filters);
      setProformas(data.results || []);
    } catch (error) {
      toast.error('Error al cargar las proformas');
    }
  };

  useEffect(() => {
    loadProformas();
  }, []);

  // ... (resto del código del componente anterior) ...

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proformas</h1>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          onClick={handleCreateNew}
        >
          Nueva Proforma
        </button>
      </div>

      {renderFilters()}
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        proformas.length > 0 ? (
          renderProformasList()
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">No hay proformas que mostrar</p>
          </div>
        )
      )}
    </div>
  );
};

export default ProformaList;