// src/pages/import/MsprefImportPage.jsx
import { useState, useCallback } from 'react';
import { Upload, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { msprefService } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const MsprefImportPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });
  const navigate = useNavigate();

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const selectedFile = e.target.files[0];
      if (!selectedFile) return;

      if (
        selectedFile.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel'
      ) {
        setFile(selectedFile);
      } else {
        showNotification(
          'Por favor, seleccione un archivo Excel válido (.xlsx o .xls)',
          'error'
        );
        e.target.value = null;
      }
    },
    [showNotification]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showNotification('Por favor, seleccione un archivo Excel', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await msprefService.importExcel(file);

      showNotification(
        `Importación exitosa: ${response.creados} registros creados, ${response.actualizados} actualizados`,
        'success'
      );

      if (response.errores?.length > 0) {
        setTimeout(() => {
          showNotification(`Advertencias: ${response.errores.join(', ')}`, 'error');
        }, 5000);
      }

      // Limpiar el formulario
      setFile(null);
      e.target.reset();
    } catch (error) {
      console.error('Error de importación:', error);
      showNotification(error.message || 'Error al importar el archivo', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notificación */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
            notification.type === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Cabecera */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/mspref')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Volver a MS Prefs
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Importar MS Prefs desde Excel
          </h1>
          <p className="text-gray-600">
            Sube un archivo Excel con los siguientes campos: sku, nombre_generico,
            categoria, especialidad, normada, referencias_tecnica, aplicaciones
          </p>
        </div>

        {/* Card del formulario */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Zona de drop o selección de archivo */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <div className="text-center">
                  <label className="block">
                    <span className="sr-only">Seleccionar archivo</span>
                    <input
                      type="file"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    {file ? file.name : 'Arrastra o selecciona un archivo Excel'}
                  </p>
                </div>
              </div>
            </div>

            {/* Información del formato esperado */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">
                Formato del archivo Excel
              </h3>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>SKU (texto) - Identificador único del producto</li>
                <li>Nombre Genérico (texto) - Nombre descriptivo del producto</li>
                <li>Categoría (texto) - Se creará automáticamente si no existe</li>
                <li>Especialidad (texto) - Se creará automáticamente si no existe</li>
                <li>
                  Normada (si/no, true/false, 1/0) - Indica si el producto está
                  normado
                </li>
                <li>
                  Referencias Técnicas (texto) - Especificaciones técnicas del
                  producto
                </li>
                <li>Aplicaciones (texto) - Usos y aplicaciones del producto</li>
              </ul>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/mspref')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-white ${
                  !file || loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Importando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Importar Excel</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MsprefImportPage;
