import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/config/axios';
import {
  zonasService,
  ciudadesService,
  tipoClienteService,
  clientesService,
  BaseService,
} from '@/services/api';
import './ClienteForm.css';

// Utilidad para verificar estado de autenticación
const verificarAutenticacion = (navigate) => {
  const token = localStorage.getItem('auth-token');
  if (!token) {
    console.error('No hay token de autenticación disponible');
    toast.error('No estás autenticado. Inicia sesión para continuar.');
    navigate('/login');
    return false;
  }
  
  // Asegurar que el token está configurado en axios
  if (!api.defaults.headers.common['Authorization']) {
    console.log('Configurando token de autenticación en axios');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  return true;
};

// Utilidad para reautenticar forzadamente (regenera la sesión)
const reautenticar = async (username, password) => {
  try {
    console.log('Intentando reautenticación forzada...');
    
    // Obtener un nuevo token directamente del API
    const loginData = {
      username: username,
      password: password
    };
    
    const response = await api.post('auth/token/', loginData);
    
    if (response.data && response.data.access) {
      console.log('Reautenticación exitosa, actualizando token');
      
      // Guardar el nuevo token
      const { access, refresh } = response.data;
      localStorage.setItem('auth-token', access);
      localStorage.setItem('refresh-token', refresh);
      localStorage.setItem('last-auth-prompt', Date.now().toString());
      
      // Actualizar headers para todas las solicitudes
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error en reautenticación forzada:', error);
    return false;
  }
};

function AddClientePage() {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    zona: '',
    ciudad: '',
    tipo_cliente: '',
    nombre: '',
    alias: '',
    razon_social: '',
    ruc: '',
    email: '',
    telefono: '',
    direccion: '',
    activo: true,
  });

  // Estados para las opciones de los selects
  const [zonas, setZonas] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [tiposCliente, setTiposCliente] = useState([]);

  // Estados de carga y errores
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [errors, setErrors] = useState({});
  
  // Estados para modales de agregar zona/ciudad
  const [showAddZonaModal, setShowAddZonaModal] = useState(false);
  const [showAddCiudadModal, setShowAddCiudadModal] = useState(false);
  const [newZona, setNewZona] = useState('');
  const [newCiudad, setNewCiudad] = useState('');
  const [addingZona, setAddingZona] = useState(false);
  const [addingCiudad, setAddingCiudad] = useState(false);

  const navigate = useNavigate();

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    verificarAutenticacion(navigate);
  }, [navigate]);
  
  // Cargar las opciones de los selects al montar el componente
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        
        // Verificar autenticación primero - reutiliza nuestra utilidad
        if (!verificarAutenticacion(navigate)) {
          return;
        }
        
        // Diagnóstico del estado de autenticación
        console.group('Estado de autenticación');
        console.log('Token: ', localStorage.getItem('auth-token') ? 'Disponible' : 'No disponible');
        console.log('Authorization header: ', api.defaults.headers.common['Authorization'] ? 'Configurado' : 'No configurado');
        console.log('Base URL: ', api.defaults.baseURL);
        console.groupEnd();
        
        // Intentar cargar todas las opciones
        console.log('AddClientePage: Cargando opciones de selects...');
        
        // Cargar zonas con reintento
        let zonasRes, ciudadesRes, tiposClienteRes;
        try {
          console.log('Cargando zonas...');
          zonasRes = await zonasService.getAll();
          console.log('Zonas cargadas con éxito:', zonasRes);
        } catch (zonasError) {
          console.error('Error al cargar zonas:', zonasError);
          toast.error('No se pudieron cargar las zonas. Verifique su conexión.');
          return;
        }
        
        // Cargar ciudades con reintento
        try {
          console.log('Cargando ciudades...');
          ciudadesRes = await ciudadesService.getAll();
          console.log('Ciudades cargadas con éxito:', ciudadesRes);
        } catch (ciudadesError) {
          console.error('Error al cargar ciudades:', ciudadesError);
          toast.error('No se pudieron cargar las ciudades. Verifique su conexión.');
          return;
        }
        
        // Cargar tipos de cliente con reintento
        try {
          console.log('Cargando tipos de cliente...');
          tiposClienteRes = await tipoClienteService.getAll();
          console.log('Tipos de cliente cargados con éxito:', tiposClienteRes);
        } catch (tiposError) {
          console.error('Error al cargar tipos de cliente:', tiposError);
          toast.error('No se pudieron cargar los tipos de cliente. Verifique su conexión.');
          return;
        }
        
        // Actualizar estados con los datos cargados
        setZonas(zonasRes.results || []);
        setCiudades(ciudadesRes.results || []);
        setTiposCliente(tiposClienteRes.results || []);
        
        // Logging detallado
        console.log('Datos de formularios cargados exitosamente:', {
          zonas: zonasRes.results?.length || 0,
          ciudades: ciudadesRes.results?.length || 0,
          tiposCliente: tiposClienteRes.results?.length || 0
        });
      } catch (error) {
        console.error('Error general al cargar opciones:', error);
        
        // Mensaje específico según el tipo de error
        if (error.response?.status === 401) {
          toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
          navigate('/login');
        } else if (error.message?.includes('Network')) {
          toast.error('Error de conexión. Verifica tu conexión a internet.');
        } else {
          toast.error('Error al cargar datos. Por favor, recarga la página.');
        }
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Actualizar las ciudades al cambiar la zona
  useEffect(() => {
    if (formData.zona) {
      setLoadingOptions(true);
      ciudadesService
        .getAll({ zona: formData.zona })
        .then((res) => {
          setCiudades(res.results || []);
          console.log('Ciudades filtradas por zona:', res);
        })
        .catch((error) => {
          console.error('Error al cargar ciudades:', error);
        })
        .finally(() => {
          setLoadingOptions(false);
        });
    }
  }, [formData.zona]);

  // Manejar los cambios en los inputs con validación mejorada
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Detectar si se seleccionó "Agregar nuevo"
    if (name === 'zona' && value === 'add_new') {
      setShowAddZonaModal(true);
      return;
    }
    
    if (name === 'ciudad' && value === 'add_new') {
      setShowAddCiudadModal(true);
      return;
    }
    
    // Log del cambio para depuración
    console.log(`Campo ${name} cambiado:`, {
      tipo: type,
      valorAnterior: formData[name],
      valorNuevo: type === 'checkbox' ? checked : value
    });
    
    // Validación para campos select (IDs)
    if (['zona', 'ciudad', 'tipo_cliente'].includes(name)) {
      const newValue = value.trim();
      
      // Si es un valor vacío, simplemente actualizar
      if (!newValue) {
        // Si es un cambio de zona, resetear también la ciudad
        if (name === 'zona') {
          setFormData((prev) => ({
            ...prev,
            [name]: '',
            ciudad: '' // resetear la ciudad cuando cambia la zona
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: ''
          }));
        }
        return;
      }
      
      // Validar que es un número válido antes de actualizar
      const numericValue = parseInt(newValue, 10);
      if (isNaN(numericValue)) {
        console.warn(`Valor no numérico para campo ${name}:`, value);
        toast.error(`Valor inválido para ${name}`);
        return;
      }
      
      // Guardar como string para mantener compatibilidad con elementos select
      if (name === 'zona') {
        setFormData((prev) => ({
          ...prev,
          [name]: String(newValue),
          ciudad: '' // resetear la ciudad cuando cambia la zona
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: String(newValue)
        }));
      }
    } else {
      // Para otros campos, actualizar normalmente
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
    
    // Limpiar error si existía
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validar el formulario con comprobación de tipo
  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos de IDs (zona, ciudad, tipo_cliente)
    // Zona
    if (!formData.zona) {
      newErrors.zona = 'La zona es requerida';
    } else {
      // Verificar que sea convertible a número
      try {
        const zonaId = parseInt(formData.zona, 10);
        if (isNaN(zonaId)) {
          newErrors.zona = 'La zona seleccionada no es válida (ID no numérico)';
        }
      } catch (error) {
        newErrors.zona = 'Error al validar zona: ' + error.message;
      }
    }
    
    // Ciudad
    if (!formData.ciudad) {
      newErrors.ciudad = 'La ciudad es requerida';
    } else {
      // Verificar que sea convertible a número
      try {
        const ciudadId = parseInt(formData.ciudad, 10);
        if (isNaN(ciudadId)) {
          newErrors.ciudad = 'La ciudad seleccionada no es válida (ID no numérico)';
        }
      } catch (error) {
        newErrors.ciudad = 'Error al validar ciudad: ' + error.message;
      }
    }
    
    // Tipo Cliente
    if (!formData.tipo_cliente) {
      newErrors.tipo_cliente = 'El tipo de cliente es requerido';
    } else {
      // Verificar que sea convertible a número
      try {
        const tipoClienteId = parseInt(formData.tipo_cliente, 10);
        if (isNaN(tipoClienteId)) {
          newErrors.tipo_cliente = 'El tipo de cliente seleccionado no es válido (ID no numérico)';
        }
      } catch (error) {
        newErrors.tipo_cliente = 'Error al validar tipo de cliente: ' + error.message;
      }
    }

    if (!formData.nombre) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length > 80) {
      newErrors.nombre = 'El nombre no puede exceder los 80 caracteres';
    }

    if (!formData.alias) {
      newErrors.alias = 'El alias es requerido';
    } else if (formData.alias.length > 30) {
      newErrors.alias = 'El alias no puede exceder los 30 caracteres';
    }

    if (!formData.razon_social) {
      newErrors.razon_social = 'La razón social es requerida';
    } else if (formData.razon_social.length > 255) {
      newErrors.razon_social = 'La razón social no puede exceder los 255 caracteres';
    }

    if (!formData.ruc) {
      newErrors.ruc = 'El RUC es requerido';
    } else if (formData.ruc.length !== 13) {
      newErrors.ruc = 'El RUC debe tener 13 caracteres';
    } else if (!/^\d+$/.test(formData.ruc)) {
      newErrors.ruc = 'El RUC debe contener solo números';
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    } else if (formData.email.length > 50) {
      newErrors.email = 'El email no puede exceder los 50 caracteres';
    }

    if (formData.telefono && formData.telefono.length > 20) {
      newErrors.telefono = 'El teléfono no puede exceder los 20 caracteres';
    }

    if (!formData.direccion) {
      newErrors.direccion = 'La dirección es requerida';
    } else if (formData.direccion.length > 100) {
      newErrors.direccion = 'La dirección no puede exceder los 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar el envío del formulario - implementación simplificada y robusta
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Iniciando proceso de guardar cliente...');

    // Validación del formulario
    if (!validateForm()) {
      console.error('Formulario inválido, validación fallida');
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }

    // Verificar autenticación antes de continuar - reutiliza nuestra utilidad
    if (!verificarAutenticacion(navigate)) {
      return;
    }

    // Diagnóstico completo de la autenticación
    console.group('Diagnóstico de autenticación pre-envío');
    const authToken = localStorage.getItem('auth-token');
    console.log('Token existente:', authToken ? `${authToken.substring(0, 15)}...` : 'No disponible');
    console.log('Authorization header en axios:', api.defaults.headers.common['Authorization'] ? 'Configurado' : 'No configurado');
    console.log('baseURL en axios:', api.defaults.baseURL);
    console.groupEnd();

    // Iniciar proceso de guardado
    setLoading(true);
    console.log('Cliente en proceso de guardado...');
    try {
      // Verificar que los campos requeridos no estén vacíos
      const requiredFields = ['nombre', 'ruc', 'email', 'zona', 'ciudad', 'tipo_cliente', 'razon_social', 'direccion'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        const errorMsg = `Campos requeridos faltantes: ${missingFields.join(', ')}`;
        console.error(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      // Validar explícitamente cada campo ID para asegurar conversión a números enteros
      const zonaId = parseInt(formData.zona, 10);
      const ciudadId = parseInt(formData.ciudad, 10);
      const tipoClienteId = parseInt(formData.tipo_cliente, 10);
      
      // Verificar que las conversiones fueron exitosas
      if (isNaN(zonaId) || isNaN(ciudadId) || isNaN(tipoClienteId)) {
        const errorMsg = "Error: Uno o más IDs no pudieron convertirse a números";
        console.error(errorMsg, {
          zona: formData.zona, 
          ciudadRaw: formData.ciudad,
          tipoClienteRaw: formData.tipo_cliente,
          resultados: { zonaId, ciudadId, tipoClienteId }
        });
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      // Verificar que el nombre y alias no existan ya - esto evita errores 500
      try {
        console.log('Verificando si ya existe un cliente con este nombre o alias...');
        // Crear una instancia específica para búsqueda con múltiples intentos
        const clientesSearchService = new BaseService('core/clientes/');
        const alternativeSearchService = new BaseService('pandora/clientes/');
        
        let searchResults = [];
        
        try {
          console.log('Intentando búsqueda en endpoint primario core/clientes/...');
          const response = await clientesSearchService.search(formData.nombre);
          // La respuesta puede ser un objeto con results o un array directamente
          searchResults = response.results || response;
          console.log('Búsqueda exitosa en endpoint primario:', searchResults);
        } catch (primaryError) {
          console.error('Error en búsqueda primaria:', primaryError);
          
          // Intentar endpoint alternativo
          console.log('Intentando búsqueda en endpoint alternativo pandora/clientes/...');
          try {
            const alternativeResponse = await alternativeSearchService.search(formData.nombre);
            searchResults = alternativeResponse.results || alternativeResponse;
            console.log('Búsqueda exitosa en endpoint alternativo:', searchResults);
          } catch (secondaryError) {
            console.error('Error también en búsqueda alternativa:', secondaryError);
            // Continuamos con un array vacío
            searchResults = [];
          }
        }
        
        // Verificar si ya existe un cliente con el mismo nombre
        const existingByName = searchResults.find(
          cliente => cliente.nombre && cliente.nombre.toLowerCase() === formData.nombre.toLowerCase()
        );
        
        if (existingByName) {
          setErrors(prev => ({ ...prev, nombre: 'Ya existe un cliente con este nombre' }));
          toast.error('No se puede crear el cliente: Ya existe un cliente con este nombre');
          setLoading(false);
          return;
        }
        
        // Verificar si ya existe un cliente con el mismo alias
        const existingByAlias = searchResults.find(
          cliente => cliente.alias && cliente.alias.toLowerCase() === formData.alias.toLowerCase()
        );
        
        if (existingByAlias) {
          setErrors(prev => ({ ...prev, alias: 'Ya existe un cliente con este alias' }));
          toast.error('No se puede crear el cliente: Ya existe un cliente con este alias');
          setLoading(false);
          return;
        }
        
        // Verificar si ya existe un cliente con el mismo RUC
        const existingByRuc = searchResults.find(
          cliente => cliente.ruc === formData.ruc
        );
        
        if (existingByRuc) {
          setErrors(prev => ({ ...prev, ruc: 'Ya existe un cliente con este RUC' }));
          toast.error('No se puede crear el cliente: Ya existe un cliente con este RUC');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.warn('No se pudo verificar la duplicación de clientes:', error);
        // Continuamos de todos modos, ya que el servidor también validará
      }
      
      // Crear una copia de los datos para formatear correctamente
      // Asegurar que todos los campos estén limpios y en el formato correcto
      const formattedData = {
        // Usar los IDs ya validados y asegurar que son números
        zona: zonaId,
        ciudad: ciudadId,
        tipo_cliente: tipoClienteId,
        // Asegurar que los strings estén limpios
        nombre: String(formData.nombre || '').trim(),
        alias: String(formData.alias || '').trim(),
        razon_social: String(formData.razon_social || '').trim(),
        ruc: String(formData.ruc || '').trim(),
        email: String(formData.email || '').trim(),
        direccion: String(formData.direccion || '').trim(),
        // Campos opcional - enviar cadena vacía en lugar de null
        telefono: formData.telefono ? String(formData.telefono).trim() : '',
        nota: formData.nota ? String(formData.nota).trim() : '',
        // Asegurar que el estado activo sea booleano
        activo: Boolean(formData.activo)
      };
      
      console.log('Datos de cliente completos y validados:', formattedData);
      
      // Log detallado para depuración
      console.log('Verificación de tipos y valores:', {
        zona: { tipo: typeof formattedData.zona, valor: formattedData.zona },
        ciudad: { tipo: typeof formattedData.ciudad, valor: formattedData.ciudad },
        tipo_cliente: { tipo: typeof formattedData.tipo_cliente, valor: formattedData.tipo_cliente },
        activo: { tipo: typeof formattedData.activo, valor: formattedData.activo }
      });
      
      try {
        // Verificar token una vez más
        const token = localStorage.getItem('auth-token');
        if (!token) {
          console.error('No hay token de autenticación disponible para crear cliente');
          toast.error('No estás autenticado. Inicia sesión para continuar.');
          navigate('/login');
          setLoading(false);
          return;
        }
        
        // IMPLEMENTACIÓN DIRECTA: Enviar directamente al servidor con axios
        console.log('Intentando crear cliente con implementación directa...');
        
        // Intentar múltiples endpoints con implementación directa
        // Variantes de formato y configuración
        const directEndpoints = [
          // NUEVA RUTA DIRECTA ESPECIALIZADA
          { url: 'api/core/clientes-create/', useApi: true },
          { url: 'api/pandora/clientes-create/', useApi: true },
          { url: 'http://localhost:8000/api/core/clientes-create/', useApi: false },
          { url: 'http://localhost:8000/api/pandora/clientes-create/', useApi: false },
          
          // 1. URLs absolutas (independientes de axios y configuración de proxy)
          { url: 'http://localhost:8000/api/core/clientes/', useApi: false },
          { url: 'http://localhost:8000/api/pandora/clientes/', useApi: false },
          { url: 'http://localhost:8000/api/clientes/', useApi: false },
          
          // 2. URLs con api prefix (para usar con el proxy configurado)
          { url: 'api/core/clientes/', useApi: true },
          { url: 'api/pandora/clientes/', useApi: true },
          { url: 'api/clientes/', useApi: true },
          
          // 3. URLs sin el prefijo /api (en caso que el proxy no esté funcionando correctamente)
          { url: 'core/clientes/', useApi: true },
          { url: 'pandora/clientes/', useApi: true },
          
          // 4. URLs sin trailing slash (por si hay problema con la normalización)
          { url: 'api/core/clientes', useApi: true },
          { url: 'api/pandora/clientes', useApi: true },
          
          // 5. Alternativa desempolvada - enpoints directos
          { url: 'clientes/', useApi: true },
          { url: '/clientes/', useApi: true }
        ];
        
        let clienteCreado = false;
        let responseData = null;
        
        for (const endpoint of directEndpoints) {
          if (clienteCreado) break;
          
          try {
            console.log(`Intento directo con endpoint ${endpoint.url}...`);
            
            // Configurar petición con autenticación explícita
            const config = {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              timeout: 30000
            };
            
            // Log completo para depuración
            const requestUrl = endpoint.useApi ? endpoint.url : endpoint.url;
            console.log(`Enviando POST a ${requestUrl}:`, {
              config: config,
              data: formattedData
            });
            
            let response;
            
            if (endpoint.useApi) {
              // Usar la instancia de axios configurada
              response = await api.post(endpoint.url, formattedData, config);
            } else {
              // Crear fetch request directa
              // Esto es un bypass completo del sistema axios por si hay algo en la configuración que causa problemas
              const fetchResponse = await fetch(endpoint.url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formattedData)
              });
              
              if (!fetchResponse.ok) {
                throw new Error(`Fetch error: ${fetchResponse.status} ${fetchResponse.statusText}`);
              }
              
              const data = await fetchResponse.json();
              response = { data, status: fetchResponse.status };
            }
            
            console.log(`✅ ¡Éxito con implementación directa en ${endpoint.url}!`, response.data);
            clienteCreado = true;
            responseData = response.data;
            
          } catch (endpointError) {
            // Log detallado específico para problemas de conexión
            if (!endpointError.response) {
              // Error de red o conexión (no llegó al servidor)
              console.error(`❌ Error de conexión con endpoint ${endpoint.url}:`, {
                message: endpointError.message,
                type: 'network_error',
                code: endpointError.code,
                useApi: endpoint.useApi,
                stack: endpointError.stack?.split('\n').slice(0, 3).join('\n')
              });
            } else {
              // Respuesta del servidor con error
              console.error(`❌ Error del servidor con endpoint ${endpoint.url}:`, {
                message: endpointError.message,
                status: endpointError.response?.status,
                statusText: endpointError.response?.statusText,
                data: endpointError.response?.data,
                headers: endpointError.response?.headers,
                useApi: endpoint.useApi,
                fullUrl: endpoint.useApi ? api.defaults.baseURL + endpoint.url : endpoint.url,
                requestMethod: 'POST',
              });
              
              // Log de todo el objeto error para depuración profunda
              console.debug('Error completo:', endpointError);
            }
            
            // Si hay una respuesta específica del servidor, mostrarla
            if (endpointError.response?.data) {
              const serverError = endpointError.response.data;
              // Solo mostrar toasts para errores específicos, no para todos los intentos
              if (endpoint.useApi && endpoint.url === 'api/core/clientes/') {
                toast.error(`Error del servidor: ${serverError.error || serverError.detail || 'Error desconocido'}`);
              }
            }
            
            // Continuar con el siguiente endpoint
          }
        }
        
        if (clienteCreado) {
          toast.success('Cliente agregado correctamente');
          
          // Resetear el formulario
          setFormData({
            zona: '',
            ciudad: '',
            tipo_cliente: '',
            nombre: '',
            alias: '',
            razon_social: '',
            ruc: '',
            email: '',
            telefono: '',
            direccion: '',
            activo: true,
          });
          
          // Redirigir a la página de clientes
          navigate('/clientes');
          return;
        }
        
        // Si ninguna implementación directa funcionó, intentar con los servicios normales
        console.log('Intentando crear cliente con endpoint principal (core/clientes/)...');
        const response = await clientesService.create(formattedData);
        console.log('✅ ¡Éxito! Cliente creado:', response);
        toast.success('Cliente agregado correctamente');
        
        // Resetear el formulario
        setFormData({
          zona: '',
          ciudad: '',
          tipo_cliente: '',
          nombre: '',
          alias: '',
          razon_social: '',
          ruc: '',
          email: '',
          telefono: '',
          direccion: '',
          activo: true,
        });
        
        // Redirigir a la página de clientes
        navigate('/clientes');
      } catch (initialError) {
        console.error('❌ Error con el endpoint principal, intentando alternativo...', initialError);
        
        // Segundo intento: endpoint alternativo en pandora
        try {
          console.log('Intentando endpoint alternativo (pandora/clientes/)...');
          // Crear instancia directa para endpoint alternativo
          const alternativeService = new BaseService('pandora/clientes/');
          const response = await alternativeService.create(formattedData);
          
          console.log('✅ ¡Éxito con endpoint alternativo!', response);
          toast.success('Cliente agregado correctamente');
          
          // Resetear el formulario
          setFormData({
            zona: '',
            ciudad: '',
            tipo_cliente: '',
            nombre: '',
            alias: '',
            razon_social: '',
            ruc: '',
            email: '',
            telefono: '',
            direccion: '',
            activo: true,
          });
          
          // Redirigir a la página de clientes
          navigate('/clientes');
        } catch (alternativeError) {
          console.error('❌ Error también con endpoint alternativo:', alternativeError);
          // Re-lanzar el error original para que sea manejado por el bloque catch externo
          throw initialError;
        }
      }
    } catch (error) {
      console.error('Error al crear cliente (detalles completos):', error);
      
      // Extraer información detallada sobre el error para depuración y mensajes de usuario
      console.error('Error al crear cliente - Objeto completo:', error);
      
      // Información de la petición
      console.error('Configuración de la petición:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
        data: error.config?.data ? JSON.parse(error.config.data) : null
      });
      
      // Construir mensaje detallado para el usuario
      let errorDetails = '';
      let statusInfo = '';
      let urlInfo = '';
      
      // Añadir información del status si está disponible
      if (error.response) {
        statusInfo = `[${error.response.status}] ${error.response.statusText || 'Error'}: `;
        urlInfo = `URL: ${error.config?.url} - `;
        
        console.error(`Respuesta del servidor: Status ${error.response.status} (${error.response.statusText})`);
        
        // Si la respuesta tiene datos, analizarlos
        if (error.response.data) {
          const responseData = error.response.data;
          console.error('Datos de respuesta:', responseData);
          
          // Si es un objeto, extraer errores por campo
          if (typeof responseData === 'object' && responseData !== null) {
            console.log('Analizando errores por campo...');
            
            // Si el servidor devuelve un objeto con errores por campo
            let fieldErrors = [];
            
            Object.entries(responseData).forEach(([field, message]) => {
              if (field !== 'status' && field !== 'detail' && field !== 'message') {
                const formattedMessage = Array.isArray(message) ? message.join(', ') : message;
                fieldErrors.push(`${field}: ${formattedMessage}`);
                console.log(`- Error en campo ${field}: ${formattedMessage}`);
              }
            });
            
            // Mensaje principal primero
            if (responseData.detail) {
              errorDetails = responseData.detail;
            } else if (responseData.message) {
              errorDetails = responseData.message;
            } else if (responseData.error) {
              errorDetails = responseData.error;
            }
            
            // Añadir errores por campo si existen
            if (fieldErrors.length > 0) {
              if (errorDetails) errorDetails += ". ";
              errorDetails += `Errores por campo: ${fieldErrors.join('; ')}`;
            }
          } 
          // Si es string, usarlo directamente
          else if (typeof responseData === 'string') {
            errorDetails = responseData;
          }
          // Si tiene 'message' o 'error'
          else if (responseData.message) {
            errorDetails = responseData.message;
          } else if (responseData.error) {
            errorDetails = responseData.error;
          }
        }
      } 
      // Si no hay respuesta pero hay petición, es un error de red
      else if (error.request) {
        errorDetails = "Error de red: No se pudo conectar con el servidor. Verificar conexión a internet.";
        console.error('Error de red - No se recibió respuesta:', error.request);
      }
      
      // Si no se estableció ningún detalle, usar el mensaje genérico
      if (!errorDetails) {
        errorDetails = error.message || "Error desconocido al crear cliente";
      }
      
      // Log completo para depuración
      console.error(`Error al crear cliente: ${statusInfo}${urlInfo}${errorDetails}`);
      
      // Manejar errores de validación del servidor
      // Primero manejar errores específicos del formulario
      if (error.errors) {
        const formattedErrors = {};
        Object.keys(error.errors).forEach((key) => {
          if (Array.isArray(error.errors[key])) {
            formattedErrors[key] = error.errors[key].join(' ');
          } else {
            formattedErrors[key] = String(error.errors[key]);
          }
        });
        setErrors(formattedErrors);
        toast.error('Hay errores en el formulario');
      } 
      // Luego errores del servidor (Django REST errores por campo)
      else if (error.response && error.response.data && typeof error.response.data === 'object') {
        const serverErrors = error.response.data;
        const formattedErrors = {};
        let hasFieldErrors = false;
        
        // Procesar errores específicos por campo
        Object.entries(serverErrors).forEach(([field, message]) => {
          // Evitar campos que no son errores reales
          if (field !== 'detail' && field !== 'status' && field !== 'type') {
            formattedErrors[field] = Array.isArray(message) ? message.join(' ') : String(message);
            hasFieldErrors = true;
          }
        });
        
        // Si hay errores por campo, actualizar el formulario
        if (hasFieldErrors) {
          setErrors(formattedErrors);
          toast.error('El servidor ha rechazado algunos valores. Por favor, corrija los campos marcados.');
          return;
        }
        
        // Si hay un mensaje general de error, mostrarlo
        if (serverErrors.detail) {
          toast.error('Error del servidor: ' + serverErrors.detail);
        } else if (serverErrors.message) {
          toast.error('Error del servidor: ' + serverErrors.message);
        } else if (serverErrors.error) {
          toast.error('Error del servidor: ' + serverErrors.error);
        } else {
          // Error genérico si no hay detalles específicos
          toast.error(`Error al procesar la solicitud: ${error.response.status} ${error.response.statusText}`);
        }
      } 
      // Error de conexión o red
      else if (error.message && error.message.includes('Network Error')) {
        toast.error('Error de conexión: No se pudo conectar con el servidor. Verifique su conexión a internet.');
      } 
      // Error 404 - Recurso no encontrado (endpoint incorrecto)
      else if (error.response && error.response.status === 404) {
        toast.error('Error 404: El recurso solicitado no existe. Esto puede indicar un problema con la configuración del servidor.');
      }
      // Error genérico si ninguno de los anteriores aplica
      else {
        // Usar el errorDetails que construimos anteriormente
        toast.error(errorDetails || 'Error al crear el cliente. Inténtelo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar una nueva zona con validación mejorada
  const handleAddZona = async () => {
    if (!newZona.trim()) {
      toast.error("El nombre de la zona no puede estar vacío");
      return;
    }
    
    try {
      setAddingZona(true);
      console.log('Creando nueva zona:', newZona.trim());
      
      // Crear datos para enviar
      const zonaData = { 
        nombre: newZona.trim(),
        activo: true
      };
      
      // Intentar crear la zona
      const response = await zonasService.create(zonaData);
      
      // Validar respuesta
      if (!response || !response.id) {
        throw new Error("Respuesta inválida del servidor al crear zona");
      }
      
      console.log('Zona creada exitosamente:', response);
      
      // Asegurarse que el ID sea numérico para procesar correctamente
      let zonaId = response.id;
      
      // Si el ID es string, convertirlo a número explícitamente
      if (typeof zonaId === 'string') {
        zonaId = parseInt(zonaId, 10);
        if (isNaN(zonaId)) {
          throw new Error(`ID de zona inválido recibido del servidor: "${response.id}"`);
        }
      }
      
      // Crear objeto normalizado
      const zonaNueva = {
        ...response,
        id: zonaId
      };
      
      console.log('Zona normalizada:', zonaNueva);
      
      // Actualizar la lista de zonas evitando duplicados
      setZonas(zonasActuales => {
        // Eliminar cualquier duplicado si existiera
        const zonasFiltradas = zonasActuales.filter(z => z.id !== zonaNueva.id);
        return [...zonasFiltradas, zonaNueva];
      });
      
      // Seleccionar la nueva zona - usar el ID como string para el formulario
      // Importante: Actualizar la ciudad a vacío para evitar conflictos
      setFormData(dataActual => ({
        ...dataActual, 
        zona: String(zonaNueva.id),
        ciudad: '' // Resetear ciudad al cambiar zona
      }));
      
      // Cerrar el modal y limpiar el campo
      setShowAddZonaModal(false);
      setNewZona('');
      
      toast.success("Zona agregada correctamente");
    } catch (error) {
      console.error("Error detallado al agregar zona:", error);
      
      // Extraer mensaje de error detallado
      let errorMessage = "Error al agregar la zona";
      
      if (error.response) {
        console.error("Respuesta de error del servidor:", error.response);
        const { status, data } = error.response;
        
        console.error(`Status: ${status}, Datos:`, data);
        
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data) {
          if (data.detail) errorMessage = data.detail;
          else if (data.message) errorMessage = data.message;
          else if (data.nombre) errorMessage = `Error en campo nombre: ${data.nombre}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setAddingZona(false);
    }
  };
  
  // Función para agregar una nueva ciudad
  const handleAddCiudad = async () => {
    if (!newCiudad.trim()) {
      toast.error("El nombre de la ciudad no puede estar vacío");
      return;
    }
    
    if (!formData.zona) {
      toast.error("Debe seleccionar una zona primero");
      return;
    }
    
    try {
      setAddingCiudad(true);
      
      // Asegurarse de que zona sea un número entero válido
      const zonaId = parseInt(formData.zona, 10);
      if (isNaN(zonaId)) {
        throw new Error("ID de zona inválido, no se puede convertir a número");
      }
      
      console.log(`Creando ciudad "${newCiudad.trim()}" con zona ID: ${zonaId} (${typeof zonaId})`);
      
      // Crear una ciudad con la zona ID convertida a número
      const response = await ciudadesService.create({ 
        nombre: newCiudad.trim(),
        zona: zonaId
      });
      
      // Verificar la respuesta
      console.log("Respuesta del servidor al crear ciudad:", response);
      
      if (!response || !response.id) {
        throw new Error("Respuesta inválida del servidor al crear ciudad");
      }
      
      // Asegurarse que el ID es un entero válido
      const ciudadId = typeof response.id === 'string' ? parseInt(response.id, 10) : response.id;
      
      // Crear objeto normalizado
      const ciudadNueva = {
        ...response,
        id: ciudadId
      };
      
      console.log("Ciudad creada y normalizada:", ciudadNueva);
      
      // Actualizar lista de ciudades con el nuevo objeto
      setCiudades(ciudadesActuales => {
        // Eliminar duplicados si existieran
        const ciudadesFiltradas = ciudadesActuales.filter(c => c.id !== ciudadNueva.id);
        return [...ciudadesFiltradas, ciudadNueva];
      });
      
      // Para el formulario usamos string como el select espera
      setFormData(dataActual => ({
        ...dataActual, 
        ciudad: String(ciudadNueva.id)
      }));
      
      // Cerrar el modal y limpiar el campo
      setShowAddCiudadModal(false);
      setNewCiudad('');
      
      toast.success("Ciudad agregada correctamente");
    } catch (error) {
      console.error("Error detallado al agregar ciudad:", error);
      const errorMsg = error.response?.data?.detail || error.message || "Error al agregar la ciudad";
      toast.error(errorMsg);
    } finally {
      setAddingCiudad(false);
    }
  };

  // Función para limpiar el formulario
  const handleClear = () => {
    setFormData({
      zona: '',
      ciudad: '',
      tipo_cliente: '',
      nombre: '',
      alias: '',
      razon_social: '',
      ruc: '',
      email: '',
      telefono: '',
      direccion: '',
      activo: true,
    });
    setErrors({});
  };

  return (
    <div className="cliente-form-container">
      <div className="form-header">
        <div className="header-left">
          <div className="header-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h2 className="form-title">Registro de Cliente</h2>
        </div>
        <div className="header-right">
          <div 
            className="search-icon" 
            onClick={() => {
              // Abrir la página del SRI para consulta de RUC en una nueva pestaña
              window.open('https://srienlinea.sri.gob.ec/sri-en-linea/SriRucWeb/ConsultaRuc/Consultas/consultaRuc', '_blank');
            }}
            title="Consultar RUC en SRI"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
      </div>

      {loadingOptions ? (
        <div className="loading-spinner">Cargando datos...</div>
      ) : (
        <form onSubmit={handleSubmit} className="cliente-form">
          <div className="form-layout">
            {/* Fila 1: Nombre (ancho completo) - MOVIDO AL PRINCIPIO */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="nombre">
                  Nombre <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  maxLength={80}
                  className={errors.nombre ? 'error' : ''}
                  disabled={loading}
                />
                {errors.nombre && (
                  <span className="error-message">{errors.nombre}</span>
                )}
              </div>
            </div>

            {/* Fila 2: RUC y Alias - MOVIDO ARRIBA */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ruc">
                  RUC <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="ruc"
                    name="ruc"
                    value={formData.ruc}
                    onChange={handleChange}
                    maxLength={13}
                    className={errors.ruc ? 'error' : ''}
                    disabled={loading}
                    placeholder="Rellena este campo."
                  />
                  <button 
                    type="button"
                    className="copy-button"
                    onClick={() => {
                      if (formData.ruc) {
                        navigator.clipboard.writeText(formData.ruc);
                        toast.success("RUC copiado al portapapeles");
                      }
                    }}
                    title="Copiar RUC"
                    disabled={!formData.ruc || loading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
                {errors.ruc && (
                  <span className="error-message">{errors.ruc}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="alias">
                  Alias <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="alias"
                  name="alias"
                  value={formData.alias}
                  onChange={handleChange}
                  maxLength={30}
                  className={errors.alias ? 'error' : ''}
                  disabled={loading}
                />
                {errors.alias && (
                  <span className="error-message">{errors.alias}</span>
                )}
              </div>
            </div>

            {/* Fila 3: Zona y Ciudad */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zona">
                  Zona <span className="required">*</span>
                </label>
                <div className="select-with-add">
                  <select
                    id="zona"
                    name="zona"
                    value={formData.zona}
                    onChange={handleChange}
                    className={errors.zona ? 'error' : ''}
                    disabled={loading}
                  >
                    <option value="">Seleccione una zona</option>
                    {zonas.map((zona) => (
                      <option key={zona.id} value={zona.id}>
                        {zona.nombre}
                      </option>
                    ))}
                    <option value="add_new" className="add-new-option">+ Agregar nueva zona</option>
                  </select>
                </div>
                {errors.zona && (
                  <span className="error-message">{errors.zona}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="ciudad">
                  Ciudad <span className="required">*</span>
                </label>
                <div className="select-with-add">
                  <select
                    id="ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    className={errors.ciudad ? 'error' : ''}
                    disabled={loading || !formData.zona}
                  >
                    <option value="">Seleccione una ciudad</option>
                    {ciudades.map((ciudad) => (
                      <option key={ciudad.id} value={ciudad.id}>
                        {ciudad.nombre}
                      </option>
                    ))}
                    {formData.zona && (
                      <option value="add_new" className="add-new-option">+ Agregar nueva ciudad</option>
                    )}
                  </select>
                </div>
                {errors.ciudad && (
                  <span className="error-message">{errors.ciudad}</span>
                )}
              </div>
            </div>

            {/* Fila 4: Razón Social (ancho completo) */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="razon_social">
                  Razón Social <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="razon_social"
                  name="razon_social"
                  value={formData.razon_social}
                  onChange={handleChange}
                  maxLength={255}
                  className={errors.razon_social ? 'error' : ''}
                  disabled={loading}
                />
                {errors.razon_social && (
                  <span className="error-message">{errors.razon_social}</span>
                )}
              </div>
            </div>

            {/* Fila 5: Dirección (ancho completo) */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="direccion">
                  Dirección <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  maxLength={100}
                  className={errors.direccion ? 'error' : ''}
                  disabled={loading}
                />
                {errors.direccion && (
                  <span className="error-message">{errors.direccion}</span>
                )}
              </div>
            </div>

            {/* Fila 6: Email y Teléfono */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={50}
                  className={errors.email ? 'error' : ''}
                  disabled={loading}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  maxLength={20}
                  className={errors.telefono ? 'error' : ''}
                  disabled={loading}
                />
                {errors.telefono && (
                  <span className="error-message">{errors.telefono}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-footer">
            <div className="checkbox-group">
              {/* Tipo de Cliente primero */}
              <div className="tipo-cliente-footer">
                <label htmlFor="tipo_cliente_footer">
                  Tipo de Cliente <span className="required">*</span>
                </label>
                <select
                  id="tipo_cliente_footer"
                  name="tipo_cliente"
                  value={formData.tipo_cliente}
                  onChange={handleChange}
                  className={errors.tipo_cliente ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Seleccione tipo de cliente</option>
                  {tiposCliente.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
                {errors.tipo_cliente && (
                  <span className="error-message">{errors.tipo_cliente}</span>
                )}
              </div>
              
              {/* Cliente Activo después */}
              <label htmlFor="activo" className="checkbox-label">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Cliente Activo</span>
              </label>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-clear"
                onClick={handleClear}
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Limpiar
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      )}
      
      {/* Modal para agregar nueva zona */}
      {showAddZonaModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Agregar Nueva Zona</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddZonaModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="newZona">Nombre de la zona</label>
                <input
                  type="text"
                  id="newZona"
                  value={newZona}
                  onChange={(e) => setNewZona(e.target.value)}
                  placeholder="Ingrese el nombre de la zona"
                  className="w-full"
                  disabled={addingZona}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-cancel-btn"
                onClick={() => setShowAddZonaModal(false)}
                disabled={addingZona}
              >
                Cancelar
              </button>
              <button 
                className="modal-action-btn"
                onClick={handleAddZona}
                disabled={addingZona || !newZona.trim()}
              >
                {addingZona ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para agregar nueva ciudad */}
      {showAddCiudadModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Agregar Nueva Ciudad</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddCiudadModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="newCiudad">Nombre de la ciudad</label>
                <input
                  type="text"
                  id="newCiudad"
                  value={newCiudad}
                  onChange={(e) => setNewCiudad(e.target.value)}
                  placeholder="Ingrese el nombre de la ciudad"
                  className="w-full"
                  disabled={addingCiudad}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                La ciudad será añadida a la zona: {zonas.find(z => z.id === formData.zona)?.nombre || ''}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-cancel-btn"
                onClick={() => setShowAddCiudadModal(false)}
                disabled={addingCiudad}
              >
                Cancelar
              </button>
              <button 
                className="modal-action-btn"
                onClick={handleAddCiudad}
                disabled={addingCiudad || !newCiudad.trim()}
              >
                {addingCiudad ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddClientePage;
