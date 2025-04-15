import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
// Ya tenemos el Dialog, usaremos un enfoque diferente sin AlertDialog
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle
// } from "@/components/ui/alert-dialog";
import { proformasService } from '@/services/api';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { formatDate } from '@/lib/utils';

export default function ProformasList({ onLoadProforma, onProformasLoaded }) {
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Verificar conexión al backend
  const checkBackendConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(window._baseApiUrl || 'http://localhost:8000/api/v1/', {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error("Error conectando al backend. Status:", response.status);
        toast.error("Error conectando al backend. Verifique que el servidor esté funcionando.");
        return false;
      }
      
      console.log("Conexión al backend verificada correctamente.");
      return true;
    } catch (error) {
      console.error("Error verificando conexión al backend:", error);
      toast.error(`Error conectando al backend: ${error.message || "Verifique que el servidor esté funcionando"}`);
      return false;
    }
  };
  
  // Cargar proformas al montar el componente
  useEffect(() => {
    const initializeComponent = async () => {
      // Primero verificamos la conexión al backend
      const isConnected = await checkBackendConnection();
      
      if (isConnected) {
        // Si la conexión es exitosa, cargamos las proformas
        loadProformas();
      }
    };
    
    initializeComponent();
  }, []);

  // Función para cargar proformas
  const loadProformas = async () => {
    setLoading(true);
    try {
      console.log("Solicitando proformas al servidor...");
      const response = await proformasService.getAll();
      console.log("Respuesta del servidor:", response);
      
      // Manejar diferentes formatos de respuesta
      let proformasData = [];
      if (response.results && Array.isArray(response.results)) {
        proformasData = response.results;
      } else if (Array.isArray(response)) {
        proformasData = response;
      } else if (response && typeof response === 'object') {
        // Por si devuelve un objeto no esperado
        proformasData = Object.values(response).filter(item => typeof item === 'object');
      }
      
      console.log("Proformas procesadas:", proformasData);
      setProformas(proformasData);
      
      if (proformasData.length === 0) {
        toast.info("No hay proformas guardadas");
      }
      
      // Llamar al callback con las proformas cargadas
      if (onProformasLoaded && typeof onProformasLoaded === 'function') {
        onProformasLoaded(response.results || response);
      }
    } catch (error) {
      console.error("Error al cargar proformas:", error);
      toast.error("No se pudieron cargar las proformas. " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  // Filtrar proformas según término de búsqueda
  const filteredProformas = proformas.filter(proforma => 
    proforma.numero?.toString().includes(searchTerm) ||
    proforma.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para obtener clase de badge según estado
  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'borrador':
        return 'bg-yellow-200 text-yellow-800';
      case 'enviada':
        return 'bg-blue-200 text-blue-800';
      case 'aprobada':
        return 'bg-green-200 text-green-800';
      case 'rechazada':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  // Función para manejar clic en una proforma
  const handleProformaClick = (proforma) => {
    if (onLoadProforma) {
      onLoadProforma(proforma.id);
      setOpenDialog(false);
    } else {
      navigate(`/proformas/editar/${proforma.id}`);
    }
  };
  
  // Función para eliminar una proforma
  const handleDeleteProforma = async (id) => {
    if (!id) return;
    
    setDeleting(true);
    try {
      await proformasService.delete(id);
      toast.success("Proforma eliminada correctamente");
      
      // Actualizar la lista de proformas (quitar la eliminada)
      setProformas(prev => prev.filter(p => p.id !== id));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Error al eliminar proforma:", error);
      toast.error("No se pudo eliminar la proforma");
    } finally {
      setDeleting(false);
    }
  };

  // Ahora usamos formatDate importado desde utils.js

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Proformas guardadas</h3>
            <Button variant="ghost" size="sm" onClick={loadProformas} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Actualizar</span>
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Cargando proformas...</p>
            </div>
          ) : proformas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {proformas.slice(0, 8).map((proforma) => (
                <div 
                  key={proforma.id} 
                  className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onLoadProforma(proforma.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{proforma.numero || proforma.id}</div>
                    <Badge 
                      variant="outline" 
                      className={`${
                        proforma.estado === 'borrador' ? 'bg-gray-100 text-gray-800' : 
                        proforma.estado === 'enviada' ? 'bg-blue-100 text-blue-800' : 
                        proforma.estado === 'aprobada' ? 'bg-green-100 text-green-800' : 
                        proforma.estado === 'rechazada' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {proforma.estado || 'borrador'}
                    </Badge>
                  </div>
                  {proforma.nombre && (
                    <div className="text-sm text-gray-700 mt-1 font-medium truncate">{proforma.nombre}</div>
                  )}
                  <div className="text-sm text-gray-600 mt-1 truncate">{proforma.cliente_nombre || 'Cliente'}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatDate(proforma.fecha_emision) || 'Fecha N/D'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No hay proformas guardadas.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button 
        variant="outline" 
        onClick={() => {
          setOpenDialog(true);
          loadProformas(); // Cargar proformas cada vez que se abre el diálogo
        }}
        className="mb-4"
      >
        Ver Proformas Guardadas
      </Button>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Proformas Guardadas</DialogTitle>
            <DialogDescription>
              Seleccione una proforma para cargarla y editarla
            </DialogDescription>
          </DialogHeader>
          
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Buscar por número o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadProformas}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Recargar"}
            </Button>
          </div>
          
          <ScrollArea className="flex-grow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Cargando proformas...</TableCell>
                  </TableRow>
                ) : filteredProformas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">No se encontraron proformas</TableCell>
                  </TableRow>
                ) : (
                  filteredProformas.map((proforma) => (
                    <TableRow key={proforma.id} className="hover:bg-gray-50 cursor-pointer">
                      <TableCell>{proforma.numero}</TableCell>
                      <TableCell>{proforma.nombre || ''}</TableCell>
                      <TableCell>{proforma.cliente?.nombre}</TableCell>
                      <TableCell>{formatDate(proforma.fecha_emision)}</TableCell>
                      <TableCell>{formatCurrency(proforma.total)}</TableCell>
                      <TableCell>
                        <Badge className={getBadgeClass(proforma.estado)}>
                          {proforma.estado.charAt(0).toUpperCase() + proforma.estado.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleProformaClick(proforma)}
                          >
                            Editar
                          </Button>
                          {/* Solo permitir eliminar proformas en borrador */}
                          {proforma.estado === 'borrador' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                              onClick={() => setConfirmDeleteId(proforma.id)}
                              disabled={deleting}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar proforma */}
      <Dialog 
        open={confirmDeleteId !== null} 
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¿Está seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Esta proforma se eliminará permanentemente del sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDeleteId(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleDeleteProforma(confirmDeleteId)}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}