import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar as CalendarIcon,
  Car,
  MapPin,
  Fuel,
  Wrench,
  Clock,
  AlertCircle,
  Check,
  Search,
  Download,
  Filter,
  PlusCircle,
  BarChart4,
  LineChart,
  Clipboard,
  FileText
} from "lucide-react";

// Componente para mostrar vehículos en el mapa
const VehicleMapMarker = ({ vehicle }) => {
  return (
    <div className={`p-2 rounded-md ${
      vehicle.status === 'activo' 
        ? 'bg-green-100 border border-green-300' 
        : vehicle.status === 'mantenimiento'
        ? 'bg-amber-100 border border-amber-300'
        : 'bg-red-100 border border-red-300'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded-full ${
          vehicle.status === 'activo' ? 'bg-green-500' 
          : vehicle.status === 'mantenimiento' ? 'bg-amber-500'
          : 'bg-red-500'
        }`}>
          <Car className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-sm">{vehicle.placa}</p>
          <p className="text-xs text-gray-500">{vehicle.modelo}</p>
        </div>
      </div>
    </div>
  );
};

// Componente para cada vehículo en la lista
const VehicleCard = ({ vehicle, onSelectVehicle }) => {
  return (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelectVehicle(vehicle)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              vehicle.status === 'activo' ? 'bg-green-100 text-green-600' 
              : vehicle.status === 'mantenimiento' ? 'bg-amber-100 text-amber-600'
              : 'bg-red-100 text-red-600'
            }`}>
              <Car className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">{vehicle.placa}</h3>
              <p className="text-sm text-gray-500">{vehicle.modelo} ({vehicle.año})</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${
              vehicle.status === 'activo' ? 'text-green-600' 
              : vehicle.status === 'mantenimiento' ? 'text-amber-600'
              : 'text-red-600'
            }`}>
              {vehicle.status === 'activo' ? 'Activo' 
               : vehicle.status === 'mantenimiento' ? 'En Mantenimiento'
               : 'Fuera de Servicio'}
            </p>
            <p className="text-xs text-gray-500 flex items-center justify-end mt-1">
              <MapPin className="h-3 w-3 mr-1" /> {vehicle.ubicacion}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para entradas de mantenimiento
