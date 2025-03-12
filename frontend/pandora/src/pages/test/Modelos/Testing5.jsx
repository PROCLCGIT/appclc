import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  Check,
  X,
  Shield,
  Users,
  Settings,
  Lock
} from 'lucide-react';

// Datos simulados de usuarios
const mockUsers = [
  {
    id: 1,
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@example.com',
    role: 'Administrador',
    department: 'Tecnología',
    avatar: 'CR',
    status: 'active',
    lastActive: '2 horas atrás',
    permissions: ['users.create', 'users.read', 'users.update', 'users.delete', 'settings'],
    phone: '+593 9876 5432',
    createdAt: '2023-01-10',
  },
  {
    id: 2,
    name: 'María González',
    email: 'maria.gonzalez@example.com',
    role: 'Editor',
    department: 'Ventas',
    avatar: 'MG',
    status: 'active',
    lastActive: '5 min atrás',
    permissions: ['users.read', 'content.read', 'content.create', 'content.update'],
    phone: '+593 9876 1234',
    createdAt: '2023-02-15',
  },
  {
    id: 3,
    name: 'Pedro López',
    email: 'pedro.lopez@example.com',
    role: 'Usuario',
    department: 'Marketing',
    avatar: 'PL',
    status: 'inactive',
    lastActive: '3 días atrás',
    permissions: ['users.read', 'content.read'],
    phone: '+593 9876 5678',
    createdAt: '2023-03-20',
  },
  {
    id: 4,
    name: 'Lucía Martínez',
    email: 'lucia.martinez@example.com',
    role: 'Editor',
    department: 'Contenido',
    avatar: 'LM',
    status: 'active',
    lastActive: '1 día atrás',
    permissions: ['users.read', 'content.read', 'content.create', 'content.update'],
    phone: '+593 9876 8765',
    createdAt: '2023-04-05',
  },
  {
    id: 5,
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    role: 'Administrador',
    department: 'Tecnología',
    avatar: 'JP',
    status: 'active',
    lastActive: 'Ahora',
    permissions: ['users.create', 'users.read', 'users.update', 'users.delete', 'settings'],
    phone: '+593 9876 4321',
    createdAt: '2023-05-12',
  },
  {
    id: 6,
    name: 'Ana Torres',
    email: 'ana.torres@example.com',
    role: 'Usuario',
    department: 'Ventas',
    avatar: 'AT',
    status: 'pending',
    lastActive: 'Nunca',
    permissions: ['users.read', 'content.read'],
    phone: '+593 9876 2468',
    createdAt: '2023-06-18',
  },
  {
    id: 7,
    name: 'Roberto Núñez',
    email: 'roberto.nunez@example.com',
    role: 'Usuario',
    department: 'Finanzas',
    avatar: 'RN',
    status: 'inactive',
    lastActive: '1 semana atrás',
    permissions: ['users.read', 'content.read'],
    phone: '+593 9876 1357',
    createdAt: '2023-07-22',
  },
  {
    id: 8,
    name: 'Sofía Castro',
    email: 'sofia.castro@example.com',
    role: 'Editor',
    department: 'Recursos Humanos',
    avatar: 'SC',
    status: 'active',
    lastActive: '3 horas atrás',
    permissions: ['users.read', 'content.read', 'content.create', 'content.update'],
    phone: '+593 9876 9753',
    createdAt: '2023-08-30',
  }
];

// Componente para el Avatar
const Avatar = ({ name, status }) => {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  const colors = {
    'active': 'bg-emerald-100 text-emerald-800',
    'inactive': 'bg-gray-100 text-gray-800',
    'pending': 'bg-amber-100 text-amber-800'
  };
  
  const statusColors = {
    'active': 'bg-emerald-500',
    'inactive': 'bg-gray-400',
    'pending': 'bg-amber-500'
  };
  
  return (
    <div className="relative">
      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${colors[status]} font-medium text-sm`}>
        {initials}
      </div>
      <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${statusColors[status]}`}></div>
    </div>
  );
};

