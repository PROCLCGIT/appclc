import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    loadProformas();
  }, []);

  const loadProformas = async () => {
    setLoading(true);
    try {
      const response = await proformasService.getAll();
      console.log("Proformas cargadas:", response);
      
      // Procesar los datos
      let proformasData = [];
      if (response.results && Array.isArray(response.results)) {
        proformasData = response.results;
      } else if (Array.isArray(response)) {
        proformasData = response;
      }
      
      // Limitar a las 5 más recientes
      const recientes = proformasData
        .slice(0, 5)
        .map(p => {
          // Preparar los datos en el formato que espera el componente
          // Asegurarse de usar el ID real de la base de datos, no el número de proforma
          const proformaId = typeof p.id === 'number' ? p.id : p.id || p.numero;
          console.log("Procesando proforma para dashboard:", p.numero, "ID:", proformaId);
          
          return {
            id: proformaId, // Usar el ID real para navegación
            numero: p.numero,
            cliente: p.cliente_nombre || (p.cliente ? p.cliente.nombre : "Cliente sin nombre"),
            clienteAvatar: p.cliente_nombre ? 
              p.cliente_nombre.split(' ').slice(0, 2).map(n => n[0]).join('') : 
              "CN",
            fecha: formatDate(p.fecha_emision),
            expira: formatDate(p.fecha_vencimiento),
            monto: p.total,
            estado: p.estado,
            vendedor: p.created_by ? `${p.created_by.first_name} ${p.created_by.last_name}` : "N/A"
          };
        });
      
      setProformas(recientes);
    } catch (error) {
      console.error("Error al cargar proformas:", error);
      toast.error("No se pudieron cargar las proformas recientes");
      setProformas([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadProformas();
  };

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
              <TableCell colSpan={8} className="text-center py-4">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  <span>Cargando proformas...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : proformas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                <div className="flex flex-col items-center justify-center p-4">
                  <FileText className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500 mb-1">No hay proformas disponibles</p>
                  <p className="text-gray-400 text-sm mb-4">Crea una nueva proforma para comenzar</p>
                  <Button onClick={() => navigate('/enhancedproforma?new=true')}>
                    Nueva Proforma
                  </Button>
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
                      className={`ml-2 ${getStatusColor(proforma.estado)}`}
                    >
                      {proforma.estado}
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