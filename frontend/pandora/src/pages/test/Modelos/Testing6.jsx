import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  CalendarIcon, 
  Clock, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  User,
  Users,
  MapPin,
  BarChart,
  CalendarDays,
  X,
  Check,
  AlertCircle,
  Calendar as CalendarLucide
} from 'lucide-react';

// Datos de ejemplo para calendario
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Eventos simulados
const mockEvents = [
  {
    id: 1,
    title: 'Reunión de planificación',
    start: new Date(2025, 2, 5, 10, 0),
    end: new Date(2025, 2, 5, 11, 30),
    description: 'Reunión con el equipo para planificar las actividades del mes.',
    location: 'Sala de Conferencias A',
    attendees: ['Carlos Rodríguez', 'María González', 'Juan Pérez'],
    color: 'blue',
    isAllDay: false
  },
  {
    id: 2,
    title: 'Presentación de proyecto',
    start: new Date(2025, 2, 7, 14, 0),
    end: new Date(2025, 2, 7, 16, 0),
    description: 'Presentación del nuevo proyecto a los stakeholders.',
    location: 'Auditorio Principal',
    attendees: ['Carlos Rodríguez', 'Pedro López', 'Ana Torres', 'Sofía Castro'],
    color: 'purple',
    isAllDay: false
  },
  {
    id: 3,
    title: 'Conferencia de Tecnología',
    start: new Date(2025, 2, 10, 9, 0),
    end: new Date(2025, 2, 12, 18, 0),
    description: 'Conferencia anual sobre tendencias tecnológicas.',
    location: 'Centro de Convenciones',
    attendees: ['María González', 'Roberto Núñez'],
    color: 'green',
    isAllDay: true
  },
  {
    id: 4,
    title: 'Reunión con cliente',
    start: new Date(2025, 2, 15, 11, 0),
    end: new Date(2025, 2, 15, 12, 0),
    description: 'Discusión sobre requerimientos del proyecto.',
    location: 'Oficina 302',
    attendees: ['Carlos Rodríguez', 'Lucía Martínez'],
    color: 'amber',
    isAllDay: false
  },
  {
    id: 5,
    title: 'Sprint Review',
    start: new Date(2025, 2, 19, 15, 0),
    end: new Date(2025, 2, 19, 16, 30),
    description: 'Revisión del sprint actual y planificación del siguiente.',
    location: 'Sala de Juntas',
    attendees: ['Carlos Rodríguez', 'María González', 'Pedro López', 'Ana Torres'],
    color: 'red',
    isAllDay: false
  },
  {
    id: 6,
    title: 'Capacitación de equipo',
    start: new Date(2025, 2, 22, 9, 0),
    end: new Date(2025, 2, 22, 17, 0),
    description: 'Capacitación sobre nuevas tecnologías.',
    location: 'Sala de Capacitación',
    attendees: ['Pedro López', 'Ana Torres', 'Sofía Castro', 'Roberto Núñez'],
    color: 'blue',
    isAllDay: true
  },
  {
    id: 7,
    title: 'Entrega de proyecto',
    start: new Date(2025, 2, 28, 10, 0),
    end: new Date(2025, 2, 28, 11, 0),
    description: 'Entrega final del proyecto al cliente.',
    location: 'Oficina del Cliente',
    attendees: ['Carlos Rodríguez', 'María González', 'Juan Pérez'],
    color: 'emerald',
    isAllDay: false
  }
];

// Componente para las vistas del calendario
const CalendarHeader = ({ date, view, onPrev, onNext, onToday, onViewChange }) => {
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  
  return (
    <div className="flex justify-between items-center pb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">
          {view === 'month' && `${month} ${year}`}
          {view === 'week' && `Semana ${getWeekNumber(date)} - ${month} ${year}`}
          {view === 'day' && `${date.getDate()} ${month} ${year}`}
        </h2>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex">
          <Button variant="outline" size="sm" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onToday} className="mx-1">
            Hoy
          </Button>
          <Button variant="outline" size="sm" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="border rounded-md p-1">
          <Button
            variant={view === 'month' ? 'subtle' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('month')}
            className={`px-3 ${view === 'month' ? 'bg-primary/10' : ''}`}
          >
            Mes
          </Button>
          <Button
            variant={view === 'week' ? 'subtle' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('week')}
            className={`px-3 ${view === 'week' ? 'bg-primary/10' : ''}`}
          >
            Semana
          </Button>
          <Button
            variant={view === 'day' ? 'subtle' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('day')}
            className={`px-3 ${view === 'day' ? 'bg-primary/10' : ''}`}
          >
            Día
          </Button>
        </div>
      </div>
    </div>
  );
};

