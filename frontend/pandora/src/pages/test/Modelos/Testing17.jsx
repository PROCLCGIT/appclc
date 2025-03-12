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
import { Textarea } from "@/components/ui/textarea";
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
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Flag,
  Folder,
  GraduationCap,
  Menu,
  MessageSquare,
  Play,
  PlayCircle,
  Search,
  Star,
  ThumbsUp,
  User,
  Users,
  Video,
  Volume2,
} from "lucide-react";

// Datos simulados para los cursos
const coursesData = [
  {
    id: 1,
    title: "Desarrollo Web Avanzado con React",
    instructor: "Carlos Mendoza",
    category: "programming",
    level: "advanced",
    rating: 4.8,
    reviews: 342,
    students: 12493,
    duration: "32h 45m",
    price: 49.99,
    discount: 39.99,
    language: "Español",
    lastUpdate: "Marzo 2025",
    image: "https://placehold.co/600x400/4F46E5/FFFFFF?text=React+Avanzado",
    description: "Domina React con conceptos avanzados como hooks personalizados, patrones de renderizado, optimización de rendimiento y arquitecturas modernas para construir aplicaciones web escalables y mantenibles.",
    topics: ["React Hooks", "Context API", "Redux", "Arquitectura de aplicaciones", "Testing con Jest", "Server-Side Rendering", "Performance"]
  },
  {
    id: 2,
    title: "Machine Learning para Análisis de Datos",
    instructor: "Ana Martínez",
    category: "data-science",
    level: "intermediate",
    rating: 4.9,
    reviews: 528,
    students: 8752,
    duration: "28h 20m",
    price: 59.99,
    discount: 0,
    language: "Español",
    lastUpdate: "Febrero 2025",
    image: "https://placehold.co/600x400/3B82F6/FFFFFF?text=Machine+Learning",
    description: "Aprende a implementar algoritmos de machine learning utilizando Python y scikit-learn para análisis de datos, predicciones y clasificación con aplicaciones prácticas en casos reales de negocio.",
    topics: ["Python para Datos", "Algoritmos Supervisados", "Procesamiento de Datos", "Clasificación", "Regresión", "Validación de Modelos"]
  },
  {
    id: 3,
    title: "Diseño UI/UX: De Principiante a Profesional",
    instructor: "Elena Rodríguez",
    category: "design",
    level: "beginner",
    rating: 4.7,
    reviews: 731,
    students: 15782,
    duration: "24h 10m",
    price: 44.99,
    discount: 29.99,
    language: "Español",
    lastUpdate: "Enero 2025",
    image: "https://placehold.co/600x400/EC4899/FFFFFF?text=UI/UX+Design",
    description: "Conviértete en un diseñador UI/UX profesional aprendiendo los fundamentos del diseño, teoría del color, tipografía, diseño de interfaces, prototipado y metodologías centradas en el usuario.",
    topics: ["Fundamentos de Diseño", "Figma", "Wireframing", "Prototipado", "User Research", "Design Systems", "Accesibilidad"]
  },
  {
    id: 4,
    title: "Blockchain y Smart Contracts con Solidity",
    instructor: "Roberto Sánchez",
    category: "blockchain",
    level: "intermediate",
    rating: 4.6,
    reviews: 238,
    students: 5423,
    duration: "26h 30m",
    price: 54.99,
    discount: 44.99,
    language: "Español",
    lastUpdate: "Abril 2025",
    image: "https://placehold.co/600x400/10B981/FFFFFF?text=Blockchain",
    description: "Domina el desarrollo blockchain con Ethereum y Solidity. Aprende a crear, desplegar y gestionar contratos inteligentes para construir aplicaciones descentralizadas (DApps) seguras y eficientes.",
    topics: ["Ethereum", "Solidity", "Smart Contracts", "Web3.js", "Truffle Framework", "DApps", "Seguridad en Blockchain"]
  },
  {
    id: 5,
    title: "Marketing Digital 360°",
    instructor: "María González",
    category: "marketing",
    level: "beginner",
    rating: 4.8,
    reviews: 892,
    students: 21345,
    duration: "22h 15m",
    price: 39.99,
    discount: 0,
    language: "Español",
    lastUpdate: "Marzo 2025",
    image: "https://placehold.co/600x400/F59E0B/FFFFFF?text=Marketing+Digital",
    description: "Aprende todas las estrategias de marketing digital: SEO, SEM, redes sociales, email marketing, analítica web y más. Un curso completo para dominar el ecosistema digital y aumentar la visibilidad de tu negocio.",
    topics: ["SEO", "Google Ads", "Meta Ads", "Email Marketing", "Analytics", "Growth Hacking", "Contenidos"]
  }
];