// Componente para la tarjeta de usuario
const UserCard = ({ user, onEdit, onDelete, onViewDetails }) => {
  const statusText = {
    'active': 'Activo',
    'inactive': 'Inactivo',
    'pending': 'Pendiente'
  };
  
  const roleColors = {
    'Administrador': 'bg-purple-100 text-purple-800',
    'Editor': 'bg-blue-100 text-blue-800',
    'Usuario': 'bg-gray-100 text-gray-800'
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar name={user.name} status={user.status} />
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          
          <div className="dropdown relative">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <div className="dropdown-menu absolute right-0 mt-2 w-56 hidden bg-white rounded-md shadow-lg border z-10">
              <div className="py-1">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => onViewDetails(user)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalles
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => onEdit(user)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100" onClick={() => onDelete(user)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Departamento</span>
            <span className="text-sm">{user.department}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Rol</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
              {user.role}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Estado</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.status === 'active' 
                ? 'bg-emerald-100 text-emerald-800' 
                : user.status === 'inactive' 
                  ? 'bg-gray-100 text-gray-800' 
                  : 'bg-amber-100 text-amber-800'
            }`}>
              {statusText[user.status]}
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Última actividad: {user.lastActive}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onViewDetails(user)}>
              Ver
            </Button>
            <Button variant="default" size="sm" onClick={() => onEdit(user)}>
              Editar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para el panel de detalles del usuario
const UserDetails = ({ user, onClose }) => {
  if (!user) return null;
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Detalles del Usuario</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
            <div className="flex-shrink-0">
              <Avatar name={user.name} status={user.status} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.role} — {user.department}</p>
              <div className="mt-2 flex items-center space-x-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{user.phone}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Información de Cuenta
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Estado</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : user.status === 'inactive' 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {user.status === 'active' ? 'Activo' : user.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Creado</span>
                    <span className="text-sm">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Última actividad</span>
                    <span className="text-sm">{user.lastActive}</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Permisos
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.permissions.map(permission => (
                    <span 
                      key={permission} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">Notificaciones por email</span>
                    </div>
                    <div className="w-10 h-5 rounded-full bg-emerald-500 relative">
                      <div className="absolute w-4 h-4 rounded-full bg-white left-5 top-0.5"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">Autenticación de dos factores</span>
                    </div>
                    <div className="w-10 h-5 rounded-full bg-gray-300 relative">
                      <div className="absolute w-4 h-4 rounded-full bg-white left-0.5 top-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Equipos
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 mr-2">D</div>
                      <span className="text-sm">Desarrollo</span>
                    </div>
                    <span className="text-xs text-gray-500">5 miembros</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700 mr-2">P</div>
                      <span className="text-sm">Proyecto Alpha</span>
                    </div>
                    <span className="text-xs text-gray-500">8 miembros</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar Usuario
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Formulario de usuario
const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    user 
      ? { ...user } 
      : {
          name: '',
          email: '',
          role: 'Usuario',
          department: '',
          phone: '',
          status: 'pending',
          permissions: ['users.read', 'content.read']
        }
  );
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error cuando el campo cambia
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  const handleStatusChange = (status) => {
    setFormData({
      ...formData,
      status
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email es inválido';
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'El departamento es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">{user ? 'Editar Usuario' : 'Crear Usuario'}</h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'border-red-500' : ''}
                  placeholder="Nombre del usuario"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rol <span className="text-red-500">*</span></Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Usuario">Usuario</option>
                  <option value="Editor">Editor</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Departamento <span className="text-red-500">*</span></Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={errors.department ? 'border-red-500' : ''}
                  placeholder="Departamento del usuario"
                />
                {errors.department && <p className="text-red-500 text-xs">{errors.department}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+593 9876 5432"
                />
              </div>
              
              {!user && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password || ''}
                      onChange={handleChange}
                      className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      placeholder="Contraseña"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Estado del usuario</Label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                    formData.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-gray-100 text-gray-800 border border-transparent'
                  }`}
                  onClick={() => handleStatusChange('active')}
                >
                  {formData.status === 'active' && <Check className="h-4 w-4 mr-1" />}
                  Activo
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                    formData.status === 'inactive' 
                      ? 'bg-gray-200 text-gray-800 border border-gray-300' 
                      : 'bg-gray-100 text-gray-800 border border-transparent'
                  }`}
                  onClick={() => handleStatusChange('inactive')}
                >
                  {formData.status === 'inactive' && <Check className="h-4 w-4 mr-1" />}
                  Inactivo
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                    formData.status === 'pending' 
                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                      : 'bg-gray-100 text-gray-800 border border-transparent'
                  }`}
                  onClick={() => handleStatusChange('pending')}
                >
                  {formData.status === 'pending' && <Check className="h-4 w-4 mr-1" />}
                  Pendiente
                </button>
              </div>
            </div>
            
            <div className="mt-6 border-t pt-6 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" variant="default">
                {user ? 'Actualizar Usuario' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Página principal de gestión de usuarios
const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Filtrar usuarios
  const filterUsers = () => {
    let filtered = users;
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(filtered);
  };
  
  // Escuchar cambios en filtros
  React.useEffect(() => {
    filterUsers();
  }, [searchTerm, statusFilter, users]);
  
  // Handlers para CRUD de usuarios
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };
  
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };
  
  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };
  
  const handleDeleteUser = (user) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario ${user.name}?`)) {
      setUsers(users.filter(u => u.id !== user.id));
    }
  };
  
  const handleSubmitUser = (userData) => {
    if (selectedUser) {
      // Actualizar usuario existente
      setUsers(users.map(u => u.id === selectedUser.id ? { ...userData, id: selectedUser.id } : u));
    } else {
      // Crear nuevo usuario
      const newUser = {
        ...userData,
        id: Math.max(...users.map(u => u.id)) + 1,
        lastActive: 'Nunca',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
    }
    setIsFormOpen(false);
  };
  
  return (
    <div className="container mx-auto p-6 max-w-[1200px]">
      <div className="space-y-6">
        {/* Header con filtros */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <p className="text-gray-500">Administra usuarios y permisos del sistema</p>
          </div>
          <Button onClick={handleAddUser} className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo Usuario
          </Button>
        </div>
        
        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="min-w-[80px]"
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                  className="min-w-[80px]"
                >
                  Activos
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('inactive')}
                  className="min-w-[80px]"
                >
                  Inactivos
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                  className="min-w-[80px]"
                >
                  Pendientes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Grid de usuarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <User className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No se encontraron usuarios</h3>
              <p className="mt-1 text-sm text-gray-500">
                No hay usuarios que coincidan con los criterios de búsqueda actuales.
              </p>
              <Button variant="default" className="mt-4" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            filteredUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onViewDetails={handleViewUserDetails}
              />
            ))
          )}
        </div>
        
        {/* Resumen de usuarios */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">Resumen de Usuarios</CardTitle>
            <CardDescription>Distribución de usuarios por estado y rol</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Por Estado</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                      <span className="text-sm">Activos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {users.filter(u => u.status === 'active').length}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(users.filter(u => u.status === 'active').length / users.length * 100)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                      <span className="text-sm">Inactivos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {users.filter(u => u.status === 'inactive').length}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(users.filter(u => u.status === 'inactive').length / users.length * 100)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-sm">Pendientes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {users.filter(u => u.status === 'pending').length}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(users.filter(u => u.status === 'pending').length / users.length * 100)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Por Rol</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                      <span className="text-sm">Administradores</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {users.filter(u => u.role === 'Administrador').length}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(users.filter(u => u.role === 'Administrador').length / users.length * 100)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm">Editores</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {users.filter(u => u.role === 'Editor').length}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(users.filter(u => u.role === 'Editor').length / users.length * 100)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                      <span className="text-sm">Usuarios</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {users.filter(u => u.role === 'Usuario').length}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(users.filter(u => u.role === 'Usuario').length / users.length * 100)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Modales */}
      {isDetailsOpen && (
        <UserDetails 
          user={selectedUser} 
          onClose={() => setIsDetailsOpen(false)} 
        />
      )}
      
      {isFormOpen && (
        <UserForm 
          user={selectedUser} 
          onSubmit={handleSubmitUser}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default UserManagement;