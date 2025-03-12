import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { X, Edit, Trash, Eye, Plus, Save } from 'lucide-react';

// Datos de ejemplo
const initialInventory = [
  { id: 1, code: 'INV-001', name: 'Laptop Dell XPS 13', category: 'Electrónicos', quantity: 15, price: 1299.99, status: 'En stock' },
  { id: 2, code: 'INV-002', name: 'Monitor LG 27"', category: 'Electrónicos', quantity: 8, price: 349.99, status: 'En stock' },
  { id: 3, code: 'INV-003', name: 'Teclado Logitech K380', category: 'Accesorios', quantity: 25, price: 49.99, status: 'En stock' },
  { id: 4, code: 'INV-004', name: 'Mouse Logitech MX Master', category: 'Accesorios', quantity: 12, price: 89.99, status: 'En stock' },
  { id: 5, code: 'INV-005', name: 'Audífonos Sony WH-1000XM4', category: 'Audio', quantity: 5, price: 349.99, status: 'Bajo stock' },
  { id: 6, code: 'INV-006', name: 'Tablet Samsung Galaxy Tab S7', category: 'Electrónicos', quantity: 10, price: 649.99, status: 'En stock' },
  { id: 7, code: 'INV-007', name: 'Impresora HP LaserJet Pro', category: 'Oficina', quantity: 3, price: 299.99, status: 'Bajo stock' },
  { id: 8, code: 'INV-008', name: 'Disco Duro Externo 2TB', category: 'Almacenamiento', quantity: 0, price: 89.99, status: 'Agotado' },
];

const categories = [
  'Electrónicos', 'Accesorios', 'Audio', 'Oficina', 'Almacenamiento'
];

const ProductCard = ({ product, onEdit, onDelete, onView }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'En stock':
        return 'bg-green-100 text-green-800';
      case 'Bajo stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Agotado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 bg-gray-50 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">{product.name}</CardTitle>
            <CardDescription className="text-xs">Código: {product.code}</CardDescription>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(product.status)}`}>
            {product.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Categoría:</span>
            <span className="text-sm font-medium">{product.category}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Cantidad:</span>
            <span className="text-sm font-medium">{product.quantity} unidades</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Precio:</span>
            <span className="text-sm font-bold">${product.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-end space-x-2 mt-4 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => onView(product)}>
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button variant="outline" size="sm" className="text-red-600" onClick={() => onDelete(product)}>
              <Trash className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    product ? 
    { ...product } : 
    { 
      code: `INV-${String(Date.now()).slice(-3)}`, 
      name: '', 
      category: '', 
      quantity: 0, 
      price: 0, 
      status: 'En stock' 
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => handleSelectChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre del producto</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => handleSelectChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="En stock">En stock</SelectItem>
            <SelectItem value="Bajo stock">Bajo stock</SelectItem>
            <SelectItem value="Agotado">Agotado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {product ? 'Actualizar producto' : 'Guardar producto'}
        </Button>
      </div>
    </form>
  );
};

const InventoryManagement = () => {
  const [inventory, setInventory] = useState(initialInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewedProduct, setViewedProduct] = useState(null);
  
  // Filtrar inventario por término de búsqueda
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejo de formulario de producto
  const openProductForm = (product = null) => {
    setCurrentProduct(product);
    setIsFormOpen(true);
  };

  const closeProductForm = () => {
    setCurrentProduct(null);
    setIsFormOpen(false);
  };

  const handleSubmitProduct = (productData) => {
    if (currentProduct) {
      // Actualizar producto existente
      setInventory(prev => 
        prev.map(item => item.id === currentProduct.id ?
          {...productData, id: currentProduct.id} : item
        )
      );
    } else {
      // Agregar nuevo producto
      const newId = Math.max(...inventory.map(item => item.id), 0) + 1;
      setInventory(prev => [...prev, {...productData, id: newId}]);
    }
    closeProductForm();
  };

  // Ver detalles del producto
  const viewProductDetails = (product) => {
    setViewedProduct(product);
    setIsViewDialogOpen(true);
  };

  // Eliminar producto
  const deleteProduct = (productId) => {
    setInventory(prev => prev.filter(item => item.id !== productId));
  };

  // Formato de moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
            <p className="text-sm text-gray-500">Administra el inventario de productos</p>
          </div>
          <Button onClick={() => openProductForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar producto
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:w-auto sm:flex-1">
            <Input
              placeholder="Buscar por nombre, código o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <div className="grid w-full grid-cols-2 border rounded-md p-1 gap-1">
              <button 
                onClick={() => setActiveTab('table')} 
                className={`px-3 py-1.5 text-sm rounded-sm ${activeTab === 'table' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
              >
                Tabla
              </button>
              <button 
                onClick={() => setActiveTab('cards')} 
                className={`px-3 py-1.5 text-sm rounded-sm ${activeTab === 'cards' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
              >
                Tarjetas
              </button>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {activeTab === 'table' && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                          No se encontraron productos
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.code}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell className="text-right">{product.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              product.status === 'En stock' 
                                ? 'bg-green-100 text-green-800' 
                                : product.status === 'Bajo stock'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {product.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                onClick={() => viewProductDetails(product)} 
                                variant="ghost" 
                                size="icon"
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                onClick={() => openProductForm(product)} 
                                variant="ghost" 
                                size="icon"
                                title="Editar producto"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-600"
                                title="Eliminar producto"
                                onClick={() => {
                                  if (confirm(`¿Está seguro de eliminar el producto ${product.name}? Esta acción no se puede deshacer.`)) {
                                    deleteProduct(product.id);
                                  }
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeTab === 'cards' && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInventory.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No se encontraron productos
                  </div>
                ) : (
                  filteredInventory.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onView={viewProductDetails}
                      onEdit={openProductForm}
                      onDelete={() => {
                        if (confirm(`¿Está seguro de eliminar el producto ${product.name}? Esta acción no se puede deshacer.`)) {
                          deleteProduct(product.id);
                        }
                      }}
                    />
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Formulario modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{currentProduct ? 'Editar producto' : 'Agregar nuevo producto'}</DialogTitle>
            <DialogDescription>
              {currentProduct
                ? 'Actualiza la información del producto existente.'
                : 'Completa el formulario para agregar un nuevo producto al inventario.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={currentProduct}
            onSubmit={handleSubmitProduct}
            onCancel={closeProductForm}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de vista detallada */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          {viewedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{viewedProduct.name}</DialogTitle>
                <DialogDescription>
                  Detalles completos del producto
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Código:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">{viewedProduct.code}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Categoría:</span>
                  <span>{viewedProduct.category}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Precio unitario:</span>
                  <span className="font-bold">{formatCurrency(viewedProduct.price)}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Cantidad en stock:</span>
                  <span>{viewedProduct.quantity} unidades</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Valor total en inventario:</span>
                  <span className="font-bold">{formatCurrency(viewedProduct.price * viewedProduct.quantity)}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    viewedProduct.status === 'En stock'
                      ? 'bg-green-100 text-green-800'
                      : viewedProduct.status === 'Bajo stock'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {viewedProduct.status}
                  </span>
                </div>
              </div>

              <DialogFooter className="mt-6 flex justify-between sm:justify-between gap-2">
                <Button variant="outline" onClick={() => openProductForm(viewedProduct)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="default" onClick={() => setIsViewDialogOpen(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;