// Datos del curso seleccionado
const selectedCourseData = {
  id: 1,
  sections: [
    {
      id: 1,
      title: "Introducción al curso",
      lectures: [
        { id: 1, title: "Bienvenida al curso", duration: "5:20", type: "video", completed: true },
        { id: 2, title: "¿Qué aprenderás?", duration: "8:45", type: "video", completed: true },
        { id: 3, title: "Configuración del entorno", duration: "12:30", type: "video", completed: false }
      ]
    },
    {
      id: 2,
      title: "Fundamentos avanzados de React",
      lectures: [
        { id: 4, title: "React Hooks en profundidad", duration: "18:15", type: "video", completed: false },
        { id: 5, title: "useEffect y ciclo de vida", duration: "22:40", type: "video", completed: false },
        { id: 6, title: "Custom Hooks", duration: "15:55", type: "video", completed: false },
        { id: 7, title: "Práctica: Creando hooks personalizados", duration: "25:10", type: "practice", completed: false },
        { id: 8, title: "Cuestionario: Hooks", duration: "10 preguntas", type: "quiz", completed: false }
      ]
    },
    {
      id: 3,
      title: "Arquitectura de aplicaciones",
      lectures: [
        { id: 9, title: "Patrones de arquitectura en React", duration: "24:30", type: "video", completed: false },
        { id: 10, title: "Atomic Design", duration: "19:45", type: "video", completed: false },
        { id: 11, title: "Context API vs Redux", duration: "28:20", type: "video", completed: false },
        { id: 12, title: "Implementación de Redux", duration: "32:15", type: "video", completed: false },
        { id: 13, title: "Proyecto: Arquitectura de una app", duration: "45:00", type: "project", completed: false }
      ]
    }
  ]
};

