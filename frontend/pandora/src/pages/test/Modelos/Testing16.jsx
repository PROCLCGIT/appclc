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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Edit,
  FileDown,
  FileText,
  Filter,
  Home,
  Info,
  LayoutDashboard,
  LineChart,
  MapPin,
  Milestone,
  Plus,
  Search,
  Settings,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

// Datos de ejemplo
const projectsData = [
  {
    id: 1,
    name: "Torre Residencial Marina Bay",
    client: "Grupo Inmobiliario Alvarez",
    budget: 12500000,
    spent: 5200000,
    start_date: "2025-01-15",
    end_date: "2026-07-30",
    status: "active",
    progress: 42,
    location: "Malecón 2000, Guayaquil",
    manager: "Carlos Mendoza",
    team_size: 48,
    type: "residential",
    description: "Construcción de una torre residencial de lujo de 25 pisos con 150 apartamentos, áreas comunes y 3 niveles de estacionamientos subterráneos."
  },
  {
    id: 2,
    name: "Centro Comercial Plaza Norte",
    client: "Desarrollos Comerciales S.A.",
    budget: 18700000,
    spent: 12400000,
    start_date: "2024-08-10",
    end_date: "2025-11-20",
    status: "active",
    progress: 67,
    location: "Av. 6 de Diciembre, Quito",
    manager: "Ana Martínez",
    team_size: 72,
    type: "commercial",
    description: "Desarrollo de un centro comercial de 3 niveles con 120 locales comerciales, food court, cines y estacionamiento para 800 vehículos."
  },
  {
    id: 3,
    name: "Hospital General del Valle",
    client: "Ministerio de Salud",
    budget: 24300000,
    spent: 22100000,
    start_date: "2023-05-22",
    end_date: "2025-03-15",
    status: "delayed",
    progress: 89,
    location: "Valle de los Chillos, Pichincha",
    manager: "Roberto Sánchez",
    team_size: 94,
    type: "healthcare",
    description: "Construcción de un hospital general de 250 camas con 8 quirófanos, áreas de emergencia, consulta externa y servicios complementarios."
  },
  {
    id: 4,
    name: "Campus Universitario Tecnológico",
    client: "Universidad Politécnica",
    budget: 31200000,
    spent: 8900000,
    start_date: "2024-11-05",
    end_date: "2027-02-28",
    status: "active",
    progress: 28,
    location: "Vía a Daule km 12, Guayaquil",
    manager: "Diana Torres",
    team_size: 63,
    type: "education",
    description: "Desarrollo de un campus universitario con 5 edificios para facultades, biblioteca, auditorios, laboratorios, áreas deportivas y estacionamientos."
  },
  {
    id: 5,
    name: "Puente Metropolitano",
    client: "Ministerio de Obras Públicas",
    budget: 42800000,
    spent: 38500000,
    start_date: "2023-03-10",
    end_date: "2025-01-30",
    status: "completed",
    progress: 100,
    location: "Río Guayas, Guayaquil",
    manager: "Eduardo Vega",
    team_size: 105,
    type: "infrastructure",
    description: "Construcción de un puente de 1.2 km de longitud con 6 carriles para tráfico vehicular y paso peatonal que conecta dos áreas metropolitanas."
  }
];

const phasesData = [
  {
    project_id: 1,
    phases: [
      { id: 1, name: "Planificación y Diseño", start_date: "2025-01-15", end_date: "2025-03-30", progress: 100, status: "completed" },
      { id: 2, name: "Cimentación", start_date: "2025-04-01", end_date: "2025-07-15", progress: 100, status: "completed" },
      { id: 3, name: "Estructura Principal", start_date: "2025-07-16", end_date: "2025-12-31", progress: 65, status: "active" },
      { id: 4, name: "Instalaciones", start_date: "2025-10-15", end_date: "2026-03-30", progress: 10, status: "active" },
      { id: 5, name: "Acabados", start_date: "2026-02-01", end_date: "2026-06-30", progress: 0, status: "pending" },
      { id: 6, name: "Entrega", start_date: "2026-07-01", end_date: "2026-07-30", progress: 0, status: "pending" }
    ]
  }
];

