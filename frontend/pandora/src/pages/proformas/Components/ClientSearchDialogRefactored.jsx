import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SearchDialog } from "@/components/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User, Building, Phone, Plus, CheckCircle } from "lucide-react";
import { normalizarIDsCliente } from "@/services/utils/clienteUtils";
import { toast } from "sonner";

const ClientSearchDialogRefactored = ({ 
  isOpen, 
  onClose, 
  onSelectClient, 
  clientes, 
  loadingClientes, 
  onRequestLoadClientes, 
  searchClientes 
}) => {
  const navigate = useNavigate();
  const [lastSearchTerm, setLastSearchTerm] = useState("");
  
  // Function to handle client loading/searching
  const handleClientSearch = useCallback((forceRefresh = false, searchQuery = "") => {
    console.log('ClientSearchDialogRefactored: Solicitando carga de clientes... forceRefresh:', forceRefresh, 'searchQuery:', searchQuery);
    
    try {
      // Use onRequestLoadClientes prop if available
      if (typeof onRequestLoadClientes === 'function') {
        console.log('Usando función onRequestLoadClientes');
        return onRequestLoadClientes(forceRefresh);
      } 
      // Fallback to searchClientes if there's no onRequestLoadClientes
      else if (typeof searchClientes === 'function') {
        console.log('Fallback: Usando searchClientes como alternativa');
        return searchClientes(searchQuery);
      } else {
        console.warn('No hay función disponible para cargar clientes');
        toast.error('No se pudieron cargar los clientes', {
          description: 'No se encontró un método apropiado para cargar clientes'
        });
        return Promise.resolve([]);
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error('Error al cargar clientes');
      return Promise.resolve([]);
    }
  }, [onRequestLoadClientes, searchClientes]);
  
  // Load clients when dialog opens
  useEffect(() => {
    if (isOpen && !loadingClientes && clientes.length === 0) {
      handleClientSearch(true);
    }
  }, [isOpen, loadingClientes, clientes.length, handleClientSearch]);

  // Filter function for clients
  const filterClients = useCallback((clients, searchTerm) => {
    // If search term changes significantly, trigger server-side search
    if (searchTerm.trim().length >= 2 && searchTerm !== lastSearchTerm) {
      setLastSearchTerm(searchTerm);
      // Delay search to prevent too many requests while typing
      const timeoutId = setTimeout(() => {
        handleClientSearch(false, searchTerm);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
    
    if (!searchTerm.trim()) {
      return clients.slice(0, 10); // Show first 10 if no search
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return clients.filter(cliente => 
      cliente.nombre?.toLowerCase().includes(lowerSearchTerm) ||
      cliente.ruc?.includes(searchTerm) ||
      cliente.persona_contacto?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [lastSearchTerm, handleClientSearch]);

  // Utilizamos la función de utilidad para normalizar IDs de clientes

  // Renderer for client items
  const renderClientItem = (cliente) => (
    <TableRow 
      className="cursor-pointer hover:bg-blue-50 transition-colors border-b last:border-b-0"
      onDoubleClick={() => onSelectClient(normalizarIDsCliente(cliente))}
    >
      <TableCell className="font-medium">
        <div className="flex items-center">
          <Building className="h-4 w-4 mr-2 text-gray-500" />
          <span>{cliente.nombre}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-500" />
          {cliente.ruc}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-gray-500" />
          {cliente.persona_contacto || <span className="text-gray-400 italic">Sin contacto</span>}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSelectClient(normalizarIDsCliente(cliente))}
          className="rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
          title="Seleccionar cliente"
        >
          <CheckCircle className="h-5 w-5" />
        </Button>
      </TableCell>
    </TableRow>
  );

  // Wrapper component for rendering table
  const ClientsTable = ({ items }) => (
    <div className="max-h-[300px] overflow-auto border rounded-lg shadow-sm">
      <Table>
        <TableHeader className="bg-blue-50 sticky top-0">
          <TableRow>
            <TableHead className="w-[40%] text-blue-700">Nombre</TableHead>
            <TableHead className="w-[20%] text-blue-700">RUC</TableHead>
            <TableHead className="w-[30%] text-blue-700">Contacto</TableHead>
            <TableHead className="w-[10%] text-center text-blue-700">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((cliente) => renderClientItem(cliente))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <SearchDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Buscar Cliente"
      icon={<User className="h-5 w-5" />}
      searchPlaceholder="Buscar por nombre, RUC o contacto..."
      items={clientes}
      onSelect={(item) => onSelectClient(normalizarIDsCliente(item))}
      filterItems={filterClients}
      onCreate={() => {
        onClose();
        navigate('/madvance/add-cliente');
      }}
      createLabel={
        <>
          <Plus className="h-4 w-4 mr-1" />
          Nuevo Cliente
        </>
      }
      loading={loadingClientes}
      loadingText="Cargando clientes..."
      emptyTitle="No hay clientes disponibles"
      emptyDescription="No se encontraron clientes en el sistema. Puede crear un nuevo cliente usando el botón 'Nuevo Cliente'."
      emptyIcon={<User className="h-8 w-8 text-gray-400" />}
      noResultsTitle="No se encontraron clientes"
      noResultsDescription="Intente con otra búsqueda o cree un nuevo cliente."
      maxWidth="max-w-[750px]"
    >
      {(filteredItems) => (
        <div className="max-h-[300px] overflow-auto border rounded-lg shadow-sm">
          <Table>
            <TableHeader className="bg-blue-50 sticky top-0">
              <TableRow>
                <TableHead className="w-[40%] text-blue-700">Nombre</TableHead>
                <TableHead className="w-[20%] text-blue-700">RUC</TableHead>
                <TableHead className="w-[30%] text-blue-700">Contacto</TableHead>
                <TableHead className="w-[10%] text-center text-blue-700">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((cliente) => renderClientItem(cliente))}
            </TableBody>
          </Table>
        </div>
      )}
    </SearchDialog>
  );
};

export default ClientSearchDialogRefactored;