// Obtener el número de semana del año
const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Componente para el día en la vista de mes
const MonthDay = ({ day, events, currentMonth, isToday, onEventClick, onAddEvent }) => {
  const isCurrentMonth = day.getMonth() === currentMonth;
  
  // Ordenar eventos
  const sortedEvents = events.sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return a.start - b.start;
  });
  
  // Limitar eventos visibles
  const visibleEvents = sortedEvents.slice(0, 3);
  const hasMoreEvents = sortedEvents.length > 3;
  
  return (
    <div
      className={`border relative p-1 min-h-[100px] transition-colors ${
        !isCurrentMonth ? 'bg-gray-50' : ''
      } ${isToday ? 'bg-blue-50' : ''}`}
    >
      <div className="flex justify-between items-start">
        <button
          className={`text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full ${
            isToday ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
          }`}
        >
          {day.getDate()}
        </button>
        <button
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          onClick={() => onAddEvent(day)}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      
      <div className="space-y-1 mt-1">
        {visibleEvents.map((event) => (
          <button
            key={event.id}
            onClick={() => onEventClick(event)}
            className={`block text-left w-full px-1.5 py-0.5 rounded text-xs font-medium truncate bg-${event.color}-100 text-${event.color}-800 hover:bg-${event.color}-200`}
          >
            {event.isAllDay ? '• ' : `${formatTime(event.start)} • `}
            {event.title}
          </button>
        ))}
        
        {hasMoreEvents && (
          <button className="text-xs text-gray-500 hover:text-gray-700 px-1.5 py-0.5">
            +{sortedEvents.length - 3} más
          </button>
        )}
      </div>
    </div>
  );
};

// Componente para la vista de mes
const MonthView = ({ date, events, onEventClick, onAddEvent }) => {
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();
  
  // Obtener primer día del mes
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  // Obtener último día del mes
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  // Obtener días para mostrar en la cuadrícula (incluyendo días del mes anterior y siguiente)
  const daysToDisplay = [];
  
  // Agregar días del mes anterior para completar la primera semana
  const firstDayOfWeek = firstDayOfMonth.getDay();
  if (firstDayOfWeek > 0) {
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      daysToDisplay.push(new Date(currentYear, currentMonth - 1, prevMonthLastDay - i));
    }
  }
  
  // Agregar todos los días del mes actual
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    daysToDisplay.push(new Date(currentYear, currentMonth, i));
  }
  
  // Agregar días del mes siguiente para completar la última semana
  const lastDayOfWeek = lastDayOfMonth.getDay();
  if (lastDayOfWeek < 6) {
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      daysToDisplay.push(new Date(currentYear, currentMonth + 1, i));
    }
  }
  
  // Dividir días en semanas
  const weeks = [];
  let week = [];
  
  daysToDisplay.forEach((day) => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  
  // Agregar la última semana si está incompleta
  if (week.length > 0) {
    weeks.push(week);
  }
  
  // Encontrar eventos para cada día
  const today = new Date();
  const isToday = (day) => {
    return day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear();
  };
  
  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear();
    });
  };
  
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day, index) => (
          <div key={index} className="py-2 text-center text-sm font-medium text-gray-500 border-b">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7">
        {weeks.map((week, i) => (
          week.map((day, j) => (
            <MonthDay
              key={`${i}-${j}`}
              day={day}
              events={getEventsForDay(day)}
              currentMonth={currentMonth}
              isToday={isToday(day)}
              onEventClick={onEventClick}
              onAddEvent={onAddEvent}
            />
          ))
        ))}
      </div>
    </div>
  );
};

