// src/components/proformas/ProformaPreview.jsx
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const ProformaPreview = ({ data }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value);
  };

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.unit_price;
    const discount = subtotal * (item.discount_percentage / 100);
    return subtotal - discount;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">Vista Previa de Proforma</h3>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          onClick={handlePrint}
        >
          Imprimir
        </button>
      </div>

      <div className="p-8" ref={componentRef}>
        {/* Encabezado */}
        <div className="flex justify-between mb-8">
          <div>
            <img src="/logo.png" alt="Logo" className="h-16" />
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-gray-800">PROFORMA</h2>
              <p className="text-gray-600">#{data.number}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">Fecha: {new Date(data.date).toLocaleDateString()}</p>
            <p className="text-gray-600">Válido hasta: {new Date(data.valid_until).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Información del Cliente */}
        <div className="mb-8 grid grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium mb-2">Cliente</h4>
            <div className="text-gray-600">
              <p className="font-medium">{data.client_detail?.nombre}</p>
              <p>{data.client_detail?.ruc}</p>
              <p>{data.client_detail?.direccion}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Condiciones Comerciales</h4>
            <div className="text-gray-600">
              <p><span className="font-medium">Términos de pago:</span> {data.payment_terms}</p>
              <p><span className="font-medium">Tiempo de entrega:</span> {data.delivery_time}</p>
            </div>
          </div>
        </div>

        {/* Tabla de Items */}
        <div className="mb-8 overflow-hidden border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descripción
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Precio Unit.
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Descuento
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {item.discount_percentage}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(calculateItemTotal(item))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="mb-8">
          <div className="flex justify-end space-y-2">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>{formatCurrency(data.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">IGV (18%):</span>
                <span>{formatCurrency(data.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notas y Términos */}
        <div className="space-y-4 text-sm text-gray-600">
          {data.notes && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
              <p>{data.notes}</p>
            </div>
          )}
          {data.terms_conditions && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Términos y Condiciones</h4>
              <p>{data.terms_conditions}</p>
            </div>
          )}
        </div>

        {/* Pie de página */}
        <div className="mt-8 pt-8 border-t text-center text-gray-500 text-sm">
          <p>Gracias por su preferencia</p>
          <p>Para cualquier consulta, por favor contacte a su vendedor asignado</p>
          <p>{data.sales_person_name}</p>
        </div>
      </div>
    </div>
  );
};

export default ProformaPreview;