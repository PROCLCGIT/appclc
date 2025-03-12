// src/pages/ZonasPage.jsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DataTable from '@/components/common/DataTable';
import FormDialog from '@/components/common/FormDialog';
import { zonasService } from '@/services/api';

const ZonasPage = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({ 
    nombre: '',
    code: '',
    cobertura: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await zonasService.getAll();
      setData(response.results);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({ 
      nombre: '',
      code: '',
      cobertura: '' 
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({ 
      nombre: item.nombre,
      code: item.code || '',
      cobertura: item.cobertura || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm('¿Está seguro de eliminar este registro?')) {
      try {
        await zonasService.delete(item.id);
        await loadData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedItem) {
        await zonasService.update(selectedItem.id, formData);
      } else {
        await zonasService.create(formData);
      }
      setIsDialogOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const paginatedData = (() => {
    const filteredData = data.filter((item) =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.cobertura && item.cobertura.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const totalItems = filteredData.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return {
      data: filteredData.slice(startIndex, startIndex + itemsPerPage),
      totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage),
    };
  })();

  const { data: visibleData, totalItems, totalPages } = paginatedData;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'code', label: 'Código' },
    { key: 'cobertura', label: 'Cobertura' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white shadow-sm rounded-md p-4 sm:p-6">
        <h1 className="text-2xl font-semibold mb-2">Zonas</h1>
        <p className="text-gray-500 mb-4">Gestiona las zonas del sistema</p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar zona..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
          </div>
          <Button onClick={handleAdd} className="mt-2 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Zona
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-white shadow-sm rounded-md p-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-md p-4">
        <DataTable
          columns={columns}
          data={visibleData}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">
            Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <FormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={selectedItem ? 'Editar Zona' : 'Nueva Zona'}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <div className="grid w-full gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                Nombre
              </label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-gray-700">
                Código
              </label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="cobertura" className="text-sm font-medium text-gray-700">
              Cobertura
            </label>
            <textarea
              id="cobertura"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
              value={formData.cobertura}
              onChange={(e) =>
                setFormData({ ...formData, cobertura: e.target.value })
              }
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default ZonasPage;
