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
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Eye,
  File,
  FileCheck,
  FileDown,
  FilePlus,
  FileSearch,
  FileText,
  FileX,
  Filter,
  Clock3,
  Loader2,
  Pen,
  Plus,
  Search,
  SlidersHorizontal,
  Tag,
  Trash,
  Upload,
  Users2,
} from "lucide-react";

// Datos de ejemplo para documentos
const documentsData = [
  {
    id: 1,
    title: "Contrato de Servicios Médicos",
    type: "contract",
    category: "legal",
    status: "approved",
    createdAt: "2025-02-15",
    updatedAt: "2025-02-20",
    size: "1.2 MB",
    author: "Ana Martínez",
    approvers: ["Juan Pérez", "María López"],
    tags: ["contrato", "servicios", "médico"]
  },
  {
    id: 2,
    title: "Política de Privacidad",
    type: "policy",
    category: "compliance",
    status: "pending",
    createdAt: "2025-02-17",
    updatedAt: "2025-02-17",
    size: "580 KB",
    author: "Carlos Ruiz",
    approvers: ["Juan Pérez"],
    tags: ["privacidad", "datos", "RGPD"]
  },
  {
    id: 3,
    title: "Informe Anual 2024",
    type: "report",
    category: "financial",
    status: "approved",
    createdAt: "2025-01-30",
    updatedAt: "2025-02-10",
    size: "3.7 MB",
    author: "Elena García",
    approvers: ["Juan Pérez", "Carlos Ruiz", "Roberto Sánchez"],
    tags: ["informe", "anual", "finanzas"]
  },
  {
    id: 4,
    title: "Propuesta Comercial Cliente XYZ",
    type: "proposal",
    category: "sales",
    status: "draft",
    createdAt: "2025-02-22",
    updatedAt: "2025-02-22",
    size: "850 KB",
    author: "Roberto Sánchez",
    approvers: [],
    tags: ["propuesta", "comercial", "cliente"]
  },
  {
    id: 5,
    title: "Manual de Procedimientos Operativos",
    type: "manual",
    category: "operations",
    status: "rejected",
    createdAt: "2025-02-01",
    updatedAt: "2025-02-18",
    size: "4.3 MB",
    author: "María López",
    approvers: ["Ana Martínez"],
    tags: ["manual", "procedimientos", "operaciones"]
  },
  {
    id: 6,
    title: "Acuerdo de Confidencialidad",
    type: "contract",
    category: "legal",
    status: "approved",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-20",
    size: "720 KB",
    author: "Juan Pérez",
    approvers: ["Carlos Ruiz", "Elena García"],
    tags: ["confidencialidad", "legal", "acuerdo"]
  }
];

