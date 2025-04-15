// src/components/layout/Navigation.jsx

import {
  Home,
  Microscope,
  SearchCode,
  Workflow,
  ShoppingBag,
  Activity,
  Users,
  Database,
  Settings,
  FileText,
  BarChart3,
  Box,
  Briefcase,
  Building,
  BookOpen,
  Clipboard,
  Tag,
  TrendingUp,
  Truck,
  ShieldCheck,
  Upload,
  Download,
  Layers,
  Zap,
  FileBox,
  BookMarked
} from "lucide-react";

export const navigation = [
  // Sección MAIN - Dashboard principal
  {
    section: "MAIN",
    name: "Dashboard",
    path: "/",
    icon: Home
  },

  {
    section: "Ejemplos",
    name: "Ejemplos",
    icon: Home,
    badge: "31",
    children: [
      { name: "Testing 1", path: "/testing1" },
      { name: "Testing 2", path: "/testing2" },
      { name: "Testing 3", path: "/testing3" },
      { name: "Testing 4", path: "/testing4" },
      { name: "Testing 5", path: "/testing5" },
      { name: "Testing 6", path: "/testing6" },
      { name: "Testing 7", path: "/testing7" },
      { name: "Testing 8", path: "/testing8" },
      { name: "Testing 9", path: "/testing9" },
      { name: "Testing 10", path: "/testing10" },
      { name: "Testing 11", path: "/testing11" },
      { name: "Testing 12", path: "/testing12" },
      { name: "Testing 13", path: "/testing13" },
      { name: "Testing 14", path: "/testing14" },
      { name: "Testing 15", path: "/testing15" },
      { name: "Testing 16", path: "/testing16" },
      { name: "Testing 17", path: "/testing17" },
      { name: "Testing 18", path: "/testing18" },
      { name: "Testing 19", path: "/testing19" },
      { name: "Testing 20", path: "/testing20" },
      { name: "Testing 21 - Proforma Moderna", path: "/testing21" },
      { name: "Testing 22 - Proforma Inventario", path: "/testing22" },
      { name: "Testing 23 - Proforma Avanzada", path: "/testing23" },
      { name: "Testing 24 - Proforma Multidivisa", path: "/testing24" },
      { name: "Testing 25", path: "/testing25" },
      { name: "Testing 26", path: "/testing26" },
      { name: "Testing 27 - Dashboard Proformas", path: "/testing27", badge: "Nuevo" },
      { name: "Testing 28 - Editor Proformas", path: "/testing28", badge: "Nuevo" },
      { name: "Testing 29 - Gestión Proformas", path: "/testing29", badge: "Nuevo" },
      { name: "Testing 30 - Creador Proformas", path: "/testing30", badge: "Nuevo" }
    ]
  },

  // Sección PRUEBAS - Testing y desarrollo
  {
    section: "PRUEBAS",
    name: "Testing",
    icon: Microscope,
    badge: "3",
    children: [
      { name: "Modelo 1", path: "/OP01" },
      { name: "Modelo 2", path: "/OP02" },
      { name: "Modelo 3", path: "/OP03" },
      { name: "Modelo 4", path: "/OP04" },
      { name: "Modelo 5", path: "/OP05" },

    ]
  },

  // Sección WEB APPS
  {
    section: "WEB APPS",
    name: "Base Legal",
    icon: FileText,
    badge: "3",
    children: [
      { name: "Info Empresa", path: "/empresainfo" },
      { name: "Info Empresa 2", path: "/empresainfo2" },
      { name: "Info Empresa 3", path: "/empresainfo3" },
      
    ]
  },
  {
    section: "WEB APPS",
    name: "Doc Manager",
    icon: FileBox,
    badge: "New",
    children: [
   
      { name: "Gestor Documental", path: "/docmanager" },
    ]
  },

  
  {
    section: "WEB APPS",
    name: "Productos",
    icon: ShoppingBag,
    children: [
      { name: "Productos Ofertados", path: "/productosofertados" },
      { name: "Productos Disponibles", path: "/productosdisponibles" },
      { name: "Histórico de Ventas", path: "/historico-ventas" },
      { name: "Histórico de Compras", path: "/historico-compras" }
    ]
  },
        
  {
    section: "WEB APPS",
    name: "Proformas",
    icon: Clipboard,
    badge: "2",
    children: [
      { name: "DashBoard Proformas", path: "/dashboardproformas" },
      { name: "Mis Proformas", path: "/proformas-guardadas" },
      { name: "Nueva Proforma" , path: "/enhancedproforma?new=true" },
    ]
  },
  
  {
    section: "WEB APPS",
    name: "Briefs",
    icon: BookMarked,
    children: [
      { name: "Gestión de Briefs", path: "/briefs" },
      { name: "Nuevo Brief", path: "/briefs/add" },
    ]
  },

  {
    section: "WEB APPS",
    name: "Inventario",
    icon: BookMarked,
    children: [
      { name: "Inventario", path: "/inventariopage" },
      { name: "Brief", path: "/brief" },
      { name: "Wizard Form", path: "/wizardform" },
      
    ]
  },


  // Sección ANÁLISIS
  {
    section: "ANÁLISIS",
    name: "Precios",
    icon: TrendingUp,
    children: [
      { name: "Precios SIE", path: "/preciossie" },
      { name: "Procesos Auditados", path: "/procesosauditados" }
    ]
  },

  // Sección CONTACTOS
  {
    section: "CONTACTOS",
    name: "Directorio",
    icon: Users,
    children: [
      { name: "Clientes", path: "/clientes" },
      { name: "Proveedores", path: "/proveedores" },
      { name: "Vendedores", path: "/vendedores" },
      { name: "Contactos", path: "/contactos" },
      { name: "Relaciones Blue", path: "/relaciones-blue", badge: "Nuevo" }
    ]
  },
  
  // Sección CONFIG
  {
    section: "CONFIG",
    name: "Bases Relacionales",
    icon: Database,
    children: [
      { name: "Pandora", path: "/pandora" },
      { name: "Categorías", path: "/categorias" },
      { name: "Marcas", path: "/marcas" },
      { name: "Unidades", path: "/unidades" },
      { name: "Zonas", path: "/zonas" },
      { name: "Ciudades", path: "/ciudades" },
      { name: "Especialidades", path: "/especialidades" },
      { name: "Procedencia", path: "/procedencia" },
      { name: "Tipos de Cliente", path: "/tipocliente" },
      { name: "Tipos de Contratación", path: "/tipocontratacion" },
      { name: "Empresas CLC", path: "/empresasclc"},
      { name: "MSP Referencia", path: "/mspref" }
    ]
  },
     
  {
    section: "CONFIG",
    name: "Importación/Exportación",
    icon: Upload,
    children: [
      { name: "Importar Ref MSP", path: "/msprefimport" },
      { name: "Importar Productos Ofertados", path: "/productosofertadosimport" }
    ]
  }
];