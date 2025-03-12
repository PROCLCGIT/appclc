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
import { Textarea } from "@/components/ui/textarea";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  BarChart4,
  Book,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  HelpCircle,
  History,
  LineChart,
  Link,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings,
  Star,
  Tag,
  ThumbsDown,
  ThumbsUp,
  Timer,
  User,
  Users,
  MoreHorizontal,
  X,
} from "lucide-react";

// Datos simulados
const ticketsData = [
  {
    id: 1,
    subject: "Error al realizar el pago",
    customer: "Carlos Méndez",
    status: "open",
    priority: "high",
    category: "payment",
    assignee: "Ana Torres",
    createdAt: "2025-02-26T10:35:00",
    updatedAt: "2025-02-26T14:22:00",
    messages: [
      {
        id: 1,
        sender: "customer",
        senderName: "Carlos Méndez",
        content: "Estoy intentando realizar un pago en la plataforma pero me aparece un error que dice 'Transacción rechazada'. He intentado con diferentes tarjetas pero sigue sin funcionar. ¿Pueden ayudarme?",
        timestamp: "2025-02-26T10:35:00",
        attachments: []
      },
      {
        id: 2,
        sender: "agent",
        senderName: "Ana Torres",
        content: "Hola Carlos, gracias por contactarnos. Lamento los inconvenientes. ¿Podrías indicarme en qué momento exacto del proceso aparece el error? ¿Aparece algún código de error específico?",
        timestamp: "2025-02-26T11:15:00",
        attachments: []
      },
      {
        id: 3,
        sender: "customer",
        senderName: "Carlos Méndez",
        content: "Aparece justo después de ingresar los datos de la tarjeta y dar clic en 'Procesar pago'. El error dice 'Error 3022: Transacción rechazada por la entidad bancaria'.",
        timestamp: "2025-02-26T11:42:00",
        attachments: [
          { id: 1, name: "error_screenshot.png", size: "243 KB", type: "image" }
        ]
      },
      {
        id: 4,
        sender: "agent",
        senderName: "Ana Torres",
        content: "Gracias por la información. He revisado el error y parece ser un problema temporal con nuestro procesador de pagos. Nuestro equipo técnico está trabajando en solucionarlo. Por mientras, ¿podrías intentar utilizar el método de pago por transferencia bancaria? Es una alternativa que debería funcionar sin problemas.",
        timestamp: "2025-02-26T14:22:00",
        attachments: [
          { id: 2, name: "payment_alternative.pdf", size: "521 KB", type: "document" }
        ]
      }
    ],
    tags: ["pago", "error", "urgente"]
  },
  {
    id: 2,
    subject: "Solicitud de cambio de plan",
    customer: "María López",
    status: "pending",
    priority: "medium",
    category: "billing",
    assignee: "Roberto Sánchez",
    createdAt: "2025-02-25T09:12:00",
    updatedAt: "2025-02-26T11:30:00",
    messages: [
      {
        id: 1,
        sender: "customer",
        senderName: "María López",
        content: "Hola, me gustaría cambiar mi plan actual al plan Premium. ¿Cuál es el procedimiento a seguir?",
        timestamp: "2025-02-25T09:12:00",
        attachments: []
      }
    ],
    tags: ["plan", "facturación"]
  },
  {
    id: 3,
    subject: "Problema con la descarga de reportes",
    customer: "Juan Pérez",
    status: "solved",
    priority: "low",
    category: "technical",
    assignee: "Ana Torres",
    createdAt: "2025-02-24T16:45:00",
    updatedAt: "2025-02-25T10:18:00",
    messages: [
      {
        id: 1,
        sender: "customer",
        senderName: "Juan Pérez",
        content: "No puedo descargar los reportes mensuales desde el panel de administración. Al hacer clic en el botón de descarga no pasa nada.",
        timestamp: "2025-02-24T16:45:00",
        attachments: []
      }
    ],
    tags: ["reportes", "descarga", "técnico"]
  },
  {
    id: 4,
    subject: "Consulta sobre nuevas funcionalidades",
    customer: "Elena Ramírez",
    status: "open",
    priority: "medium",
    category: "product",
    assignee: "Roberto Sánchez",
    createdAt: "2025-02-26T08:30:00",
    updatedAt: "2025-02-26T13:15:00",
    messages: [
      {
        id: 1,
        sender: "customer",
        senderName: "Elena Ramírez",
        content: "Buenos días, me gustaría saber si tienen planeado incluir la funcionalidad de exportación a Excel en la próxima actualización.",
        timestamp: "2025-02-26T08:30:00",
        attachments: []
      }
    ],
    tags: ["funcionalidad", "consulta"]
  },
  {
    id: 5,
    subject: "Error 404 en la página de informes",
    customer: "Pedro González",
    status: "open",
    priority: "high",
    category: "technical",
    assignee: "Ana Torres",
    createdAt: "2025-02-26T11:05:00",
    updatedAt: "2025-02-26T11:05:00",
    messages: [
      {
        id: 1,
        sender: "customer",
        senderName: "Pedro González",
        content: "Cuando intento acceder a la sección de informes me aparece un error 404. Esto ha comenzado a suceder hoy mismo.",
        timestamp: "2025-02-26T11:05:00",
        attachments: []
      }
    ],
    tags: ["error", "técnico", "urgente"]
  }
];

