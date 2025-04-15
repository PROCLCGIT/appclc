import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { RefreshCw, ArrowRight, Eye, Edit, Copy, FileText } from "lucide-react";

const ProformasRecientes = ({ proformas, loading, onLoadProforma, onRefresh }) => {
  // Función para formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Obtener color de estado
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
      case "expirada":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Proformas Recientes</CardTitle>
            <CardDescription>
              Últimas proformas guardadas en el sistema
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualizar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              Ver todas
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Emisión</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
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
              ) : proformas.length > 0 ? (
                proformas.slice(0, 5).map((proforma) => (
                  <TableRow key={proforma.id}>
                    <TableCell className="font-medium">{proforma.numero || `#${proforma.id}`}</TableCell>
                    <TableCell>{proforma.nombre || ''}</TableCell>
                    <TableCell>{proforma.cliente_nombre || 'Cliente sin nombre'}</TableCell>
                    <TableCell>{formatDate(proforma.fecha_emision)}</TableCell>
                    <TableCell>{formatDate(proforma.fecha_vencimiento)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(proforma.total || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(proforma.estado)}
                      >
                        {proforma.estado || 'borrador'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onLoadProforma(proforma.id)}
                          title="Ver proforma"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onLoadProforma(proforma.id)}
                          title="Editar proforma"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Duplicar proforma"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Exportar PDF"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    <span>No hay proformas guardadas.</span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProformasRecientes; 