// Formato de hora
const formatTime = (date) => {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

// Vista de semana
const WeekView = ({ date, events, onEventClick, onAddEvent }) => {
  // Obtener el domingo de la semana actual
  const currentDate = new Date(date);
  const dayOfWeek = currentDate.getDay();
  const diff = currentDate.getDate() - dayOfWeek;
  const firstDayOfWeek = new Date(currentDate.setDate(diff));
  
  // Generar los 7 días de la semana
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(firstDayOfWeek);
    day.setDate(firstDayOfWeek.getDate() + i);
    days.push(day);
  }
  
  // Horas a mostrar (de 7:00 a 20:00)
  const hours = [];
  for (let i = 7; i <= 20; i++) {
    hours.push(i);
  }
  
  // Verificar si un día es hoy
  const isToday = (day) => {
    const today = new Date();
    return day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear();
  };
  
  // Obtener eventos para cada día y hora
  const getEventsForDayAndHour = (day, hour) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      const eventEndDate = new Date(event.end);
      
      const isSameDay = eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear();
      
      const isWithinHour = 
        (eventDate.getHours() <= hour && eventEndDate.getHours() > hour) ||
        (eventDate.getHours() === hour);
      
      return isSameDay && (event.isAllDay || isWithinHour);
    });
  };
  
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 text-center text-sm font-medium text-gray-500 border-r"></div>
        {days.map((day, index) => (
          <div 
            key={index} 
            className={`p-2 text-center border-r ${isToday(day) ? 'bg-blue-50' : ''}`}
          >
            <div className="text-sm font-medium">
              {WEEKDAYS[day.getDay()]}
            </div>
            <div className={`text-lg font-bold ${isToday(day) ? 'text-blue-600' : ''}`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>
      
      <div className="relative">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b">
            <div className="p-2 text-center text-xs text-gray-500 border-r relative -top-2">
              {`${hour}:00`}
            </div>
            
            {days.map((day, dayIndex) => (
              <div 
                key={dayIndex} 
                className={`border-r min-h-[60px] relative ${isToday(day) ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  const newDate = new Date(day);
                  newDate.setHours(hour, 0, 0);
                  onAddEvent(newDate);
                }}
              >
                {getEventsForDayAndHour(day, hour).map((event, eventIndex) => (
                  <div
                    key={`${event.id}-${eventIndex}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`absolute left-0 right-0 mx-1 px-2 py-1 rounded text-xs ${
                      event.isAllDay 
                        ? 'top-0 bg-gray-100 text-gray-800 border border-gray-200' 
                        : `bg-${event.color}-100 text-${event.color}-800`
                    }`}
                    style={{
                      top: event.isAllDay ? `${eventIndex * 20}px` : `${(event.start.getMinutes() / 60) * 100}%`,
                      height: event.isAllDay ? '18px' : `${((event.end - event.start) / 3600000) * 100}%`,
                      zIndex: 10
                    }}
                  >
                    <div className="truncate font-medium">
                      {event.title}
                    </div>
                    {!event.isAllDay && (
                      <div className="text-xs opacity-70">
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Vista de día
const DayView = ({ date, events, onEventClick, onAddEvent }) => {
  // Horas a mostrar (de 7:00 a 20:00)
  const hours = [];
  for (let i = 7; i <= 20; i++) {
    hours.push(i);
  }
  
  // Obtener eventos para cada hora
  const getEventsForHour = (hour) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      const eventEndDate = new Date(event.end);
      
      const isSameDay = eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();
      
      const isWithinHour = 
        (eventDate.getHours() <= hour && eventEndDate.getHours() > hour) ||
        (eventDate.getHours() === hour);
      
      return isSameDay && (event.isAllDay || isWithinHour);
    });
  };
  
  // Obtener todos los eventos de todo el día
  const allDayEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    
    const isSameDay = eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear();
    
    return isSameDay && event.isAllDay;
  });
  
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Franja de eventos de todo el día */}
      {allDayEvents.length > 0 && (
        <div className="p-2 border-b bg-gray-50">
          <div className="text-xs font-medium text-gray-500 mb-1">Todo el día</div>
          <div className="space-y-1">
            {allDayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs cursor-pointer hover:bg-gray-300"
              >
                <div className="font-medium">{event.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Franja horaria */}
      <div className="grid grid-cols-1">
        {hours.map((hour) => (
          <div 
            key={hour} 
            className="grid grid-cols-[80px_1fr] border-b"
            onClick={() => {
              const newDate = new Date(date);
              newDate.setHours(hour, 0, 0);
              onAddEvent(newDate);
            }}
          >
            <div className="p-2 text-center text-xs text-gray-500 border-r relative -top-2">
              {`${hour}:00`}
            </div>
            
            <div className="relative min-h-[60px]">
              {getEventsForHour(hour).filter(e => !e.isAllDay).map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  className={`absolute left-0 right-0 mx-2 px-3 py-1 rounded-md text-sm bg-${event.color}-100 text-${event.color}-800 cursor-pointer hover:bg-${event.color}-200`}
                  style={{
                    top: `${(event.start.getMinutes() / 60) * 100}%`,
                    height: `${((event.end - event.start) / 3600000) * 100}%`,
                    zIndex: 10
                  }}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-xs opacity-75 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(event.start)} - {formatTime(event.end)}
                  </div>
                  {event.location && (
                    <div className="text-xs opacity-75 flex items-center mt-1 truncate">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Detalle del evento
const EventDetail = ({ event, onClose, onEdit, onDelete }) => {
  if (!event) return null;
  
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold">{event.title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-4 space-y-4">
        <div className="flex items-start gap-3">
          <CalendarLucide className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <div className="font-medium">{formatDate(event.start)}</div>
            {!event.isAllDay && (
              <div className="text-gray-600">
                {formatTime(event.start)} - {formatTime(event.end)}
              </div>
            )}
            {event.isAllDay && (
              <div className="text-gray-600">Todo el día</div>
            )}
          </div>
        </div>
        
        {event.location && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <div className="font-medium">Ubicación</div>
              <div className="text-gray-600">{event.location}</div>
            </div>
          </div>
        )}
        
        {event.description && (
          <div className="flex items-start gap-3">
            <BarChart className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <div className="font-medium">Descripción</div>
              <div className="text-gray-600 mt-1">{event.description}</div>
            </div>
          </div>
        )}
        
        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <div className="font-medium">Participantes</div>
              <div className="mt-2 space-y-2">
                {event.attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                      {attendee.charAt(0)}
                    </div>
                    <div className="text-gray-600">{attendee}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 pt-6 border-t flex justify-end gap-2">
        <Button variant="outline" onClick={onEdit}>
          Editar
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          Eliminar
        </Button>
      </div>
    </div>
  );
};

// Formulario de evento
const EventForm = ({ event, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    event 
      ? { 
          ...event,
          startDate: event.start.toISOString().split('T')[0],
          startTime: event.isAllDay ? '00:00' : `${String(event.start.getHours()).padStart(2, '0')}:${String(event.start.getMinutes()).padStart(2, '0')}`,
          endDate: event.end.toISOString().split('T')[0],
          endTime: event.isAllDay ? '23:59' : `${String(event.end.getHours()).padStart(2, '0')}:${String(event.end.getMinutes()).padStart(2, '0')}`
        } 
      : {
          title: '',
          description: '',
          location: '',
          attendees: [],
          color: 'blue',
          isAllDay: false,
          startDate: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endDate: new Date().toISOString().split('T')[0],
          endTime: '10:00'
        }
  );
  
  const [errors, setErrors] = useState({});
  const [attendeeInput, setAttendeeInput] = useState('');
  
  const colorOptions = [
    { value: 'blue', label: 'Azul', bgClass: 'bg-blue-500' },
    { value: 'green', label: 'Verde', bgClass: 'bg-green-500' },
    { value: 'red', label: 'Rojo', bgClass: 'bg-red-500' },
    { value: 'purple', label: 'Morado', bgClass: 'bg-purple-500' },
    { value: 'amber', label: 'Ámbar', bgClass: 'bg-amber-500' },
    { value: 'emerald', label: 'Esmeralda', bgClass: 'bg-emerald-500' }
  ];
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Limpiar error
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  const handleAddAttendee = () => {
    if (attendeeInput.trim() && !formData.attendees.includes(attendeeInput.trim())) {
      setFormData({
        ...formData,
        attendees: [...formData.attendees, attendeeInput.trim()]
      });
      setAttendeeInput('');
    }
  };
  
  const handleRemoveAttendee = (attendee) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter(a => a !== attendee)
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }
    
    if (!formData.isAllDay && !formData.startTime) {
      newErrors.startTime = 'La hora de inicio es requerida';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }
    
    if (!formData.isAllDay && !formData.endTime) {
      newErrors.endTime = 'La hora de fin es requerida';
    }
    
    // Validar que la fecha/hora de fin sea posterior a la de inicio
    const start = new Date(`${formData.startDate}T${formData.isAllDay ? '00:00' : formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.isAllDay ? '23:59' : formData.endTime}`);
    
    if (end < start) {
      newErrors.endDate = 'La fecha/hora de fin debe ser posterior a la de inicio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Construir fechas de inicio y fin
      const start = new Date(`${formData.startDate}T${formData.isAllDay ? '00:00' : formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.isAllDay ? '23:59' : formData.endTime}`);
      
      const eventData = {
        ...formData,
        start,
        end
      };
      
      // Remover campos temporales
      delete eventData.startDate;
      delete eventData.startTime;
      delete eventData.endDate;
      delete eventData.endTime;
      
      onSubmit(eventData);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold">{event ? 'Editar Evento' : 'Nuevo Evento'}</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-4 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAllDay"
              name="isAllDay"
              checked={formData.isAllDay}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <Label htmlFor="isAllDay" className="ml-2">
              Todo el día
            </Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Fecha de inicio <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>
            
            {!formData.isAllDay && (
              <div>
                <Label htmlFor="startTime">Hora de inicio <span className="text-red-500">*</span></Label>
                <Input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={errors.startTime ? 'border-red-500' : ''}
                />
                {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
              </div>
            )}
            
            <div>
              <Label htmlFor="endDate">Fecha de fin <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
            
            {!formData.isAllDay && (
              <div>
                <Label htmlFor="endTime">Hora de fin <span className="text-red-500">*</span></Label>
                <Input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={errors.endTime ? 'border-red-500' : ''}
                />
                {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ejemplo: Sala de reuniones A"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalles del evento..."
              rows={3}
            />
          </div>
          
          <div>
            <Label>Color del evento</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${color.bgClass} ${
                    formData.color === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  title={color.label}
                >
                  {formData.color === color.value && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="attendees">Participantes</Label>
            <div className="flex">
              <Input
                id="attendeeInput"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                placeholder="Nombre del participante"
                className="flex-grow mr-2"
              />
              <Button 
                type="button" 
                onClick={handleAddAttendee}
                disabled={!attendeeInput.trim()}
              >
                Añadir
              </Button>
            </div>
            
            {formData.attendees.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center gap-1 bg-gray-100 rounded-full pl-2 pr-1 py-1 text-sm">
                    <span>{attendee}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(attendee)}
                      className="ml-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200 p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Hay errores en el formulario</div>
              <ul className="text-sm list-disc pl-5 mt-1 space-y-1">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {event ? 'Actualizar Evento' : 'Crear Evento'}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Componente sidebar con mini calendario y próximos eventos
const EventSidebar = ({ currentDate, events, selectedDate, onDateChange }) => {
  // Generar días para el mini calendario
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  // Obtener primer día del mes
  const firstDayOfMonth = new Date(year, month, 1);
  // Obtener último día del mes
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Obtener días para mostrar en la cuadrícula (incluyendo días del mes anterior y siguiente)
  const daysToDisplay = [];
  
  // Agregar días del mes anterior para completar la primera semana
  const firstDayOfWeek = firstDayOfMonth.getDay();
  if (firstDayOfWeek > 0) {
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      daysToDisplay.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
  }
  
  // Agregar todos los días del mes actual
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    daysToDisplay.push(new Date(year, month, i));
  }
  
  // Agregar días del mes siguiente para completar la última semana
  const lastDayOfWeek = lastDayOfMonth.getDay();
  if (lastDayOfWeek < 6) {
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      daysToDisplay.push(new Date(year, month + 1, i));
    }
  }
  
  // Dividir días en semanas
  const weeks = [];
  let week = [];
  
  daysToDisplay.forEach((day) => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  
  // Obtener próximos eventos (limitados a eventos futuros desde hoy)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingEvents = [...events]
    .filter(event => new Date(event.start) >= today)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 5);
  
  // Verificar si un día tiene eventos
  const hasEvents = (day) => {
    return events.some(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear();
    });
  };
  
  // Verificar si un día es el seleccionado
  const isSelected = (day) => {
    return selectedDate.getDate() === day.getDate() &&
      selectedDate.getMonth() === day.getMonth() &&
      selectedDate.getFullYear() === day.getFullYear();
  };
  
  // Verificar si un día es hoy
  const isToday = (day) => {
    const todayDate = new Date();
    return day.getDate() === todayDate.getDate() &&
      day.getMonth() === todayDate.getMonth() &&
      day.getFullYear() === todayDate.getFullYear();
  };
  
  return (
    <div className="space-y-6">
      {/* Mini calendario */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{MONTHS[month]} {year}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onDateChange(new Date(year, month - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDateChange(new Date(year, month + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 text-center mb-2">
            {WEEKDAYS.map((day, index) => (
              <div key={index} className="text-xs font-medium text-gray-500">
                {day.charAt(0)}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            {weeks.map((week, i) => (
              week.map((day, j) => {
                const isCurrentMonth = day.getMonth() === month;
                return (
                  <button
                    key={`${i}-${j}`}
                    className={`w-7 h-7 rounded-full text-sm flex items-center justify-center relative 
                      ${!isCurrentMonth ? 'text-gray-300' : ''}
                      ${isSelected(day) ? 'bg-primary text-white' : 
                        isToday(day) ? 'bg-blue-100 text-blue-700' : 
                        isCurrentMonth ? 'hover:bg-gray-100' : ''
                      }
                    `}
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
                      onDateChange(newDate);
                    }}
                  >
                    {day.getDate()}
                    {hasEvents(day) && (
                      <div className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full 
                        ${isSelected(day) ? 'bg-white' : 'bg-primary'}`}
                      ></div>
                    )}
                  </button>
                );
              })
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Próximos eventos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Próximos eventos</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <CalendarDays className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>No hay eventos próximos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const isToday = new Date(event.start).toDateString() === new Date().toDateString();
                
                return (
                  <div key={event.id} className="border-l-2 pl-3 py-1" style={{ borderColor: `var(--${event.color})` }}>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <CalendarLucide className="h-3 w-3 mr-1" />
                      {isToday ? 'Hoy' : new Date(event.start).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      {!event.isAllDay && (
                        <>
                          <span className="mx-1">·</span>
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(event.start)}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Componente principal de la aplicación de calendario
const CalendarApp = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState(mockEvents);
  const [view, setView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newEventDate, setNewEventDate] = useState(null);
  
  // Handlers de navegación
  const goToPrev = () => {
    const newDate = new Date(date);
    if (view === 'month') {
      newDate.setMonth(date.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(date.getDate() - 7);
    } else if (view === 'day') {
      newDate.setDate(date.getDate() - 1);
    }
    setDate(newDate);
  };
  
  const goToNext = () => {
    const newDate = new Date(date);
    if (view === 'month') {
      newDate.setMonth(date.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(date.getDate() + 7);
    } else if (view === 'day') {
      newDate.setDate(date.getDate() + 1);
    }
    setDate(newDate);
  };
  
  const goToToday = () => {
    setDate(new Date());
  };
  
  // Handlers de eventos
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };
  
  const handleAddEvent = (startDate) => {
    setNewEventDate(startDate);
    setSelectedEvent(null);
    setIsFormOpen(true);
  };
  
  const handleEditEvent = () => {
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };
  
  const handleDeleteEvent = () => {
    if (window.confirm('¿Está seguro de eliminar este evento?')) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setIsDetailOpen(false);
    }
  };
  
  const handleSubmitEvent = (eventData) => {
    if (selectedEvent) {
      // Actualizar evento existente
      setEvents(events.map(e => e.id === selectedEvent.id ? { ...eventData, id: selectedEvent.id } : e));
    } else {
      // Crear nuevo evento
      const newId = Math.max(...events.map(e => e.id), 0) + 1;
      setEvents([...events, { ...eventData, id: newId }]);
    }
    setIsFormOpen(false);
  };
  
  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="md:sticky md:top-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Calendario</h1>
              <p className="text-gray-500">Planifica tus eventos</p>
            </div>
            
            <Button onClick={() => handleAddEvent(date)} className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Crear Evento
            </Button>
            
            <EventSidebar
              currentDate={date}
              events={events}
              selectedDate={date}
              onDateChange={setDate}
            />
          </div>
        </div>
        
        {/* Calendario principal */}
        <div className="flex-grow">
          <Card>
            <CardHeader className="pb-0">
              <CalendarHeader
                date={date}
                view={view}
                onPrev={goToPrev}
                onNext={goToNext}
                onToday={goToToday}
                onViewChange={setView}
              />
            </CardHeader>
            <CardContent className="p-0">
              {view === 'month' && (
                <MonthView
                  date={date}
                  events={events}
                  onEventClick={handleEventClick}
                  onAddEvent={handleAddEvent}
                />
              )}
              
              {view === 'week' && (
                <WeekView
                  date={date}
                  events={events}
                  onEventClick={handleEventClick}
                  onAddEvent={handleAddEvent}
                />
              )}
              
              {view === 'day' && (
                <DayView
                  date={date}
                  events={events}
                  onEventClick={handleEventClick}
                  onAddEvent={handleAddEvent}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal de detalles */}
      {isDetailOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <EventDetail
              event={selectedEvent}
              onClose={() => setIsDetailOpen(false)}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          </div>
        </div>
      )}
      
      {/* Modal de formulario */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <EventForm
              event={selectedEvent}
              onSubmit={handleSubmitEvent}
              onCancel={() => setIsFormOpen(false)}
              initialDate={newEventDate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarApp;