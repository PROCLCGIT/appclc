import React from "react";
import { SearchBar, EmptyState } from "@/components/shared";
import { proformasService } from "@/services/api";
import { useAsyncSearch } from "@/lib/hooks";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, FileBarChart, Search } from "lucide-react";
import useDelayedFlag from "@/hooks/useDelayedFlag";
import { SkeletonTable } from "@/components/SkeletonList";

/**
 * A component that demonstrates using the useAsyncSearch hook for product search
 * with improved loading UX using skeletons instead of spinners
 */
const SearchableProductList = ({ onSelectProduct }) => {
  // Use the useAsyncSearch hook to handle async search with debounce
  const { 
    searchTerm, 
    results, 
    isLoading, 
    error, 
    hasSearched,
    handleSearchChange, 
    clearSearch 
  } = useAsyncSearch(
    // The search function - returns a promise with search results
    async (term) => {
      const response = await proformasService.buscarProductos(term);
      return response || [];
    },
    {
      debounceTime: 400, // Wait 400ms before searching
      minChars: 2 // Minimum characters to trigger search
    }
  );

  // Use delayed flag to avoid loading flash
  const showSkeletons = useDelayedFlag(isLoading, 300);

  // Render product table
  const renderProductTable = () => (
    <Table>
      <TableHeader className="bg-gray-50">
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead className="text-right">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((product) => (
          <TableRow key={product.id} className="hover:bg-gray-50">
            <TableCell className="font-medium">{product.nombre}</TableCell>
            <TableCell>{product.codigo || "—"}</TableCell>
            <TableCell>${product.precio?.toFixed(2) || "0.00"}</TableCell>
            <TableCell className="text-right">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onSelectProduct(product)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Seleccionar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar productos por nombre o código..."
          onClear={clearSearch}
          disabled={isLoading}
          autoFocus
        />
      </div>

      {showSkeletons && (
        <div className="mt-6">
          <SkeletonTable
            rows={5}
            columns={4}
            showHeader={true}
          />
        </div>
      )}

      {!showSkeletons && error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          <p className="font-medium">Error al buscar productos</p>
          <p className="text-sm mt-1">{error.message || "Ocurrió un error inesperado"}</p>
        </div>
      )}

      {!showSkeletons && !error && hasSearched && results.length === 0 && (
        <EmptyState
          icon={<Search className="h-10 w-10 text-gray-400" />}
          title="No se encontraron productos"
          description={`No hay resultados para "${searchTerm}". Intente con otra búsqueda.`}
          action={{
            label: "Limpiar búsqueda",
            onClick: clearSearch,
            variant: "outline"
          }}
        />
      )}

      {!showSkeletons && !error && !hasSearched && (
        <EmptyState
          icon={<FileBarChart className="h-10 w-10 text-blue-400" />}
          title="Busque productos"
          description="Ingrese al menos 2 caracteres para buscar productos por nombre o código."
        />
      )}

      {!showSkeletons && !error && results.length > 0 && renderProductTable()}
    </div>
  );
};

export default SearchableProductList;