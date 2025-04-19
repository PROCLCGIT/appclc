import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Calendar, CreditCard, Download, Edit, Filter, LogOut, Settings, ShoppingCart, User, Package, CheckCircle, Clock, AlertCircle, Inbox } from "lucide-react";

export default function Testing8() {
  const [activeNotification, setActiveNotification] = useState(null);
  
  const notificationTypes = [
    { id: "all", label: "Todos", count: 18 },
    { id: "unread", label: "No leídos", count: 6 },
    { id: "mentions", label: "Menciones", count: 3 },
    { id: "purchases", label: "Compras", count: 5 },
    { id: "system", label: "Sistema", count: 4 },
  ];
  
  const notifications = [
    {
      id: 1,
      type: "purchases",
      title: "Orden #95124 completada",
      description: "Su pedido ha sido entregado con éxito",
      time: "Hace 12 minutos",
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      unread: true,
      actionText: "Ver detalles del pedido",
      content: [
        {
          title: "Detalles del pedido",
          items: [
            { label: "Número de orden", value: "#95124" },
            { label: "Estado", value: "Entregado" },
            { label: "Fecha de pedido", value: "02 Mar 2025, 14:30" },
            { label: "Fecha de entrega", value: "05 Mar 2025, 10:15" },
            { label: "Método de pago", value: "Tarjeta de crédito" },
            { label: "Dirección de entrega", value: "Av. Las Condes 12880, Las Condes, Santiago" }
          ]
        },
        {
          title: "Productos",
          items: [
            { label: "Laptop ThinkPad X1", value: "$1,899.00" },
            { label: "Monitor 27\" 4K", value: "$499.00" },
            { label: "Teclado mecánico", value: "$129.00" },
            { label: "Subtotal", value: "$2,527.00" },
            { label: "Envío", value: "$0.00" },
            { label: "Total", value: "$2,527.00" }
          ]
        }
      ]
    },
    {
      id: 2,
      type: "system",
      title: "Actualización del sistema completada",
      description: "La versión 2.4.1 ha sido instalada exitosamente",
      time: "Hace 47 minutos",
      icon: <Bell className="h-8 w-8 text-blue-500" />,
      unread: true,
      actionText: "Ver changelog",
      content: [
        {
          title: "Detalles de la actualización",
          items: [
            { label: "Versión", value: "2.4.1" },
            { label: "Fecha", value: "5 Mar 2025" },
            { label: "Tamaño", value: "45.2 MB" }
          ]
        },
        {
          title: "Cambios principales",
          text: "• Mejoras en rendimiento del sistema\n• Corrección de errores en el módulo de inventario\n• Optimización de la interfaz de usuario\n• Nuevas opciones de filtrado en reportes\n• Mejoras en la seguridad del sistema"
        }
      ]
    },
    {
      id: 3,
      type: "mentions",
      title: "Julia López te ha mencionado",
      description: "En el proyecto 'Rediseño de Portal'",
      time: "Hace 2 horas",
      icon: <User className="h-8 w-8 text-indigo-500" />,
      unread: true,
      actionText: "Responder",
      content: [
        {
          title: "Mensaje",
          text: "@admin Por favor, necesito que revises los mockups actualizados para el proyecto de rediseño del portal. He implementado los cambios que discutimos en la reunión de ayer."
        },
        {
          title: "Proyecto",
          items: [
            { label: "Nombre", value: "Rediseño de Portal" },
            { label: "Deadline", value: "28 Mar 2025" },
            { label: "Estado", value: "En progreso" }
          ]
        }
      ]
    },
    {
      id: 4,
      type: "purchases",
      title: "Nuevo pedido recibido",
      description: "Orden #95180 está pendiente de aprobación",
      time: "Hace 4 horas",
      icon: <ShoppingCart className="h-8 w-8 text-amber-500" />,
      unread: true,
      actionText: "Revisar pedido",
      content: [
        {
          title: "Detalles del pedido",
          items: [
            { label: "Número de orden", value: "#95180" },
            { label: "Estado", value: "Pendiente de aprobación" },
            { label: "Fecha de pedido", value: "05 Mar 2025, 09:45" },
            { label: "Cliente", value: "Empresa ABC Ltda." },
            { label: "Método de pago", value: "Transferencia bancaria" }
          ]
        },
        {
          title: "Productos solicitados",
          items: [
            { label: "Servidor Dell PowerEdge", value: "$3,899.00" },
            { label: "Licencias Windows Server (5)", value: "$1,299.00" },
            { label: "Servicio de instalación", value: "$450.00" },
            { label: "Total", value: "$5,648.00" }
          ]
        }
      ]
    },
    {
      id: 5,
      type: "system",
      title: "Alerta de seguridad",
      description: "Inicio de sesión desde una nueva ubicación",
      time: "Hace 6 horas",
      icon: <AlertCircle className="h-8 w-8 text-red-500" />,
      unread: true,
      actionText: "Revisar actividad",
      content: [
        {
          title: "Detalles de la alerta",
          items: [
            { label: "Tipo", value: "Inicio de sesión desde nueva ubicación" },
            { label: "Fecha/Hora", value: "05 Mar 2025, 07:15" },
            { label: "Dispositivo", value: "Macbook Pro (macOS 15.4)" },
            { label: "Ubicación", value: "Santiago, Chile" },
            { label: "Dirección IP", value: "190.45.128.112" }
          ]
        },
        {
          title: "Acciones recomendadas",
          text: "• Si este inicio de sesión fue realizado por usted, puede ignorar esta alerta\n• Si no reconoce esta actividad, cambie su contraseña inmediatamente\n• Active la autenticación de dos factores para mayor seguridad"
        }
      ]
    },
    {
      id: 6,
      type: "mentions",
      title: "Ricardo Campos te ha mencionado",
      description: "En el comentario sobre la migración",
      time: "Ayer, 16:42",
      icon: <User className="h-8 w-8 text-indigo-500" />,
      unread: false,
      actionText: "Responder",
      content: [
        {
          title: "Comentario",
          text: "@admin ¿Podemos programar una reunión para discutir los próximos pasos de la migración de la base de datos? Tengo algunas preocupaciones sobre la compatibilidad con los módulos existentes."
        }
      ]
    },
    {
      id: 7,
      type: "purchases",
      title: "Recordatorio de pago",
      description: "Factura #F-2389 vence en 3 días",
      time: "Ayer, 14:15",
      icon: <CreditCard className="h-8 w-8 text-purple-500" />,
      unread: false,
      actionText: "Ver factura",
      content: [
        {
          title: "Detalles de la factura",
          items: [
            { label: "Número de factura", value: "#F-2389" },
            { label: "Fecha de emisión", value: "20 Feb 2025" },
            { label: "Fecha de vencimiento", value: "08 Mar 2025" },
            { label: "Monto", value: "$8,750.00" },
            { label: "Estado", value: "Pendiente" }
          ]
        }
      ]
    },
    {
      id: 8,
      type: "system",
      title: "Mantenimiento programado",
      description: "El sistema estará en mantenimiento el 10 de marzo",
      time: "02 Mar 2025",
      icon: <Settings className="h-8 w-8 text-slate-500" />,
      unread: false,
      actionText: "Más información",
      content: [
        {
          title: "Detalles del mantenimiento",
          items: [
            { label: "Fecha", value: "10 Mar 2025" },
            { label: "Hora de inicio", value: "22:00 hrs" },
            { label: "Duración estimada", value: "2 horas" },
            { label: "Servicios afectados", value: "Portal web, API, Sistema de pagos" }
          ]
        },
        {
          title: "Información adicional",
          text: "Durante este período, el sistema no estará disponible debido a actualizaciones críticas de infraestructura. Recomendamos planificar sus actividades acordemente para evitar interrupciones en sus operaciones."
        }
      ]
    }
  ];

  const filteredNotifications = (type) => {
    if (type === 'all') return notifications;
    return notifications.filter(n => n.type === type);
  };

  const renderNotificationDetail = () => {
    if (!activeNotification) return null;
    
    const notification = notifications.find(n => n.id === activeNotification);
    
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          {notification.icon}
          <div>
            <h3 className="text-lg font-medium">{notification.title}</h3>
            <p className="text-sm text-gray-500">{notification.time}</p>
          </div>
        </div>
        
        <Separator />
        
        {notification.content.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">{section.title}</h4>
            
            {section.items && (
              <div className="space-y-2">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex justify-between text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
            
            {section.text && (
              <div className="text-sm whitespace-pre-line bg-gray-50 p-3 rounded-md">
                {section.text}
              </div>
            )}
          </div>
        ))}
        
        <div className="pt-4">
          <Button className="w-full">{notification.actionText}</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Centro de Notificaciones</h1>
          <p className="text-gray-500 mt-1">Gestiona tus alertas y mensajes en un solo lugar</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Filtrar
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings size={16} />
            Configurar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Categorías</CardTitle>
              <CardDescription>Filtrar por tipo de notificación</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {notificationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {}}
                    className={`w-full flex justify-between items-center px-4 py-2.5 text-left text-sm ${
                      type.id === 'all'
                        ? 'bg-slate-100 font-medium text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{type.label}</span>
                    <Badge variant="secondary">{type.count}</Badge>
                  </button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 pb-3">
              <div className="space-y-3 w-full">
                <div className="flex justify-between items-center">
                  <Label htmlFor="mark-read" className="flex items-center gap-2 cursor-pointer">
                    <Bell size={14} />
                    <span>Marcar todo como leído</span>
                  </Label>
                  <Switch id="mark-read" />
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="notifications" className="flex items-center gap-2 cursor-pointer">
                    <Bell size={14} />
                    <span>Notificaciones push</span>
                  </Label>
                  <Switch id="notifications" defaultChecked />
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle>Resumen</CardTitle>
              <CardDescription>Actividad reciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Package size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">12 nuevos pedidos</p>
                  <p className="text-xs text-gray-500">Esta semana</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Clock size={18} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">5 tareas pendientes</p>
                  <p className="text-xs text-gray-500">Requieren atención</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Inbox size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">24 mensajes nuevos</p>
                  <p className="text-xs text-gray-500">3 sin leer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>
                  {filteredNotifications('all').filter(n => n.unread).length} no leídas de {filteredNotifications('all').length} notificaciones
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input className="w-[180px]" placeholder="Buscar notificaciones..." />
                <Button variant="ghost" size="icon">
                  <Settings size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredNotifications('all').map((notification) => (
                  <Sheet key={notification.id}>
                    <SheetTrigger asChild>
                      <button 
                        className={`w-full flex items-start gap-4 p-4 text-left hover:bg-slate-50 ${notification.unread ? 'bg-blue-50/30' : ''}`}
                        onClick={() => setActiveNotification(notification.id)}
                      >
                        <div className="flex-shrink-0">{notification.icon}</div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className={`font-medium ${notification.unread ? 'text-blue-700' : ''}`}>{notification.title}</h3>
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{notification.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                        </div>
                        {notification.unread && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          </div>
                        )}
                      </button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md">
                      <SheetHeader className="mb-4">
                        <SheetTitle>Detalles de notificación</SheetTitle>
                        <SheetDescription>
                          Información detallada y acciones disponibles
                        </SheetDescription>
                      </SheetHeader>
                      {renderNotificationDetail()}
                    </SheetContent>
                  </Sheet>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t flex justify-between py-4">
              <Button variant="ghost" size="sm">
                Marcar todo como leído
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download size={14} />
                Exportar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}