const knowledgeBaseData = [
  {
    id: 1,
    title: "Cómo realizar un pago en la plataforma",
    category: "payment",
    views: 1245,
    helpfulRating: 92,
    lastUpdated: "2025-01-15"
  },
  {
    id: 2,
    title: "Guía de solución de problemas comunes",
    category: "technical",
    views: 3421,
    helpfulRating: 87,
    lastUpdated: "2025-02-10"
  },
  {
    id: 3,
    title: "Cómo cambiar su plan de suscripción",
    category: "billing",
    views: 876,
    helpfulRating: 95,
    lastUpdated: "2025-01-23"
  },
  {
    id: 4,
    title: "Configuración de notificaciones",
    category: "account",
    views: 654,
    helpfulRating: 89,
    lastUpdated: "2025-02-05"
  },
  {
    id: 5,
    title: "Exportación de datos a diferentes formatos",
    category: "usage",
    views: 1098,
    helpfulRating: 91,
    lastUpdated: "2025-02-18"
  }
];

// Componente para la tarjeta de ticket
const TicketCard = ({ ticket, onClick, isSelected }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Abierto</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'solved':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Resuelto</Badge>;
      case 'closed':
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Cerrado</Badge>;
      default:
        return <Badge>Desconocido</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Alta</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Media</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Baja</Badge>;
      default:
        return <Badge variant="outline">Desconocida</Badge>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card 
      className={`mb-3 cursor-pointer hover:border-blue-200 transition-colors ${isSelected ? 'border-blue-500 bg-blue-50/30' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between mb-2">
          <h3 className="font-medium text-sm truncate">{ticket.subject}</h3>
          <div className="flex gap-2">
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            <span>{ticket.customer}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatDate(ticket.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {ticket.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para el chat de ticket
const TicketChat = ({ ticket, onClose }) => {
  const [newMessage, setNewMessage] = useState("");
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAttachment = (attachment) => {
    if (attachment.type === 'image') {
      return (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border mt-2">
          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
            <Eye className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-grow">
            <p className="text-sm font-medium">{attachment.name}</p>
            <p className="text-xs text-gray-500">{attachment.size}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border mt-2">
          <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded flex items-center justify-center">
            <Book className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-grow">
            <p className="text-sm font-medium">{attachment.name}</p>
            <p className="text-xs text-gray-500">{attachment.size}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Cabecera */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" className="h-8 w-8 p-0 mr-2" onClick={onClose}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-semibold">{ticket.subject}</h2>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">#{ticket.id}</span>
              <span>•</span>
              <span className="mx-2">{ticket.customer}</span>
              <span>•</span>
              <span className="ml-2">Creado: {formatDate(ticket.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cuerpo del chat */}
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-6">
          {ticket.messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'agent' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] ${message.sender === 'agent' ? 'bg-white border' : 'bg-blue-50 border border-blue-100'} rounded-lg p-4`}>
                <div className="flex items-center mb-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${message.sender === 'agent' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {message.sender === 'agent' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                  </div>
                  <div className="ml-2">
                    <p className="font-medium text-sm">{message.senderName}</p>
                    <p className="text-xs text-gray-500">{formatDate(message.timestamp)}</p>
                  </div>
                </div>
                <p className="text-sm mb-2">{message.content}</p>
                {message.attachments.length > 0 && (
                  <div className="space-y-2">
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id}>
                        {renderAttachment(attachment)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Panel de respuesta */}
      <div className="p-4 border-t">
        <div className="bg-white border rounded-lg">
          <Textarea 
            placeholder="Escribir respuesta..." 
            className="border-0 focus-visible:ring-0 resize-none min-h-[120px]"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <div className="flex justify-between p-2 border-t">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm">
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para la tarjeta de detalles del ticket
const TicketDetails = ({ ticket }) => {
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'payment':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Pagos</Badge>;
      case 'billing':
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200">Facturación</Badge>;
      case 'technical':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Técnico</Badge>;
      case 'product':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Producto</Badge>;
      default:
        return <Badge>General</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-1">Detalles del ticket</h3>
        <p className="text-sm text-gray-500">#{ticket.id} - {ticket.subject}</p>
      </div>
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Información</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Categoría</p>
                <div className="mt-1">{getCategoryBadge(ticket.category)}</div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Asignado a</p>
                <div className="flex items-center mt-1">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                    <User className="h-3 w-3 text-purple-700" />
                  </div>
                  <p className="text-sm font-medium">{ticket.assignee}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Estado</p>
                <div className="flex items-center mt-1">
                  <span className={`h-2 w-2 rounded-full ${
                    ticket.status === 'open' ? 'bg-blue-500' :
                    ticket.status === 'pending' ? 'bg-yellow-500' :
                    ticket.status === 'solved' ? 'bg-green-500' : 'bg-gray-500'
                  } mr-2`}></span>
                  <p className="text-sm font-medium">
                    {ticket.status === 'open' ? 'Abierto' :
                     ticket.status === 'pending' ? 'Pendiente' :
                     ticket.status === 'solved' ? 'Resuelto' : 'Cerrado'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Prioridad</p>
                <div className="flex items-center mt-1">
                  <span className={`h-2 w-2 rounded-full ${
                    ticket.priority === 'high' ? 'bg-rose-500' :
                    ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  } mr-2`}></span>
                  <p className="text-sm font-medium">
                    {ticket.priority === 'high' ? 'Alta' :
                     ticket.priority === 'medium' ? 'Media' : 'Baja'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Cliente</h4>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="font-medium">{ticket.customer}</p>
                <p className="text-sm text-gray-500">cliente@ejemplo.com</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contactar
              </Button>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Ver perfil
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Etiquetas</h4>
            <div className="flex flex-wrap gap-1">
              {ticket.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs cursor-pointer">
                <Plus className="h-3 w-3 mr-1" />
                Añadir
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Actividad</h4>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <History className="h-3 w-3 text-blue-700" />
                </div>
                <div>
                  <p className="text-xs">
                    <span className="font-medium">Actualizado</span> - {new Date(ticket.updatedAt).toLocaleDateString('es-ES', { 
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-3 w-3 text-purple-700" />
                </div>
                <div>
                  <p className="text-xs">
                    <span className="font-medium">Asignado a {ticket.assignee}</span> - {new Date(ticket.createdAt).toLocaleDateString('es-ES', { 
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-green-700" />
                </div>
                <div>
                  <p className="text-xs">
                    <span className="font-medium">Ticket creado</span> - {new Date(ticket.createdAt).toLocaleDateString('es-ES', { 
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="p-4 border-t mt-auto">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            <Timer className="h-4 w-4 mr-2" />
            Posponer
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Opciones
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente para la tarjeta de conocimiento
const KnowledgeBaseCard = ({ article }) => {
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'payment':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Pagos</Badge>;
      case 'billing':
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200">Facturación</Badge>;
      case 'technical':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Técnico</Badge>;
      case 'account':
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Cuenta</Badge>;
      case 'usage':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Uso</Badge>;
      default:
        return <Badge>General</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-blue-700" />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium mb-1">{article.title}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {getCategoryBadge(article.category)}
              <div className="flex items-center text-xs text-gray-500">
                <Eye className="h-3 w-3 mr-1" />
                <span>{article.views}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <ThumbsUp className="h-3 w-3 mr-1" />
                <span>{article.helpfulRating}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Actualizado: {article.lastUpdated}</span>
              <Button variant="ghost" size="sm" className="h-7">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Ver artículo</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente principal
const Testing15 = () => {
  const [tickets, setTickets] = useState(ticketsData);
  const [filteredTickets, setFilteredTickets] = useState(ticketsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState("tickets");
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [knowledgeSearchTerm, setKnowledgeSearchTerm] = useState("");
  
  // Filtrar tickets basado en todos los criterios
  const applyFilters = () => {
    let filtered = tickets;
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Aplicar filtro de estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    // Aplicar filtro de prioridad
    if (priorityFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }
    
    setFilteredTickets(filtered);
  };

  // Manejar búsqueda
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    // Usar setTimeout para no ejecutar la búsqueda en cada pulsación de tecla
    setTimeout(() => {
      applyFilters();
    }, 300);
  };
  
  // Filtrar por estado
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    applyFilters();
  };
  
  // Filtrar por prioridad
  const handlePriorityFilter = (priority) => {
    setPriorityFilter(priority);
    applyFilters();
  };
  
  // Buscar en base de conocimiento
  const handleKnowledgeSearch = (e) => {
    setKnowledgeSearchTerm(e.target.value);
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plataforma de Soporte Técnico</h1>
            <p className="text-gray-500 mt-1">
              Gestión de tickets y ayuda al cliente
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <BarChart4 className="h-4 w-4 mr-2" />
              Estadísticas
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
            <Button onClick={() => setIsCreatingTicket(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <Tabs defaultValue="tickets" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Tickets
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Base de Conocimiento
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(value) => handleStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="open">Abiertos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="solved">Resueltos</SelectItem>
                <SelectItem value="closed">Cerrados</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={(value) => handlePriorityFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-1">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setFilteredTickets(tickets);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="tickets" className="mt-0">
          {isCreatingTicket ? (
            // Formulario de creación de ticket
            <div className="bg-white p-6 rounded-lg border shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Crear nuevo ticket</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsCreatingTicket(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ticket-subject">Asunto</Label>
                  <Input id="ticket-subject" placeholder="Escribe un asunto descriptivo..." className="mt-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticket-category">Categoría</Label>
                    <Select defaultValue="technical">
                      <SelectTrigger id="ticket-category" className="mt-1">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Soporte técnico</SelectItem>
                        <SelectItem value="billing">Facturación</SelectItem>
                        <SelectItem value="payment">Pagos</SelectItem>
                        <SelectItem value="product">Producto</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="ticket-priority">Prioridad</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="ticket-priority" className="mt-1">
                        <SelectValue placeholder="Selecciona una prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="low">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="ticket-message">Descripción</Label>
                  <Textarea 
                    id="ticket-message" 
                    placeholder="Describe detalladamente el problema o consulta..." 
                    className="mt-1"
                    rows={6}
                  />
                </div>
                
                <div>
                  <Label htmlFor="ticket-files">Archivos adjuntos</Label>
                  <div className="flex items-center justify-center w-full mt-1">
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Paperclip className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-medium">Haz clic para adjuntar</span> o arrastra y suelta
                        </p>
                        <p className="text-xs text-gray-500">
                          Imágenes, documentos o archivos comprimidos (máx. 10 MB)
                        </p>
                      </div>
                      <input id="file-upload" type="file" className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsCreatingTicket(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsCreatingTicket(false)}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar ticket
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Lista de tickets */}
              <div className={`lg:col-span-${selectedTicket ? '3' : '5'}`}>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Buscar tickets..." 
                      className="pl-10" 
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                </div>
                <ScrollArea className="h-[calc(100vh-280px)]">
                  {filteredTickets.length === 0 ? (
                    <div className="text-center p-6 bg-gray-50 rounded-lg border">
                      <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">No se encontraron tickets</p>
                      <p className="text-sm text-gray-500 mt-1">Prueba con otros términos de búsqueda o filtros</p>
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <TicketCard 
                        key={ticket.id} 
                        ticket={ticket}
                        onClick={() => setSelectedTicket(ticket)}
                        isSelected={selectedTicket && selectedTicket.id === ticket.id}
                      />
                    ))
                  )}
                </ScrollArea>
              </div>

              {/* Detalle del ticket */}
              {selectedTicket ? (
                <>
                  <div className="lg:col-span-6 border rounded-lg overflow-hidden">
                    <TicketChat 
                      ticket={selectedTicket} 
                      onClose={() => setSelectedTicket(null)}
                    />
                  </div>
                  <div className="lg:col-span-3 border rounded-lg overflow-hidden">
                    <TicketDetails ticket={selectedTicket} />
                  </div>
                </>
              ) : (
                <div className="lg:col-span-7 flex items-center justify-center bg-gray-50 rounded-lg border">
                  <div className="text-center p-8">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Selecciona un ticket para ver los detalles</h3>
                    <p className="text-gray-500 max-w-md">
                      Haz clic en cualquier ticket de la lista para ver sus detalles y responder a las consultas del cliente.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsCreatingTicket(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear nuevo ticket
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="knowledge" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-2">Base de Conocimiento</h2>
                <p className="mb-6">Encuentra soluciones rápidas a problemas comunes y aprende a utilizar todas las funcionalidades.</p>
                <div className="relative">
                  <Input 
                    placeholder="Buscar artículos, guías y tutoriales..." 
                    className="bg-white text-gray-900 pl-10 h-12 placeholder:text-gray-500"
                    value={knowledgeSearchTerm}
                    onChange={handleKnowledgeSearch}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Button className="absolute right-1 top-1 h-10">
                    Buscar
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Categorías populares</CardTitle>
                  <CardDescription>Artículos organizados por temática</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Configuración</p>
                        <p className="text-xs">12 artículos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Pagos</p>
                        <p className="text-xs">8 artículos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Cuentas</p>
                        <p className="text-xs">15 artículos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-amber-50 text-amber-700 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Ayuda</p>
                        <p className="text-xs">10 artículos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas de ayuda</CardTitle>
                  <CardDescription>Resumen de uso de la base de conocimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">89%</p>
                      <p className="text-sm text-gray-500">Tasa de resolución</p>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '89%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">2.5 min</p>
                      <p className="text-sm text-gray-500">Tiempo medio de respuesta</p>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">6,234</p>
                      <p className="text-sm text-gray-500">Consultas resueltas</p>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">92%</p>
                      <p className="text-sm text-gray-500">Satisfacción del cliente</p>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Artículos populares</h3>
                <Button variant="ghost">Ver todos</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {knowledgeBaseData.map((article) => (
                  <KnowledgeBaseCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Testing15;