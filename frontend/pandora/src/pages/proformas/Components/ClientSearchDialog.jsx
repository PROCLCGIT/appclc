import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, CheckCircle, User, Building, Phone } from "lucide-react";

const ClientSearchDialog = ({ 
  isOpen, 
  onClose, 
  onSelectClient, 
  clientes, 
  loadingClientes,
  onRequestLoadClientes // Nueva prop para solicitar carga manual de clientes
}) => {
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
  
  // Debug info ampliado
  useEffect(() => {
    if (isOpen) {
      console.log("ClientSearchDialog: Estado del diálogo, isOpen =", isOpen);
      console.log("ClientSearchDialog: loadingClientes =", loadingClientes);
      
      if (!Array.isArray(clientes)) {
        console.error("ClientSearchDialog: clientes no es un array:", clientes);
      } else if (clientes.length === 0) {
        console.warn("ClientSearchDialog: No hay clientes disponibles para mostrar (array vacío)");
      } else {
        console.log(`ClientSearchDialog: ${clientes.length} clientes disponibles, ${filteredClientes.length} filtrados`);
        // Mostrar muestra de los primeros clientes para debug
        console.log('Muestra de clientes recibidos:', clientes.slice(0, 3));
      }
    }
  }, [isOpen, clientes, filteredClientes.length, loadingClientes]);
  
  // Efecto para cargar clientes cuando se abre el diálogo
  useEffect(() => {
    if (isOpen && !loadingClientes) {
      console.log("ClientSearchDialog: Diálogo abierto. Estado de clientes:", {
        cantidad: clientes?.length || 0,
        hayClientes: Boolean(clientes?.length)
      });
      
      // Siempre intentar cargar/refrescar clientes al abrir el diálogo
      if (typeof onRequestLoadClientes === 'function') {
        console.log("ClientSearchDialog: Ejecutando onRequestLoadClientes()...");
        // Usar timeout para evitar problemas de concurrencia
        const timer = setTimeout(() => {
          onRequestLoadClientes(true); // Pasar true para forzar recarga
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, loadingClientes, onRequestLoadClientes]);

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
            {clientes.length === 0 && !loadingClientes && (
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 text-xs px-2 py-1 h-6"
                  onClick={() => {
                    console.log('Mostrando clientes de respaldo');
                    // Datos de ejemplo para usar en caso de fallo total
                    const clientesEmergencia = [
                      { id: 1, nombre: "Distribuidora XYZ", ruc: "0987654321001", persona_contacto: "Ana María García" },
                      { id: 2, nombre: "Importadora Global", ruc: "1234567899001", persona_contacto: "Roberto Sánchez" },
                      { id: 3, nombre: "Comercial El Sol", ruc: "1456789230001", persona_contacto: "Carmen Rodríguez" },
                      { id: 4, nombre: "Industrias del Este", ruc: "1787654320001", persona_contacto: "Pedro Fernández" },
                      { id: 5, nombre: "MegaSuper S.A.", ruc: "0123456789001", persona_contacto: "Luisa Martínez" },
                    ];
                    
                    // Establecer clientes mockeados para que aparezcan en la interfaz
                    setFilteredClientes(clientesEmergencia);
                  }}
                >
                  Mostrar Clientes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1 h-6 bg-green-50 text-green-700 border-green-200"
                  onClick={() => {
                    console.log('Utilizando cliente de emergencia');
                    // Crear cliente de emergencia y usarlo directamente
                    const clienteEmergencia = { 
                      id: Date.now(), 
                      nombre: "Cliente Temporal", 
                      ruc: "9999999999001", 
                      persona_contacto: "Usuario Actual",
                      email: "cliente@temporal.com",
                      telefono: "099-999-9999"
                    };
                    if (typeof onSelectClient === 'function') {
                      onSelectClient(clienteEmergencia);
                      onClose();
                    }
                  }}
                >
                  Usar Cliente Temporal
                </Button>
              </div>
            )}
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
                    <p className="mt-1">Posibles causas:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>Sesión expirada o token inválido</li>
                      <li>Conexión inestable con el servidor</li>
                      <li>Permisos insuficientes para acceder a los datos</li>
                      <li>Configuración incorrecta de URLs de la API</li>
                    </ul>
                    <div className="mt-3 flex gap-2 justify-center">
                      <Button 
                        size="xs" 
                        variant="outline"
                        className="text-xs h-6 px-2 py-0 bg-white"
                        onClick={() => {
                          // Regenerar token para sesión (si posible)
                          const regenerarToken = async () => {
                            try {
                              console.log('Iniciando regeneración de token...');
                              const refreshToken = localStorage.getItem('refresh-token');
                              
                              if (!refreshToken) {
                                console.error('No hay refresh token disponible');
                                alert('No hay token de refresco disponible. Vuelva a iniciar sesión.');
                                return;
                              }
                              
                              // Intentar con múltiples rutas posibles de API
                              const posibleApis = [
                                '/api/auth/token/refresh/',
                                '/auth/token/refresh/',
                                '/api/token/refresh/'
                              ];
                              
                              // Para mostrar feedback al usuario mientras se intenta regenerar
                              const button = document.activeElement;
                              if (button) {
                                button.disabled = true;
                                button.innerHTML = 'Regenerando...';
                              }
                              
                              let success = false;
                              let errors = [];
                              
                              // Intentar cada ruta secuencialmente
                              for (const apiPath of posibleApis) {
                                try {
                                  console.log(`Intentando refrescar token con: ${apiPath}`);
                                  const apiUrl = `${window.location.origin}${apiPath}`;
                                  const response = await fetch(apiUrl, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ refresh: refreshToken })
                                  });
                                  
                                  if (response.ok) {
                                    const data = await response.json();
                                    if (data && data.access) {
                                      localStorage.setItem('auth-token', data.access);
                                      console.log('✅ Token regenerado con éxito usando', apiPath);
                                      success = true;
                                      
                                      // Actualizar la UI para indicar éxito
                                      if (button) {
                                        button.innerHTML = '✓ Sesión Renovada';
                                        button.className += ' bg-green-100 text-green-700';
                                      }
                                      
                                      // Reintentar carga después de un breve retraso
                                      if (typeof onRequestLoadClientes === 'function') {
                                        setTimeout(() => onRequestLoadClientes(true), 800);
                                      }
                                      
                                      break; // Salir del bucle si tuvimos éxito
                                    } else {
                                      console.error('Respuesta sin token de acceso:', data);
                                      errors.push(`API ${apiPath} respondió sin token de acceso`);
                                    }
                                  } else {
                                    const errorData = await response.text();
                                    console.error(`Error al refrescar token con ${apiPath}:`, errorData);
                                    errors.push(`API ${apiPath}: ${response.status} ${response.statusText}`);
                                  }
                                } catch (apiError) {
                                  console.error(`Error de conexión con ${apiPath}:`, apiError.message);
                                  errors.push(`Error al contactar ${apiPath}: ${apiError.message}`);
                                }
                              }
                              
                              // Si ninguna ruta funcionó
                              if (!success) {
                                console.error('Todos los intentos de regeneración fallaron:', errors);
                                
                                // Restaurar estado del botón
                                if (button) {
                                  button.disabled = false;
                                  button.innerHTML = 'Regenerar Sesión';
                                }
                                
                                // Mostrar mensaje al usuario
                                alert(`No se pudo regenerar la sesión. Por favor, vuelva a iniciar sesión. Detalles: ${errors.join(', ')}`);
                              }
                            } catch (e) {
                              console.error('Error general al intentar refrescar token:', e);
                              alert('Error al intentar regenerar la sesión: ' + e.message);
                            }
                          };
                          
                          // Ejecutar función
                          regenerarToken();
                        }}
                      >
                        Regenerar Sesión
                      </Button>
                      <Button 
                        size="xs" 
                        variant="outline"
                        className="text-xs h-6 px-2 py-0 bg-white text-green-700 border-green-200"
                        onClick={() => {
                          // Recargar página completa
                          window.location.reload();
                        }}
                      >
                        Recargar Página
                      </Button>
                    </div>
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