const MaintenanceEntry = ({ entry }) => {
  return (
    <div className={`p-3 rounded-md border-l-4 mb-3 ${
      entry.tipo === 'preventivo' ? 'bg-blue-50 border-blue-400' 
      : entry.tipo === 'correctivo' ? 'bg-amber-50 border-amber-400'
      : 'bg-red-50 border-red-400'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-800">{entry.descripcion}</h4>
          <p className="text-sm text-gray-600 mt-1">
            Vehículo: {entry.placa} | Técnico: {entry.tecnico}
          </p>
        </div>
        <div className="text-right">
          <p className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            entry.tipo === 'preventivo' ? 'bg-blue-100 text-blue-800' 
            : entry.tipo === 'correctivo' ? 'bg-amber-100 text-amber-800'
            : 'bg-red-100 text-red-800'
          }`}>
            {entry.tipo === 'preventivo' ? 'Preventivo' 
             : entry.tipo === 'correctivo' ? 'Correctivo'
             : 'Emergencia'}
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center justify-end">
            <Clock className="h-3 w-3 mr-1" />
            {entry.fecha}
          </p>
        </div>
      </div>
      {entry.estado && (
        <div className="mt-2 flex justify-between">
          <p className="text-xs text-gray-500">Costo: ${entry.costo}</p>
          <p className={`text-xs font-medium flex items-center ${
            entry.estado === 'completado' ? 'text-green-600' 
            : entry.estado === 'en progreso' ? 'text-blue-600'
            : 'text-gray-600'
          }`}>
            {entry.estado === 'completado' ? (
              <Check className="h-3 w-3 mr-1" />
            ) : entry.estado === 'en progreso' ? (
              <Clock className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            {entry.estado}
          </p>
        </div>
      )}
    </div>
  );
};

// Componente para consumo de combustible
const FuelConsumptionEntry = ({ entry }) => {
  return (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="flex items-center">
        <div className="p-2 bg-purple-100 rounded-full text-purple-600 mr-3">
          <Fuel className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-sm">{entry.fecha}</p>
          <p className="text-xs text-gray-500">{entry.placa} - {entry.conductor}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm">{entry.litros} L</p>
        <p className="text-xs text-gray-500">${entry.costo}</p>
      </div>
    </div>
  );
};

const Testing19 = () => {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Datos de muestra
  const mockVehicles = [
    { id: 1, placa: 'ABC-123', modelo: 'Toyota Hilux', año: 2021, status: 'activo', ubicacion: 'Oficina Central', ultimoMantenimiento: '15/04/2023', proximoMantenimiento: '15/07/2023', kilometraje: 45680, conductor: 'Juan Pérez' },
    { id: 2, placa: 'DEF-456', modelo: 'Ford Ranger', año: 2020, status: 'mantenimiento', ubicacion: 'Taller Mecánico', ultimoMantenimiento: '02/05/2023', proximoMantenimiento: '02/08/2023', kilometraje: 67890, conductor: 'María López' },
    { id: 3, placa: 'GHI-789', modelo: 'Mitsubishi L200', año: 2022, status: 'activo', ubicacion: 'Sucursal Norte', ultimoMantenimiento: '10/06/2023', proximoMantenimiento: '10/09/2023', kilometraje: 23450, conductor: 'Carlos Rodríguez' },
    { id: 4, placa: 'JKL-012', modelo: 'Chevrolet S10', año: 2019, status: 'inactivo', ubicacion: 'Almacén', ultimoMantenimiento: '05/03/2023', proximoMantenimiento: '05/06/2023', kilometraje: 89120, conductor: 'Ana Martínez' },
    { id: 5, placa: 'MNO-345', modelo: 'Nissan Frontier', año: 2021, status: 'activo', ubicacion: 'Sucursal Sur', ultimoMantenimiento: '20/05/2023', proximoMantenimiento: '20/08/2023', kilometraje: 34560, conductor: 'Roberto Sánchez' },
  ];

  const mockMaintenanceEntries = [
    { id: 1, placa: 'ABC-123', fecha: '15/04/2023', tipo: 'preventivo', descripcion: 'Cambio de aceite y filtros', tecnico: 'Pedro Gómez', costo: 150, estado: 'completado' },
    { id: 2, placa: 'DEF-456', fecha: '02/05/2023', tipo: 'correctivo', descripcion: 'Reparación sistema de frenos', tecnico: 'Luis Torres', costo: 380, estado: 'en progreso' },
    { id: 3, placa: 'GHI-789', fecha: '10/06/2023', tipo: 'preventivo', descripcion: 'Revisión general y alineación', tecnico: 'Pedro Gómez', costo: 220, estado: 'completado' },
    { id: 4, placa: 'JKL-012', fecha: '05/03/2023', tipo: 'emergencia', descripcion: 'Reemplazo de batería', tecnico: 'Luis Torres', costo: 190, estado: 'completado' },
    { id: 5, placa: 'ABC-123', fecha: '15/07/2023', tipo: 'preventivo', descripcion: 'Cambio de aceite programado', tecnico: 'Pedro Gómez', costo: 150, estado: 'pendiente' },
  ];

  const mockFuelEntries = [
    { id: 1, placa: 'ABC-123', fecha: '10/06/2023', litros: 45, costo: 67.50, conductor: 'Juan Pérez', estacion: 'Estación Central', km: 45200 },
    { id: 2, placa: 'DEF-456', fecha: '05/06/2023', litros: 50, costo: 75.00, conductor: 'María López', estacion: 'Estación Norte', km: 67500 },
    { id: 3, placa: 'GHI-789', fecha: '12/06/2023', litros: 40, costo: 60.00, conductor: 'Carlos Rodríguez', estacion: 'Estación Sur', km: 23200 },
    { id: 4, placa: 'ABC-123', fecha: '25/05/2023', litros: 48, costo: 72.00, conductor: 'Juan Pérez', estacion: 'Estación Oeste', km: 44800 },
    { id: 5, placa: 'MNO-345', fecha: '08/06/2023', litros: 42, costo: 63.00, conductor: 'Roberto Sánchez', estacion: 'Estación Central', km: 34300 },
  ];

  // Filtrar vehículos según término de búsqueda
  const filteredVehicles = mockVehicles.filter(vehicle => 
    vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.conductor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar selección de vehículo
  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Encabezado principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestión de Flota Vehicular</h1>
          <p className="text-gray-500 mt-1">Monitoreo y administración de vehículos en tiempo real</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo Vehículo
          </Button>
          <Button variant="default" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
        </div>
      </div>

      {/* Tabs principales */}
      <div className="border-b mb-6">
        <div className="flex overflow-x-auto">
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center ${
              activeTab === 'vehicles'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('vehicles')}
          >
            <Car className="h-4 w-4 mr-2" />
            Vehículos
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center ${
              activeTab === 'maintenance'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('maintenance')}
          >
            <Wrench className="h-4 w-4 mr-2" />
            Mantenimientos
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center ${
              activeTab === 'fuel'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('fuel')}
          >
            <Fuel className="h-4 w-4 mr-2" />
            Combustible
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center ${
              activeTab === 'reports'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart4 className="h-4 w-4 mr-2" />
            Reportes
          </button>
        </div>
      </div>

      {/* Contenido basado en el tab activo */}
      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de vehículos */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Buscar por placa, modelo o conductor..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="overflow-y-auto max-h-[600px] pr-2">
              {filteredVehicles.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No se encontraron vehículos</p>
              ) : (
                filteredVehicles.map(vehicle => (
                  <VehicleCard 
                    key={vehicle.id} 
                    vehicle={vehicle} 
                    onSelectVehicle={handleSelectVehicle}
                  />
                ))
              )}
            </div>
          </div>

          {/* Mapa con ubicación */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Mapa Interactivo</CardTitle>
                <CardDescription>Ubicación en tiempo real de la flota</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder del mapa */}
                <div className="bg-gray-100 rounded-md border h-[500px] relative">
                  <div className="absolute inset-0 bg-blue-50 opacity-40"></div>
                  
                  {/* Marcadores de vehículos en el mapa */}
                  <div className="absolute top-1/4 left-1/4">
                    <VehicleMapMarker vehicle={mockVehicles[0]} />
                  </div>
                  <div className="absolute top-1/3 right-1/3">
                    <VehicleMapMarker vehicle={mockVehicles[1]} />
                  </div>
                  <div className="absolute bottom-1/4 left-1/3">
                    <VehicleMapMarker vehicle={mockVehicles[2]} />
                  </div>
                  <div className="absolute bottom-1/3 right-1/4">
                    <VehicleMapMarker vehicle={mockVehicles[3]} />
                  </div>
                  <div className="absolute top-1/2 left-1/2">
                    <VehicleMapMarker vehicle={mockVehicles[4]} />
                  </div>

                  {/* Centro del mapa */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="p-2 bg-white rounded-md shadow-md text-sm border">
                      <MapPin className="h-4 w-4 mx-auto mb-1 text-red-500" />
                      Oficina Central
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario de mantenimientos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calendario de Mantenimientos</CardTitle>
                <CardDescription>Programación de servicios preventivos y correctivos</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder de calendario */}
                <div className="bg-white border rounded-md p-4 h-[400px]">
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                      <div key={day} className="py-2 font-medium text-sm text-gray-500">{day}</div>
                    ))}
                    
                    {/* Días del mes (simplificado) */}
                    {Array.from({ length: 35 }).map((_, i) => {
                      const day = i + 1;
                      const hasEvent = [5, 10, 15, 20, 25].includes(day);
                      
                      return (
                        <div 
                          key={i} 
                          className={`p-2 text-sm border ${
                            hasEvent ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                          } ${day === 15 ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <span className="block">{day <= 30 ? day : ''}</span>
                          {hasEvent && (
                            <div className="mt-1 h-1.5 w-1.5 mx-auto rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de próximos mantenimientos */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Próximos Mantenimientos</CardTitle>
                <CardDescription>Servicios programados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {mockMaintenanceEntries.map(entry => (
                    <MaintenanceEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Programar Mantenimiento
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'fuel' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de consumo */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Consumo de Combustible</CardTitle>
                <CardDescription>Análisis mensual por vehículo</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder de gráfico */}
                <div className="h-80 bg-white border rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-10 w-10 mx-auto text-blue-400 mb-2" />
                    <p className="text-gray-700">Gráfico de Consumo de Combustible</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Muestra el consumo y eficiencia de combustible por vehículo
                    </p>
                  </div>
                </div>

                {/* Métricas resumen */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-blue-50 rounded-md p-3 border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium">Consumo Total</p>
                    <p className="text-2xl font-bold text-gray-800">225 L</p>
                    <p className="text-xs text-gray-500">Último mes</p>
                  </div>
                  <div className="bg-green-50 rounded-md p-3 border border-green-100">
                    <p className="text-xs text-green-600 font-medium">Eficiencia Promedio</p>
                    <p className="text-2xl font-bold text-gray-800">12.3 km/L</p>
                    <p className="text-xs text-gray-500">Toda la flota</p>
                  </div>
                  <div className="bg-purple-50 rounded-md p-3 border border-purple-100">
                    <p className="text-xs text-purple-600 font-medium">Gasto Mensual</p>
                    <p className="text-2xl font-bold text-gray-800">$337.50</p>
                    <p className="text-xs text-gray-500">En combustible</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registro de recargas */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Registro de Recargas</CardTitle>
                <CardDescription>Últimas cargas de combustible</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[350px] overflow-y-auto">
                  {mockFuelEntries.map(entry => (
                    <FuelConsumptionEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Registrar Recarga
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reportes disponibles */}
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Costos Operativos</CardTitle>
              <CardDescription>Análisis detallado por vehículo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                      <BarChart4 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Costos por Vehículo</h4>
                      <p className="text-sm text-gray-500">Desglose de gastos por unidad</p>
                    </div>
                  </div>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                </div>
                
                <div className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                      <Fuel className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Consumo de Combustible</h4>
                      <p className="text-sm text-gray-500">Análisis de eficiencia y gasto</p>
                    </div>
                  </div>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                </div>
                
                <div className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-amber-100 text-amber-600 mr-3">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Mantenimientos Realizados</h4>
                      <p className="text-sm text-gray-500">Historial y costos de servicios</p>
                    </div>
                  </div>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                </div>
                
                <div className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                      <LineChart className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Análisis de Rendimiento</h4>
                      <p className="text-sm text-gray-500">Comparativa de eficiencia por modelo</p>
                    </div>
                  </div>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vista previa de reporte */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa de Reporte</CardTitle>
              <CardDescription>Reporte de costos por vehículo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border rounded-md p-4 h-[400px] overflow-y-auto">
                <div className="text-center p-4 border-b">
                  <h3 className="font-bold text-lg">Reporte de Costos Operativos</h3>
                  <p className="text-sm text-gray-500">Período: Junio 2023</p>
                </div>
                
                <table className="w-full mt-4 text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Vehículo</th>
                      <th className="py-2 text-right">Combustible</th>
                      <th className="py-2 text-right">Mantenimiento</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">ABC-123</td>
                      <td className="py-2 text-right">$139.50</td>
                      <td className="py-2 text-right">$150.00</td>
                      <td className="py-2 text-right font-medium">$289.50</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">DEF-456</td>
                      <td className="py-2 text-right">$75.00</td>
                      <td className="py-2 text-right">$380.00</td>
                      <td className="py-2 text-right font-medium">$455.00</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">GHI-789</td>
                      <td className="py-2 text-right">$60.00</td>
                      <td className="py-2 text-right">$220.00</td>
                      <td className="py-2 text-right font-medium">$280.00</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">JKL-012</td>
                      <td className="py-2 text-right">$0.00</td>
                      <td className="py-2 text-right">$190.00</td>
                      <td className="py-2 text-right font-medium">$190.00</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">MNO-345</td>
                      <td className="py-2 text-right">$63.00</td>
                      <td className="py-2 text-right">$0.00</td>
                      <td className="py-2 text-right font-medium">$63.00</td>
                    </tr>
                    <tr className="bg-gray-100 font-medium">
                      <td className="py-2">TOTAL</td>
                      <td className="py-2 text-right">$337.50</td>
                      <td className="py-2 text-right">$940.00</td>
                      <td className="py-2 text-right font-bold">$1,277.50</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="mt-6 text-center mb-4">
                  {/* Placeholder de gráfico de reporte */}
                  <div className="h-40 bg-white border rounded-md flex items-center justify-center mb-2">
                    <div className="text-center">
                      <BarChart4 className="h-8 w-8 mx-auto text-blue-400 mb-1" />
                      <p className="text-xs text-gray-500">Distribución de gastos por vehículo</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 italic">Generado el 24/06/2023 a las 14:30</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Testing19;