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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Filter,
  Info,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Sliders,
  Tag,
  Trash,
  Users,
} from "lucide-react";

// Datos simulados para eventos
const eventsData = [
  {
    id: 1,
    title: "Conferencia de Medicina Interna",
    type: "conference",
    date: "2025-03-15",
    time: "09:00 - 18:00",
    location: "Centro de Convenciones",
    attendees: 128,
    maxAttendees: 200,
    status: "active"
  },
  {
    id: 2,
    title: "Taller de Investigación Clínica",
    type: "workshop",
    date: "2025-03-22",
    time: "14:00 - 17:00",
    location: "Aula Magna Universidad",
    attendees: 42,
    maxAttendees: 50,
    status: "active"
  },
  {
    id: 3,
    title: "Presentación de Productos Farmacéuticos",
    type: "presentation",
    date: "2025-04-05",
    time: "10:00 - 13:00",
    location: "Hotel Continental",
    attendees: 75,
    maxAttendees: 100,
    status: "active"
  },
  {
    id: 4,
    title: "Congreso Internacional de Pediatría",
    type: "conference",
    date: "2025-05-10",
    time: "08:00 - 19:00",
    location: "Centro de Convenciones Internacional",
    attendees: 315,
    maxAttendees: 500,
    status: "scheduled"
  },
  {
    id: 5,
    title: "Simposio de Avances Tecnológicos",
    type: "symposium",
    date: "2025-04-18",
    time: "09:30 - 16:00",
    location: "Centro de Investigación",
    attendees: 89,
    maxAttendees: 120,
    status: "active"
  }
];

// Componente para la vista del calendario
const CalendarView = ({ events }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  
  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay() || 7; // Ajustar para que lunes sea 1 y domingo sea 7
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 1; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 p-1 border border-gray-100"></div>);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(event => event.date === dateStr);
      
      days.push(
        <div key={day} className="h-24 p-1 border border-gray-100 overflow-hidden relative">
          <div className={`absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="mt-6 space-y-1">
            {dayEvents.map(event => (
              <div 
                key={event.id}
                className={`text-xs truncate rounded px-1 py-0.5 ${
                  event.type === 'conference' ? 'bg-blue-100 text-blue-800' :
                  event.type === 'workshop' ? 'bg-purple-100 text-purple-800' :
                  event.type === 'presentation' ? 'bg-orange-100 text-orange-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Cabecera del calendario */}
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
          <h3 className="font-semibold text-lg">{months[currentMonth]} {currentYear}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            setCurrentMonth(new Date().getMonth());
            setCurrentYear(new Date().getFullYear());
          }}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Días de la semana */}
      <div className="grid grid-cols-7">
        {daysOfWeek.map(day => (
          <div key={day} className="py-2 text-center text-sm font-medium text-gray-500 border-b">
            {day}
          </div>
        ))}
      </div>
      
      {/* Grilla del calendario */}
      <div className="grid grid-cols-7">
        {renderCalendar()}
      </div>
    </div>
  );
};

