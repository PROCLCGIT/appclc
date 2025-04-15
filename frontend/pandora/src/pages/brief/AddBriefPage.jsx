import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Trash2, Users, FileText } from 'lucide-react';
import {
  clientesService,
  unidadesService,
  briefService,
  briefItemsService
} from '@/services/api';
import './BriefForm.css';

function AddBriefPage() {
  const navigate = useNavigate();
  
  // Form data for the brief
  const [formData, setFormData] = useState({
    codigo: '',
    origen: '',
    fecha: new Date().toISOString().split('T')[0],
    presupuestoref: '',
    observaciones: '',
    cliente: '',
  });

  // List of brief items
  const [items, setItems] = useState([
    {
      id: 1, // Local ID for rendering
      nombre: '',
      descripcion: '',
      unidad: '',
      cantidad: 1
    }
  ]);

  // Options for selects
  const [clientes, setClientes] = useState([]);
  const [unidades, setUnidades] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // Error tracking
  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});

  // Search client modal state
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);

  // Load initial data
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        
        // Generate a unique code for the brief
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const generatedCode = `BR-${year}${month}-${random}`;
        
        setFormData(prev => ({...prev, codigo: generatedCode}));
        
        // Load clients and units
        const [clientesRes, unidadesRes] = await Promise.all([
          clientesService.getAll(),
          unidadesService.getAll(),
        ]);
        
        setClientes(clientesRes.results || []);
        setUnidades(unidadesRes.results || []);
        
        // Set filtered clients initially to all clients
        setFilteredClients(clientesRes.results || []);
        
        console.log('Options loaded:', { 
          clientes: clientesRes.results,
          unidades: unidadesRes.results
        });
      } catch (error) {
        console.error('Error al cargar opciones:', error);
        toast.error('Error al cargar datos necesarios. Por favor, recarga la página.');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Filter clients when search term changes
  useEffect(() => {
    if (clientSearchTerm.trim() === '') {
      setFilteredClients(clientes);
    } else {
      const term = clientSearchTerm.toLowerCase();
      const filtered = clientes.filter(
        client => 
          client.nombre.toLowerCase().includes(term) || 
          client.alias.toLowerCase().includes(term) ||
          client.ruc.toLowerCase().includes(term)
      );
      setFilteredClients(filtered);
    }
  }, [clientSearchTerm, clientes]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Process numeric values
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    
    // Process numeric values
    if (field === 'cantidad') {
      updatedItems[index][field] = value === '' ? '' : Number(value);
    } else {
      updatedItems[index][field] = value;
    }
    
    setItems(updatedItems);
    
    // Clear item error if it exists
    if (itemErrors[`${index}-${field}`]) {
      setItemErrors(prev => ({ ...prev, [`${index}-${field}`]: '' }));
    }
  };

  // Add a new item
  const addItem = () => {
    const newItem = {
      id: items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1,
      nombre: '',
      descripcion: '',
      unidad: '',
      cantidad: 1
    };
    
    setItems([...items, newItem]);
  };

  // Remove an item
  const removeItem = (id) => {
    if (items.length === 1) {
      toast.error('El brief debe tener al menos un ítem');
      return;
    }
    
    setItems(items.filter(item => item.id !== id));
    
    // Remove any errors associated with this item
    const newItemErrors = { ...itemErrors };
    Object.keys(newItemErrors).forEach(key => {
      if (key.startsWith(`${id}-`)) {
        delete newItemErrors[key];
      }
    });
    
    setItemErrors(newItemErrors);
  };

  // Open client search modal
  const handleClientSearch = () => {
    setClientSearchTerm('');
    setFilteredClients(clientes);
    setShowClientSearch(true);
  };

  // Select a client from the search modal
  const handleSelectClient = (client) => {
    setFormData(prev => ({
      ...prev,
      cliente: client.id
    }));
    
    setShowClientSearch(false);
    
    // Clear any error on cliente field
    if (errors.cliente) {
      setErrors(prev => ({ ...prev, cliente: '' }));
    }
  };

  // Validate the brief form
  const validateBrief = () => {
    const newErrors = {};

    if (!formData.codigo) newErrors.codigo = 'El código es requerido';
    if (!formData.origen) newErrors.origen = 'El origen es requerido';
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (!formData.cliente) newErrors.cliente = 'El cliente es requerido';
    
    if (!formData.presupuestoref) {
      newErrors.presupuestoref = 'El presupuesto de referencia es requerido';
    } else if (isNaN(formData.presupuestoref) || Number(formData.presupuestoref) <= 0) {
      newErrors.presupuestoref = 'El presupuesto debe ser un número mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate brief items
  const validateItems = () => {
    const newItemErrors = {};
    
    items.forEach((item, index) => {
      if (!item.nombre) {
        newItemErrors[`${index}-nombre`] = 'El nombre es requerido';
      }
      
      if (!item.unidad) {
        newItemErrors[`${index}-unidad`] = 'La unidad es requerida';
      }
      
      if (!item.cantidad || item.cantidad <= 0) {
        newItemErrors[`${index}-cantidad`] = 'La cantidad debe ser mayor a 0';
      }
    });
    
    setItemErrors(newItemErrors);
    return Object.keys(newItemErrors).length === 0;
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form and items
    const isFormValid = validateBrief();
    const areItemsValid = validateItems();
    
    if (!isFormValid || !areItemsValid) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create the brief
      const briefResponse = await briefService.create(formData);
      console.log('Brief creado:', briefResponse);
      
      // Create each item associated with the brief
      for (const item of items) {
        const itemData = {
          id_brief: briefResponse.id,
          nombre: item.nombre,
          descripcion: item.descripcion || '',
          unidad: item.unidad,
          cantidad: item.cantidad
        };
        
        await briefItemsService.create(itemData);
      }
      
      toast.success('Brief creado exitosamente');
      
      // Navigate back to briefs list
      navigate('/briefs');
    } catch (error) {
      console.error('Error al crear brief:', error);
      
      // Handle API validation errors
      if (error.errors) {
        const formattedErrors = {};
        Object.keys(error.errors).forEach(key => {
          formattedErrors[key] = Array.isArray(error.errors[key]) 
            ? error.errors[key].join(' ') 
            : String(error.errors[key]);
        });
        setErrors(formattedErrors);
      }
      
      toast.error(error.message || 'Error al crear el brief. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Clear the form
  const handleClear = () => {
    // Generate a new code
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const generatedCode = `BR-${year}${month}-${random}`;
    
    // Reset form data
    setFormData({
      codigo: generatedCode,
      origen: '',
      fecha: new Date().toISOString().split('T')[0],
      presupuestoref: '',
      observaciones: '',
      cliente: '',
    });
    
    // Reset items to a single empty item
    setItems([
      {
        id: 1,
        nombre: '',
        descripcion: '',
        unidad: '',
        cantidad: 1
      }
    ]);
    
    // Clear all errors
    setErrors({});
    setItemErrors({});
  };

  return (
    <div className="brief-form-container">
      <div className="form-header">
        <div className="header-left">
          <div className="header-icon">
            <FileText size={24} />
          </div>
          <h2 className="form-title">Nuevo Brief</h2>
        </div>
      </div>

      {loadingOptions ? (
        <div className="loading-spinner">Cargando datos...</div>
      ) : (
        <form onSubmit={handleSubmit} className="brief-form">
          <div className="form-section">
            <h3 className="section-title">Información General</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="codigo">
                  Código <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  className={errors.codigo ? 'error' : ''}
                  disabled={loading}
                />
                {errors.codigo && (
                  <span className="error-message">{errors.codigo}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="fecha">
                  Fecha <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className={errors.fecha ? 'error' : ''}
                  disabled={loading}
                />
                {errors.fecha && (
                  <span className="error-message">{errors.fecha}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="origen">
                  Origen <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="origen"
                  name="origen"
                  value={formData.origen}
                  onChange={handleChange}
                  className={errors.origen ? 'error' : ''}
                  disabled={loading}
                  placeholder="Ej: Solicitud del cliente, Iniciativa interna..."
                />
                {errors.origen && (
                  <span className="error-message">{errors.origen}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="presupuestoref">
                  Presupuesto de Referencia <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="presupuestoref"
                  name="presupuestoref"
                  value={formData.presupuestoref}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={errors.presupuestoref ? 'error' : ''}
                  disabled={loading}
                  placeholder="0.00"
                />
                {errors.presupuestoref && (
                  <span className="error-message">{errors.presupuestoref}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="cliente">
                  Cliente <span className="required">*</span>
                </label>
                <div className="input-with-button">
                  <select
                    id="cliente"
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleChange}
                    className={errors.cliente ? 'error' : ''}
                    disabled={loading}
                  >
                    <option value="">Seleccione un cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="search-button"
                    onClick={handleClientSearch}
                    disabled={loading}
                  >
                    <Users size={18} />
                    Buscar
                  </button>
                </div>
                {errors.cliente && (
                  <span className="error-message">{errors.cliente}</span>
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows="3"
                  className={errors.observaciones ? 'error' : ''}
                  disabled={loading}
                  placeholder="Observaciones adicionales sobre el brief"
                ></textarea>
                {errors.observaciones && (
                  <span className="error-message">{errors.observaciones}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">Ítems del Brief</h3>
              <button
                type="button"
                className="add-item-button"
                onClick={addItem}
                disabled={loading}
              >
                <Plus size={18} />
                Agregar ítem
              </button>
            </div>
            
            <div className="items-container">
              {items.length === 0 ? (
                <div className="no-items-message">
                  <p>No hay ítems agregados. Haga clic en "Agregar ítem" para comenzar.</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={item.id} className="item-card">
                    <div className="item-header">
                      <span className="item-number">Ítem #{index + 1}</span>
                      <button
                        type="button"
                        className="remove-item-button"
                        onClick={() => removeItem(item.id)}
                        disabled={loading || items.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  
                  <div className="item-form">
                    <div className="form-row">
                      <div className="form-group full-width">
                        <label htmlFor={`item-${item.id}-nombre`}>
                          Nombre <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id={`item-${item.id}-nombre`}
                          value={item.nombre}
                          onChange={(e) => handleItemChange(index, 'nombre', e.target.value)}
                          className={itemErrors[`${index}-nombre`] ? 'error' : ''}
                          disabled={loading}
                        />
                        {itemErrors[`${index}-nombre`] && (
                          <span className="error-message">{itemErrors[`${index}-nombre`]}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`item-${item.id}-unidad`}>
                          Unidad <span className="required">*</span>
                        </label>
                        <select
                          id={`item-${item.id}-unidad`}
                          value={item.unidad}
                          onChange={(e) => handleItemChange(index, 'unidad', e.target.value)}
                          className={itemErrors[`${index}-unidad`] ? 'error' : ''}
                          disabled={loading}
                        >
                          <option value="">Seleccione una unidad</option>
                          {unidades.map((unidad) => (
                            <option key={unidad.id} value={unidad.id}>
                              {unidad.nombre}
                            </option>
                          ))}
                        </select>
                        {itemErrors[`${index}-unidad`] && (
                          <span className="error-message">{itemErrors[`${index}-unidad`]}</span>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`item-${item.id}-cantidad`}>
                          Cantidad <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          id={`item-${item.id}-cantidad`}
                          value={item.cantidad}
                          onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                          min="0.01"
                          step="0.01"
                          className={itemErrors[`${index}-cantidad`] ? 'error' : ''}
                          disabled={loading}
                        />
                        {itemErrors[`${index}-cantidad`] && (
                          <span className="error-message">{itemErrors[`${index}-cantidad`]}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group full-width">
                        <label htmlFor={`item-${item.id}-descripcion`}>
                          Descripción
                        </label>
                        <textarea
                          id={`item-${item.id}-descripcion`}
                          value={item.descripcion}
                          onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                          rows="2"
                          className={itemErrors[`${index}-descripcion`] ? 'error' : ''}
                          disabled={loading}
                          placeholder="Descripción detallada del ítem"
                        ></textarea>
                        {itemErrors[`${index}-descripcion`] && (
                          <span className="error-message">{itemErrors[`${index}-descripcion`]}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                ))
              )}
              
              {items.length > 0 && (
                <div className="add-another-item">
                  <button
                    type="button"
                    className="add-item-button"
                    onClick={addItem}
                    disabled={loading}
                  >
                    <Plus size={18} />
                    Agregar otro ítem
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-footer">
            <div className="form-actions">
              <button
                type="button"
                className="btn-clear"
                onClick={handleClear}
                disabled={loading}
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Brief'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Client Search Modal */}
      {showClientSearch && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Buscar Cliente</h3>
              <button
                className="modal-close"
                onClick={() => setShowClientSearch(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="search-input">
                <input
                  type="text"
                  placeholder="Buscar por nombre, alias o RUC..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="search-results">
                {filteredClients.length === 0 ? (
                  <div className="no-results">No se encontraron clientes</div>
                ) : (
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Alias</th>
                        <th>RUC</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map(client => (
                        <tr key={client.id}>
                          <td>{client.nombre}</td>
                          <td>{client.alias}</td>
                          <td>{client.ruc}</td>
                          <td>
                            <button
                              type="button"
                              className="select-btn"
                              onClick={() => handleSelectClient(client)}
                            >
                              Seleccionar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-cancel-btn"
                onClick={() => setShowClientSearch(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddBriefPage;