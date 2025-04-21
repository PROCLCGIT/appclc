/**
 * Hook centralizado para gestionar todas las operaciones de proformas con React Query
 * Este hook reemplaza múltiples hooks individuales para simplificar el data fetching
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { ProformaService } from '@/services/classes/ProformaService';
import { toast } from 'sonner';
import { createEmptyProforma } from '@/pages/proformas/utils/proformaUtils';

// Servicio de proformas (singleton)
const proformaService = new ProformaService();

// Keys para consultas de React Query
export const proformaQueryKeys = {
  all: ['proformas'],
  lists: () => [...proformaQueryKeys.all, 'list'],
  list: (filters) => [...proformaQueryKeys.lists(), filters],
  details: () => [...proformaQueryKeys.all, 'detail'],
  detail: (id) => [...proformaQueryKeys.details(), id],
  dashboard: (dateRange) => [...proformaQueryKeys.all, 'dashboard', dateRange],
  items: (proformaId) => [...proformaQueryKeys.detail(proformaId), 'items'],
  historial: (proformaId) => [...proformaQueryKeys.detail(proformaId), 'historial'],
  config: () => [...proformaQueryKeys.all, 'config'],
  products: (searchParams) => ['products', 'search', searchParams],
  clients: (searchParams) => ['clients', 'search', searchParams],
};

/**
 * Hook principal para gestionar proformas con React Query
 */
