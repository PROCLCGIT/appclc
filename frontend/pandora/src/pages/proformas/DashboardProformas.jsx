// src/pages/proformas/DashboardProformas.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Colores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'];
const ESTADO_COLORS = {
  'borrador': '#6c757d',   // Gris
  'enviada': '#007bff',    // Azul
  'aprobada': '#28a745',   // Verde
  'rechazada': '#dc3545',  // Rojo
  'vencida': '#ffc107',    // Amarillo
  'convertida': '#17a2b8'  // Cian
};

const DashboardProformas = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState("month");
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().setMonth(new Date().getMonth() - 6)));
  const [fechaFin, setFechaFin] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  // Función para formatear números con separador de miles y decimales
  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num);
  };

  // Función para formatear porcentajes
  const formatPercent = (num) => {
    return `${num.toFixed(2)}%`;
  };

  // Cargar datos del dashboard
  const fetchData = async () => {
    setLoading(true);
    try {
      // Formatear fechas
      const inicio = fechaInicio ? fechaInicio.toISOString().split('T')[0] : undefined;
      const fin = fechaFin ? fechaFin.toISOString().split('T')[0] : undefined;

      // Llamar al API
      const response = await axios.get('/api/v1/proformas/stats-dashboard/', {
        params: {
          fecha_inicio: inicio,
          fecha_fin: fin,
          periodo
        }
      });

      setData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Error al cargar los datos del dashboard. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente o cambiar filtros
  useEffect(() => {
    fetchData();
  }, []);

  // Manejar cambio de filtros
  const handleFilterChange = () => {
    fetchData();
  };

  // Si está cargando, mostrar indicador
  if (loading && !data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard de Proformas</h1>
        <div className="flex space-x-4">
          <Select value={periodo} onValueChange={(val) => setPeriodo(val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Diario</SelectItem>
              <SelectItem value="week">Semanal</SelectItem>
              <SelectItem value="month">Mensual</SelectItem>
              <SelectItem value="year">Anual</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <DatePicker
              date={fechaInicio}
              setDate={setFechaInicio}
              placeholder="Fecha inicio"
              className="w-[140px]"
            />
          </div>
          <div>
            <DatePicker
              date={fechaFin}
              setDate={setFechaFin}
              placeholder="Fecha fin"
              className="w-[140px]"
            />
          </div>
          <Button variant="default" onClick={handleFilterChange}>
            Aplicar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="estados">Por Estado</TabsTrigger>
          <TabsTrigger value="tiempo">Evolución</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>

        {data && (
          <>
            {/* Pestaña de Resumen */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">Total Proformas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{data.resumen.total_proformas}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Valor total: {formatNumber(data.resumen.monto_total)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">Promedio por Proforma</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatNumber(data.resumen.monto_promedio)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">Tasa de Aprobación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatPercent(data.resumen.tasa_aprobacion)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      % de proformas enviadas que son aprobadas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">Tasa de Conversión</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatPercent(data.resumen.tasa_conversion)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      % de proformas aprobadas que se convierten
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Proformas por Estado</CardTitle>
                    <CardDescription>Distribución por estado</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.por_estado}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="cantidad"
                          nameKey="label"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        >
                          {data.por_estado.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={ESTADO_COLORS[entry.estado] || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [value, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Evolución Mensual</CardTitle>
                    <CardDescription>Cantidad y monto por mes</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data.por_tiempo}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === "monto") return formatNumber(value);
                            return value;
                          }}
                        />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="cantidad"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          name="Cantidad"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="monto"
                          stroke="#82ca9d"
                          name="Monto"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Pestaña de Estados */}
            <TabsContent value="estados">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Proformas por Estado</CardTitle>
                    <CardDescription>Distribución por cantidad</CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.por_estado}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cantidad" name="Cantidad" fill="#8884d8">
                          {data.por_estado.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={ESTADO_COLORS[entry.estado] || COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monto por Estado</CardTitle>
                    <CardDescription>Distribución por monto total</CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.por_estado}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatNumber(value)} />
                        <Legend />
                        <Bar dataKey="monto" name="Monto" fill="#82ca9d">
                          {data.por_estado.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={ESTADO_COLORS[entry.estado] || COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalles por Estado</CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% del Total</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% del Monto</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.por_estado.map((estado, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{estado.label}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{estado.cantidad}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {((estado.cantidad / data.resumen.total_proformas) * 100).toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(estado.monto)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {((estado.monto / data.resumen.monto_total) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Pestaña de Evolución en el tiempo */}
            <TabsContent value="tiempo">
              <Card>
                <CardHeader>
                  <CardTitle>Evolución Temporal</CardTitle>
                  <CardDescription>
                    Cantidad y monto por {periodo === 'day' ? 'día' : periodo === 'week' ? 'semana' : periodo === 'month' ? 'mes' : 'año'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.por_tiempo}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "monto") return formatNumber(value);
                          if (name === "tasa_conversion") return formatPercent(value);
                          return value;
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="cantidad"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Cantidad"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="monto"
                        stroke="#82ca9d"
                        name="Monto"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="tasa_conversion"
                        stroke="#ff7c43"
                        dot={{ r: 6 }}
                        name="Tasa de Conversión (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalles de Evolución Temporal</CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aprobadas</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa Conversión</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.por_tiempo.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.fecha}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.cantidad}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(item.monto)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.aprobadas}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatPercent(item.tasa_conversion)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Pestaña de Clientes */}
            <TabsContent value="clientes">
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Clientes</CardTitle>
                  <CardDescription>Por monto total generado</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.top_clientes}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="cliente__nombre" width={150} />
                      <Tooltip formatter={(value) => formatNumber(value)} />
                      <Legend />
                      <Bar dataKey="monto" name="Monto Total" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalles por Cliente</CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUC/ID</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.top_clientes.map((cliente, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.cliente__nombre}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.cliente__ruc}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{cliente.cantidad}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(cliente.monto)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatNumber(cliente.monto / cliente.cantidad)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default DashboardProformas;