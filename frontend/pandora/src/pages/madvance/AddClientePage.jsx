import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  zonasService,
  ciudadesService,
  tipoClienteService,
  clientesService,
} from '@/services/api';
import './ClienteForm.css';

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

  // Cargar las opciones de los selects al montar el componente
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [zonasRes, ciudadesRes, tiposClienteRes] = await Promise.all([
          zonasService.getAll(),
          ciudadesService.getAll(),
          tipoClienteService.getAll(),
        ]);
        setZonas(zonasRes.results || []);
        setCiudades(ciudadesRes.results || []);
        setTiposCliente(tiposClienteRes.results || []);
        console.log('Zonas cargadas:', zonasRes);
        console.log('Ciudades cargadas:', ciudadesRes);
        console.log('Tipos de cliente cargados:', tiposClienteRes);
      } catch (error) {
        console.error('Error al cargar opciones:', error);
        toast.error('Error al cargar datos. Por favor, recarga la página.');
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

  // Manejar los cambios en los inputs
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
    
    // Si es un cambio de zona, resetear la ciudad
    if (name === 'zona') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ciudad: '' // resetear la ciudad cuando cambia la zona
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.zona) newErrors.zona = 'La zona es requerida';
    if (!formData.ciudad) newErrors.ciudad = 'La ciudad es requerida';
    if (!formData.tipo_cliente)
      newErrors.tipo_cliente = 'El tipo de cliente es requerido';

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

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      console.log('Enviando datos de cliente:', formData);
      const response = await clientesService.create(formData);
      console.log('Cliente creado:', response);
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
    } catch (error) {
      console.error('Error al crear cliente:', error);
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
      } else {
        toast.error(error.message || 'Error al crear el cliente. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar una nueva zona
  const handleAddZona = async () => {
    if (!newZona.trim()) {
      toast.error("El nombre de la zona no puede estar vacío");
      return;
    }
    
    try {
      setAddingZona(true);
      const response = await zonasService.create({ nombre: newZona.trim() });
      
      // Actualizar la lista de zonas
      setZonas([...zonas, response]);
      
      // Seleccionar la nueva zona
      setFormData({...formData, zona: response.id});
      
      // Cerrar el modal y limpiar el campo
      setShowAddZonaModal(false);
      setNewZona('');
      
      toast.success("Zona agregada correctamente");
    } catch (error) {
      console.error("Error al agregar zona:", error);
      toast.error(error.message || "Error al agregar la zona");
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
      const response = await ciudadesService.create({ 
        nombre: newCiudad.trim(),
        zona: formData.zona
      });
      
      // Actualizar la lista de ciudades
      setCiudades([...ciudades, response]);
      
      // Seleccionar la nueva ciudad
      setFormData({...formData, ciudad: response.id});
      
      // Cerrar el modal y limpiar el campo
      setShowAddCiudadModal(false);
      setNewCiudad('');
      
      toast.success("Ciudad agregada correctamente");
    } catch (error) {
      console.error("Error al agregar ciudad:", error);
      toast.error(error.message || "Error al agregar la ciudad");
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
