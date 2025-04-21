import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RefreshCw, MoreHorizontal, CheckCircle2, Clock8, FileText, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { proformasService } from "@/services/api";
import { formatDate } from "@/lib/utils";

// Formatear valores monetarios
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

// Obtener el color para el estado de la proforma
const getStatusColor = (status) => {
  switch (status) {
    case "aprobada":
      return "bg-green-100 text-green-800";
    case "enviada":
      return "bg-blue-100 text-blue-800";
    case "borrador":
      return "bg-gray-100 text-gray-800";
    case "rechazada":
      return "bg-red-100 text-red-800";
    case "vencida":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Obtener el icono para el estado de la proforma
const getStatusIcon = (status) => {
  switch (status) {
    case "aprobada":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "enviada":
      return <Clock8 className="h-4 w-4 text-blue-600" />;
    case "borrador":
      return <FileText className="h-4 w-4 text-gray-600" />;
    case "rechazada":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "vencida":
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
};

const ProformasDashboardTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [proformas, setProformas] = useState([]);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    loadProformas();
  }, []);

  const loadProformas = useCallback(async (showToast = true) => {
    setLoading(true);
    setError(null);
    
    // Si se solicita mostrar toast, usamos un timeout para evitar parpadeos
    let loadToastId;
    if (showToast) {
      // Solo mostrar el toast de carga si tarda más de 600ms
      const toastTimer = setTimeout(() => {
        loadToastId = toast.loading("Cargando proformas recientes...");
      }, 600);
      
      // Limpiar el timer si la carga termina rápido
      return () => clearTimeout(toastTimer);
    }
    
    try {
      // Opciones para la petición API con cache inteligente
      const options = {
        params: {
          ordering: '-created_at', // Ordenar por fecha de creación descendente
          page_size: 10  // Solicitar 10 para tener más para elegir
        },
        _useCache: true,         // Usar cache si está disponible
        _cacheTTL: 5 * 60 * 1000 // 5 minutos de TTL para la cache
      };
      
      // Realizar la petición al API
      const response = await proformasService.getAll(options);
      console.log("Proformas cargadas:", response);
      
      // Limpiar el toast de carga si existe
      if (loadToastId) {
        toast.dismiss(loadToastId);
      }
      
      // Procesar los datos con mejor manejo de estructuras
      let proformasData = [];
      
      // Manejar diferentes formatos de respuesta del API
      if (response) {
        if (response.results && Array.isArray(response.results)) {
          proformasData = response.results;
        } else if (Array.isArray(response)) {
          proformasData = response;
        } else if (typeof response === 'object') {
          // Si es un objeto pero no tiene el formato esperado, intentar extraer datos
          const possibleArrays = Object.values(response).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            // Usar el array más grande que encontremos
            proformasData = possibleArrays.reduce((acc, arr) => 
              arr.length > acc.length ? arr : acc, []);
          }
        }
      }
      
      // Verificar si tenemos datos válidos
      if (!proformasData || proformasData.length === 0) {
        console.log("No se encontraron proformas en la respuesta");
        setProformas([]);
        setLastRefresh(Date.now());
        return;
      }
      
      // Filtrar para asegurar que solo tenemos proformas válidas
      const validProformas = proformasData.filter(p => 
        p && p.id && (p.numero || p.nombre) && p.estado);
      
      // Ordenar por fecha de creación descendente (más recientes primero)
      validProformas.sort((a, b) => {
        // Primero intentar ordenar por fecha de creación
        const dateA = new Date(a.created_at || a.fecha_emision || 0);
        const dateB = new Date(b.created_at || b.fecha_emision || 0);
        return dateB - dateA;
      });
      
      // Limitar a las 5 más recientes y transformar a formato UI
      const recientes = validProformas
        .slice(0, 5)
        .map(p => {
          // Preparar los datos en el formato que espera el componente
          const proformaId = typeof p.id === 'number' || typeof p.id === 'string' ? p.id : p.numero;
          
          // Extraer nombre del cliente con manejo de diferentes estructuras
          let clienteNombre = "Cliente sin nombre";
          let clienteInitials = "CN";
          
          if (p.cliente_detail && p.cliente_detail.nombre) {
            clienteNombre = p.cliente_detail.nombre;
          } else if (p.cliente_nombre) {
            clienteNombre = p.cliente_nombre;
          } else if (p.cliente && typeof p.cliente === 'object') {
            clienteNombre = p.cliente.nombre || p.cliente.name || "Cliente sin nombre";
          }
          
          // Generar iniciales para avatar
          if (clienteNombre && clienteNombre !== "Cliente sin nombre") {
            clienteInitials = clienteNombre
              .split(' ')
              .slice(0, 2)
              .map(n => n[0])
              .join('')
              .toUpperCase();
          }
          
          // Extraer información del vendedor
          let vendedor = "N/A";
          if (p.created_by) {
            if (p.created_by.first_name && p.created_by.last_name) {
              vendedor = `${p.created_by.first_name} ${p.created_by.last_name}`;
            } else if (p.created_by.username) {
              vendedor = p.created_by.username;
            } else if (typeof p.created_by === 'string') {
              vendedor = p.created_by;
            }
          } else if (p.created_by_username) {
            vendedor = p.created_by_username;
          }
          
          // Crear objeto con formato unificado
          return {
            id: proformaId,
            numero: p.numero || `PRO-${new Date().getFullYear()}-XXXX`,
            cliente: clienteNombre,
            clienteAvatar: clienteInitials,
            fecha: formatDate(p.fecha_emision),
            expira: formatDate(p.fecha_vencimiento),
            monto: parseFloat(p.total || 0),
            estado: p.estado,
            estadoLabel: p.estado_display || p.estado,
            vendedor: vendedor
          };
        });
      
      // Actualizar el estado con los datos procesados
      setProformas(recientes);
      setLastRefresh(Date.now());
      
    } catch (error) {
      console.error("Error al cargar proformas:", error);
      
      // Limpiar toast de carga si existe
      if (loadToastId) {
        toast.dismiss(loadToastId);
      }
      
      // Mostrar error al usuario solo si solicitamos mostrar toast
      if (showToast) {
        toast.error("No se pudieron cargar las proformas recientes");
      }
      
      // Guardar el error para mostrarlo en la UI
      setError({
        message: "No se pudieron cargar las proformas",
        details: error.message || "Error de conexión con el servidor"
      });
      
      // Mantener las proformas anteriores si existen
      if (proformas.length === 0) {
        setProformas([]);
      }
    } finally {
      setLoading(false);
    }
  }, [proformas.length]);

  // Función de recarga con protección contra clics rápidos
  const refreshData = useCallback(() => {
    const now = Date.now();
    // Evitar recargas múltiples en menos de 2 segundos
    if (now - lastRefresh < 2000) {
      toast.info("Espere unos segundos antes de recargar nuevamente");
      return;
    }
    
    toast.info("Actualizando proformas...", { id: "refresh-toast" });
    loadProformas(false).then(() => {
      toast.success("Proformas actualizadas", { id: "refresh-toast" });
    }).catch(() => {
      toast.error("Error al actualizar", { id: "refresh-toast" });
    });
  }, [lastRefresh, loadProformas]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Expiración</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="relative">
                    <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                    <div className="absolute inset-0 h-8 w-8 border-4 border-blue-200 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-gray-600 font-medium">Cargando proformas recientes...</span>
                  <span className="text-gray-400 text-sm">Esto puede tomar unos momentos</span>
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-red-50 rounded-lg">
                  <XCircle className="h-10 w-10 text-red-500" />
                  <p className="text-red-600 font-medium">{error.message}</p>
                  <p className="text-red-500 text-sm">{error.details}</p>
                  <div className="flex space-x-3 mt-2">
                    <Button onClick={refreshData} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reintentar
                    </Button>
                    <Button onClick={() => navigate('/enhancedproforma?new=true')}>
                      Nueva Proforma
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : proformas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                  <FileText className="h-16 w-16 text-gray-300 mb-3" />
                  <p className="text-gray-700 font-medium mb-1">No hay proformas disponibles</p>
                  <p className="text-gray-500 text-sm mb-4">Crea una nueva proforma para comenzar</p>
                  <div className="flex space-x-3">
                    <Button onClick={() => navigate('/enhancedproforma?new=true')} variant="default">
                      Nueva Proforma
                    </Button>
                    <Button onClick={refreshData} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualizar
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            proformas.map((proforma, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{proforma.numero}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                        {proforma.clienteAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <span>{proforma.cliente}</span>
                  </div>
                </TableCell>
                <TableCell>{proforma.fecha}</TableCell>
                <TableCell>{proforma.expira}</TableCell>
                <TableCell>{proforma.vendedor}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(proforma.monto)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(proforma.estado)}
                    <Badge 
                      variant="outline" 
                      className={`ml-2 capitalize ${getStatusColor(proforma.estado)}`}
                    >
                      {proforma.estadoLabel || proforma.estado}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/enhancedproforma?id=${proforma.id}`)}>
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/enhancedproforma?id=${proforma.id}`)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const id = proforma.id;
                        if (id) {
                          toast.info(`Duplicando proforma ${proforma.numero}...`);
                          proformasService.duplicar(id)
                            .then(() => {
                              toast.success("Proforma duplicada correctamente");
                              refreshData(); // Recargar datos
                            })
                            .catch(error => {
                              console.error("Error al duplicar:", error);
                              toast.error("Error al duplicar la proforma");
                            });
                        }
                      }}>
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Enviar por correo</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const id = proforma.id;
                        if (id) {
                          window.open(`${import.meta.env.VITE_API_URL || '/api/v1'}/proformas/proformas/${id}/exportar_pdf/`, '_blank');
                        }
                      }}>
                        Descargar PDF
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => {
                        const id = proforma.id;
                        if (id) {
                          if (window.confirm(`¿Está seguro de que quiere cancelar la proforma ${proforma.numero}?`)) {
                            toast.info(`Cancelando proforma ${proforma.numero}...`);
                            proformasService.cambiarEstado(id, 'cancelada')
                              .then(() => {
                                toast.success("Proforma cancelada");
                                refreshData(); // Recargar datos
                              })
                              .catch(error => {
                                console.error("Error al cancelar:", error);
                                toast.error("Error al cancelar la proforma");
                              });
                          }
                        }
                      }}>
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProformasDashboardTable;