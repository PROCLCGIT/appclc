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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  LineChart,
  PieChart,
  Activity,
  FileDown,
  FileText,
  Filter,
  ListFilter,
  RefreshCw,
  Users,
} from "lucide-react";

// Datos de ejemplo para las métricas
const medicalData = {
  patientsByDepartment: [
    { department: "Cardiología", count: 345, change: "+7%" },
    { department: "Neurología", count: 267, change: "+3%" },
    { department: "Oncología", count: 189, change: "-2%" },
    { department: "Pediatría", count: 412, change: "+12%" },
  ],
  patientStats: {
    total: "5,738",
    new: "142",
    readmissions: "87",
    avgStay: "4.3",
  },
  treatmentEfficacy: [
    { treatment: "Tratamiento A", efficacy: 78, change: "+5%" },
    { treatment: "Tratamiento B", efficacy: 65, change: "+2%" },
    { treatment: "Tratamiento C", efficacy: 92, change: "+9%" },
    { treatment: "Tratamiento D", efficacy: 71, change: "-1%" },
  ]
};

// Componente para tarjetas de métricas
const MetricCard = ({ title, value, icon, description, change, changeType }) => {
  return (
    <Card className="overflow-hidden border-none shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-3xl font-bold mt-2 text-gray-900">{value}</h3>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className="p-3 rounded-full bg-blue-50 text-blue-600">
            {icon}
          </div>
        </div>
        {change && (
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm font-medium ${
                changeType === "positive"
                  ? "text-emerald-600"
                  : changeType === "negative"
                  ? "text-rose-600"
                  : "text-blue-600"
              }`}
            >
              {change}
            </span>
            <span className="text-xs ml-2 text-gray-500">
              comparado con el período anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para el gráfico de barras
const BarChartComponent = () => {
  return (
    <div className="relative h-80 w-full">
      {/* Simulación visual del gráfico */}
      <div className="absolute inset-0 flex items-end justify-between p-4">
        <div className="w-1/4 px-2">
          <div className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md w-full h-[65%]"></div>
          <p className="text-xs text-center mt-2 text-gray-600 font-medium">Ene</p>
        </div>
        <div className="w-1/4 px-2">
          <div className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md w-full h-[45%]"></div>
          <p className="text-xs text-center mt-2 text-gray-600 font-medium">Feb</p>
        </div>
        <div className="w-1/4 px-2">
          <div className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md w-full h-[80%]"></div>
          <p className="text-xs text-center mt-2 text-gray-600 font-medium">Mar</p>
        </div>
        <div className="w-1/4 px-2">
          <div className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md w-full h-[60%]"></div>
          <p className="text-xs text-center mt-2 text-gray-600 font-medium">Abr</p>
        </div>
      </div>
    </div>
  );
};

// Componente para el gráfico lineal
const LineChartComponent = () => {
  return (
    <div className="relative h-80 w-full">
      {/* Línea principal */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M0,50 Q20,20 40,40 T70,30 T100,40"
            fill="none"
            stroke="rgba(37, 99, 235, 0.8)"
            strokeWidth="2"
          />
          {/* Área bajo la curva con gradiente */}
          <path
            d="M0,50 Q20,20 40,40 T70,30 T100,40 V100 H0 Z"
            fill="url(#blue-gradient)"
            opacity="0.2"
          />
          <defs>
            <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(37, 99, 235, 0.8)" />
              <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* Puntos de datos */}
      <div className="absolute inset-0 flex justify-between items-center px-4">
        <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
        <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
        <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
        <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
        <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
      </div>
    </div>
  );
};

// Componente para la tarjeta de progreso
const ProgressCard = ({ title, value, maxValue, color = "blue" }) => {
  const percentage = (value / maxValue) * 100;
  
  const getGradient = () => {
    switch (color) {
      case "blue": return "bg-gradient-to-r from-blue-500 to-blue-600";
      case "green": return "bg-gradient-to-r from-emerald-500 to-emerald-600";
      case "purple": return "bg-gradient-to-r from-purple-500 to-purple-600";
      case "orange": return "bg-gradient-to-r from-orange-500 to-orange-600";
      default: return "bg-gradient-to-r from-blue-500 to-blue-600";
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <span className="text-sm font-semibold">{value}/{maxValue}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${getGradient()}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Componente principal para el análisis de datos médicos
const Testing11 = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateRange, setDateRange] = useState("month");
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Encabezado con título y filtros */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Análisis de Datos Médicos</h1>
            <p className="text-gray-500 mt-1">
              Visualización e interpretación de indicadores clínicos
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar datos
                </>
              )}
            </Button>
            <Button>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Filtros adicionales */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
            className="rounded-full"
          >
            Todos los datos
          </Button>
          <Button
            variant={activeFilter === "cardiology" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("cardiology")}
            className="rounded-full"
          >
            Cardiología
          </Button>
          <Button
            variant={activeFilter === "neurology" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("neurology")}
            className="rounded-full"
          >
            Neurología
          </Button>
          <Button
            variant={activeFilter === "oncology" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("oncology")}
            className="rounded-full"
          >
            Oncología
          </Button>
          <Button
            variant={activeFilter === "pediatrics" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("pediatrics")}
            className="rounded-full"
          >
            Pediatría
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            Más filtros
          </Button>
        </div>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total de Pacientes"
          value={medicalData.patientStats.total}
          icon={<Users className="h-6 w-6" />}
          description="Pacientes registrados"
          change="+5.2%"
          changeType="positive"
        />
        <MetricCard
          title="Nuevos Pacientes"
          value={medicalData.patientStats.new}
          icon={<Users className="h-6 w-6" />}
          description="Últimos 30 días"
          change="+12.3%"
          changeType="positive"
        />
        <MetricCard
          title="Readmisiones"
          value={medicalData.patientStats.readmissions}
          icon={<Activity className="h-6 w-6" />}
          description="Últimos 30 días"
          change="-4.6%"
          changeType="positive"
        />
        <MetricCard
          title="Estancia Media"
          value={medicalData.patientStats.avgStay}
          icon={<Activity className="h-6 w-6" />}
          description="Días promedio"
          change="-0.3%"
          changeType="positive"
        />
      </div>

      {/* Pestañas de visualización de datos */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-100">
        <Tabs defaultValue="patients" className="w-full">
          <div className="border-b px-6 pt-4">
            <TabsList className="bg-transparent border rounded-lg p-1">
              <TabsTrigger value="patients" className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Pacientes por Especialidad</TabsTrigger>
              <TabsTrigger value="treatments" className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Eficacia de Tratamientos</TabsTrigger>
              <TabsTrigger value="diagnostics" className="rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Diagnósticos</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="patients" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Distribución de Pacientes</h3>
                <p className="text-sm text-gray-500">Desglose por departamento médico</p>
              </div>
              <Button variant="outline" size="sm">
                <ListFilter className="h-4 w-4 mr-2" />
                Filtrar datos
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BarChartComponent />
              </div>
              <div className="space-y-4">
                {medicalData.patientsByDepartment.map((dept, index) => (
                  <ProgressCard
                    key={index}
                    title={dept.department}
                    value={dept.count}
                    maxValue={500}
                    color={index % 4 === 0 ? "blue" : index % 4 === 1 ? "green" : index % 4 === 2 ? "purple" : "orange"}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="treatments" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eficacia de Tratamientos</h3>
                <p className="text-sm text-gray-500">Resultados clínicos por tipo de tratamiento</p>
              </div>
              <Button variant="outline" size="sm">
                <ListFilter className="h-4 w-4 mr-2" />
                Filtrar datos
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LineChartComponent />
              </div>
              <div className="space-y-4">
                {medicalData.treatmentEfficacy.map((treatment, index) => (
                  <ProgressCard
                    key={index}
                    title={treatment.treatment}
                    value={treatment.efficacy}
                    maxValue={100}
                    color={index % 4 === 0 ? "blue" : index % 4 === 1 ? "green" : index % 4 === 2 ? "purple" : "orange"}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="diagnostics" className="p-6">
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <p className="text-gray-500">Seleccione un periodo para visualizar los datos de diagnósticos</p>
                <Button className="mt-4">Cargar Datos</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reportes recientes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Reportes Recientes</CardTitle>
          <CardDescription>Últimos informes médicos generados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                <div className="p-2 rounded-md bg-blue-50 text-blue-600 mr-4">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-medium text-gray-900">Reporte de Análisis Clínico #{item}</h4>
                  <p className="text-xs text-gray-500">Generado el 12/0{item}/2025</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">PDF</Badge>
                  <Button variant="ghost" size="icon">
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t">
          <Button variant="link" className="text-sm">Ver todos los reportes</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Testing11;