export function useProformaQuery(options = {}) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState(null);
  const [activeProforma, setActiveProforma] = useState(() => createEmptyProforma());
  const [openProformas, setOpenProformas] = useState(() => []);
  const [previewMode, setPreviewMode] = useState(false);

  // Opciones configurables
  const {
    initialId = null,
    showToasts = true,
    filters = {},
    staleTime = 1000 * 60 * 5, // 5 minutos
  } = options;

  // ===== CONSULTAS =====

  // Consulta de lista de proformas
  const proformasQuery = useQuery({
    queryKey: proformaQueryKeys.list(filters),
    queryFn: () => proformaService.getAll(filters),
    staleTime,
  });

  // Consulta de configuración
  const configQuery = useQuery({
    queryKey: proformaQueryKeys.config(),
    queryFn: () => proformaService.getConfiguration(),
    staleTime: 1000 * 60 * 30, // 30 minutos (cambia menos)
  });

  // Consulta de detalle de proforma activa (condicional)
  const detailQuery = useQuery({
    queryKey: proformaQueryKeys.detail(activeId),
    queryFn: () => proformaService.getById(activeId),
    enabled: !!activeId && activeId > 0, // Solo ejecutar si hay un ID activo válido
    staleTime,
    onSuccess: (data) => {
      if (data) {
        // Transformar datos de API a formato interno
        const transformed = transformApiToInternal(data);
        setActiveProforma(transformed);
        
        // Actualizar la lista de proformas abiertas
        setOpenProformas(prev => {
          const exists = prev.some(p => p.id === data.id);
          if (!exists) {
            return [...prev, transformed];
          }
          return prev.map(p => p.id === data.id ? transformed : p);
        });
      }
    },
  });

  // ===== MUTACIONES =====

  // Crear proforma
  const createMutation = useMutation({
    mutationFn: (data) => proformaService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(proformaQueryKeys.lists());
      if (showToasts) toast.success('Proforma creada con éxito');
      return data;
    },
    onError: (error) => {
      if (showToasts) toast.error('Error al crear la proforma');
      console.error('Error creating proforma:', error);
      throw error;
    },
  });

  // Actualizar proforma
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => proformaService.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidar consultas afectadas
      queryClient.invalidateQueries(proformaQueryKeys.detail(variables.id));
      queryClient.invalidateQueries(proformaQueryKeys.lists());
      
      if (showToasts) toast.success('Proforma actualizada con éxito');
      return data;
    },
    onError: (error) => {
      if (showToasts) toast.error('Error al actualizar la proforma');
      console.error('Error updating proforma:', error);
      throw error;
    },
  });

  // Cambiar estado de proforma
  const changeStateMutation = useMutation({
    mutationFn: ({ id, estado, notas }) => {
      return proformaService.executeAction(id, 'cambiar_estado', { estado, notas });
    },
    onSuccess: (data, variables) => {
      // Invalidar consultas afectadas
      queryClient.invalidateQueries(proformaQueryKeys.detail(variables.id));
      queryClient.invalidateQueries(proformaQueryKeys.lists());
      
      // Mensaje personalizado según el estado
      const estados = {
        'aprobada': 'aprobada',
        'enviada': 'enviada',
        'rechazada': 'rechazada',
        'borrador': 'guardada como borrador',
        'vencida': 'marcada como vencida',
        'convertida': 'convertida',
      };
      
      if (showToasts) {
        toast.success(`Proforma ${estados[variables.estado] || 'actualizada'} con éxito`);
      }
      
      return data;
    },
    onError: (error) => {
      if (showToasts) toast.error('Error al cambiar el estado de la proforma');
      console.error('Error changing proforma state:', error);
      throw error;
    },
  });

  // Duplicar proforma
  const duplicateMutation = useMutation({
    mutationFn: (id) => proformaService.executeAction(id, 'duplicar'),
    onSuccess: (data) => {
      // Invalidar consultas de lista
      queryClient.invalidateQueries(proformaQueryKeys.lists());
      
      if (showToasts) toast.success('Proforma duplicada con éxito');
      return data;
    },
    onError: (error) => {
      if (showToasts) toast.error('Error al duplicar la proforma');
      console.error('Error duplicating proforma:', error);
      throw error;
    },
  });

  // Actualizar configuración
  const updateConfigMutation = useMutation({
    mutationFn: (configData) => proformaService.updateConfiguration(configData),
    onSuccess: (data) => {
      // Invalidar consulta de configuración
      queryClient.invalidateQueries(proformaQueryKeys.config());
      
      if (showToasts) toast.success('Configuración actualizada con éxito');
      return data;
    },
    onError: (error) => {
      if (showToasts) toast.error('Error al actualizar la configuración');
      console.error('Error updating configuration:', error);
      throw error;
    },
  });

  // ===== FUNCIONES DE UTILIDAD =====

  /**
   * Transforma datos de la API al formato interno
   */
  const transformApiToInternal = useCallback((apiData) => {
    if (!apiData) return null;
    
    // Extraer datos de cliente
    let client = null;
    if (apiData.cliente_detail) {
      client = {
        id: apiData.cliente_detail.id,
        name: apiData.cliente_detail.nombre || "",
        attention: apiData.atencion_a || "",
        email: apiData.cliente_detail.email || "",
        phone: apiData.cliente_detail.telefono || "",
        address: apiData.cliente_detail.direccion || "",
        ruc: apiData.cliente_detail.ruc || ""
      };
    } else if (apiData.cliente && typeof apiData.cliente === 'object') {
      client = {
        id: apiData.cliente.id,
        name: apiData.cliente.nombre || "",
        attention: apiData.atencion_a || "",
        email: apiData.cliente.email || "",
        phone: apiData.cliente.telefono || "",
        address: apiData.cliente.direccion || "",
        ruc: apiData.cliente.ruc || ""
      };
    }
    
    // Formatear los ítems
    const items = Array.isArray(apiData.items) ? apiData.items.map(item => {
      return {
        id: item.id || Date.now() + Math.random(),
        savedId: item.id,
        code: item.codigo || "",
        description: item.descripcion || "Item sin descripción",
        unit: item.unidad || "Unidad",
        quantity: parseFloat(item.cantidad) || 0,
        unitPrice: parseFloat(item.precio_unitario) || 0,
        discount: parseFloat(item.porcentaje_descuento) || 0,
        total: parseFloat(item.total) || 0,
        source: item.tipo_item || 'personalizado',
        productId: item.producto_ofertado?.id || item.producto_disponible?.id || null,
        original: item.producto_ofertado || item.producto_disponible || null
      };
    }) : [];
    
    // Formatear la proforma completa
    return {
      id: apiData.id,
      savedId: apiData.id,
      quote: {
        number: apiData.numero || `PRO-${new Date().getFullYear()}-XXXX`,
        name: apiData.nombre || "",
        date: new Date(apiData.fecha_emision || Date.now()),
        expiryDate: new Date(apiData.fecha_vencimiento || (Date.now() + 30*24*60*60*1000)),
        paymentTerms: apiData.condiciones_pago || "50% anticipo, 50% contra entrega",
        deliveryTime: apiData.tiempo_entrega || "5 días hábiles",
        subtotal: typeof apiData.subtotal === 'number' ? apiData.subtotal.toString() : apiData.subtotal || "0",
        tax: typeof apiData.impuesto === 'number' ? apiData.impuesto.toString() : apiData.impuesto || "0",
        total: typeof apiData.total === 'number' ? apiData.total.toString() : apiData.total || "0",
        taxRate: apiData.porcentaje_impuesto || 12,
        notes: apiData.notes || apiData.notas || ""
      },
      client,
      items,
      estado: apiData.estado || 'borrador',
      metadata: {
        createdAt: apiData.created_at,
        updatedAt: apiData.updated_at,
        createdBy: apiData.created_by_name || apiData.created_by?.username || null,
      }
    };
  }, []);

  /**
   * Transforma formato interno al formato de API
   */
  const transformInternalToApi = useCallback((internalData) => {
    if (!internalData) return null;
    
    const { quote, client, items } = internalData;
    
    // Crear objeto base para API
    const apiData = {
      numero: quote?.number,
      nombre: quote?.name,
      fecha_emision: quote?.date instanceof Date ? quote.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      fecha_vencimiento: quote?.expiryDate instanceof Date ? quote.expiryDate.toISOString().split('T')[0] : new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0],
      condiciones_pago: quote?.paymentTerms || "50% anticipo, 50% contra entrega",
      tiempo_entrega: quote?.deliveryTime || "5 días hábiles",
      porcentaje_impuesto: parseFloat(quote?.taxRate) || 12,
      notas: quote?.notes || "",
      
      // Datos del cliente
      cliente: client?.id || null,
      atencion_a: client?.attention || "",
      
      // Montos (opcionales, se calculan en backend)
      subtotal: parseFloat(quote?.subtotal) || 0,
      impuesto: parseFloat(quote?.tax) || 0,
      total: parseFloat(quote?.total) || 0,
    };
    
    // Si hay savedId, incluirlo para actualizaciones
    if (internalData.savedId) {
      apiData.id = internalData.savedId;
    }
    
    // Preparar items si se necesitan enviar
    if (Array.isArray(items) && items.length > 0) {
      apiData.items = items.map(item => ({
        id: item.savedId, // Solo incluir ID si existe (para actualizaciones)
        codigo: item.code || '',
        descripcion: item.description || '',
        unidad: item.unit || 'Unidad',
        cantidad: parseFloat(item.quantity) || 0,
        precio_unitario: parseFloat(item.unitPrice) || 0,
        porcentaje_descuento: parseFloat(item.discount) || 0,
        total: parseFloat(item.total) || 0,
        tipo_item: item.source || 'personalizado',
        producto_ofertado: item.source === 'ofertado' ? item.productId : null,
        producto_disponible: item.source === 'disponible' ? item.productId : null,
      }));
    }
    
    return apiData;
  }, []);

  /**
   * Carga una proforma específica por ID
   */
  const loadProforma = useCallback(async (id, options = {}) => {
    if (!id) return null;
    
    const { showToast = showToasts, forceRefresh = false } = options;
    
    try {
      if (showToast) toast.loading(`Cargando proforma #${id}...`);
      
      if (forceRefresh) {
        await queryClient.invalidateQueries(proformaQueryKeys.detail(id));
      }
      
      // Buscar en caché primero si no es forceRefresh
      let data;
      if (!forceRefresh) {
        data = queryClient.getQueryData(proformaQueryKeys.detail(id));
      }
      
      // Si no está en caché o es forceRefresh, hacer la consulta
      if (!data) {
        data = await queryClient.fetchQuery({
          queryKey: proformaQueryKeys.detail(id),
          queryFn: () => proformaService.getById(id),
          staleTime: forceRefresh ? 0 : staleTime,
        });
      }
      
      if (!data) {
        if (showToast) toast.error('No se pudo cargar la proforma');
        return null;
      }
      
      const transformedData = transformApiToInternal(data);
      setActiveId(data.id);
      setActiveProforma(transformedData);
      
      // Actualizar lista de proformas abiertas
      setOpenProformas(prev => {
        const index = prev.findIndex(p => p.id === data.id);
        if (index === -1) {
          return [...prev, transformedData];
        } else {
          const updated = [...prev];
          updated[index] = transformedData;
          return updated;
        }
      });
      
      if (showToast) toast.success('Proforma cargada con éxito');
      return transformedData;
    } catch (error) {
      console.error('Error loading proforma:', error);
      if (showToast) toast.error('Error al cargar la proforma');
      return null;
    }
  }, [queryClient, staleTime, showToasts, transformApiToInternal]);

  /**
   * Crea una nueva proforma
   */
  const createNewProforma = useCallback(() => {
    const newProforma = createEmptyProforma();
    setActiveProforma(newProforma);
    setActiveId(null); // No tiene ID de backend aún
    
    // Añadir a proformas abiertas
    setOpenProformas(prev => [...prev, newProforma]);
    
    return newProforma;
  }, []);

  /**
   * Cierra una proforma abierta
   */
  const closeProforma = useCallback((id) => {
    setOpenProformas(prev => {
      const filtered = prev.filter(p => p.id !== id);
      
      // Si cerramos la proforma activa, activar la primera disponible
      if (id === activeId || activeProforma.id === id) {
        if (filtered.length > 0) {
          setActiveId(filtered[0].savedId || null);
          setActiveProforma(filtered[0]);
        } else {
          // Si no quedan proformas, crear una nueva
          const newProforma = createEmptyProforma();
          setActiveId(null);
          setActiveProforma(newProforma);
          return [newProforma];
        }
      }
      
      return filtered;
    });
  }, [activeId, activeProforma]);

  /**
   * Guarda la proforma activa
   */
  const saveActiveProforma = useCallback(async (options = {}) => {
    const { showToast = showToasts } = options;
    
    if (!activeProforma) {
      if (showToast) toast.error('No hay proforma activa para guardar');
      return null;
    }
    
    try {
      const apiData = transformInternalToApi(activeProforma);
      let result;
      
      if (activeProforma.savedId) {
        // Actualizar existente
        result = await updateMutation.mutateAsync({
          id: activeProforma.savedId,
          data: apiData
        });
      } else {
        // Crear nueva
        result = await createMutation.mutateAsync(apiData);
      }
      
      // Actualizar estado local con el resultado
      if (result) {
        const transformed = transformApiToInternal(result);
        setActiveId(result.id);
        setActiveProforma(transformed);
        
        // Actualizar en la lista de proformas abiertas
        setOpenProformas(prev => {
          return prev.map(p => 
            p.id === activeProforma.id ? transformed : p
          );
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error saving proforma:', error);
      if (showToast) toast.error('Error al guardar la proforma');
      return null;
    }
  }, [activeProforma, createMutation, showToasts, transformInternalToApi, updateMutation]);

  /**
   * Actualiza parcialmente la proforma activa
   */
  const updateActiveProforma = useCallback((updates) => {
    if (!activeProforma) return null;
    
    const updated = { ...activeProforma, ...updates };
    setActiveProforma(updated);
    
    // Actualizar en la lista de proformas abiertas
    setOpenProformas(prev => {
      return prev.map(p => 
        p.id === activeProforma.id ? updated : p
      );
    });
    
    return updated;
  }, [activeProforma]);

  /**
   * Cambia la proforma activa
   */
  const setActive = useCallback((proformaId) => {
    if (!proformaId) return false;
    
    // Buscar en proformas abiertas
    const proforma = openProformas.find(p => p.id === proformaId);
    if (proforma) {
      setActiveId(proforma.savedId || null);
      setActiveProforma(proforma);
      return true;
    }
    
    // Si no está abierta, intentar cargarla si tiene savedId
    if (typeof proformaId === 'number') {
      loadProforma(proformaId);
      return true;
    }
    
    return false;
  }, [loadProforma, openProformas]);

  // Calcular estado general
  const isLoading = proformasQuery.isLoading || configQuery.isLoading || detailQuery.isLoading;
  const isError = proformasQuery.isError || configQuery.isError || detailQuery.isError;
  const isSaving = createMutation.isPending || updateMutation.isPending || changeStateMutation.isPending;

  // Retornar objeto con todos los datos y funciones
  return {
    // Estado general
    isLoading,
    isError,
    isSaving,
    error: proformasQuery.error || configQuery.error || detailQuery.error,
    
    // Datos
    proformas: proformasQuery.data || [],
    config: configQuery.data || {},
    openProformas,
    activeProforma,
    activeId,
    previewMode,
    
    // Controladores de estado
    setActiveProforma: setActive,
    setPreviewMode,
    
    // Operaciones CRUD
    loadProforma,
    createNewProforma,
    closeProforma,
    saveProforma: saveActiveProforma,
    updateProforma: updateActiveProforma,
    changeProformaState: changeStateMutation.mutateAsync,
    duplicateProforma: duplicateMutation.mutateAsync,
    updateConfig: updateConfigMutation.mutateAsync,
    
    // Utilidades
    transformApiToInternal,
    transformInternalToApi,
    
    // Acceso directo a consultas y mutaciones si se necesita
    queries: {
      proformasQuery,
      configQuery,
      detailQuery,
    },
    mutations: {
      createMutation,
      updateMutation,
      changeStateMutation,
      duplicateMutation,
      updateConfigMutation,
    },
  };
}

/**
 * Hook específico para búsqueda de productos
 */
export function useProductSearchQuery(options = {}) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSource, setSearchSource] = useState('all');
  const [viewType, setViewType] = useState('grid');
  
  const {
    debounceMs = 300,
    minTermLength = 2,
    enabled = true,
    staleTime = 1000 * 60, // 1 minuto
  } = options;
  
  // Búsqueda con debounce usando useQuery
  const searchQuery = useQuery({
    queryKey: proformaQueryKeys.products({ term: searchTerm, source: searchSource }),
    queryFn: () => proformaService.searchProducts(searchTerm, searchSource),
    enabled: enabled && searchTerm.length >= minTermLength,
    staleTime,
  });
  
  // Función para búsqueda explícita
  const searchProducts = useCallback(async (term, source = searchSource) => {
    if (!term || term.length < minTermLength) {
      return [];
    }
    
    setSearchTerm(term);
    if (source !== searchSource) setSearchSource(source);
    
    try {
      return await queryClient.fetchQuery({
        queryKey: proformaQueryKeys.products({ term, source }),
        queryFn: () => proformaService.searchProducts(term, source),
        staleTime,
      });
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Error al buscar productos');
      return [];
    }
  }, [minTermLength, queryClient, searchSource, staleTime]);
  
  // Cargar productos iniciales
  const loadInitialProducts = useCallback(async () => {
    try {
      const results = await proformaService.searchProducts('', 'destacados');
      return results || [];
    } catch (error) {
      console.error('Error loading initial products:', error);
      return [];
    }
  }, []);
  
  return {
    // Estado
    searchTerm,
    setSearchTerm,
    searchSource,
    setSearchSource,
    viewType,
    setViewType,
    
    // Resultados y estado
    searchResults: searchQuery.data || [],
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    error: searchQuery.error,
    
    // Funciones
    searchProducts,
    loadInitialProducts,
    
    // Acceso directo a la consulta
    searchQuery,
  };
}