// Componente para el card del documento
const DocumentCard = ({ document }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aprobado</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rechazado</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Borrador</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'contract':
        return <FileCheck className="h-5 w-5" />;
      case 'policy':
        return <FileText className="h-5 w-5" />;
      case 'report':
        return <FileText className="h-5 w-5" />;
      case 'proposal':
        return <FilePlus className="h-5 w-5" />;
      case 'manual':
        return <FileSearch className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'legal':
        return "bg-blue-50 text-blue-700";
      case 'compliance':
        return "bg-purple-50 text-purple-700";
      case 'financial':
        return "bg-emerald-50 text-emerald-700";
      case 'sales':
        return "bg-orange-50 text-orange-700";
      case 'operations':
        return "bg-indigo-50 text-indigo-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-gray-100">
      <CardHeader className="p-4 bg-gray-50/50 border-b">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getCategoryColor(document.category)}`}>
              {getTypeIcon(document.type)}
            </div>
            <div>
              <CardTitle className="text-base font-medium">{document.title}</CardTitle>
              <CardDescription className="mt-1 text-xs flex items-center">
                {document.author} · {new Date(document.updatedAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(document.status)}
            <span className="text-xs text-gray-500">{document.size}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-1 mb-3">
          {document.tags.map((tag, index) => (
            <Badge variant="secondary" key={index} className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Users2 className="h-4 w-4 mr-2 text-gray-400" />
          <span>
            {document.approvers.length === 0 
              ? "Sin aprobadores" 
              : `${document.approvers.length} aprobador${document.approvers.length > 1 ? 'es' : ''}`}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm" className="text-xs">
          <Eye className="h-3.5 w-3.5 mr-1" />
          Ver documento
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pen className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// Componente del visor de documentos (simulado)
const DocumentViewer = ({ document }) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-white h-[600px] flex flex-col">
      <div className="flex items-center justify-between bg-gray-50 border-b p-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-500" />
          <span className="font-medium">{document.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs h-8">
            <Download className="h-3.5 w-3.5 mr-1" />
            Descargar
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8">
            <Pen className="h-3.5 w-3.5 mr-1" />
            Anotar
          </Button>
        </div>
      </div>
      <div className="flex-grow p-4 bg-gray-50 flex items-center justify-center">
        {/* Simulación del contenido del documento */}
        <div className="bg-white shadow-sm rounded-md w-full max-w-2xl h-[500px] p-8 flex flex-col items-center justify-center">
          <FileText className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-400 text-center">Visor de documentos simulado</p>
          <p className="text-gray-400 text-center text-sm mt-2">Se mostraría el contenido de "{document.title}"</p>
          <div className="mt-6 w-full space-y-3">
            <div className="h-3 bg-gray-100 rounded-full w-full"></div>
            <div className="h-3 bg-gray-100 rounded-full w-5/6 mx-auto"></div>
            <div className="h-3 bg-gray-100 rounded-full w-full"></div>
            <div className="h-3 bg-gray-100 rounded-full w-4/5 mx-auto"></div>
            <div className="h-3 bg-gray-100 rounded-full w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para la barra lateral de detalles del documento
const DocumentDetailsSidebar = ({ document }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return { icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, text: "Aprobado", color: "text-green-700" };
      case 'pending':
        return { icon: <Clock className="h-4 w-4 text-yellow-500" />, text: "Pendiente de aprobación", color: "text-yellow-700" };
      case 'rejected':
        return { icon: <FileX className="h-4 w-4 text-red-500" />, text: "Rechazado", color: "text-red-700" };
      case 'draft':
        return { icon: <File className="h-4 w-4 text-gray-500" />, text: "Borrador", color: "text-gray-700" };
      default:
        return { icon: <File className="h-4 w-4" />, text: "Desconocido", color: "text-gray-700" };
    }
  };

  const statusInfo = getStatusInfo(document.status);
  
  return (
    <div className="w-full border rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-50 p-4 border-b">
        <h3 className="font-medium">Detalles del documento</h3>
      </div>
      <div className="p-4 space-y-6">
        <div>
          <div className="flex items-center mb-4">
            {statusInfo.icon}
            <span className={`ml-2 text-sm font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Autor:</span>
              <span className="font-medium">{document.author}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tipo:</span>
              <span className="font-medium capitalize">{document.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Categoría:</span>
              <span className="font-medium capitalize">{document.category}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tamaño:</span>
              <span className="font-medium">{document.size}</span>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="text-sm font-medium mb-3">Proceso de aprobación</h4>
          <div className="space-y-2">
            {document.approvers.length > 0 ? (
              document.approvers.map((approver, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 rounded-md bg-gray-50">
                  <span>{approver}</span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No hay aprobadores asignados</p>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="text-sm font-medium mb-3">Historial</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-xs">
              <div className="mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Documento aprobado</p>
                <p className="text-gray-500">
                  {new Date(document.updatedAt).toLocaleDateString()} - {document.approvers[0]}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <div className="mt-0.5">
                <Clock3 className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Documento enviado para aprobación</p>
                <p className="text-gray-500">
                  {new Date(document.createdAt).toLocaleDateString()} - {document.author}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <div className="mt-0.5">
                <File className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <div>
                <p className="font-medium">Documento creado</p>
                <p className="text-gray-500">
                  {new Date(document.createdAt).toLocaleDateString()} - {document.author}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t p-4">
        <Button className="w-full">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Aprobar documento
        </Button>
      </div>
    </div>
  );
};

// Formulario de subida de documento (simulado)
const UploadDocumentForm = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título del documento</Label>
        <Input id="title" placeholder="Ej. Contrato de Servicios" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de documento</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contract">Contrato</SelectItem>
              <SelectItem value="policy">Política</SelectItem>
              <SelectItem value="report">Informe</SelectItem>
              <SelectItem value="proposal">Propuesta</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="compliance">Cumplimiento</SelectItem>
              <SelectItem value="financial">Financiero</SelectItem>
              <SelectItem value="sales">Ventas</SelectItem>
              <SelectItem value="operations">Operaciones</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
        <Input id="tags" placeholder="Ej. contrato, servicios, cliente" />
      </div>
      
      <div className="space-y-2">
        <Label>Archivo</Label>
        <div className="border-2 border-dashed rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="flex flex-col items-center">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium mb-1">Arrastre y suelte el archivo aquí</p>
            <p className="text-xs text-gray-500 mb-3">PDF, DOCX hasta 10MB</p>
            <Button variant="outline" size="sm">
              Seleccionar archivo
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="approvers">Aprobadores</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar aprobadores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="juanperez">Juan Pérez</SelectItem>
            <SelectItem value="marialopez">María López</SelectItem>
            <SelectItem value="carlosruiz">Carlos Ruiz</SelectItem>
            <SelectItem value="elenagarcia">Elena García</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline">Cancelar</Button>
        <Button>Subir documento</Button>
      </div>
    </div>
  );
};

// Componente principal del gestor de documentos
const Testing13 = () => {
  const [documents, setDocuments] = useState(documentsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchesTab = activeTab === "all" || 
                      (activeTab === "recent" && new Date(doc.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                      (activeTab === "approved" && doc.status === "approved") ||
                      (activeTab === "pending" && doc.status === "pending");
    
    return matchesSearch && matchesStatus && matchesCategory && matchesTab;
  });
  
  // Simular carga
  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestor de Documentos Legales</h1>
            <p className="text-gray-500 mt-1">
              Administre y organice su documentación de forma eficiente y segura
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Subir documento
            </Button>
            <Button variant="default">
              <FilePlus className="h-4 w-4 mr-2" />
              Nuevo documento
            </Button>
          </div>
        </div>
        
        {/* Búsqueda y filtros */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          <div className="relative md:col-span-5">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar documentos..." 
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyUp={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="md:col-span-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="compliance">Cumplimiento</SelectItem>
                <SelectItem value="financial">Financiero</SelectItem>
                <SelectItem value="sales">Ventas</SelectItem>
                <SelectItem value="operations">Operaciones</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-1">
            <Button variant="outline" className="w-full h-10" onClick={handleSearch}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SlidersHorizontal className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Pestañas de documentos */}
      <div className="mb-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
            <TabsTrigger 
              value="all" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-sm py-3 px-4"
            >
              Todos los documentos
            </TabsTrigger>
            <TabsTrigger 
              value="recent" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-sm py-3 px-4"
            >
              Recientes
            </TabsTrigger>
            <TabsTrigger 
              value="approved" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-sm py-3 px-4"
            >
              Aprobados
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent text-sm py-3 px-4"
            >
              Pendientes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Lista de documentos o vista detallada */}
      {selectedDocument ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500"
                onClick={() => setSelectedDocument(null)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
              <h2 className="font-semibold ml-2">{selectedDocument.title}</h2>
            </div>
            <DocumentViewer document={selectedDocument} />
          </div>
          <div>
            <DocumentDetailsSidebar document={selectedDocument} />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Documentos</h2>
              <p className="text-sm text-gray-500">
                {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs">
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
                Ordenar por
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Cargando documentos...</p>
              </div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50">
              <div className="text-center">
                <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-1">No se encontraron documentos</p>
                <p className="text-sm text-gray-400">Intenta con diferentes filtros o términos de búsqueda</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map(doc => (
                <div key={doc.id} onClick={() => setSelectedDocument(doc)} className="cursor-pointer">
                  <DocumentCard document={doc} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Testing13;