import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Package, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';

// Componente para KPI con porcentaje de cambio
const KpiCard = ({ title, value, change, icon: Icon, description }) => {
  const isPositive = change > 0;
  const color = isPositive ? 'text-emerald-600' : 'text-rose-600';
  const bgColor = isPositive ? 'bg-emerald-50' : 'bg-rose-50';
  const iconColor = isPositive ? 'text-emerald-600' : 'text-rose-600';
  const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${bgColor}`}>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 pt-1">
          <div className={`flex items-center ${color}`}>
            <ChangeIcon className="h-4 w-4 mr-1" />
            <span>{Math.abs(change)}%</span>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para tabla de datos con ordenamiento
const DataTable = ({ data, columns }) => {
  const [sortField, setSortField] = useState('revenue');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const sortedData = [...data].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });
  
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.field} 
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                  onClick={() => handleSort(column.field)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortField === column.field ? (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td 
                    key={column.field} 
                    className="px-4 py-4 text-sm"
                  >
                    {column.render ? column.render(item) : item[column.field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Componente de estadísticas de gráfico con diseño minimalista
const ChartStatistic = ({ title, value, previousValue, color }) => {
  const percentage = ((value - previousValue) / previousValue) * 100;
  const isPositive = percentage > 0;
  
  // Simulación de datos para mini gráfico
  const generateChartData = () => {
    const points = [];
    for (let i = 0; i < 15; i++) {
      points.push(10 + Math.floor(Math.random() * 40));
    }
    return points;
  };
  
  const chartData = generateChartData();
  const maxValue = Math.max(...chartData);
  
  return (
    <div className="rounded-lg border p-4 h-full bg-white">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="text-2xl font-semibold">{value}</p>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isPositive ? '+' : ''}{percentage.toFixed(1)}%
        </div>
      </div>
      
      {/* Mini chart */}
      <div className="h-12 mt-3 flex items-end space-x-1">
        {chartData.map((point, index) => (
          <div 
            key={index}
            className={`flex-1 ${color}`}
            style={{ height: `${(point / maxValue) * 100}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

// Datos simulados para la aplicación
const sampleProducts = [
  { id: 1, name: 'Widget Pro', category: 'Electronics', stock: 150, price: 129.99, revenue: 45496.5, status: 'In Stock' },
  { id: 2, name: 'SuperBook Laptop', category: 'Computers', stock: 32, price: 899.99, revenue: 125998.6, status: 'Low Stock' },
  { id: 3, name: 'UltraPhone X', category: 'Phones', stock: 65, price: 699.99, revenue: 97998.6, status: 'In Stock' },
  { id: 4, name: 'PowerTab 10"', category: 'Tablets', stock: 28, price: 349.99, revenue: 20999.4, status: 'Low Stock' },
  { id: 5, name: 'AudioPods', category: 'Audio', stock: 200, price: 89.99, revenue: 35996, status: 'In Stock' },
  { id: 6, name: 'SmartWatch 5', category: 'Wearables', stock: 45, price: 199.99, revenue: 15999.2, status: 'In Stock' },
  { id: 7, name: 'HomeHub', category: 'Smart Home', stock: 0, price: 129.99, revenue: 12999, status: 'Out of Stock' },
  { id: 8, name: 'Gaming Console Z', category: 'Gaming', stock: 12, price: 499.99, revenue: 29999.4, status: 'Low Stock' },
];

// Columnas para la tabla
const productColumns = [
  { field: 'name', label: 'Producto' },
  { field: 'category', label: 'Categoría' },
  { 
    field: 'stock', 
    label: 'Inventario',
    render: (item) => (
      <div className="flex items-center">
        <span className="mr-2">{item.stock}</span>
        <div className={`w-2 h-2 rounded-full ${
          item.stock === 0 ? 'bg-red-500' : 
          item.stock < 30 ? 'bg-yellow-500' : 
          'bg-green-500'
        }`}></div>
      </div>
    )
  },
  { 
    field: 'price', 
    label: 'Precio',
    render: (item) => `$${item.price.toFixed(2)}`
  },
  { 
    field: 'revenue', 
    label: 'Ingresos',
    render: (item) => `$${item.revenue.toFixed(2)}`
  },
  { 
    field: 'status', 
    label: 'Estado',
    render: (item) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        item.status === 'In Stock' ? 'bg-green-100 text-green-800' : 
        item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 
        'bg-red-100 text-red-800'
      }`}>
        {item.status}
      </span>
    )
  },
];

// Fechas para filtro
const dateRanges = [
  { label: 'Hoy', value: 'today' },
  { label: 'Ayer', value: 'yesterday' },
  { label: 'Esta semana', value: 'this_week' },
  { label: 'Este mes', value: 'this_month' },
  { label: 'Último trimestre', value: 'last_quarter' },
  { label: 'Este año', value: 'this_year' },
  { label: 'Personalizado', value: 'custom' },
];

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('this_month');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Simulación de carga de datos
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="container mx-auto p-6 max-w-[1200px]">
      <div className="space-y-6">
        {/* Header con filtros */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Análisis de Ventas</h1>
            <p className="text-gray-500 mt-1">Análisis detallado del rendimiento de ventas y productos</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de fecha */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="pl-3 pr-8 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none h-4 w-4 text-gray-400" />
            </div>
            
            {/* Botón de exportar */}
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </Button>
            
            {/* Botón de actualizar */}
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
            </Button>
          </div>
        </div>
        
        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Ventas Totales" 
            value="$45,231.89" 
            change={12.2} 
            icon={DollarSign}
            description="vs. mes anterior" 
          />
          <KpiCard 
            title="Nuevos Clientes" 
            value="356" 
            change={8.1} 
            icon={Users}
            description="vs. mes anterior" 
          />
          <KpiCard 
            title="Órdenes" 
            value="1,254" 
            change={-3.2} 
            icon={ShoppingCart}
            description="vs. mes anterior" 
          />
          <KpiCard 
            title="Productos Vendidos" 
            value="8,594" 
            change={15.3} 
            icon={Package}
            description="vs. mes anterior" 
          />
        </div>

        {/* Stats with mini charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ChartStatistic 
            title="Tasa de Conversión" 
            value="3.6%" 
            previousValue={3.2}
            color="bg-blue-500" 
          />
          <ChartStatistic 
            title="Valor Promedio de Orden" 
            value="$89.42" 
            previousValue={78.65}
            color="bg-purple-500" 
          />
          <ChartStatistic 
            title="Tasa de Devolución" 
            value="2.1%" 
            previousValue={2.8}
            color="bg-emerald-500" 
          />
        </div>
        
        {/* Graph placeholder */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Evolución de Ventas</CardTitle>
                <CardDescription>Tendencia de ventas por producto</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Ventas</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Ganancias</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Gráfico de Ventas</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-md">
                  Aquí normalmente se visualizaría un gráfico interactivo con la evolución de ventas por producto a lo largo del tiempo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Products data table */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Productos más Vendidos</CardTitle>
                  <CardDescription>
                    Una lista de los productos con mejor rendimiento por ingresos
                  </CardDescription>
                </div>
                <div className="flex items-center w-full sm:w-auto">
                  <div className="relative flex-grow sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="ml-2">
                    <Filter className="h-4 w-4 mr-1" />
                    <span>Filtros</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable 
                data={sampleProducts.filter(product => 
                  product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.category.toLowerCase().includes(searchTerm.toLowerCase())
                )} 
                columns={productColumns} 
              />
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando <strong>{sampleProducts.length}</strong> de <strong>{sampleProducts.length}</strong> productos
              </div>
              <div className="flex items-center space-x-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >
                  Anterior
                </Button>
                <div className="text-sm">Página 1 de 1</div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >
                  Siguiente
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;