// Componente para la tarjeta de evento
const EventCard = ({ event }) => {
  const getEventTypeStyles = (type) => {
    switch (type) {
      case 'conference': return 'text-blue-600 bg-blue-50';
      case 'workshop': return 'text-purple-600 bg-purple-50';
      case 'presentation': return 'text-orange-600 bg-orange-50';
      case 'symposium': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getEventTypeName = (type) => {
    switch (type) {
      case 'conference': return 'Conferencia';
      case 'workshop': return 'Taller';
      case 'presentation': return 'Presentación';
      case 'symposium': return 'Simposio';
      default: return 'Evento';
    }
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {formatDate(event.date)} · {event.time}
            </CardDescription>
          </div>
          <Badge variant="outline" className={`rounded-full px-2 text-xs ${getEventTypeStyles(event.type)}`}>
            {getEventTypeName(event.type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="mt-2 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            {event.location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-2 text-gray-400" />
            <div className="flex items-center gap-2">
              <span>{event.attendees} / {event.maxAttendees} asistentes</span>
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 border-t flex justify-between">
        <Button variant="outline" size="sm">
          Ver detalles
        </Button>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// Componente de la vista de lista
const ListView = ({ events }) => {
  return (
    <div className="space-y-4">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

// Formulario de evento
const EventForm = ({ onClose }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título del evento</Label>
        <Input id="title" placeholder="Ej. Conferencia Anual" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <div className="relative">
            <Input id="date" type="date" />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time">Horario</Label>
          <div className="relative">
            <Input id="time" placeholder="Ej. 09:00 - 18:00" />
            <Clock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de evento</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conference">Conferencia</SelectItem>
            <SelectItem value="workshop">Taller</SelectItem>
            <SelectItem value="presentation">Presentación</SelectItem>
            <SelectItem value="symposium">Simposio</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Ubicación</Label>
        <Input id="location" placeholder="Ej. Centro de Convenciones" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxAttendees">Capacidad máxima</Label>
          <Input id="maxAttendees" type="number" placeholder="Ej. 200" min="1" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select defaultValue="active">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="scheduled">Programado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="pt-4 border-t space-x-2 flex justify-end">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={onClose}>Guardar Evento</Button>
      </div>
    </div>
  );
};

// Componente principal de la plataforma de gestión de eventos
const Testing12 = () => {
  const [events, setEvents] = useState(eventsData);
  const [viewMode, setViewMode] = useState("calendar");
  const [searchTerm, setSearchTerm] = useState("");
  const [eventType, setEventType] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Filtrar eventos por búsqueda y tipo
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = eventType === "all" || event.type === eventType;
    return matchesSearch && matchesType;
  });
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plataforma de Gestión de Eventos</h1>
            <p className="text-gray-500 mt-1">
              Administre y organice eventos de manera eficiente
            </p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Crear Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Evento</DialogTitle>
                  <DialogDescription>
                    Complete el formulario con los detalles del evento.
                  </DialogDescription>
                </DialogHeader>
                <EventForm onClose={() => setIsFormOpen(false)} />
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Filtros y búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          <div className="relative md:col-span-5">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar eventos..." 
              className="pl-10" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-4 flex">
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="conference">Conferencias</SelectItem>
                <SelectItem value="workshop">Talleres</SelectItem>
                <SelectItem value="presentation">Presentaciones</SelectItem>
                <SelectItem value="symposium">Simposios</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-3">
            <div className="bg-white rounded-md border p-1 flex">
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                className="flex-1 text-xs"
                onClick={() => setViewMode("calendar")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendario
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                className="flex-1 text-xs"
                onClick={() => setViewMode("list")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Lista
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vista principal (calendario o lista) */}
      <div className="mb-6">
        {viewMode === "calendar" ? (
          <CalendarView events={filteredEvents} />
        ) : (
          <ListView events={filteredEvents} />
        )}
      </div>
      
      {/* Estadísticas de eventos */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Estadísticas de Eventos</CardTitle>
          <CardDescription>Resumen de participación y asistencia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Total de Eventos</p>
              <p className="text-3xl font-bold">{events.length}</p>
              <div className="flex items-center text-sm">
                <span className="text-emerald-600 font-medium">+12%</span>
                <span className="text-gray-500 ml-2">vs. mes anterior</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Eventos Activos</p>
              <p className="text-3xl font-bold">{events.filter(e => e.status === 'active').length}</p>
              <div className="flex items-center text-sm">
                <span className="text-emerald-600 font-medium">+5%</span>
                <span className="text-gray-500 ml-2">vs. mes anterior</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Total Asistentes</p>
              <p className="text-3xl font-bold">{events.reduce((total, event) => total + event.attendees, 0)}</p>
              <div className="flex items-center text-sm">
                <span className="text-emerald-600 font-medium">+23%</span>
                <span className="text-gray-500 ml-2">vs. mes anterior</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Tasa de Ocupación</p>
              <p className="text-3xl font-bold">
                {Math.round((events.reduce((total, event) => total + event.attendees, 0) / events.reduce((total, event) => total + event.maxAttendees, 0)) * 100)}%
              </p>
              <div className="flex items-center text-sm">
                <span className="text-emerald-600 font-medium">+7%</span>
                <span className="text-gray-500 ml-2">vs. mes anterior</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Próximos eventos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Eventos Próximos</CardTitle>
          <CardDescription>Los eventos más cercanos en el calendario</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {events
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5)
                .map(event => (
                <div key={event.id} className="flex p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500 mr-3">
                        {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-xs text-gray-500">
                        {event.time}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{event.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Badge variant="outline" className="text-xs">
                      {event.attendees} asistentes
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 mt-1">
                      <Info className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Detalles</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Testing12;