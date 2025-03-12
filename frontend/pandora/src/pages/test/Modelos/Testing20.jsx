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
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  UserCircle2,
  Users,
  FileCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  BarChart4,
  PieChart,
  ChevronDown,
  Download,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Star,
  XCircle,
  AlertCircle,
  Check,
  PlusCircle,
  CalendarDays
} from "lucide-react";

// Componente de tarjeta de empleado
const EmployeeCard = ({ employee, onSelect }) => {
  return (
    <div 
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white" 
      onClick={() => onSelect(employee)}
    >
      <div className="p-4 flex items-center gap-4">
        <div className="flex-shrink-0">
          {employee.avatar ? (
            <img 
              src={employee.avatar} 
              alt={employee.name}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl">
              {employee.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-grow">
          <h3 className="font-medium text-base">{employee.name}</h3>
          <p className="text-sm text-gray-500 flex items-center">
            <Building className="h-3 w-3 mr-1 inline-block" /> 
            {employee.department}
          </p>
          <p className="text-sm text-gray-500 flex items-center">
            <Mail className="h-3 w-3 mr-1 inline-block" /> 
            {employee.email}
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className={`px-2 py-1 rounded-full text-xs font-medium 
            ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 
              employee.status === 'vacation' ? 'bg-blue-100 text-blue-800' : 
              employee.status === 'leave' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'}`
          }>
            {employee.status === 'active' ? 'Activo' : 
             employee.status === 'vacation' ? 'Vacaciones' :
             employee.status === 'leave' ? 'Permiso' : 'Inactivo'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para solicitud de vacaciones
const VacationRequest = ({ request, onApprove, onReject }) => {
  return (
    <div className={`border-l-4 p-4 mb-3 rounded-md ${
      request.status === 'pending' ? 'border-yellow-500 bg-yellow-50' :
      request.status === 'approved' ? 'border-green-500 bg-green-50' :
      request.status === 'rejected' ? 'border-red-500 bg-red-50' :
      'border-gray-500 bg-gray-50'
    }`}>
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium">{request.employee}</h4>
          <p className="text-sm text-gray-600">
            {request.startDate} - {request.endDate} ({request.days} días)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Motivo: {request.reason}
          </p>
        </div>
        <div>
          {request.status === 'pending' ? (
            <div className="flex gap-2">
              <button 
                className="p-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                onClick={() => onApprove(request.id)}
              >
                <CheckCircle2 className="h-5 w-5" />
              </button>
              <button 
                className="p-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                onClick={() => onReject(request.id)}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <span className={`text-sm font-medium flex items-center ${
              request.status === 'approved' ? 'text-green-600' :
              request.status === 'rejected' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {request.status === 'approved' ? (
                <><Check className="h-4 w-4 mr-1" /> Aprobado</>
              ) : request.status === 'rejected' ? (
                <><XCircle className="h-4 w-4 mr-1" /> Rechazado</>
              ) : (
                <><Clock className="h-4 w-4 mr-1" /> Pendiente</>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para curso de capacitación
const TrainingCourse = ({ course }) => {
  return (
    <div className="border rounded-md p-4 mb-3 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium">{course.title}</h4>
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <CalendarDays className="h-3 w-3 mr-1" />
            {course.duration} | {course.schedule}
          </p>
          <div className="flex items-center mt-2">
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2">
              {course.category}
            </div>
            {course.required && (
              <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                Obligatorio
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="mb-1">
            {course.progress < 100 ? (
              <Button size="sm" variant="outline" className="h-8">
                Continuar
              </Button>
            ) : (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Completado
              </div>
            )}
          </div>
          <div className="flex items-center mt-2 justify-end">
            <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">{course.progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para la evaluación de desempeño
const PerformanceReview = ({ review }) => {
  return (
    <div className="border rounded-md overflow-hidden mb-4">
      <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
        <div>
          <h4 className="font-medium">{review.employee}</h4>
          <p className="text-xs text-gray-500">
            Período: {review.period} | Evaluador: {review.evaluator}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8">
            <FileCheck className="h-4 w-4 mr-1" />
            Ver Detalle
          </Button>
        </div>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Desempeño General</p>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.overallScore
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-1 text-sm font-medium">{review.overallScore}/5</span>
            </div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Habilidades</p>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.skillsScore
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-1 text-sm font-medium">{review.skillsScore}/5</span>
            </div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Actitud</p>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.attitudeScore
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-1 text-sm font-medium">{review.attitudeScore}/5</span>
            </div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Productividad</p>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.productivityScore
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-1 text-sm font-medium">{review.productivityScore}/5</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-700">
          <span className="font-medium">Fortalezas:</span> {review.strengths}
        </p>
        <p className="text-sm text-gray-700 mt-1">
          <span className="font-medium">Áreas de mejora:</span> {review.areasToImprove}
        </p>
      </div>
    </div>
  );
};

const Testing20 = () => {
  const [activeTab, setActiveTab] = useState('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Datos de muestra
  const mockEmployees = [
    { id: 1, name: 'Ana Martínez', department: 'Desarrollo', position: 'Desarrollador Senior', email: 'ana.martinez@empresa.com', phone: '+1 234 567 890', status: 'active', hireDate: '15/03/2020', skills: ['React', 'Node.js', 'MongoDB'] },
    { id: 2, name: 'Juan Pérez', department: 'Diseño', position: 'UX/UI Designer', email: 'juan.perez@empresa.com', phone: '+1 234 567 891', status: 'vacation', hireDate: '10/06/2019', skills: ['Figma', 'Adobe XD', 'Sketch'] },
    { id: 3, name: 'María López', department: 'Marketing', position: 'Marketing Manager', email: 'maria.lopez@empresa.com', phone: '+1 234 567 892', status: 'active', hireDate: '22/01/2021', skills: ['SEO', 'Content Creation', 'Analytics'] },
    { id: 4, name: 'Carlos Rodríguez', department: 'Ventas', position: 'Account Executive', email: 'carlos.rodriguez@empresa.com', phone: '+1 234 567 893', status: 'leave', hireDate: '05/08/2018', skills: ['Negotiation', 'CRM', 'Presentations'] },
    { id: 5, name: 'Laura González', department: 'Desarrollo', position: 'QA Engineer', email: 'laura.gonzalez@empresa.com', phone: '+1 234 567 894', status: 'active', hireDate: '30/11/2020', skills: ['Test Automation', 'Selenium', 'JUnit'] },
    { id: 6, name: 'Roberto Sánchez', department: 'RRHH', position: 'HR Specialist', email: 'roberto.sanchez@empresa.com', phone: '+1 234 567 895', status: 'active', hireDate: '14/02/2019', skills: ['Recruitment', 'Onboarding', 'Benefits Administration'] },
  ];

  const mockVacationRequests = [
    { id: 1, employee: 'Juan Pérez', department: 'Diseño', startDate: '15/07/2023', endDate: '30/07/2023', days: 15, reason: 'Vacaciones de verano', status: 'approved' },
    { id: 2, employee: 'María López', department: 'Marketing', startDate: '05/08/2023', endDate: '12/08/2023', days: 7, reason: 'Vacaciones familiares', status: 'pending' },
    { id: 3, employee: 'Carlos Rodríguez', department: 'Ventas', startDate: '10/06/2023', endDate: '15/06/2023', days: 5, reason: 'Asuntos personales', status: 'approved' },
    { id: 4, employee: 'Laura González', department: 'Desarrollo', startDate: '01/09/2023', endDate: '15/09/2023', days: 14, reason: 'Viaje internacional', status: 'pending' },
    { id: 5, employee: 'Roberto Sánchez', department: 'RRHH', startDate: '20/06/2023', endDate: '24/06/2023', days: 4, reason: 'Trámites personales', status: 'rejected' },
  ];

  const mockTrainingCourses = [
    { id: 1, title: 'Introducción a React', category: 'Desarrollo', duration: '8 horas', schedule: 'Auto-estudio', required: false, progress: 75 },
    { id: 2, title: 'Liderazgo Efectivo', category: 'Habilidades Blandas', duration: '12 horas', schedule: 'Lunes y Miércoles, 15:00-17:00', required: true, progress: 100 },
    { id: 3, title: 'Ciberseguridad Básica', category: 'Seguridad', duration: '4 horas', schedule: 'Auto-estudio', required: true, progress: 25 },
    { id: 4, title: 'Marketing Digital', category: 'Marketing', duration: '10 horas', schedule: 'Viernes, 10:00-12:00', required: false, progress: 50 },
    { id: 5, title: 'Excel Avanzado', category: 'Ofimática', duration: '6 horas', schedule: 'Auto-estudio', required: false, progress: 100 },
  ];

  const mockPerformanceReviews = [
    { id: 1, employee: 'Ana Martínez', evaluator: 'Carlos Gómez', period: 'Q1 2023', overallScore: 4.5, skillsScore: 5, attitudeScore: 4, productivityScore: 4.5, strengths: 'Excelente capacidad técnica y resolución de problemas.', areasToImprove: 'Podría mejorar en documentación de código.' },
    { id: 2, employee: 'Juan Pérez', evaluator: 'María Torres', period: 'Q4 2022', overallScore: 4, skillsScore: 4, attitudeScore: 4.5, productivityScore: 3.5, strengths: 'Creatividad y trabajo en equipo sobresalientes.', areasToImprove: 'Mejorar la gestión del tiempo y cumplimiento de plazos.' },
    { id: 3, employee: 'María López', evaluator: 'José Ramírez', period: 'Q1 2023', overallScore: 3.5, skillsScore: 3, attitudeScore: 4, productivityScore: 3.5, strengths: 'Buena comunicación y orientación al cliente.', areasToImprove: 'Necesita desarrollar más competencias técnicas específicas.' },
  ];

  // Filtrar empleados según término de búsqueda y departamento
  const filteredEmployees = mockEmployees.filter(employee => 
    (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     employee.position.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedDepartment === 'all' || employee.department === selectedDepartment)
  );

  // Departamentos disponibles
  const departments = ['Desarrollo', 'Diseño', 'Marketing', 'Ventas', 'RRHH'];

  // Manejar selección de empleado
  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  // Manejar aprobación/rechazo de solicitudes de vacaciones
  const handleApproveVacation = (id) => {
    alert(`Solicitud ${id} aprobada`);
  };

  const handleRejectVacation = (id) => {
    alert(`Solicitud ${id} rechazada`);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Encabezado principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portal de Recursos Humanos</h1>
          <p className="text-gray-500 mt-1">Gestión de personal, evaluaciones y capacitaciones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Datos
          </Button>
          <Button variant="default" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo Empleado
          </Button>
        </div>
      </div>

      {/* Tabs principales */}
      <div className="border-b mb-6">
        <div className="flex overflow-x-auto">
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center ${
              activeTab === 'directory'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('directory')}
          >
            <Users className="h-4 w-4 mr-2" />
            Directorio de Empleados
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center ${
              activeTab === 'vacations'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('vacations')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Vacaciones
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center ${
              activeTab === 'performance'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            <BarChart4 className="h-4 w-4 mr-2" />
            Evaluaciones de Desempeño
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm flex items-center ${
              activeTab === 'training'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('training')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Capacitación
          </button>
        </div>
      </div>

      {/* Contenido basado en el tab activo */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filtros y lista de empleados */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar por nombre, email o cargo..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="all">Todos los departamentos</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredEmployees.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No se encontraron empleados</p>
              ) : (
                filteredEmployees.map(employee => (
                  <EmployeeCard 
                    key={employee.id} 
                    employee={employee} 
                    onSelect={handleSelectEmployee}
                  />
                ))
              )}
            </div>
          </div>

          {/* Detalles del empleado */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Empleado</CardTitle>
                <CardDescription>
                  {selectedEmployee ? 'Información completa' : 'Selecciona un empleado para ver sus detalles'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedEmployee ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-3xl">
                        {selectedEmployee.name.charAt(0)}
                      </div>
                    </div>
                    
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-medium">{selectedEmployee.name}</h3>
                      <p className="text-gray-500">{selectedEmployee.position}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium">Departamento</p>
                          <p className="text-sm text-gray-600">{selectedEmployee.department}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium">Correo Electrónico</p>
                          <p className="text-sm text-gray-600">{selectedEmployee.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium">Teléfono</p>
                          <p className="text-sm text-gray-600">{selectedEmployee.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium">Fecha de Contratación</p>
                          <p className="text-sm text-gray-600">{selectedEmployee.hireDate}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Habilidades</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmployee.skills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <UserCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Selecciona un empleado del directorio para ver su información detallada</p>
                  </div>
                )}
              </CardContent>
              {selectedEmployee && (
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline">Ver Expediente</Button>
                  <Button>Editar Perfil</Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'vacations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Solicitudes de vacaciones */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Vacaciones</CardTitle>
                <CardDescription>Sistema de solicitud y aprobación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockVacationRequests.map(request => (
                    <VacationRequest 
                      key={request.id} 
                      request={request}
                      onApprove={handleApproveVacation}
                      onReject={handleRejectVacation}
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nueva Solicitud de Vacaciones
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Calendario de vacaciones */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Calendario de Vacaciones</CardTitle>
                <CardDescription>Vista mensual del equipo</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mini calendario (simplificado) */}
                <div className="bg-white border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <ChevronDown className="h-5 w-5 rotate-90" />
                    </button>
                    <h3 className="font-medium">Julio 2023</h3>
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <ChevronDown className="h-5 w-5 -rotate-90" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                      <div key={day} className="py-1 text-xs font-medium text-gray-500">{day}</div>
                    ))}
                    
                    {/* Días del mes (simplificado) */}
                    {Array.from({ length: 31 }).map((_, i) => {
                      const day = i + 1;
                      // Simular días con vacaciones para algunos empleados
                      const hasVacation = [5, 6, 7, 8, 9, 10, 15, 16, 17, 18, 19, 20, 21, 22].includes(day);
                      
                      return (
                        <div 
                          key={i} 
                          className={`p-1 text-xs border rounded ${
                            hasVacation ? 'bg-blue-50 border-blue-100' : day === 15 ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Leyenda */}
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Personal en vacaciones:</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <p className="text-sm">Juan Pérez (Diseño)</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <p className="text-sm">Carlos Rodríguez (Ventas)</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                      <p className="text-sm">Laura González (Desarrollo)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evaluaciones de desempeño */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Evaluaciones de Desempeño</CardTitle>
                <CardDescription>Historial y calificaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockPerformanceReviews.map(review => (
                    <PerformanceReview key={review.id} review={review} />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nueva Evaluación
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Gráficos comparativos */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Análisis Comparativo</CardTitle>
                <CardDescription>Evolución del desempeño</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder para gráficos */}
                <div className="space-y-4">
                  <div className="border rounded-md p-4 h-48 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart4 className="h-10 w-10 mx-auto text-blue-400 mb-2" />
                      <p className="text-sm text-gray-700">Comparativa por Departamento</p>
                      <p className="text-xs text-gray-500">Puntuaciones promedio</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 h-48 flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-10 w-10 mx-auto text-purple-400 mb-2" />
                      <p className="text-sm text-gray-700">Distribución de Calificaciones</p>
                      <p className="text-xs text-gray-500">Por categoría de desempeño</p>
                    </div>
                  </div>
                </div>
                
                {/* Métricas resumen */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium">Promedio General</p>
                    <p className="text-xl font-bold">4.2/5</p>
                    <p className="text-xs text-gray-500">+0.3 vs período anterior</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md border border-green-100">
                    <p className="text-xs text-green-600 font-medium">Mejor Departamento</p>
                    <p className="text-xl font-bold">Desarrollo</p>
                    <p className="text-xs text-gray-500">4.5/5 promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cursos de capacitación */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Módulo de Capacitación</CardTitle>
                <CardDescription>Cursos disponibles y progreso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <Input
                      type="text"
                      placeholder="Buscar cursos..."
                      className="flex-grow"
                    />
                    <select className="h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48">
                      <option value="all">Todas las categorías</option>
                      <option value="development">Desarrollo</option>
                      <option value="soft_skills">Habilidades Blandas</option>
                      <option value="security">Seguridad</option>
                      <option value="marketing">Marketing</option>
                      <option value="office">Ofimática</option>
                    </select>
                  </div>
                  
                  <div className="space-y-4">
                    {mockTrainingCourses.map(course => (
                      <TrainingCourse key={course.id} course={course} />
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Nuevo Curso
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Estadísticas de capacitación */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Seguimiento de Progreso</CardTitle>
                <CardDescription>Estadísticas de capacitación</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Progreso general */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Progreso General</p>
                    <p className="text-sm font-medium">70%</p>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">14 de 20 cursos completados</p>
                </div>
                
                {/* Progreso por categoría */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Progreso por Categoría</p>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs">Desarrollo</p>
                      <p className="text-xs font-medium">85%</p>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs">Habilidades Blandas</p>
                      <p className="text-xs font-medium">100%</p>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs">Seguridad</p>
                      <p className="text-xs font-medium">25%</p>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs">Marketing</p>
                      <p className="text-xs font-medium">50%</p>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs">Ofimática</p>
                      <p className="text-xs font-medium">100%</p>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
                
                {/* Certificaciones recientes */}
                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Certificaciones Recientes</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-full text-green-600 mr-3">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Liderazgo Efectivo</p>
                        <p className="text-xs text-gray-500">Completado: 15/06/2023</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-full text-blue-600 mr-3">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Excel Avanzado</p>
                        <p className="text-xs text-gray-500">Completado: 10/06/2023</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testing20;