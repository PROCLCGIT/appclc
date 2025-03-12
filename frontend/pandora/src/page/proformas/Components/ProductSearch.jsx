// src/page/proformas/Components/ProductSearch.jsx
import { useState, useEffect } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getProducts } from '../Services/proformaService';

/**
 * Componente para buscar productos y agregarlos a la proforma
 */
const ProductSearch = ({ onProductSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtrar productos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.length < 2) {
      setFilteredProducts([]);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(lowerCaseSearch) || 
      product.id.toLowerCase().includes(lowerCaseSearch)
    );
    
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Manejar la selección de un producto
  const handleProductSelect = (product) => {
    onProductSelected(product);
    setSearchTerm(''); // Limpiar búsqueda después de seleccionar
  };

  return (
    <Tabs defaultValue="search" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="search">Búsqueda de Productos</TabsTrigger>
        <TabsTrigger value="inventory">Inventario</TabsTrigger>
      </TabsList>
      
      <TabsContent value="search" className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar producto por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          
          {searchTerm.length > 0 && filteredProducts.length === 0 && !loading && (
            <div className="mt-2 text-sm text-gray-500">
              No se encontraron productos que coincidan con "{searchTerm}".
            </div>
          )}
          
          {searchTerm.length > 0 && filteredProducts.length > 0 && (
            <ScrollArea className="h-64 border rounded-md mt-2 shadow-sm">
              <div className="p-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-2 hover:bg-blue-50 rounded-md cursor-pointer flex justify-between items-center border-b last:border-0"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.id}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm font-semibold text-blue-600 mr-3">
                        ${product.price.toFixed(2)}
                      </div>
                      {product.stock !== null && (
                        <div className="text-sm">
                          <span className="text-gray-500">Stock: </span>
                          <span className={product.stock <= 5 ? "text-amber-600 font-medium" : "text-green-600"}>
                            {product.stock}
                            {product.stock <= 5 && (
                              <AlertTriangle className="inline-block ml-1 w-3 h-3 text-amber-500" />
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="inventory">
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="group">
                  <TableCell className="font-mono text-sm">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {product.stock !== null ? (
                      <span className={product.stock <= 5 ? "text-amber-600 font-medium" : ""}>
                        {product.stock}
                        {product.stock <= 5 && (
                          <AlertTriangle className="inline-block ml-1 w-3 h-3 text-amber-500" />
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button 
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 text-sm bg-blue-600 text-white rounded-md"
                      onClick={() => handleProductSelect(product)}
                    >
                      Agregar
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProductSearch;