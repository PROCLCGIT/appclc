import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, CheckCircle, User, Building, Phone } from "lucide-react";

const ClientSearchDialog = ({ isOpen, onClose, onSelectClient, clientes, loadingClientes }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClientes, setFilteredClientes] = useState([]);

  // Filtrar clientes cuando cambie el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClientes(clientes.slice(0, 10)); // Mostrar primeros 10 si no hay búsqueda
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = clientes.filter(cliente => 
      cliente.nombre?.toLowerCase().includes(lowerSearchTerm) ||
      cliente.ruc?.includes(searchTerm) ||
      cliente.persona_contacto?.toLowerCase().includes(lowerSearchTerm)
    );
    
    setFilteredClientes(filtered);
  }, [searchTerm, clientes]);

  // Inicializar lista al abrir diálogo
  useEffect(() => {
    if (isOpen) {
      console.log(`ClientSearchDialog: abierto con ${clientes.length} clientes disponibles`);
      // Use a timeout to move state updates out of the layout phase
      const timer = setTimeout(() => {
        setFilteredClientes(clientes.slice(0, 10));
        setSearchTerm("");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, clientes]);
  
  // Debug info
  useEffect(() => {
    if (isOpen) {
      if (clientes.length === 0) {
        console.warn("ClientSearchDialog: No hay clientes disponibles para mostrar");
      } else {
        console.log(`ClientSearchDialog: ${clientes.length} clientes disponibles, ${filteredClientes.length} filtrados`);
      }
    }
  }, [isOpen, clientes, filteredClientes.length]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px]">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 -m-6 mb-2 py-3 px-6 rounded-t-lg border-b border-blue-200">
          <DialogTitle className="text-xl font-bold flex items-center text-black">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Buscar Cliente 
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {clientes.length} clientes disponibles
            </span>
          </DialogTitle>
        </div>

        <div className="py-2">
          <div className="mb-4 flex gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <Input
                placeholder="Buscar por nombre, RUC o contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border-blue-200 focus-visible:ring-blue-500"
                autoFocus
              />
            </div>
            <Button 
              onClick={() => {
                onClose();
                navigate('/madvance/add-cliente');
              }}
              className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nuevo Cliente
            </Button>
          </div>

          {loadingClientes ? (
            <div className="flex flex-col justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="mt-2 text-blue-600 font-medium">Cargando clientes...</p>
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center">
              <div className="rounded-full bg-gray-100 p-4 mb-3">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              {searchTerm ? (
                <>
                  <p className="text-lg font-semibold">No se encontraron clientes</p>
                  <p className="text-sm">No hay resultados para "{searchTerm}". Intente con otra búsqueda o cree un nuevo cliente.</p>
                </>
              ) : clientes.length === 0 ? (
                <>
                  <p className="text-lg font-semibold">No hay clientes disponibles</p>
                  <p className="text-sm">No se encontraron clientes en el sistema. Puede crear un nuevo cliente usando el botón "Nuevo Cliente".</p>
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    <p>Estado de los datos: Array vacío recibido desde la API</p>
                    <p className="mt-1">Verifique la conexión con el servidor o los permisos de acceso.</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold">Clientes cargados pero no hay resultados</p>
                  <p className="text-sm">Se cargaron {clientes.length} clientes pero no hay resultados para su búsqueda.</p>
                </>
              )}
            </div>
          ) : (
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
                  {filteredClientes.map((cliente) => (
                    <TableRow 
                      key={cliente.id} 
                      className="cursor-pointer hover:bg-blue-50 transition-colors border-b last:border-b-0"
                      onDoubleClick={() => onSelectClient(cliente)}
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
                          onClick={() => onSelectClient(cliente)}
                          className="rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
                          title="Seleccionar cliente"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-end gap-2">
          <div className="text-xs text-gray-500 sm:hidden">
            Doble clic en una fila para seleccionar
          </div>
          <Button variant="outline" onClick={onClose} className="ml-auto">
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientSearchDialog;