// src/pages/productos/ProductosOfertadosImportPage .jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { productosOfertadosService, categoriasService } from '@/services/api';

const ProductosOfertadosImportPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [categorias, setCategorias] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    code: '',
    cudim: '',
    nombre: '',
    descripcion: '',
    referencias: '',
    especialidad: '',
    id_categoria: '',
    is_active: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    imported: 0
  });

  // Cargar categorías al montar el componente
  useState(() => {
    const loadCategorias = async () => {
      try {
        const response = await categoriasService.getAll();
        setCategorias(response.results || []);
      } catch (err) {
        setError('Error al cargar las categorías');
        console.error(err);
      }
    };
    loadCategorias();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Asumimos que queremos la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Extraer columnas (primera fila)
          if (jsonData.length > 0) {
            const headers = jsonData[0];
            setColumns(headers);
            
            // Inicio de mapeo automático si los nombres coinciden
            const defaultMapping = {};
            const requiredFields = ['code', 'nombre'];
            
            headers.forEach((header, index) => {
              const lowerHeader = String(header).toLowerCase().trim();
              
              // Mapeo automático basado en coincidencias
              if (lowerHeader === 'codigo' || lowerHeader === 'code') {
                defaultMapping.code = index;
              } else if (lowerHeader === 'cudim') {
                defaultMapping.cudim = index;
              } else if (lowerHeader === 'nombre') {
                defaultMapping.nombre = index;
              } else if (lowerHeader === 'descripcion' || lowerHeader === 'descripción') {
                defaultMapping.descripcion = index;
              } else if (lowerHeader === 'referencias' || lowerHeader === 'refs') {
                defaultMapping.referencias = index;
              } else if (lowerHeader === 'especialidad') {
                defaultMapping.especialidad = index;
              } else if (lowerHeader === 'categoria' || lowerHeader === 'categoría' || lowerHeader === 'id_categoria') {
                defaultMapping.id_categoria = index;
              } else if (lowerHeader === 'activo' || lowerHeader === 'is_active' || lowerHeader === 'estado') {
                defaultMapping.is_active = index;
              }
            });
            
            setColumnMapping(defaultMapping);
            
            // Extraer datos para vista previa (primeras 5 filas después de los encabezados)
            const dataPreview = jsonData.slice(1, 6);
            setPreviewData(dataPreview);
            
            // Establecer estadísticas iniciales
            setStats({
              ...stats,
              total: jsonData.length - 1 // Restamos 1 por la fila de encabezados
            });
          } else {
            setError('El archivo parece estar vacío');
          }
        } catch (err) {
          console.error('Error al procesar archivo Excel:', err);
          setError('No se pudo procesar el archivo Excel. Verifique el formato.');
        }
      };
      
      reader.onerror = () => {
        setError('Error al leer el archivo');
      };
      
      reader.readAsArrayBuffer(selectedFile);
      setStep(2);
    }
  };

  const handleColumnMappingChange = (field, value) => {
    setColumnMapping({
      ...columnMapping,
      [field]: value
    });
  };

  const validateMapping = () => {
    // Verificar que al menos los campos obligatorios estén mapeados
    if (columnMapping.code === '' || columnMapping.nombre === '') {
      setError('Los campos Código y Nombre son obligatorios para la importación');
      return false;
    }
    
    setError(null);
    return true;
  };

  const processFile = async () => {
    if (!validateMapping()) return;
    
    setLoading(true);
    setStep(3);
    setError(null);
    setSuccess(null);
    
    // Registrar información inicial
    console.log('Iniciando procesamiento de archivo:', file.name);
    console.log('Mapeo de columnas:', columnMapping);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          console.log('Archivo leído correctamente, procesando Excel...');
          
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Obtener los datos
          const firstSheetName = workbook.SheetNames[0];
          console.log('Nombre de la hoja:', firstSheetName);
          
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          console.log('Datos convertidos a JSON, filas totales:', jsonData.length);
          
          // Saltamos la fila de encabezados
          const rows = jsonData.slice(1);
          console.log('Procesando', rows.length, 'filas de datos');
          
          // Registrar información de categorías
          console.log('Categorías disponibles:', categorias.length);
          
          // Categorías para mapeo por nombre
          const categoriasByName = {};
          categorias.forEach(cat => {
            categoriasByName[cat.nombre.toLowerCase().trim()] = cat.id;
          });
          
          console.log('Mapa de categorías por nombre:', categoriasByName);
          
          // Procesar los datos
          const productosValidos = [];
          const productosInvalidos = [];
          const erroresPorFila = {};
          
          rows.forEach((row, index) => {
            if (row.length === 0) {
              console.log('Fila', index + 2, 'está vacía, saltando...');
              return; // Saltar filas vacías
            }
            
            console.log('Procesando fila', index + 2, ':', row);
            
            const producto = {};
            let isValid = true;
            const erroresFila = [];
            
            // Mapear campos
            if (columnMapping.code !== '' && row[columnMapping.code] !== undefined) {
              producto.code = String(row[columnMapping.code]).trim();
            } else {
              isValid = false;
              erroresFila.push('Código es obligatorio');
            }
            
            if (columnMapping.nombre !== '' && row[columnMapping.nombre] !== undefined) {
              producto.nombre = String(row[columnMapping.nombre]).trim();
            } else {
              isValid = false;
              erroresFila.push('Nombre es obligatorio');
            }
            
            // Campos opcionales
            if (columnMapping.cudim !== '' && row[columnMapping.cudim] !== undefined) {
              producto.cudim = String(row[columnMapping.cudim]).trim();
            }
            
            if (columnMapping.descripcion !== '' && row[columnMapping.descripcion] !== undefined) {
              producto.descripcion = String(row[columnMapping.descripcion]).trim();
            }
            
            if (columnMapping.referencias !== '' && row[columnMapping.referencias] !== undefined) {
              producto.referencias = String(row[columnMapping.referencias]).trim();
            }
            
            if (columnMapping.especialidad !== '' && row[columnMapping.especialidad] !== undefined) {
              producto.especialidad = String(row[columnMapping.especialidad]).trim();
            }
            
            // Manejar categoría (puede ser ID o nombre)
            if (columnMapping.id_categoria !== '' && row[columnMapping.id_categoria] !== undefined) {
              const catValue = String(row[columnMapping.id_categoria]).trim().toLowerCase();
              console.log('Valor de categoría en fila', index + 2, ':', catValue);
              
              // Intentar encontrar por ID primero
              if (categorias.some(cat => String(cat.id) === catValue)) {
                producto.id_categoria = catValue;
                console.log('Categoría encontrada por ID:', catValue);
              } 
              // Luego intentar por nombre
              else if (categoriasByName[catValue]) {
                producto.id_categoria = categoriasByName[catValue];
                console.log('Categoría encontrada por nombre:', catValue, '→', categoriasByName[catValue]);
              }
              // Si no se encuentra, marcar como inválido
              else if (catValue !== '') {
                isValid = false;
                erroresFila.push(`Categoría no encontrada: "${row[columnMapping.id_categoria]}"`);
                console.log('Categoría no encontrada:', catValue);
              }
            }
            
            // Manejar estado
            if (columnMapping.is_active !== '' && row[columnMapping.is_active] !== undefined) {
              const activeValue = String(row[columnMapping.is_active]).toLowerCase().trim();
              console.log('Valor de estado en fila', index + 2, ':', activeValue);
              
              if (['true', '1', 'si', 'sí', 'activo', 'yes', 'y'].includes(activeValue)) {
                producto.is_active = true;
              } else if (['false', '0', 'no', 'inactivo', 'n'].includes(activeValue)) {
                producto.is_active = false;
              } else {
                producto.is_active = true; // Valor por defecto
                console.log('Usando valor por defecto para estado: true');
              }
            } else {
              producto.is_active = true; // Valor por defecto
              console.log('No se proporcionó estado, usando valor por defecto: true');
            }
            
            // Registrar el producto procesado
            console.log('Producto procesado de fila', index + 2, ':', producto);
            console.log('Es válido:', isValid);
            
            // Agregar a la lista correspondiente
            if (isValid) {
              productosValidos.push(producto);
            } else {
              productosInvalidos.push({
                rowIndex: index + 2, // +2 porque contamos desde 1 y ya saltamos la fila de encabezados
                data: row,
                errores: erroresFila
              });
              erroresPorFila[index + 2] = erroresFila;
            }
          });
          
          console.log('Productos válidos:', productosValidos.length);
          console.log('Productos inválidos:', productosInvalidos.length);
          console.log('Detalle de errores por fila:', erroresPorFila);
          
          // Actualizar estadísticas
          setStats({
            total: rows.length,
            valid: productosValidos.length,
            invalid: productosInvalidos.length,
            imported: 0
          });
          
          // Verificar si hay productos para importar
          if (productosValidos.length === 0) {
            setError('No hay productos válidos para importar. Revise el mapeo de columnas y los datos del archivo.');
            setLoading(false);
            return;
          }
          
          console.log('Comenzando importación de', productosValidos.length, 'productos...');
          
          // Importar productos válidos
          let importados = 0;
          let fallos = 0;
          const erroresImportacion = [];
          
          for (let i = 0; i < productosValidos.length; i++) {
            const producto = productosValidos[i];
            try {
              console.log('Importando producto', i + 1, ':', producto);
              
              // Hacemos una copia para mostrar claramente qué se envía a la API
              const productoParaAPI = { ...producto };
              
              // Importante: Asegurarse que el id_categoria es del tipo correcto
              // A veces el backend espera un número, no un string
              if (productoParaAPI.id_categoria) {
                productoParaAPI.id_categoria = String(productoParaAPI.id_categoria);
                // Descomenta esta línea si el backend espera números
                // productoParaAPI.id_categoria = Number(productoParaAPI.id_categoria);
              }
              
              console.log('Enviando a API:', productoParaAPI);
              
              const response = await productosOfertadosService.create(productoParaAPI);
              console.log('Respuesta de API:', response);
              
              importados++;
              
              // Actualizar estadísticas de importación en tiempo real
              setStats(prev => ({
                ...prev,
                imported: importados
              }));
            } catch (err) {
              fallos++;
              console.error('Error al importar producto', i + 1, ':', err);
              erroresImportacion.push({
                producto,
                error: err.message || 'Error desconocido'
              });
            }
          }
          
          console.log('Importación finalizada.');
          console.log('Productos importados:', importados);
          console.log('Fallos de importación:', fallos);
          console.log('Detalle de errores de importación:', erroresImportacion);
          
          if (fallos > 0) {
            let errorMsg = `Se importaron ${importados} de ${productosValidos.length} productos. `;
            errorMsg += `Hubo ${fallos} productos que no pudieron ser importados.`;
            
            if (erroresImportacion.length > 0 && erroresImportacion[0].error) {
              errorMsg += ` Primer error: ${erroresImportacion[0].error}`;
            }
            
            setError(errorMsg);
            setSuccess(null);
          } else {
            setSuccess(`Se importaron ${importados} productos exitosamente.`);
            setError(null);
          }
        } catch (err) {
          console.error('Error en el procesamiento del archivo:', err);
          setError('Error al procesar el archivo: ' + (err.message || 'Error desconocido'));
          setSuccess(null);
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = (err) => {
        console.error('Error al leer el archivo:', err);
        setError('Error al leer el archivo: ' + (err?.target?.error?.message || 'Error desconocido'));
        setLoading(false);
      };
      
      console.log('Iniciando lectura del archivo...');
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error general en processFile:', err);
      setError('Error al procesar el archivo: ' + (err.message || 'Error desconocido'));
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setColumns([]);
    setColumnMapping({
      code: '',
      cudim: '',
      nombre: '',
      descripcion: '',
      referencias: '',
      especialidad: '',
      id_categoria: '',
      is_active: ''
    });
    setError(null);
    setSuccess(null);
    setStep(1);
    setStats({
      total: 0,
      valid: 0,
      invalid: 0,
      imported: 0
    });
  };

  const renderFileUpload = () => (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg border border-dashed border-gray-300 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
            Seleccionar archivo Excel
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Solo archivos Excel (.xlsx, .xls)
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              El archivo debe contener columnas para Código y Nombre como mínimo.
              Otros campos recomendados: CUDIM, Descripción, Referencias, Especialidad, Categoría y Estado.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-medium mb-2">Plantilla de ejemplo</h3>
        <p className="text-sm text-gray-600 mb-3">
          Puedes descargar esta plantilla para usarla como base:
        </p>
        <button
          className="text-blue-600 hover:text-blue-800 flex items-center"
          onClick={() => downloadTemplate()}
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Descargar plantilla Excel
        </button>
      </div>
    </div>
  );

  const downloadTemplate = () => {
    // Crear un libro de trabajo
    const wb = XLSX.utils.book_new();
    
    // Datos de muestra
    const headers = ['Codigo', 'CUDIM', 'Nombre', 'Descripcion', 'Referencias', 'Especialidad', 'Categoria', 'Estado'];
    const sampleData = [
      ['PRD001', 'CUD001', 'Producto de ejemplo 1', 'Descripción del producto 1', 'Referencias adicionales', 'Cardiología', 'Medicamentos', 'Activo'],
      ['PRD002', 'CUD002', 'Producto de ejemplo 2', 'Descripción del producto 2', '', 'Pediatría', 'Dispositivos', 'Inactivo']
    ];
    
    // Combinar headers y data
    const wsData = [headers, ...sampleData];
    
    // Crear hoja de cálculo
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    
    // Descargar el archivo
    XLSX.writeFile(wb, 'plantilla_productos_ofertados.xlsx');
  };

  const renderColumnMapping = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Mapeo de columnas</h3>
      
      {file && (
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <svg className="w-5 h-5 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Archivo seleccionado: <span className="font-medium ml-1">{file.name}</span>
        </div>
      )}
      
      <div className="bg-white border rounded-md overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h4 className="font-medium">Vista previa de datos</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {previewData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {cell !== undefined && cell !== null ? String(cell) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white border rounded-md overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h4 className="font-medium">Asignar campos</h4>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona qué columna del archivo corresponde a cada campo en el sistema.
            Los campos marcados con * son obligatorios.
          </p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código *
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
              value={columnMapping.code}
              onChange={(e) => handleColumnMappingChange('code', e.target.value)}
              required
            >
              <option value="">Seleccionar columna</option>
              {columns.map((column, index) => (
                <option key={index} value={index}>
                  {column}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CUDIM
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
              value={columnMapping.cudim}
              onChange={(e) => handleColumnMappingChange('cudim', e.target.value)}
            >
              <option value="">Seleccionar columna</option>
              {columns.map((column, index) => (
                <option key={index} value={index}>
                  {column}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
              value={columnMapping.nombre}
              onChange={(e) => handleColumnMappingChange('nombre', e.target.value)}
              required
            >
              <option value="">Seleccionar columna</option>
              {columns.map((column, index) => (
                <option key={index} value={index}>
                  {column}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
              value={columnMapping.descripcion}
              onChange={(e) => handleColumnMappingChange('descripcion', e.target.value)}
            >
              <option value="">Seleccionar columna</option>
              {columns.map((column, index) => (
                <option key={index} value={index}>
                  {column}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referencias
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
              value={columnMapping.referencias}
              onChange={(e) => handleColumnMappingChange('referencias', e.target.value)}
            >
              <option value="">Seleccionar columna</option>
              {columns.map((column, index) => (
                <option key={index} value={index}>
                  {column}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidad
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
              value={columnMapping.especialidad}
              onChange={(e) => handleColumnMappingChange('especialidad', e.target.value)}
            >
              <option value="">Seleccionar columna</option>
              {columns.map((column, index) => (
                <option key={index} value={index}>
                  {column}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
              value={columnMapping.id_categoria}
              onChange={(e) => handleColumnMappingChange('id_categoria', e.target.value)}
            >
              <option value="">Seleccionar columna</option>
              {columns.map((column, index) => (
                <option key={index} value={index}>
                  {column}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado (Activo/Inactivo)
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
              value={columnMapping.is_active}
              onChange={(e) => handleColumnMappingChange('is_active', e.target.value)}
            >
              <option value="">Seleccionar columna</option>
              {columns.map((column, index) => (
                <option key={index} value={index}>
                  {column}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderImportProcess = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Importando productos</h3>
      
      <div className="bg-white border rounded-md overflow-hidden">
        <div className="p-4">
          <h4 className="font-medium">Progreso de importación</h4>
          
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                    Progreso
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-purple-600">
                    {stats.imported} de {stats.valid}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                <div
                  style={{ width: `${stats.valid > 0 ? (stats.imported / stats.valid) * 100 : 0}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                ></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-500">Total de filas</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-500">Productos válidos</p>
              <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-500">Productos inválidos</p>
              <p className="text-2xl font-bold text-red-600">{stats.invalid}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-500">Importados</p>
              <p className="text-2xl font-bold text-purple-600">{stats.imported}</p>
            </div>
          </div>
          
          {success && (
            <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="flex justify-center items-center mt-4">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Importando productos...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Importar Productos desde Excel</h2>
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
            onClick={() => navigate('/productos/ofertados')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="mr-1">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver
          </button>
        </div>
      </div>

      <div className="border-b">
        <div className="flex">
          <button
            className={`px-4 py-2 font-medium ${
              step === 1 
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500'
            }`}
          >
            1. Seleccionar archivo
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              step === 2 
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500'
            }`}
          >
            2. Mapear columnas
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              step === 3 
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500'
            }`}
          >
            3. Importar datos
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {error && step !== 3 && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {step === 1 && renderFileUpload()}
        {step === 2 && renderColumnMapping()}
        {step === 3 && renderImportProcess()}
        
        <div className="mt-6 flex justify-between">
          <div>
            {step > 1 && (
              <button
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                Anterior
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={handleReset}
              disabled={loading}
            >
              Reiniciar
            </button>
            
            {step === 1 && file && (
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-sm text-sm font-medium"
                onClick={() => setStep(2)}
              >
                Continuar
              </button>
            )}
            
            {step === 2 && (
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-sm text-sm font-medium"
                onClick={processFile}
              >
                Importar Datos
              </button>
            )}
            
            {step === 3 && !loading && (
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-sm text-sm font-medium"
                onClick={() => navigate('/productos/ofertados')}
              >
                Finalizar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductosOfertadosImportPage;