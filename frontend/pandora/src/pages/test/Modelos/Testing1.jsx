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
  PieChart,
  LineChart,
  Download,
  RefreshCw,
} from "lucide-react";

/** 
 * Componente para cada métrica del dashboard 
 * Se agregó la prop "bgColor" para controlar el color/gradiente de fondo.
 */
const DashboardMetric = ({
  title,
  value,
  icon,
  description,
  change,
  changeType,
  bgColor = "bg-white",
}) => {
  // Opcionalmente puedes personalizar colores para el texto o ícono según tu preferencia
  return (
    <Card className={`${bgColor} text-white`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium opacity-90">{title}</p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
            {description && (
              <p className="text-xs opacity-90 mt-1">{description}</p>
            )}
          </div>
          {/* Se sustituyó la lógica de colores por un estilo uniforme sobre el fondo degradado */}
          <div className="p-2 rounded-full bg-white/20 text-white">
            {icon}
          </div>
        </div>
        {change && (
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm font-medium ${
                changeType === "positive"
                  ? "text-green-200"
                  : changeType === "negative"
                  ? "text-red-200"
                  : "text-blue-200"
              }`}
            >
              {change}
            </span>
            <span className="text-xs ml-2 opacity-80">
              comparado con el período anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Testing1 = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleDownloadReport = () => {
    alert("Descargando reporte...");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Encabezado principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen general y métricas</p>
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

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashboardMetric
          title="Total Customers"
          value="1,56,290"
          icon={<BarChart4 className="h-5 w-5" />}
          description="Usuarios registrados"
          change="+4.2%"
          changeType="positive"
          bgColor="bg-gradient-to-br from-pink-500 to-purple-500"
        />
        <DashboardMetric
          title="Conversion Ratio"
          value="16.87%"
          icon={<PieChart className="h-5 w-5" />}
          description="Tasa de conversión"
          change="-1.1%"
          changeType="negative"
          bgColor="bg-gradient-to-br from-green-400 to-green-600"
        />
        <DashboardMetric
          title="Total Deals"
          value="$73,239"
          icon={<LineChart className="h-5 w-5" />}
          description="Ingresos estimados"
          change="+2.5%"
          changeType="positive"
          bgColor="bg-gradient-to-br from-orange-400 to-orange-600"
        />
      </div>

      {/* Gráfica principal: Revenue Analytics */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Ingresos vs. Utilidad</CardDescription>
          </div>
          {/* Botón "Sort By" a la derecha */}
          <Button variant="outline" size="sm">
            Sort By
          </Button>
        </CardHeader>
        <CardContent>
          {/* Placeholder de la gráfica con un fondo pastel */}
          <div className="h-72 flex items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-md border">
            <div className="text-center">
              <BarChart4 className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Gráfica de ingresos y utilidad</p>
              <p className="text-xs text-gray-400 mt-1">
                Próximamente se mostrará la data real
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segunda fila: Leads by Source + Top Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Source</CardTitle>
            <CardDescription>Distribución de leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-r from-green-50 to-green-100 rounded-md border">
              <div className="text-center">
                <BarChart4 className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Gráfica de Leads por Fuente</p>
                <p className="text-xs text-gray-400 mt-1">
                  Próximamente se mostrará la data real
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Deals (tabla) */}
        <Card>
          <CardHeader>
            <CardTitle>Top Deals</CardTitle>
            <CardDescription>Principales oportunidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 font-medium">Deal</th>
                    <th className="py-2 font-medium">Value</th>
                    <th className="py-2 font-medium">Probability</th>
                    <th className="py-2 font-medium">Stage</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">IT Management</td>
                    <td className="py-2">$82K</td>
                    <td className="py-2">60%</td>
                    <td className="py-2">Proposal</td>
                    <td className="py-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-600 rounded">
                        Contract Sent
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Rasik Assoc</td>
                    <td className="py-2">$56K</td>
                    <td className="py-2">70%</td>
                    <td className="py-2">Review</td>
                    <td className="py-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded">
                        Open
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Ssid Systems</td>
                    <td className="py-2">$42K</td>
                    <td className="py-2">50%</td>
                    <td className="py-2">Contacted</td>
                    <td className="py-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded">
                        Open
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Justo Manojotics</td>
                    <td className="py-2">$39K</td>
                    <td className="py-2">30%</td>
                    <td className="py-2">Negotiation</td>
                    <td className="py-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-600 rounded">
                        Contract Sent
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">Adventus</td>
                    <td className="py-2">$29K</td>
                    <td className="py-2">70%</td>
                    <td className="py-2">Proposal</td>
                    <td className="py-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded">
                        Open
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Testing1;
