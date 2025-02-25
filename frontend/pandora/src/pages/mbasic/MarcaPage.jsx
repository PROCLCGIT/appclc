// src/pages/MarcaPage.jsx
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { marcaService } from '@/services/api';

const MarcaPage = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    code: '',
    description: '',
    proveedores: '',
    country_origin: '',
    website: '',
    contact_info: '',
    is_active: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await marcaService.getAll();
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
      description: '',
      proveedores: '',
      country_origin: '',
      website: '',
      contact_info: '',
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      nombre: item.nombre,
      code: item.code,
      description: item.description || '',
      proveedores: item.proveedores || '',
      country_origin: item.country_origin || '',
      website: item.website || '',
      contact_info: item.contact_info || '',
      is_active: item.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm('¿Está seguro de eliminar este registro?')) {
      try {
        await marcaService.delete(item.id);
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
        await marcaService.update(selectedItem.id, formData);
      } else {
        await marcaService.create(formData);
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
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white shadow-sm rounded-md p-4 sm:p-6">
        <h1 className="text-2xl font-semibold mb-2">Marcas</h1>
        <p className="text-gray-500 mb-4">Gestiona las marcas del sistema</p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
          </div>
          <Button onClick={handleAdd} className="mt-2 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Marca
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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Proveedores</th>
                <th className="px-4 py-2 text-left">País</th>
                <th className="px-4 py-2 text-left">Activo</th>
                <th className="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-2 text-center">Cargando...</td>
                </tr>
              ) : visibleData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-2 text-center">No hay registros</td>
                </tr>
              ) : (
                visibleData.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">{item.nombre}</td>
                    <td className="px-4 py-2">{item.code}</td>
                    <td className="px-4 py-2">{item.proveedores}</td>
                    <td className="px-4 py-2">{item.country_origin}</td>
                    <td className="px-4 py-2">{item.is_active ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">
            Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Editar Marca' : 'Nueva Marca'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="proveedores" className="text-sm font-medium text-gray-700">
                    Proveedores
                  </label>
                  <Input
                    id="proveedores"
                    value={formData.proveedores}
                    onChange={(e) => setFormData({ ...formData, proveedores: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="country_origin" className="text-sm font-medium text-gray-700">
                    País de Origen
                  </label>
                  <Input
                    id="country_origin"
                    value={formData.country_origin}
                    onChange={(e) => setFormData({ ...formData, country_origin: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="website" className="text-sm font-medium text-gray-700">
                  Sitio Web
                </label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact_info" className="text-sm font-medium text-gray-700">
                  Información de Contacto
                </label>
                <Input
                  id="contact_info"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Activo
                </label>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {selectedItem ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarcaPage;