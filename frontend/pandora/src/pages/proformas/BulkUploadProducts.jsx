// src/components/proformas/BulkUploadProducts.jsx
import { useState } from 'react';
import * as XLSX from 'xlsx';

const BulkUploadProducts = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const data = await readExcelFile(file);
      if (validateData(data)) {
        onUpload(formatData(data));
      }
    } catch (err) {
      setError('Error al procesar el archivo. Asegúrese de usar la plantilla correcta.');
    } finally {
      setUploading(false);
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  const validateData = (data) => {
    const requiredFields = ['codigo', 'cantidad', 'precio'];
    return data.every(row => 
      requiredFields.every(field => row[field] !== undefined)
    );
  };

  const formatData = (data) => {
    return data.map(row => ({
      product: row.codigo,
      quantity: parseInt(row.cantidad),
      unit_price: parseFloat(row.precio),
      discount_percentage: parseFloat(row.descuento || 0),
      description: row.descripcion || ''
    }));
  };

  const downloadTemplate = () => {
    const template = [
      {
        codigo: 'PROD001',
        cantidad: 1,
        precio: 100,
        descuento: 0,
        descripcion: 'Ejemplo de producto'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, 'plantilla_productos.xlsx');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Carga Masiva de Productos</h3>
        <button
          className="text-purple-600 hover:text-purple-800"
          onClick={downloadTemplate}
        >
          Descargar Plantilla
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-block"
        >
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M24 8v24m0-24L16 16m8-8l8 8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="text-purple-600 hover:text-purple-800">
                Seleccionar archivo
              </span>
              {' '}o arrastrar y soltar
            </div>
            <p className="text-xs text-gray-500">
              Excel (.xlsx, .xls)
            </p>
          </div>
        </label>
      </div>

      {uploading && (
        <div className="mt-4 text-center text-gray-600">
          Procesando archivo...
        </div>
      )}

      {error && (
        <div className="mt-4 text-center text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default BulkUploadProducts;