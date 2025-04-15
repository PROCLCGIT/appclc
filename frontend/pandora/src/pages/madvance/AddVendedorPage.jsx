import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { proveedoresService, vendedoresService } from '@/services/api';
import './ClienteForm.css'; // Reutilizamos el mismo CSS

function AddVendedorPage() {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    proveedor: '',
    nombre: '',
    correo: '',
    telefono: '',
    observacion: '',
    activo: true,
  });

  // Estados para las opciones de los selects
  const [proveedoresList, setProveedoresList] = useState([]);

  // Estados de carga y errores
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Cargar las opciones de los selects al montar el componente
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const proveedoresRes = await proveedoresService.getAll();
        setProveedoresList(proveedoresRes.results || []);
        console.log('Proveedores cargados:', proveedoresRes);
      } catch (error) {
        console.error('Error al cargar opciones:', error);
        toast.error('Error al cargar datos. Por favor, recarga la página.');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Manejar los cambios en los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.proveedor) newErrors.proveedor = 'El proveedor es requerido';

    if (!formData.nombre) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede exceder los 100 caracteres';
    }

    if (formData.correo) {
      if (!/\S+@\S+\.\S+/.test(formData.correo)) {
        newErrors.correo = 'El email no es válido';
      } else if (formData.correo.length > 100) {
        newErrors.correo = 'El email no puede exceder los 100 caracteres';
      }
    }

    if (formData.telefono && formData.telefono.length > 20) {
      newErrors.telefono = 'El teléfono no puede exceder los 20 caracteres';
    }

    if (formData.observacion && formData.observacion.length > 500) {
      newErrors.observacion = 'La observación no puede exceder los 500 caracteres';
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
      console.log('Enviando datos de vendedor:', formData);
      const response = await vendedoresService.create(formData);
      console.log('Vendedor creado:', response);
      toast.success('Vendedor agregado correctamente');

      // Resetear el formulario
      setFormData({
        proveedor: '',
        nombre: '',
        correo: '',
        telefono: '',
        observacion: '',
        activo: true,
      });
      // Redirigir a la página de vendedores
      navigate('/vendedores');
    } catch (error) {
      console.error('Error al crear vendedor:', error);
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
        toast.error(error.message || 'Error al crear el vendedor. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar el formulario
  const handleClear = () => {
    setFormData({
      proveedor: '',
      nombre: '',
      correo: '',
      telefono: '',
      observacion: '',
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
          <h2 className="form-title">Registro de Vendedor</h2>
        </div>
      </div>

      {loadingOptions ? (
        <div className="loading-spinner">Cargando datos...</div>
      ) : (
        <form onSubmit={handleSubmit} className="cliente-form">
          <div className="form-layout">
            {/* Fila 1: Nombre (ancho completo) */}
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
                  maxLength={100}
                  className={errors.nombre ? 'error' : ''}
                  disabled={loading}
                />
                {errors.nombre && (
                  <span className="error-message">{errors.nombre}</span>
                )}
              </div>
            </div>

            {/* Fila 2: Proveedor (ancho completo) */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="proveedor">
                  Proveedor <span className="required">*</span>
                </label>
                <select
                  id="proveedor"
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleChange}
                  className={errors.proveedor ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedoresList.map((proveedor) => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </select>
                {errors.proveedor && (
                  <span className="error-message">{errors.proveedor}</span>
                )}
              </div>
            </div>

            {/* Fila 3: Email y Teléfono */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="correo">Email</label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  maxLength={100}
                  className={errors.correo ? 'error' : ''}
                  disabled={loading}
                />
                {errors.correo && (
                  <span className="error-message">{errors.correo}</span>
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

            {/* Fila 4: Observación (ancho completo) */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="observacion">Observación</label>
                <textarea
                  id="observacion"
                  name="observacion"
                  value={formData.observacion}
                  onChange={handleChange}
                  maxLength={500}
                  className={errors.observacion ? 'error' : ''}
                  disabled={loading}
                  rows="3"
                />
                {errors.observacion && (
                  <span className="error-message">{errors.observacion}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-footer">
            <div className="checkbox-group">
              <label htmlFor="activo" className="checkbox-label">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Vendedor Activo</span>
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
    </div>
  );
}

export default AddVendedorPage;