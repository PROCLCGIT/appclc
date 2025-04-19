/**
 * Utilidades de diagnóstico para el gestor documental
 */
import { API_BASE_URL } from '@/config/constants';

/**
 * Función para verificar la conexión directa a la API
 * @param {Function} setStatus - Función para actualizar estado
 * @param {Function} setError - Función para actualizar error
 * @param {Function} setDocuments - Función para actualizar documentos
 * @param {Function} toast - Función para mostrar notificaciones
 */
export const checkDirectApiConnection = async (setStatus, setError, setDocuments, toast) => {
  try {
    setStatus("Verificando...");
    setError(null);
    
    // URL base del endpoint de documentos
    const url = `${API_BASE_URL}/docmanager/documents/`;
    console.log("Verificando API en:", url);
    
    // Realizar la petición con opciones mínimas
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }
    
    // Procesar la respuesta
    const data = await response.json();
    
    // Verificar estructura de la respuesta
    if (data && data.results && Array.isArray(data.results)) {
      setDocuments(data.results);
      setStatus(`API funcionando - ${data.results.length} documentos recibidos`);
      
      // Notificar éxito
      toast({
        title: 'Conexión exitosa',
        description: `Se han recibido ${data.results.length} documentos de la API`,
        variant: 'default'
      });
    } else {
      setStatus("Respuesta recibida pero sin documentos");
      setError("La respuesta no contiene un array de documentos en el formato esperado");
      console.warn("Respuesta de API sin documentos:", data);
    }
  } catch (err) {
    console.error("Error al comprobar API:", err);
    setStatus("Error");
    setError(err.message);
    
    // Notificar error
    toast({
      title: 'Error de conexión',
      description: err.message,
      variant: 'destructive'
    });
  }
};

/**
 * Componente de diagnóstico simplificado
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} - Componente de diagnóstico
 */
export const DiagnosticComponent = ({ toast, onSwitchMode }) => {
  const [apiStatus, setApiStatus] = useState("No comprobado");
  const [documentsTest, setDocumentsTest] = useState([]);
  const [error, setError] = useState(null);

  // Función para verificar la API
  const checkApi = () => checkDirectApiConnection(
    setApiStatus, 
    setError, 
    setDocumentsTest, 
    toast
  );

  return (
    <div className="container mx-auto p-8 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico del Gestor Documental</h1>
      
      <div className="mb-8 space-y-4">
        <div className="p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-medium mb-2">Estado de la API</h2>
          <p className="mb-2">Estado actual: 
            <span className={`font-semibold ml-2 ${
              apiStatus === "Error" ? "text-red-600" : 
              apiStatus.includes("funcionando") ? "text-green-600" : 
              "text-amber-600"
            }`}>
              {apiStatus}
            </span>
          </p>
          
          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded mb-3">
              {error}
            </div>
          )}
          
          <button 
            onClick={checkApi} 
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Verificar conexión API
          </button>
        </div>
      </div>
      
      {documentsTest.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Documentos recibidos ({documentsTest.length})</h2>
          <div className="overflow-auto max-h-[400px] border rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documentsTest.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.file_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.category_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="mt-8 flex justify-end">
        <button 
          onClick={onSwitchMode}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          Cambiar a Modo Normal
        </button>
      </div>
    </div>
  );
};