import React from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RefreshCw, MoreHorizontal, CheckCircle2, Clock8, FileText, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import PropTypes from 'prop-types';

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

/**
 * Componente de tabla para mostrar proformas en el dashboard
 * Recibe datos como props en lugar de solicitarlos directamente
 */
const ProformasDashboardTable = ({ proformas = [], loading = false, onRefresh }) => {
  const navigate = useNavigate();

  // Función para duplicar una proforma
  const handleDuplicate = (proforma) => {
    const id = proforma.id;
    if (id) {
      toast.info(`Duplicando proforma ${proforma.numero}...`);
      
      // Usamos ProformaService desde el contexto de React Query
      import('@/services/classes/ProformaService').then(({ ProformaService }) => {
        const service = new ProformaService();
        service.duplicateProforma(id)
          .then(() => {
            toast.success("Proforma duplicada correctamente");
            if (onRefresh) onRefresh(); // Llamar a la función de recarga proporcionada por el padre
          })
          .catch(error => {
            console.error("Error al duplicar:", error);
            toast.error("Error al duplicar la proforma");
          });
      });
    }
  };

  // Función para cambiar el estado de una proforma
  const handleChangeStatus = (proforma, newStatus) => {
    const id = proforma.id;
    if (id) {
      if (window.confirm(`¿Está seguro de que quiere cambiar el estado de la proforma ${proforma.numero} a ${newStatus}?`)) {
        toast.info(`Cambiando estado de proforma ${proforma.numero}...`);
        
        import('@/services/classes/ProformaService').then(({ ProformaService }) => {
          const service = new ProformaService();
          service.executeAction(id, 'cambiar_estado', { estado: newStatus })
            .then(() => {
              toast.success(`Proforma ${newStatus} correctamente`);
              if (onRefresh) onRefresh();
            })
            .catch(error => {
              console.error("Error al cambiar estado:", error);
              toast.error(`Error al cambiar el estado de la proforma a ${newStatus}`);
            });
        });
      }
    }
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
                    <Button onClick={onRefresh} variant="outline">
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
                      <DropdownMenuItem onClick={() => handleDuplicate(proforma)}>
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
                      <DropdownMenuItem className="text-red-600" onClick={() => handleChangeStatus(proforma, 'cancelada')}>
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

// Definir las PropTypes para el componente
ProformasDashboardTable.propTypes = {
  proformas: PropTypes.array,
  loading: PropTypes.bool,
  onRefresh: PropTypes.func
};

export default ProformasDashboardTable;