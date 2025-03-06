// HComprasTable.jsx

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

const HComprasTable = ({
  compras,
  isLoading,
  currentPage,
  totalPages,
  setCurrentPage,
  handleViewDetails,
  handleOpenModal,
  handleDelete
}) => {

  // Función para formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
        </div>
      ) : (
        <>
          <div className="rounded-lg border shadow-sm overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[120px]">Factura</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="w-[100px]">Fecha</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">IVA</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[160px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compras.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No se encontraron registros
                    </TableCell>
                  </TableRow>
                ) : (
                  compras.map((compra) => (
                    <TableRow key={compra.id}>
                      <TableCell className="font-medium">{compra.factura}</TableCell>
                      <TableCell>{compra.proveedor_detail?.nombre || 'N/A'}</TableCell>
                      <TableCell>{compra.producto_detail?.nombre || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(compra.fecha), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-right">{compra.cantidad || 1}</TableCell>
                      <TableCell className="text-right">{formatCurrency(compra.valor || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(compra.iva || 0)}</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(((compra.valor || 0) * (compra.cantidad || 1)) + (compra.iva || 0))}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleViewDetails(compra)}
                            title="Ver detalles"
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(compra)}
                            title="Editar"
                            className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(compra.id)}
                            title="Eliminar"
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default HComprasTable;