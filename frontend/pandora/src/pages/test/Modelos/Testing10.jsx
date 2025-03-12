import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Badge } from "../../components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";
import { Slider } from "../../components/ui/slider";
import { Label } from "../../components/ui/label";
import { Progress } from "../../components/ui/progress";
import {
  Activity,
  Barcode,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Gift,
  HelpCircle,
  Home,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShoppingBag,
  Tag,
  Truck,
  User
} from "lucide-react";

export default function Testing10() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [selectedPeriod, setSelectedPeriod] = useState("mensual");
  
  // Datos ficticios para el dashboard
  const stats = [
    { 
      title: "Ingresos", 
      value: "$15,231.89", 
      change: "+14.2%", 
      trend: "up",
      icon: <DollarSign className="h-6 w-6 text-emerald-500" />,
      description: "vs mes anterior"
    },
    { 
      title: "Gastos", 
      value: "$8,914.23", 
      change: "+7.5%", 
      trend: "up",
      icon: <CreditCard className="h-6 w-6 text-red-500" />,
      description: "vs mes anterior"
    },
    { 
      title: "Ahorros", 
      value: "$6,317.66", 
      change: "+25.4%", 
      trend: "up",
      icon: <Activity className="h-6 w-6 text-blue-500" />,
      description: "vs mes anterior"
    },
    { 
      title: "Inversiones", 
      value: "$42,985.00", 
      change: "+3.2%", 
      trend: "up",
      icon: <RefreshCw className="h-6 w-6 text-purple-500" />,
      description: "retorno anual"
    }
  ];

  const categories = [
    { name: "Comida", amount: 2340.52, percentage: 26, color: "bg-emerald-500" },
    { name: "Transporte", amount: 1432.89, percentage: 16, color: "bg-blue-500" },
    { name: "Entretenimiento", amount: 1201.32, percentage: 13, color: "bg-violet-500" },
    { name: "Facturas", amount: 2542.71, percentage: 28, color: "bg-amber-500" },
    { name: "Compras", amount: 942.43, percentage: 11, color: "bg-red-500" },
    { name: "Otros", amount: 530.15, percentage: 6, color: "bg-gray-500" }
  ];

  const transactions = [
    { 
      id: 1, 
      merchant: "Supermercado Central", 
      category: "Comida", 
      amount: -156.42, 
      date: "Hoy, 14:23", 
      icon: <ShoppingBag className="h-8 w-8 p-1.5 rounded-full bg-emerald-100 text-emerald-500" /> 
    },
    { 
      id: 2, 
      merchant: "Transferencia recibida", 
      category: "Ingresos", 
      amount: 1250.00, 
      date: "Hoy, 09:15", 
      icon: <RefreshCw className="h-8 w-8 p-1.5 rounded-full bg-blue-100 text-blue-500" /> 
    },
    { 
      id: 3, 
      merchant: "Netflix", 
      category: "Entretenimiento", 
      amount: -15.99, 
      date: "Ayer, 00:00", 
      icon: <Tag className="h-8 w-8 p-1.5 rounded-full bg-violet-100 text-violet-500" /> 
    },
    { 
      id: 4, 
      merchant: "Uber", 
      category: "Transporte", 
      amount: -24.50, 
      date: "Ayer, 19:30", 
      icon: <Truck className="h-8 w-8 p-1.5 rounded-full bg-amber-100 text-amber-500" /> 
    },
    { 
      id: 5, 
      merchant: "Tienda de Ropa", 
      category: "Compras", 
      amount: -89.99, 
      date: "Mar 04, 16:42", 
      icon: <ShoppingBag className="h-8 w-8 p-1.5 rounded-full bg-red-100 text-red-500" /> 
    },
    { 
      id: 6, 
      merchant: "Luz y Agua", 
      category: "Facturas", 
      amount: -127.35, 
      date: "Mar 03, 11:20", 
      icon: <FileText className="h-8 w-8 p-1.5 rounded-full bg-indigo-100 text-indigo-500" /> 
    },
    { 
      id: 7, 
      merchant: "Dividendos", 
      category: "Inversiones", 
      amount: 342.18, 
      date: "Mar 02, 08:00", 
      icon: <Activity className="h-8 w-8 p-1.5 rounded-full bg-green-100 text-green-500" /> 
    },
    { 
      id: 8, 
      merchant: "Restaurante Italiano", 
      category: "Comida", 
      amount: -78.50, 
      date: "Mar 01, 21:15", 
      icon: <ShoppingBag className="h-8 w-8 p-1.5 rounded-full bg-emerald-100 text-emerald-500" /> 
    }
  ];

  const accounts = [
    { 
      id: 1, 
      name: "Cuenta Corriente", 
      number: "**** 4589", 
      balance: 7845.32, 
      type: "Banco Nacional", 
      icon: <CreditCard className="h-8 w-8 p-1.5 rounded-full bg-blue-100 text-blue-500" /> 
    },
    { 
      id: 2, 
      name: "Cuenta de Ahorros", 
      number: "**** 7723", 
      balance: 15320.45, 
      type: "Banco Nacional", 
      icon: <CreditCard className="h-8 w-8 p-1.5 rounded-full bg-green-100 text-green-500" /> 
    },
    { 
      id: 3, 
      name: "Tarjeta de Crédito", 
      number: "**** 1298", 
      balance: -2145.78, 
      type: "Visa Signature", 
      icon: <CreditCard className="h-8 w-8 p-1.5 rounded-full bg-red-100 text-red-500" /> 
    },
    { 
      id: 4, 
      name: "Fondo de Inversión", 
      number: "**** 9012", 
      balance: 42985.00, 
      type: "Gestora Capital", 
      icon: <Activity className="h-8 w-8 p-1.5 rounded-full bg-purple-100 text-purple-500" /> 
    }
  ];

  const budgets = [
    { category: "Comida", spent: 2340.52, limit: 2500, percentage: 94 },
    { category: "Transporte", spent: 1432.89, limit: 1800, percentage: 80 },
    { category: "Entretenimiento", spent: 1201.32, limit: 1000, percentage: 120 },
    { category: "Facturas", spent: 2542.71, limit: 3000, percentage: 85 },
    { category: "Compras", spent: 942.43, limit: 1200, percentage: 79 }
  ];

  const goals = [
    { name: "Vacaciones", saved: 4500, target: 8000, percentage: 56, date: "Dic 2025" },
    { name: "Nuevo Auto", saved: 12000, target: 35000, percentage: 34, date: "Jun 2026" },
    { name: "Fondo de Emergencia", saved: 10000, target: 15000, percentage: 67, date: "Oct 2025" }
  ];

  // Función para formatear montos con separador de miles
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar de navegación */}
        <div className="hidden md:block">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                  FB
                </div>
                <div>
                  <CardTitle>FinanzApp</CardTitle>
                  <CardDescription>Gestión financiera personal</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <nav className="space-y-1.5">
                <Button 
                  variant={activeTab === "inicio" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("inicio")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Inicio
                </Button>
                <Button 
                  variant={activeTab === "transacciones" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("transacciones")}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Transacciones
                </Button>
                <Button 
                  variant={activeTab === "cuentas" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("cuentas")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Cuentas
                </Button>
                <Button 
                  variant={activeTab === "presupuestos" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("presupuestos")}
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Presupuestos
                </Button>
                <Button 
                  variant={activeTab === "objetivos" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("objetivos")}
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Objetivos
                </Button>
                <Separator className="my-4" />
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Ayuda
                </Button>
              </nav>
            </CardContent>
            <CardFooter className="pt-0">
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Nueva Transacción
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="space-y-6">
          {/* Header con búsqueda y acciones */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Bienvenido, Fernando</h1>
              <p className="text-muted-foreground mt-1">Aquí está el resumen de tus finanzas</p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar transacciones..." className="pl-9" />
              </div>
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navegación en móvil */}
          <div className="md:hidden">
            <ScrollArea className="w-full" orientation="horizontal">
              <div className="flex space-x-1 pb-3">
                <Button 
                  variant={activeTab === "inicio" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => setActiveTab("inicio")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Inicio
                </Button>
                <Button 
                  variant={activeTab === "transacciones" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => setActiveTab("transacciones")}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Transacciones
                </Button>
                <Button 
                  variant={activeTab === "cuentas" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => setActiveTab("cuentas")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Cuentas
                </Button>
                <Button 
                  variant={activeTab === "presupuestos" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => setActiveTab("presupuestos")}
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Presupuestos
                </Button>
                <Button 
                  variant={activeTab === "objetivos" ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => setActiveTab("objetivos")}
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Objetivos
                </Button>
              </div>
            </ScrollArea>
          </div>

          {/* Tab: Inicio (Dashboard) */}
          {activeTab === "inicio" && (
            <>
              {/* Selector de periodo */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Período:</span>
                      <ToggleGroup type="single" value={selectedPeriod} onValueChange={(value) => value && setSelectedPeriod(value)}>
                        <ToggleGroupItem value="semanal" size="sm">Semanal</ToggleGroupItem>
                        <ToggleGroupItem value="mensual" size="sm">Mensual</ToggleGroupItem>
                        <ToggleGroupItem value="anual" size="sm">Anual</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                        Actualizar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-3.5 w-3.5" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-muted-foreground text-sm">{stat.title}</p>
                          <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                        </div>
                        <div className="p-2 rounded-full bg-gray-100">
                          {stat.icon}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <Badge variant={stat.trend === "up" ? "default" : "destructive"} className="mr-2">
                          {stat.change}
                        </Badge>
                        <span className="text-muted-foreground">{stat.description}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico de gastos por categoría */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Gastos por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
                      <div className="text-center">
                        <Activity className="h-10 w-10 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Gráfico de barras con distribución de gastos</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                      {categories.map((category, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{category.name}</span>
                            <span>{category.percentage}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className={`h-full ${category.color}`} style={{ width: `${category.percentage}%` }}></div>
                          </div>
                          <p className="text-sm text-muted-foreground">{formatCurrency(category.amount)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Últimas transacciones */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Últimas Transacciones</CardTitle>
                      <Button variant="ghost" size="sm" className="text-primary">
                        Ver todas
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                      <div className="px-4 py-2">
                        {transactions.slice(0, 5).map((transaction) => (
                          <div key={transaction.id} className="flex items-center gap-3 py-3 border-b last:border-0">
                            {transaction.icon}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{transaction.merchant}</h4>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>{transaction.category}</span>
                                <span className="mx-1">•</span>
                                <span>{transaction.date}</span>
                              </div>
                            </div>
                            <span className={`font-medium ${transaction.amount >= 0 ? 'text-emerald-600' : ''}`}>
                              {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Tab: Transacciones */}
          {activeTab === "transacciones" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Historial de Transacciones</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-3.5 w-3.5" />
                      Filtrar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-3.5 w-3.5" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      {transaction.icon}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{transaction.merchant}</h4>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>{transaction.category}</span>
                          <span className="mx-1">•</span>
                          <span>{transaction.date}</span>
                        </div>
                      </div>
                      <span className={`font-medium text-lg ${transaction.amount >= 0 ? 'text-emerald-600' : ''}`}>
                        {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <Button variant="outline">Cargar más transacciones</Button>
              </CardFooter>
            </Card>
          )}

          {/* Tab: Cuentas */}
          {activeTab === "cuentas" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle>Mis Cuentas</CardTitle>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir Cuenta
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {accounts.map((account) => (
                      <Card key={account.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {account.icon}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium">{account.name}</h3>
                              <p className="text-sm text-muted-foreground">{account.number}</p>
                              <p className="text-sm text-muted-foreground mt-1">{account.type}</p>
                              <p className={`text-lg font-bold mt-2 ${account.balance < 0 ? 'text-red-600' : ''}`}>
                                {formatCurrency(account.balance)}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Movimientos Recientes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="px-6">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center gap-3 py-4 border-b last:border-0">
                        {transaction.icon}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{transaction.merchant}</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>{transaction.category}</span>
                            <span className="mx-1">•</span>
                            <span>{transaction.date}</span>
                          </div>
                        </div>
                        <span className={`font-medium ${transaction.amount >= 0 ? 'text-emerald-600' : ''}`}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <Button variant="outline">Ver todas las transacciones</Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Tab: Presupuestos */}
          {activeTab === "presupuestos" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Mis Presupuestos</CardTitle>
                      <CardDescription>Marzo 2025</CardDescription>
                    </div>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo Presupuesto
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {budgets.map((budget, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <div>
                            <span className="font-medium">{budget.category}</span>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(budget.spent)} de {formatCurrency(budget.limit)}
                            </p>
                          </div>
                          <span 
                            className={`text-sm font-medium ${
                              budget.percentage > 100 
                                ? 'text-red-600' 
                                : budget.percentage > 80 
                                  ? 'text-amber-600' 
                                  : 'text-emerald-600'
                            }`}
                          >
                            {budget.percentage}%
                          </span>
                        </div>
                        <Progress 
                          value={budget.percentage} 
                          className={`h-2 ${
                            budget.percentage > 100 
                              ? 'bg-red-100' 
                              : budget.percentage > 80 
                                ? 'bg-amber-100' 
                                : 'bg-emerald-100'
                          }`}
                          indicatorClassName={
                            budget.percentage > 100 
                              ? 'bg-red-600' 
                              : budget.percentage > 80 
                                ? 'bg-amber-600' 
                                : 'bg-emerald-600'
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
                    <div className="text-center">
                      <Activity className="h-10 w-10 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Gráfico de tendencias de gastos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab: Objetivos */}
          {activeTab === "objetivos" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle>Mis Objetivos Financieros</CardTitle>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo Objetivo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {goals.map((goal, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="mb-4">
                            <div className="bg-blue-100 text-blue-600 p-2.5 rounded-full inline-block">
                              <Gift className="h-5 w-5" />
                            </div>
                          </div>
                          <h3 className="text-lg font-medium mb-1">{goal.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">Meta para {goal.date}</p>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span>{formatCurrency(goal.saved)}</span>
                              <span>{formatCurrency(goal.target)}</span>
                            </div>
                            <Progress value={goal.percentage} className="h-2" />
                            <p className="text-xs text-center text-muted-foreground">
                              {goal.percentage}% completado
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1" size="sm">Añadir fondos</Button>
                            <Button variant="outline" size="sm" className="flex-1">Detalles</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Card className="border-dashed">
                      <CardContent className="pt-6 h-full flex flex-col items-center justify-center text-center">
                        <div className="bg-gray-100 p-3 rounded-full mb-4">
                          <Plus className="h-5 w-5 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">Crear Nuevo Objetivo</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Establece metas de ahorro para tus proyectos
                        </p>
                        <Button>Comenzar</Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Consejos para ahorrar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full h-min">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Regla 50/30/20</h4>
                        <p className="text-sm text-gray-600">
                          Divide tus ingresos en 50% para necesidades, 30% para deseos y 20% para ahorro.
                          Este método simple te ayudará a mantener un balance financiero saludable.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-green-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full h-min">
                        <Lightbulb className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Automatiza tus ahorros</h4>
                        <p className="text-sm text-gray-600">
                          Configura transferencias automáticas a tu cuenta de ahorros cada vez que recibas
                          tu sueldo. Lo que no ves, no lo gastas.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Bell = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
  </svg>
);

const Filter = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const Lightbulb = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
    <path d="M9 18h6"></path>
    <path d="M10 22h4"></path>
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"></path>
  </svg>
);