// Componente para la tarjeta de curso
const CourseCard = ({ course, onClick }) => {
  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Convertir categoría a etiqueta
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'programming':
        return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Programación</Badge>;
      case 'data-science':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Data Science</Badge>;
      case 'design':
        return <Badge className="bg-pink-50 text-pink-700 border-pink-200">Diseño</Badge>;
      case 'blockchain':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Blockchain</Badge>;
      case 'marketing':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Marketing</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">{category}</Badge>;
    }
  };

  // Convertir nivel a español
  const getLevelText = (level) => {
    switch (level) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return level;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover"
        />
        {course.discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            OFERTA
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
            <CardDescription className="mt-1">{course.instructor}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <div className="flex items-center mb-2 text-sm">
          <span className="font-bold text-amber-500 mr-1">{course.rating}</span>
          <div className="flex mr-1">
            {Array(5).fill(0).map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(course.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-gray-500">({course.reviews})</span>
        </div>
        
        <div className="flex justify-between mb-2 text-sm">
          <div className="flex items-center">
            <Users className="h-4 w-4 text-gray-400 mr-1" />
            <span>{course.students.toLocaleString()} estudiantes</span>
          </div>
          <div className="flex items-center">
            <Video className="h-4 w-4 text-gray-400 mr-1" />
            <span>{course.duration}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {getCategoryBadge(course.category)}
          <Badge variant="outline">{getLevelText(course.level)}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div>
          {course.discount > 0 ? (
            <div>
              <span className="font-bold text-lg">{formatPrice(course.discount)}</span>
              <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(course.price)}</span>
            </div>
          ) : (
            <span className="font-bold text-lg">{formatPrice(course.price)}</span>
          )}
        </div>
        <Button variant="default" size="sm" onClick={() => onClick(course.id)}>
          Ver curso
        </Button>
      </CardFooter>
    </Card>
  );
};

// Componente para el reproductor de video
const VideoPlayer = ({ lecture }) => {
  return (
    <div className="aspect-video bg-gray-900 rounded-md overflow-hidden relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <PlayCircle className="h-16 w-16 mb-4 text-white opacity-80" />
        <h3 className="text-xl font-medium">{lecture.title}</h3>
        <p className="text-sm opacity-80 mt-2">Duración: {lecture.duration}</p>
      </div>
    </div>
  );
};

// Componente para la lista de lecciones
const CourseLecturesList = ({ sections, currentLecture, onSelectLecture }) => {
  return (
    <div className="border rounded-md overflow-hidden divide-y">
      {sections.map((section) => (
        <div key={section.id} className="bg-white">
          <div className="p-3 bg-gray-50 font-medium flex justify-between items-center">
            <span>{section.title}</span>
            <span className="text-sm text-gray-500">{section.lectures.length} lecciones</span>
          </div>
          <div className="divide-y">
            {section.lectures.map((lecture) => (
              <button
                key={lecture.id}
                className={`w-full text-left p-3 hover:bg-gray-50 flex items-center ${lecture.id === currentLecture?.id ? 'bg-blue-50' : ''}`}
                onClick={() => onSelectLecture(lecture)}
              >
                <div className="mr-3 flex-shrink-0">
                  {lecture.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : lecture.type === 'video' ? (
                    <Play className="h-5 w-5 text-gray-400" />
                  ) : lecture.type === 'quiz' ? (
                    <FileText className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Folder className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div className="flex-grow">
                  <p className={`${lecture.completed ? 'text-gray-500' : 'text-gray-700'}`}>{lecture.title}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    {lecture.type === 'video' ? (
                      <Video className="h-3 w-3 mr-1" />
                    ) : lecture.type === 'quiz' ? (
                      <FileText className="h-3 w-3 mr-1" />
                    ) : (
                      <Folder className="h-3 w-3 mr-1" />
                    )}
                    <span>{lecture.duration}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente principal para la plataforma de aprendizaje
const Testing17 = () => {
  const [courses, setCourses] = useState(coursesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Obtener curso por ID
  const getCourseById = (id) => {
    return courses.find(course => course.id === id);
  };
  
  // Filtrar cursos
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });
  
  // Manejar clic en curso
  const handleCourseClick = (id) => {
    const course = getCourseById(id);
    setSelectedCourse({
      ...course,
      ...selectedCourseData
    });
    
    // Seleccionar primera lección
    if (selectedCourseData.sections.length > 0 && 
        selectedCourseData.sections[0].lectures.length > 0) {
      setCurrentLecture(selectedCourseData.sections[0].lectures[0]);
    }
    
    setActiveTab("overview");
  };
  
  // Volver a la lista de cursos
  const handleBackToList = () => {
    setSelectedCourse(null);
    setCurrentLecture(null);
  };
  
  // Obtener número total de lecciones
  const getTotalLectures = () => {
    if (!selectedCourse || !selectedCourse.sections) return 0;
    
    return selectedCourse.sections.reduce((acc, section) => {
      return acc + section.lectures.length;
    }, 0);
  };
  
  // Obtener número total de lecciones completadas
  const getCompletedLectures = () => {
    if (!selectedCourse || !selectedCourse.sections) return 0;
    
    return selectedCourse.sections.reduce((acc, section) => {
      return acc + section.lectures.filter(lecture => lecture.completed).length;
    }, 0);
  };
  
  // Obtener progreso del curso
  const getCourseProgress = () => {
    const total = getTotalLectures();
    const completed = getCompletedLectures();
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };
  
  // Seleccionar lección
  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    setActiveTab("content");
  };
  
  // Marcar lección como completada o incompleta
  const toggleLectureCompletion = () => {
    if (!currentLecture) return;
    
    const updatedSections = selectedCourse.sections.map(section => {
      const updatedLectures = section.lectures.map(lecture => {
        if (lecture.id === currentLecture.id) {
          return {
            ...lecture,
            completed: !lecture.completed
          };
        }
        return lecture;
      });
      
      return {
        ...section,
        lectures: updatedLectures
      };
    });
    
    setSelectedCourse({
      ...selectedCourse,
      sections: updatedSections
    });
    
    // Actualizar lección actual
    setCurrentLecture({
      ...currentLecture,
      completed: !currentLecture.completed
    });
  };
  
  // Ir a la lección anterior
  const goToPreviousLecture = () => {
    if (!selectedCourse || !currentLecture) return;
    
    let foundPrevious = false;
    
    // Recorrer las secciones y lecciones en orden inverso
    for (let i = selectedCourse.sections.length - 1; i >= 0; i--) {
      const section = selectedCourse.sections[i];
      
      for (let j = section.lectures.length - 1; j >= 0; j--) {
        const lecture = section.lectures[j];
        
        if (foundPrevious) {
          setCurrentLecture(lecture);
          return;
        }
        
        if (lecture.id === currentLecture.id) {
          foundPrevious = true;
        }
      }
    }
  };
  
  // Ir a la lección siguiente
  const goToNextLecture = () => {
    if (!selectedCourse || !currentLecture) return;
    
    let foundCurrent = false;
    
    // Recorrer las secciones y lecciones en orden
    for (let i = 0; i < selectedCourse.sections.length; i++) {
      const section = selectedCourse.sections[i];
      
      for (let j = 0; j < section.lectures.length; j++) {
        const lecture = section.lectures[j];
        
        if (foundCurrent) {
          setCurrentLecture(lecture);
          return;
        }
        
        if (lecture.id === currentLecture.id) {
          foundCurrent = true;
        }
      }
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedCourse ? selectedCourse.title : "Plataforma de Aprendizaje Online"}
            </h1>
            <p className="text-gray-500 mt-1">
              {selectedCourse ? `Instructor: ${selectedCourse.instructor}` : "Aprende nuevas habilidades con cursos interactivos"}
            </p>
          </div>
          {selectedCourse ? (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBackToList}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Volver a cursos
              </Button>
            </div>
          ) : (
            <div className="relative flex-grow lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar cursos..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Lista de cursos */}
      {!selectedCourse && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="programming">Programación</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
                <SelectItem value="design">Diseño</SelectItem>
                <SelectItem value="blockchain">Blockchain</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={levelFilter} 
              onValueChange={setLevelFilter}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {filteredCourses.length === 0 ? (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border">
              <div className="text-center">
                <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No se encontraron cursos</h3>
                <p className="text-gray-500 max-w-md mb-4">
                  No hay cursos que coincidan con los criterios de búsqueda o filtros seleccionados.
                </p>
                <Button onClick={() => {setSearchTerm(""); setCategoryFilter("all"); setLevelFilter("all");}}>
                  Borrar filtros
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onClick={handleCourseClick}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Vista del curso seleccionado */}
      {selectedCourse && (
        <>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Descripción del curso</TabsTrigger>
              <TabsTrigger value="content">Contenido del curso</TabsTrigger>
              <TabsTrigger value="notes">Mis notas</TabsTrigger>
              <TabsTrigger value="reviews">Opiniones</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Acerca de este curso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-gray-700">{selectedCourse.description}</p>
                      
                      <div>
                        <h3 className="font-medium mb-2">Lo que aprenderás</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                          {selectedCourse.topics.map((topic, index) => (
                            <div key={index} className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{topic}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-3">Progreso del curso</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              <span className="font-medium">{getCompletedLectures()}</span> de 
                              <span className="font-medium"> {getTotalLectures()}</span> lecciones completadas
                            </span>
                            <span>{getCourseProgress()}% completado</span>
                          </div>
                          <Progress value={getCourseProgress()} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-3">
                        <Button className="flex-1">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continuar aprendiendo
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Flag className="h-4 w-4 mr-2" />
                          Marcar como completado
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Detalles del curso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Nivel</Label>
                          <p className="font-medium">
                            {selectedCourse.level === 'beginner' ? 'Principiante' : 
                             selectedCourse.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Duración</Label>
                          <p className="font-medium">{selectedCourse.duration}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Lecciones</Label>
                          <p className="font-medium">{getTotalLectures()}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Idioma</Label>
                          <p className="font-medium">{selectedCourse.language}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Última actualización</Label>
                          <p className="font-medium">{selectedCourse.lastUpdate}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Estudiantes</Label>
                          <p className="font-medium">{selectedCourse.students.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Label className="text-xs text-gray-500">Instructor</Label>
                        <div className="flex items-center mt-2">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{selectedCourse.instructor}</p>
                            <p className="text-xs text-gray-500">Instructor profesional</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Label className="text-xs text-gray-500">Valoraciones</Label>
                        <div className="flex items-center mt-1">
                          <span className="font-bold text-lg text-amber-500 mr-2">{selectedCourse.rating}</span>
                          <div className="flex">
                            {Array(5).fill(0).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < Math.floor(selectedCourse.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{selectedCourse.reviews} opiniones</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <Card className="overflow-hidden">
                    <div className="relative">
                      {currentLecture && (
                        <VideoPlayer lecture={currentLecture} />
                      )}
                    </div>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-medium mb-1">
                            {currentLecture ? currentLecture.title : "Selecciona una lección"}
                          </h2>
                          {currentLecture && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Video className="h-4 w-4 mr-1" />
                              <span>{currentLecture.duration}</span>
                            </div>
                          )}
                        </div>
                        {currentLecture && (
                          <Button 
                            variant={currentLecture.completed ? "outline" : "default"}
                            size="sm"
                            onClick={toggleLectureCompletion}
                          >
                            {currentLecture.completed ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Completado
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Marcar como completado
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                    <div className="bg-gray-50 p-4 flex justify-between items-center border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!currentLecture}
                        onClick={goToPreviousLecture}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Anterior
                      </Button>
                      <div className="text-sm text-gray-500">
                        Lección {currentLecture ? currentLecture.id : "-"} de {getTotalLectures()}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!currentLecture}
                        onClick={goToNextLecture}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recursos de la lección</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center h-32 border rounded-md bg-gray-50">
                        <div className="text-center">
                          <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No hay recursos disponibles para esta lección</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="h-full">
                    <CardHeader className="p-4 border-b bg-gray-50">
                      <CardTitle className="text-lg">Contenido del curso</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[600px]">
                        <CourseLecturesList 
                          sections={selectedCourse.sections} 
                          currentLecture={currentLecture}
                          onSelectLecture={handleSelectLecture}
                        />
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Mis notas del curso</CardTitle>
                  <CardDescription>Toma notas personales mientras estudias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea 
                      placeholder="Escribe tus notas aquí..." 
                      className="min-h-[200px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                      <Button>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Opiniones de estudiantes</CardTitle>
                      <CardDescription>{selectedCourse.reviews} opiniones en total</CardDescription>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-3">
                        <div className="flex">
                          {Array(5).fill(0).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-5 w-5 ${i < Math.floor(selectedCourse.rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-sm text-center">{selectedCourse.rating}/5</p>
                      </div>
                      <Button variant="outline">Filtrar</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Las opiniones de los estudiantes se están cargando</p>
                    <Button className="mt-4">Ver todas las opiniones</Button>
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

export default Testing17;