/**
 * Hook específico para búsqueda de clientes
 */
export function useClientSearchQuery(options = {}) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    debounceMs = 300,
    minTermLength = 2,
    enabled = true,
    staleTime = 1000 * 60, // 1 minuto
  } = options;
  
  // Búsqueda con debounce usando useQuery
  const searchQuery = useQuery({
    queryKey: proformaQueryKeys.clients({ term: searchTerm }),
    queryFn: () => proformaService.searchClientes(searchTerm),
    enabled: enabled && searchTerm.length >= minTermLength,
    staleTime,
  });
  
  // Función para búsqueda explícita
  const searchClientes = useCallback(async (term) => {
    if (!term || term.length < minTermLength) {
      return [];
    }
    
    setSearchTerm(term);
    
    try {
      return await queryClient.fetchQuery({
        queryKey: proformaQueryKeys.clients({ term }),
        queryFn: () => proformaService.searchClientes(term),
        staleTime,
      });
    } catch (error) {
      console.error('Error searching clients:', error);
      toast.error('Error al buscar clientes');
      return [];
    }
  }, [minTermLength, queryClient, staleTime]);
  
  // Cargar clientes iniciales
  const loadClientes = useCallback(async () => {
    try {
      const results = await proformaService.searchClientes('');
      return results || [];
    } catch (error) {
      console.error('Error loading initial clients:', error);
      return [];
    }
  }, []);
  
  return {
    // Estado
    searchTerm,
    setSearchTerm,
    
    // Resultados y estado
    clientes: searchQuery.data || [],
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    error: searchQuery.error,
    
    // Funciones
    searchClientes,
    loadClientes,
    
    // Acceso directo a la consulta
    searchQuery,
  };
}