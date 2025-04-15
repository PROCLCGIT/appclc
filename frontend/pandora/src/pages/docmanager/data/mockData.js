// Datos de muestra para demostración
export const MOCK_DOCUMENTS = [
    { 
      id: 1, 
      title: "Manual Técnico Bomba XP-300", 
      description: "Especificaciones técnicas completas del modelo XP-300",
      file_type: "pdf", 
      file_size: 4200,
      category: { id: 1, name: "Manuales" },
      tags: [{ id: 1, name: "Bombas" }, { id: 3, name: "Técnico" }],
      is_favorite: true,
      created_at: "2025-04-10T15:32:20",
      updated_at: "2025-04-12T09:12:45",
      file_url: "#"
    },
    { 
      id: 2, 
      title: "Ficha Técnica Sistema Hidráulico A45", 
      description: "Características del sistema hidráulico para instalaciones industriales",
      file_type: "docx", 
      file_size: 1800,
      category: { id: 2, name: "Fichas Técnicas" },
      tags: [{ id: 2, name: "Hidráulica" }, { id: 4, name: "Industrial" }],
      is_favorite: false,
      created_at: "2025-04-08T11:23:15",
      updated_at: "2025-04-08T11:23:15",
      file_url: "#"
    },
    { 
      id: 3, 
      title: "Contrato Marco Servicios Técnicos", 
      description: "Plantilla estándar para contratos de servicios de mantenimiento",
      file_type: "pdf", 
      file_size: 3100,
      category: { id: 3, name: "Legal" },
      tags: [{ id: 8, name: "Legal" }, { id: 7, name: "Comercial" }],
      is_favorite: true,
      created_at: "2025-04-05T14:42:30",
      updated_at: "2025-04-07T16:15:11",
      file_url: "#"
    },
    { 
      id: 4, 
      title: "Certificación ISO 9001", 
      description: "Documento de certificación de calidad ISO 9001:2015",
      file_type: "pdf", 
      file_size: 2500,
      category: { id: 4, name: "Certificaciones" },
      tags: [{ id: 5, name: "ISO" }, { id: 6, name: "Calidad" }],
      is_favorite: false,
      created_at: "2025-04-01T09:30:00",
      updated_at: "2025-04-01T09:30:00",
      file_url: "#"
    },
    { 
      id: 5, 
      title: "Especificaciones Bombas Serie H", 
      description: "Detalle técnico de toda la serie H de bombas industriales",
      file_type: "xlsx", 
      file_size: 1200,
      category: { id: 2, name: "Fichas Técnicas" },
      tags: [{ id: 1, name: "Bombas" }, { id: 4, name: "Industrial" }],
      is_favorite: true,
      created_at: "2025-03-28T16:45:22",
      updated_at: "2025-04-05T11:32:40",
      file_url: "#"
    },
    { 
      id: 6, 
      title: "Propuesta Comercial Estándar", 
      description: "Plantilla para generación de propuestas comerciales",
      file_type: "docx", 
      file_size: 900,
      category: { id: 5, name: "Plantillas" },
      tags: [{ id: 7, name: "Comercial" }],
      is_favorite: false,
      created_at: "2025-03-15T10:22:45",
      updated_at: "2025-04-02T14:12:30",
      file_url: "#"
    }
  ];
  
  export const MOCK_CATEGORIES = [
    { id: 1, name: "Manuales", count: 8 },
    { id: 2, name: "Fichas Técnicas", count: 12 },
    { id: 3, name: "Legal", count: 5 },
    { id: 4, name: "Certificaciones", count: 3 },
    { id: 5, name: "Plantillas", count: 6 }
  ];