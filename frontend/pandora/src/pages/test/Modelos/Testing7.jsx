import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, LineChart, PieChart, Folders, CalendarRange, Users2, Clock, ArrowUpRight } from "lucide-react";

export default function Testing7() {
  const projectData = [
    {
      id: 1,
      name: "Rediseño Portal Clientes",
      status: "En progreso",
      completion: 65,
      deadline: "28 Mar 2025",
      team: ["A.M", "J.L", "R.K"],
      priority: "Alta"
    },
    {
      id: 2,
      name: "Integración ERP",
      status: "Planificación",
      completion: 25,
      deadline: "15 Abr 2025",
      team: ["M.S", "P.J"],
      priority: "Media"
    },
    {
      id: 3,
      name: "App Móvil v2.0",
      status: "En revisión",
      completion: 90,
      deadline: "10 Mar 2025",
      team: ["T.G", "L.M", "R.K", "P.J"],
      priority: "Alta"
    },
    {
      id: 4,
      name: "Migración Base de Datos",
      status: "Completado",
      completion: 100,
      deadline: "1 Mar 2025",
      team: ["A.M", "M.S"],
      priority: "Crítica"
    }
  ];

  const getBadgeColor = (status) => {
    switch (status) {
      case "En progreso": return "bg-blue-100 text-blue-800";
      case "Planificación": return "bg-purple-100 text-purple-800";
      case "En revisión": return "bg-amber-100 text-amber-800";
      case "Completado": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Crítica": return "bg-red-100 text-red-800";
      case "Alta": return "bg-orange-100 text-orange-800";
      case "Media": return "bg-blue-100 text-blue-800";
      case "Baja": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Proyectos</h1>
          <p className="text-gray-500 mt-1">Visualiza y gestiona todos tus proyectos en un solo lugar</p>
        </div>
        <Button className="gap-2">
          <Folders size={16} />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Proyectos Activos</p>
                <h3 className="text-2xl font-bold mt-1">24</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Folders className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>8% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Horas Registradas</p>
                <h3 className="text-2xl font-bold mt-1">1,248</h3>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>12% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Próximos Deadlines</p>
                <h3 className="text-2xl font-bold mt-1">8</h3>
              </div>
              <div className="bg-amber-100 p-2 rounded-full">
                <CalendarRange className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-red-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>3 en la próxima semana</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Miembros Equipo</p>
                <h3 className="text-2xl font-bold mt-1">16</h3>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <Users2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-blue-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>2 nuevos este mes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Rendimiento del Proyecto</CardTitle>
            <CardDescription>Seguimiento del avance mensual</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
              <div className="text-center">
                <LineChart className="h-10 w-10 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Gráfico de línea de avance de proyectos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>Estado actual de todos los proyectos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">
              <div className="text-center">
                <PieChart className="h-10 w-10 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Gráfico circular de distribución</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todos" className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="todos">Todos los Proyectos</TabsTrigger>
            <TabsTrigger value="en-progreso">En Progreso</TabsTrigger>
            <TabsTrigger value="proximos">Próximos</TabsTrigger>
            <TabsTrigger value="completados">Completados</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Filtrar</Button>
            <Button variant="outline" size="sm">Ordenar</Button>
          </div>
        </div>
        
        <TabsContent value="todos" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectData.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{project.name}</CardTitle>
                    <Badge className={getBadgeColor(project.status)}>{project.status}</Badge>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <CardDescription>Deadline: {project.deadline}</CardDescription>
                    <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progreso</span>
                      <span>{project.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${project.completion}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {project.team.map((member, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium"
                      >
                        {member}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 py-2 border-t">
                  <div className="flex justify-between items-center w-full">
                    <Button variant="ghost" size="sm">Ver detalles</Button>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}