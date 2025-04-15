import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { proveedoresService } from '@/services/api';
import './clienteform.css'; // Reutilizamos los estilos del cliente

function AddProveedorPage() {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    ruc: '',
    razon_social: '',
    nombre: '',
    direccion1: '',
    direccion2: '',
    correo: '',
    telefono: '',
    tipo_primario: false,
    activo: true,
  });

  // Estados de carga y errores
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

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

    if (!formData.ruc) {
      newErrors.ruc = 'El RUC es requerido';
    } else if (formData.ruc.length !== 13) {
      newErrors.ruc = 'El RUC debe tener 13 caracteres';
    } else if (!/^\d+$/.test(formData.ruc)) {
      newErrors.ruc = 'El RUC debe contener solo números';
    }

    if (!formData.nombre) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length > 80) {
      newErrors.nombre = 'El nombre no puede exceder los 80 caracteres';
    }

    if (!formData.razon_social) {
      newErrors.razon_social = 'La razón social es requerida';
    } else if (formData.razon_social.length > 255) {
      newErrors.razon_social = 'La razón social no puede exceder los 255 caracteres';
    }

    if (!formData.direccion1) {
      newErrors.direccion1 = 'La dirección principal es requerida';
    } else if (formData.direccion1.length > 255) {
      newErrors.direccion1 = 'La dirección no puede exceder los 255 caracteres';
    }

    if (formData.correo && !/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'El email no es válido';
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
      console.log('Enviando datos de proveedor:', formData);
      const response = await proveedoresService.create(formData);
      console.log('Proveedor creado:', response);
      toast.success('Proveedor agregado correctamente');

      // Redirigir a la página de proveedores
      navigate('/proveedores');
    } catch (error) {
      console.error('Error al crear proveedor:', error);
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
        toast.error(error.message || 'Error al crear el proveedor. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar el formulario
  const handleClear = () => {
    setFormData({
      ruc: '',
      razon_social: '',
      nombre: '',
      direccion1: '',
      direccion2: '',
      correo: '',
      telefono: '',
      tipo_primario: false,
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
              <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path>
              <path d="M16.5 9.4 7.55 4.24"></path>
              <polyline points="3.29 7 12 12 20.71 7"></polyline>
              <line x1="12" y1="22" x2="12" y2="12"></line>
              <circle cx="18.5" cy="15.5" r="2.5"></circle>
              <path d="M20.27 17.27 22 19"></path>
            </svg>
          </div>
          <h2 className="form-title">Registro de Proveedor</h2>
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
                maxLength={80}
                className={errors.nombre ? 'error' : ''}
                disabled={loading}
              />
              {errors.nombre && (
                <span className="error-message">{errors.nombre}</span>
              )}
            </div>
          </div>

          {/* Fila 2: RUC y Razón Social */}
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

          {/* Fila 3: Direcciones */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="direccion1">
                Dirección Principal <span className="required">*</span>
              </label>
              <input
                type="text"
                id="direccion1"
                name="direccion1"
                value={formData.direccion1}
                onChange={handleChange}
                maxLength={255}
                className={errors.direccion1 ? 'error' : ''}
                disabled={loading}
              />
              {errors.direccion1 && (
                <span className="error-message">{errors.direccion1}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="direccion2">
                Dirección Secundaria
              </label>
              <input
                type="text"
                id="direccion2"
                name="direccion2"
                value={formData.direccion2}
                onChange={handleChange}
                maxLength={255}
                className={errors.direccion2 ? 'error' : ''}
                disabled={loading}
              />
              {errors.direccion2 && (
                <span className="error-message">{errors.direccion2}</span>
              )}
            </div>
          </div>

          {/* Fila 4: Correo y Teléfono */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="correo">
                Correo Electrónico
              </label>
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
              <label htmlFor="telefono">
                Teléfono
              </label>
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
            {/* Tipo de Proveedor */}
            <label htmlFor="tipo_primario" className="checkbox-label">
              <input
                type="checkbox"
                id="tipo_primario"
                name="tipo_primario"
                checked={formData.tipo_primario}
                onChange={handleChange}
                disabled={loading}
              />
              <span>Proveedor Primario</span>
            </label>
            
            {/* Proveedor Activo */}
            <label htmlFor="activo" className="checkbox-label">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                disabled={loading}
              />
              <span>Proveedor Activo</span>
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
    </div>
  );
}

export default AddProveedorPage;