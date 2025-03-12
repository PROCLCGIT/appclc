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
  BarChart4,
  LineChart,
  PieChart,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Bell,
  AlertTriangle,
  Settings,
  Filter
} from "lucide-react";

// Componente para métricas financieras
const FinancialMetric = ({
  title,
  value,
  icon,
  description,
  change,
  changeType,
  bgColor = "bg-white",
}) => {
  return (
    <Card className={`${bgColor} text-white shadow-md hover:shadow-lg transition-all`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium opacity-90">{title}</p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
            {description && (
              <p className="text-xs opacity-90 mt-1">{description}</p>
            )}
          </div>
          <div className="p-2 rounded-full bg-white/20 text-white">
            {icon}
          </div>
        </div>
        {change && (
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm font-medium flex items-center ${
                changeType === "positive"
                  ? "text-green-200"
                  : changeType === "negative"
                  ? "text-red-200"
                  : "text-blue-200"
              }`}
            >
              {changeType === "positive" ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : changeType === "negative" ? (
                <TrendingDown className="h-4 w-4 mr-1" />
              ) : null}
              {change}
            </span>
            <span className="text-xs ml-2 opacity-80">
              comparado con el mes anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para alertas financieras
const FinancialAlert = ({ type, message, date }) => {
  return (
    <div className={`p-4 rounded-lg mb-3 flex items-center ${
      type === "warning" 
        ? "bg-amber-50 border-l-4 border-amber-500"
        : type === "critical" 
        ? "bg-red-50 border-l-4 border-red-500"
        : "bg-blue-50 border-l-4 border-blue-500"
    }`}>
      <div className={`p-2 rounded-full mr-3 ${
        type === "warning" ? "bg-amber-100 text-amber-600" 
        : type === "critical" ? "bg-red-100 text-red-600"
        : "bg-blue-100 text-blue-600"
      }`}>
        {type === "warning" ? (
          <AlertTriangle className="h-5 w-5" />
        ) : type === "critical" ? (
          <AlertTriangle className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
      </div>
      <div>
        <p className={`font-medium ${
          type === "warning" ? "text-amber-800" 
          : type === "critical" ? "text-red-800"
          : "text-blue-800"
        }`}>
          {message}
        </p>
        <p className="text-xs text-gray-500 mt-1">{date}</p>
      </div>
    </div>
  );
};

const Testing18 = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("flujo");

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleDownloadReport = () => {
    alert("Descargando reporte financiero...");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Encabezado principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cuadro de Mando Financiero</h1>
          <p className="text-gray-500 mt-1">Monitoreo de indicadores económicos y financieros</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isLoading}
          >
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
          <Button variant="default" size="sm" onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar reporte
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <FinancialMetric
          title="Ingresos Mensuales"
          value="$756,290"
          icon={<BarChart4 className="h-5 w-5" />}
          description="Total acumulado en el mes"
          change="+7.2%"
          changeType="positive"
          bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <FinancialMetric
          title="Gastos Operativos"
          value="$486,120"
          icon={<LineChart className="h-5 w-5" />}
          description="Gastos del período"
          change="+2.1%"
          changeType="negative"
          bgColor="bg-gradient-to-br from-red-500 to-red-600"
        />
        <FinancialMetric
          title="Flujo de Caja Neto"
          value="$270,170"
          icon={<TrendingUp className="h-5 w-5" />}
          description="Flujo neto disponible"
          change="+8.5%"
          changeType="positive"
          bgColor="bg-gradient-to-br from-green-500 to-green-600"
        />
        <FinancialMetric
          title="ROI Promedio"
          value="16.8%"
          icon={<PieChart className="h-5 w-5" />}
          description="Retorno de inversión"
          change="+1.2%"
          changeType="positive"
          bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Tabs para gráficos */}
      <div className="mb-2">
        <div className="border-b flex overflow-x-auto">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "flujo"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("flujo")}
          >
            Flujo de Caja
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "balance"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("balance")}
          >
            Balance General
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "rentabilidad"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("rentabilidad")}
          >
            Análisis de Rentabilidad
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "proyecciones"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("proyecciones")}
          >
            Proyecciones
          </button>
        </div>
      </div>

      {/* Contenido del tab activo */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            {activeTab === "flujo" && (
              <>
                <CardTitle>Gráfico de Flujo de Caja</CardTitle>
                <CardDescription>Ingresos vs. Egresos (últimos 12 meses)</CardDescription>
              </>
            )}
            {activeTab === "balance" && (
              <>
                <CardTitle>Balance General</CardTitle>
                <CardDescription>Activos vs. Pasivos y Patrimonio</CardDescription>
              </>
            )}
            {activeTab === "rentabilidad" && (
              <>
                <CardTitle>Análisis de Rentabilidad por Departamento</CardTitle>
                <CardDescription>Comparativa de ingresos y gastos</CardDescription>
              </>
            )}
            {activeTab === "proyecciones" && (
              <>
                <CardTitle>Proyecciones Financieras</CardTitle>
                <CardDescription>Escenarios a 12 meses</CardDescription>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Configurar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Placeholder para los gráficos */}
          <div className="h-80 flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border">
            <div className="text-center">
              {activeTab === "flujo" && (
                <>
                  <LineChart className="h-10 w-10 mx-auto text-blue-400 mb-2" />
                  <p className="text-gray-700">Gráfico de Flujo de Caja</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Muestra la evolución de ingresos y egresos durante los últimos 12 meses
                  </p>
                </>
              )}
              {activeTab === "balance" && (
                <>
                  <BarChart4 className="h-10 w-10 mx-auto text-blue-400 mb-2" />
                  <p className="text-gray-700">Balance General</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Comparativa de Activos, Pasivos y Patrimonio en el período actual
                  </p>
                </>
              )}
              {activeTab === "rentabilidad" && (
                <>
                  <PieChart className="h-10 w-10 mx-auto text-blue-400 mb-2" />
                  <p className="text-gray-700">Análisis de Rentabilidad por Departamento</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Distribución de ingresos, gastos y rentabilidad por área
                  </p>
                </>
              )}
              {activeTab === "proyecciones" && (
                <>
                  <TrendingUp className="h-10 w-10 mx-auto text-blue-400 mb-2" />
                  <p className="text-gray-700">Proyecciones Financieras</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Escenarios de proyección: conservador, esperado y optimista
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Análisis por departamento */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Análisis Financiero por Departamento</CardTitle>
            <CardDescription>Comparativa de rendimiento económico</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 font-medium">Departamento</th>
                    <th className="py-2 font-medium">Ingresos</th>
                    <th className="py-2 font-medium">Gastos</th>
                    <th className="py-2 font-medium">Margen</th>
                    <th className="py-2 font-medium">Rentabilidad</th>
                    <th className="py-2 font-medium">Tendencia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Ventas</td>
                    <td className="py-2">$245,800</td>
                    <td className="py-2">$89,600</td>
                    <td className="py-2">$156,200</td>
                    <td className="py-2">63.5%</td>
                    <td className="py-2">
                      <span className="inline-flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" /> +8.2%
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Marketing</td>
                    <td className="py-2">$193,400</td>
                    <td className="py-2">$127,800</td>
                    <td className="py-2">$65,600</td>
                    <td className="py-2">33.9%</td>
                    <td className="py-2">
                      <span className="inline-flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" /> +3.7%
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Operaciones</td>
                    <td className="py-2">$156,700</td>
                    <td className="py-2">$134,500</td>
                    <td className="py-2">$22,200</td>
                    <td className="py-2">14.2%</td>
                    <td className="py-2">
                      <span className="inline-flex items-center text-red-600">
                        <TrendingDown className="h-4 w-4 mr-1" /> -2.4%
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">IT & Desarrollo</td>
                    <td className="py-2">$109,200</td>
                    <td className="py-2">$92,000</td>
                    <td className="py-2">$17,200</td>
                    <td className="py-2">15.8%</td>
                    <td className="py-2">
                      <span className="inline-flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" /> +1.1%
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Administrativo</td>
                    <td className="py-2">$51,190</td>
                    <td className="py-2">$42,220</td>
                    <td className="py-2">$8,970</td>
                    <td className="py-2">17.5%</td>
                    <td className="py-2">
                      <span className="inline-flex items-center text-amber-600">
                        <RefreshCw className="h-4 w-4 mr-1" /> 0.0%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Alertas financieras */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas Configurables</CardTitle>
            <CardDescription>Indicadores financieros críticos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <FinancialAlert
                type="critical"
                message="Flujo de caja negativo en departamento de Operaciones"
                date="Hace 2 horas"
              />
              <FinancialAlert
                type="warning"
                message="Margen de ganancia por debajo del umbral (15%)"
                date="Hoy, 9:45 AM"
              />
              <FinancialAlert
                type="info"
                message="Proyección de ingresos Q1 actualizada"
                date="Ayer, 16:30 PM"
              />
              <FinancialAlert
                type="warning"
                message="Gastos operativos cercanos al límite presupuestario"
                date="28/05/2023, 11:20 AM"
              />
            </div>
            <div className="mt-4 pt-3 border-t">
              <Button variant="outline" className="w-full text-sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar alertas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Testing18;