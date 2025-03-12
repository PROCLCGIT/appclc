import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Bell, Eye, Monitor, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      productsUpdates: true,
      securityAlerts: true
    },
    privacy: {
      showOnlineStatus: true,
      showLastSeen: false,
      showReadReceipts: true
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false
    }
  });

  const handleThemeChange = (value) => {
    setSettings(prev => ({
      ...prev,
      theme: value
    }));
  };

  const handleToggleChange = (section, setting) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: !prev[section][setting]
      }
    }));
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="privacy">Privacidad</TabsTrigger>
          <TabsTrigger value="accessibility">Accesibilidad</TabsTrigger>
        </TabsList>
        
        {/* TAB: General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Personaliza la apariencia y comportamiento de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="theme">Tema</Label>
                  <Select value={settings.theme} onValueChange={handleThemeChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccionar Tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          <span>Claro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          <span>Oscuro</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          <span>Sistema</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="language">Idioma</Label>
                  <Select defaultValue="es">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccionar Idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select defaultValue="america-guayaquil">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccionar Zona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-guayaquil">América/Guayaquil</SelectItem>
                      <SelectItem value="america-bogota">América/Bogotá</SelectItem>
                      <SelectItem value="america-lima">América/Lima</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* TAB: Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Configura qué tipos de notificaciones deseas recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="notifications-email" className="text-base">Notificaciones por Email</Label>
                    <span className="text-sm text-muted-foreground">Recibe actualizaciones en tu correo electrónico</span>
                  </div>
                  <Switch
                    id="notifications-email"
                    checked={settings.notifications.email}
                    onCheckedChange={() => handleToggleChange('notifications', 'email')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="notifications-push" className="text-base">Notificaciones Push</Label>
                    <span className="text-sm text-muted-foreground">Recibe notificaciones en tu navegador</span>
                  </div>
                  <Switch
                    id="notifications-push"
                    checked={settings.notifications.push}
                    onCheckedChange={() => handleToggleChange('notifications', 'push')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="notifications-products" className="text-base">Actualizaciones de Productos</Label>
                    <span className="text-sm text-muted-foreground">Recibe notificaciones sobre cambios en productos</span>
                  </div>
                  <Switch
                    id="notifications-products"
                    checked={settings.notifications.productsUpdates}
                    onCheckedChange={() => handleToggleChange('notifications', 'productsUpdates')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="notifications-security" className="text-base">Alertas de Seguridad</Label>
                    <span className="text-sm text-muted-foreground">Recibe alertas sobre actividad sospechosa</span>
                  </div>
                  <Switch
                    id="notifications-security"
                    checked={settings.notifications.securityAlerts}
                    onCheckedChange={() => handleToggleChange('notifications', 'securityAlerts')}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* TAB: Privacy */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Privacidad</CardTitle>
              <CardDescription>
                Gestiona tus preferencias de privacidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="privacy-status" className="text-base">Mostrar Estado en Línea</Label>
                    <span className="text-sm text-muted-foreground">Otros usuarios pueden ver cuando estás activo</span>
                  </div>
                  <Switch
                    id="privacy-status"
                    checked={settings.privacy.showOnlineStatus}
                    onCheckedChange={() => handleToggleChange('privacy', 'showOnlineStatus')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="privacy-lastseen" className="text-base">Mostrar Última Conexión</Label>
                    <span className="text-sm text-muted-foreground">Otros usuarios pueden ver cuándo fue tu última actividad</span>
                  </div>
                  <Switch
                    id="privacy-lastseen"
                    checked={settings.privacy.showLastSeen}
                    onCheckedChange={() => handleToggleChange('privacy', 'showLastSeen')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="privacy-receipts" className="text-base">Confirmaciones de Lectura</Label>
                    <span className="text-sm text-muted-foreground">Mostrar cuando has leído mensajes</span>
                  </div>
                  <Switch
                    id="privacy-receipts"
                    checked={settings.privacy.showReadReceipts}
                    onCheckedChange={() => handleToggleChange('privacy', 'showReadReceipts')}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* TAB: Accessibility */}
        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Accesibilidad</CardTitle>
              <CardDescription>
                Ajusta la aplicación para hacerla más accesible según tus necesidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="accessibility-contrast" className="text-base">Alto Contraste</Label>
                    <span className="text-sm text-muted-foreground">Mejora la visibilidad con colores de mayor contraste</span>
                  </div>
                  <Switch
                    id="accessibility-contrast"
                    checked={settings.accessibility.highContrast}
                    onCheckedChange={() => handleToggleChange('accessibility', 'highContrast')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="accessibility-text" className="text-base">Texto Grande</Label>
                    <span className="text-sm text-muted-foreground">Aumenta el tamaño del texto en toda la aplicación</span>
                  </div>
                  <Switch
                    id="accessibility-text"
                    checked={settings.accessibility.largeText}
                    onCheckedChange={() => handleToggleChange('accessibility', 'largeText')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="accessibility-motion" className="text-base">Reducir Movimiento</Label>
                    <span className="text-sm text-muted-foreground">Minimiza animaciones y efectos de transición</span>
                  </div>
                  <Switch
                    id="accessibility-motion"
                    checked={settings.accessibility.reducedMotion}
                    onCheckedChange={() => handleToggleChange('accessibility', 'reducedMotion')}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}