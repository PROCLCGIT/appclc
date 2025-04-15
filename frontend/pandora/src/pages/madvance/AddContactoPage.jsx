import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { contactosService } from '@/services/api';
import './ClienteForm.css'; // Reutilizamos el mismo CSS

function AddContactoPage() {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    alias: '',
    telefono: '',
    telefono2: '',
    email: '',
    direccion: '',
    obserbacion: '',
    ingerencia: ''
  });

  // Estados de carga y errores
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Manejar los cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede exceder los 100 caracteres';
    }

    if (formData.email) {
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'El email no es válido';
      } else if (formData.email.length > 100) {
        newErrors.email = 'El email no puede exceder los 100 caracteres';
      }
    }

    if (formData.telefono && formData.telefono.length > 20) {
      newErrors.telefono = 'El teléfono no puede exceder los 20 caracteres';
    }

    if (formData.telefono2 && formData.telefono2.length > 20) {
      newErrors.telefono2 = 'El teléfono secundario no puede exceder los 20 caracteres';
    }

    if (formData.direccion && formData.direccion.length > 200) {
      newErrors.direccion = 'La dirección no puede exceder los 200 caracteres';
    }

    if (formData.obserbacion && formData.obserbacion.length > 500) {
      newErrors.obserbacion = 'La observación no puede exceder los 500 caracteres';
    }

    if (formData.ingerencia && formData.ingerencia.length > 100) {
      newErrors.ingerencia = 'La ingerencia no puede exceder los 100 caracteres';
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
      console.log('Enviando datos de contacto:', formData);
      const response = await contactosService.create(formData);
      console.log('Contacto creado:', response);
      toast.success('Contacto agregado correctamente');

      // Resetear el formulario
      setFormData({
        nombre: '',
        alias: '',
        telefono: '',
        telefono2: '',
        email: '',
        direccion: '',
        obserbacion: '',
        ingerencia: ''
      });
      // Redirigir a la página de contactos
      navigate('/contactos');
    } catch (error) {
      console.error('Error al crear contacto:', error);
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
        toast.error(error.message || 'Error al crear el contacto. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar el formulario
  const handleClear = () => {
    setFormData({
      nombre: '',
      alias: '',
      telefono: '',
      telefono2: '',
      email: '',
      direccion: '',
      obserbacion: '',
      ingerencia: ''
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h2 className="form-title">Registro de Contacto</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="cliente-form">
        <div className="form-layout">
          {/* Fila 1: Nombre y Alias */}
          <div className="form-row">
            <div className="form-group">
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
            <div className="form-group">
              <label htmlFor="alias">Alias</label>
              <input
                type="text"
                id="alias"
                name="alias"
                value={formData.alias}
                onChange={handleChange}
                maxLength={50}
                className={errors.alias ? 'error' : ''}
                disabled={loading}
              />
              {errors.alias && (
                <span className="error-message">{errors.alias}</span>
              )}
            </div>
          </div>

          {/* Fila 2: Teléfonos */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefono">Teléfono Principal</label>
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
            <div className="form-group">
              <label htmlFor="telefono2">Teléfono Secundario</label>
              <input
                type="text"
                id="telefono2"
                name="telefono2"
                value={formData.telefono2}
                onChange={handleChange}
                maxLength={20}
                className={errors.telefono2 ? 'error' : ''}
                disabled={loading}
              />
              {errors.telefono2 && (
                <span className="error-message">{errors.telefono2}</span>
              )}
            </div>
          </div>

          {/* Fila 3: Email e Ingerencia */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={100}
                className={errors.email ? 'error' : ''}
                disabled={loading}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="ingerencia">Ingerencia</label>
              <input
                type="text"
                id="ingerencia"
                name="ingerencia"
                value={formData.ingerencia}
                onChange={handleChange}
                maxLength={100}
                className={errors.ingerencia ? 'error' : ''}
                disabled={loading}
              />
              {errors.ingerencia && (
                <span className="error-message">{errors.ingerencia}</span>
              )}
            </div>
          </div>

          {/* Fila 4: Dirección (ancho completo) */}
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="direccion">Dirección</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                maxLength={200}
                className={errors.direccion ? 'error' : ''}
                disabled={loading}
              />
              {errors.direccion && (
                <span className="error-message">{errors.direccion}</span>
              )}
            </div>
          </div>

          {/* Fila 5: Observación (ancho completo) */}
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="obserbacion">Observación</label>
              <textarea
                id="obserbacion"
                name="obserbacion"
                value={formData.obserbacion}
                onChange={handleChange}
                maxLength={500}
                className={errors.obserbacion ? 'error' : ''}
                disabled={loading}
                rows="3"
              />
              {errors.obserbacion && (
                <span className="error-message">{errors.obserbacion}</span>
              )}
            </div>
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
    </div>
  );
}

export default AddContactoPage;