// Componente para la tarjeta de proyecto
const ProjectCard = ({ project, onClick }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Activo</Badge>;
      case 'delayed':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Retrasado</Badge>;
      case 'completed':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Completado</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return <Badge>Desconocido</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'residential':
        return <Home className="h-4 w-4 text-indigo-600" />;
      case 'commercial':
        return <Building className="h-4 w-4 text-blue-600" />;
      case 'infrastructure':
        return <LineChart className="h-4 w-4 text-teal-600" />;
      case 'healthcare':
        return <Info className="h-4 w-4 text-rose-600" />;
      case 'education':
        return <FileText className="h-4 w-4 text-amber-600" />;
      default:
        return <Building className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50">
              {getTypeIcon(project.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription>{project.client}</CardDescription>
            </div>
          </div>
          {getStatusBadge(project.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Presupuesto:</span>
            <span className="font-medium">{formatCurrency(project.budget)}</span>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Progreso:</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
            <span className="text-gray-500 truncate">{project.location}</span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
            <span className="text-gray-500">
              {formatDate(project.start_date)} - {formatDate(project.end_date)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-4 pb-4">
        <Button variant="outline" size="sm" onClick={() => onClick(project.id)}>
          Ver detalles
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// Componente para la línea de tiempo
const TimelineView = ({ phases }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'active':
        return 'bg-blue-500';
      case 'delayed':
        return 'bg-amber-500';
      case 'pending':
        return 'bg-gray-300';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="p-1">
      <div className="space-y-6">
        {phases.map((phase, index) => (
          <div key={phase.id} className="relative">
            {/* Línea vertical conectora */}
            {index !== phases.length - 1 && (
              <div className="absolute top-8 bottom-0 left-[18px] w-0.5 bg-gray-200 z-0"></div>
            )}
            
            <div className="flex gap-4">
              {/* Punto de la fase */}
              <div className={`w-9 h-9 rounded-full ${getStatusColor(phase.status)} flex items-center justify-center text-white z-10 flex-shrink-0`}>
                {phase.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : phase.status === 'active' ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              {/* Contenido de la fase */}
              <div className="bg-white border rounded-lg p-4 shadow-sm w-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{phase.name}</h3>
                  <Badge 
                    className={`
                      ${phase.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                        phase.status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        phase.status === 'delayed' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'}
                    `}
                  >
                    {phase.status === 'completed' ? 'Completado' : 
                     phase.status === 'active' ? 'En progreso' :
                     phase.status === 'delayed' ? 'Retrasado' : 'Pendiente'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {formatDate(phase.start_date)} - {formatDate(phase.end_date)}
                </p>
                <div className="flex items-center">
                  <div className="flex-grow">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progreso</span>
                      <span>{phase.progress}%</span>
                    </div>
                    <Progress value={phase.progress} className="h-1.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente principal
const Testing16 = () => {
  const [projects, setProjects] = useState(projectsData);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  
  // Obtener proyecto por ID
  const getProjectById = (id) => {
    return projects.find(project => project.id === id);
  };
  
  // Obtener fases por proyecto ID
  const getPhasesByProjectId = (id) => {
    const projectPhases = phasesData.find(item => item.project_id === id);
    return projectPhases ? projectPhases.phases : [];
  };
  
  // Manejar clic en tarjeta de proyecto
  const handleProjectClick = (id) => {
    setSelectedProject(getProjectById(id));
    setActiveTab("overview");
  };
  
  // Volver a la lista de proyectos
  const handleBackToList = () => {
    setSelectedProject(null);
  };
  
  // Filtrar proyectos
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedProject ? selectedProject.name : "Gestión de Proyectos de Construcción"}
            </h1>
            <p className="text-gray-500 mt-1">
              {selectedProject ? selectedProject.description : "Administre y supervise proyectos de construcción e infraestructura"}
            </p>
          </div>
          {!selectedProject && (
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo proyecto
              </Button>
            </div>
          )}
          {selectedProject && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBackToList}>
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Volver
              </Button>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Vista de lista de proyectos */}
      {!selectedProject && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar proyectos..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="delayed">Retrasados</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-64 bg-gray-50 rounded-lg border">
                <div className="text-center">
                  <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No se encontraron proyectos</h3>
                  <p className="text-gray-500 max-w-md mb-4">
                    No hay proyectos que coincidan con los criterios de búsqueda o filtros seleccionados.
                  </p>
                  <Button onClick={() => {setSearchTerm(""); setStatusFilter("all");}}>
                    Borrar filtros
                  </Button>
                </div>
              </div>
            ) : (
              filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onClick={handleProjectClick}
                />
              ))
            )}
          </div>
        </>
      )}
      
      {/* Detalle del proyecto seleccionado */}
      {selectedProject && (
        <>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white border rounded-lg mb-6 p-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-md"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Visión general
              </TabsTrigger>
              <TabsTrigger 
                value="timeline" 
                className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-md"
              >
                <Milestone className="h-4 w-4 mr-2" />
                Cronograma
              </TabsTrigger>
              <TabsTrigger 
                value="budget" 
                className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-md"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Presupuesto
              </TabsTrigger>
              <TabsTrigger 
                value="team" 
                className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none rounded-md"
              >
                <Users className="h-4 w-4 mr-2" />
                Equipo
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información del Proyecto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-gray-500">Cliente</Label>
                        <p className="font-medium">{selectedProject.client}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Ubicación</Label>
                        <p className="font-medium">{selectedProject.location}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Gerente de Proyecto</Label>
                        <p className="font-medium">{selectedProject.manager}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Fecha de inicio</Label>
                        <p className="font-medium">{formatDate(selectedProject.start_date)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Fecha de finalización</Label>
                        <p className="font-medium">{formatDate(selectedProject.end_date)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Estado</Label>
                        <div className="mt-1">
                          {selectedProject.status === 'active' ? (
                            <Badge className="bg-green-50 text-green-700 border-green-200">Activo</Badge>
                          ) : selectedProject.status === 'delayed' ? (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200">Retrasado</Badge>
                          ) : selectedProject.status === 'completed' ? (
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200">Completado</Badge>
                          ) : (
                            <Badge className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Progreso del Proyecto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Progreso General</Label>
                          <Badge variant="outline">{selectedProject.progress}% Completado</Badge>
                        </div>
                        <Progress value={selectedProject.progress} className="h-3" />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <Label>Fases del Proyecto</Label>
                        {getPhasesByProjectId(selectedProject.id).map(phase => (
                          <div key={phase.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{phase.name}</span>
                              <span>{phase.progress}%</span>
                            </div>
                            <Progress 
                              value={phase.progress} 
                              className={`h-2 ${
                                phase.status === 'completed' ? 'bg-green-100' : 
                                phase.status === 'active' ? 'bg-blue-100' :
                                phase.status === 'delayed' ? 'bg-amber-100' : 'bg-gray-100'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Resumen Financiero</CardTitle>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ver Reportes
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-gray-500">Presupuesto Total</Label>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(selectedProject.budget)}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500">Gastado hasta la fecha</Label>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(selectedProject.spent)}
                          </p>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="text-xs">
                              {Math.round((selectedProject.spent / selectedProject.budget) * 100)}% del presupuesto
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-500">Remanente</Label>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(selectedProject.budget - selectedProject.spent)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center h-full">
                        <div className="relative w-40 h-40">
                          {/* Gráfico circular simulado */}
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle 
                              cx="50" cy="50" r="40" 
                              fill="none" 
                              stroke="#e5e7eb" 
                              strokeWidth="15"
                            />
                            <circle 
                              cx="50" cy="50" r="40" 
                              fill="none" 
                              stroke="#4f46e5" 
                              strokeWidth="15"
                              strokeDasharray="251.2"
                              strokeDashoffset={251.2 * (1 - selectedProject.spent / selectedProject.budget)}
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-gray-900">
                                {Math.round((selectedProject.spent / selectedProject.budget) * 100)}%
                              </p>
                              <p className="text-xs text-gray-500">Utilizado</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Equipo del Proyecto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs text-gray-500">Gerente de Proyecto</Label>
                        <div className="flex items-center mt-1">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                          <p className="font-medium">{selectedProject.manager}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-500">Tamaño del Equipo</Label>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {selectedProject.team_size} <span className="text-sm font-normal text-gray-500">personas</span>
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <Button variant="outline" className="w-full">
                          <Users className="h-4 w-4 mr-2" />
                          Ver Equipo Completo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Cronograma del Proyecto</CardTitle>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver en Calendario
                    </Button>
                  </div>
                  <CardDescription>
                    Duración: {formatDate(selectedProject.start_date)} - {formatDate(selectedProject.end_date)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TimelineView phases={getPhasesByProjectId(selectedProject.id)} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="budget">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Presupuesto del Proyecto</CardTitle>
                  <CardDescription>
                    Análisis detallado de presupuesto, gastos y proyecciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">La vista detallada de presupuesto está en desarrollo</p>
                    <Button>Ver presupuesto general</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Equipo del Proyecto</CardTitle>
                  <CardDescription>
                    Miembros del equipo, roles y asignaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">La vista detallada del equipo está en desarrollo</p>
                    <Button>Ver organigrama del proyecto</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Testing16;