// src/page/proformas/Templates/ModernTemplate.jsx
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '../Utils/formatCurrency';

/**
 * Plantilla Moderna para la visualización de la proforma
 */
const ModernTemplate = ({ 
  clientInfo, 
  companyInfo, 
  proformaDetails, 
  items,
  financials
}) => {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-md rounded-lg print:shadow-none">
      {/* Encabezado */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Proforma</h1>
          <p className="text-gray-500 mt-1">#{proformaDetails.number}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">{companyInfo.name}</h2>
          <p className="text-gray-600">{companyInfo.address}</p>
          <p className="text-gray-600">{companyInfo.email}</p>
          <p className="text-gray-600">{companyInfo.phone}</p>
        </div>
      </div>

      {/* Información del cliente y detalles de la proforma */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="border-r pr-6">
          <h3 className="text-lg font-medium mb-2 text-gray-700">Cliente</h3>
          <h4 className="font-semibold text-gray-800">{clientInfo.name || 'N/A'}</h4>
          {clientInfo.contact && <p className="text-gray-600">Attn: {clientInfo.contact}</p>}
          {clientInfo.address && <p className="text-gray-600">{clientInfo.address}</p>}
          
          <div className="mt-2">
            {clientInfo.email && <p className="text-gray-600">{clientInfo.email}</p>}
            {clientInfo.phone && <p className="text-gray-600">{clientInfo.phone}</p>}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-700">Detalles</h3>
          <div className="grid grid-cols-2 gap-1">
            <p className="text-gray-500">Fecha:</p>
            <p className="text-gray-800">{proformaDetails.date ? format(proformaDetails.date, 'dd/MM/yyyy') : 'N/A'}</p>
            
            <p className="text-gray-500">Válido hasta:</p>
            <p className="text-gray-800">{proformaDetails.expiryDate ? format(proformaDetails.expiryDate, 'dd/MM/yyyy') : 'N/A'}</p>
            
            <p className="text-gray-500">Forma de pago:</p>
            <p className="text-gray-800">{proformaDetails.paymentTerms || 'N/A'}</p>
            
            <p className="text-gray-500">Tiempo de entrega:</p>
            <p className="text-gray-800">{proformaDetails.deliveryTime || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="mb-8 border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50">
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio Unit.</TableHead>
              <TableHead className="text-right">Desc. %</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  No hay productos añadidos a la proforma.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="border-b">
                  <TableCell className="font-mono text-sm">{item.code || '—'}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice, companyInfo.currency)}</TableCell>
                  <TableCell className="text-right">{item.discount > 0 ? `${item.discount}%` : '—'}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.total, companyInfo.currency)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Resumen y Notas */}
      <div className="flex flex-col md:flex-row md:justify-between gap-8">
        <div className="md:w-1/2">
          <h3 className="text-lg font-medium mb-2 text-gray-700">Notas</h3>
          <p className="text-gray-600 whitespace-pre-wrap p-4 border rounded-md bg-gray-50 min-h-[100px]">
            {proformaDetails.notes || 'No hay notas adicionales.'}
          </p>
        </div>
        
        <div className="md:w-1/2">
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCurrency(financials.subtotal, companyInfo.currency)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-t">
              <span className="text-gray-600">
                IVA ({(companyInfo.taxRate * 100).toFixed(0)}%):
              </span>
              <span>{formatCurrency(financials.tax, companyInfo.currency)}</span>
            </div>
            
            {financials.discount > 0 && (
              <div className="flex justify-between py-2 border-t">
                <span className="text-gray-600">Descuento:</span>
                <span>- {formatCurrency(financials.discount, companyInfo.currency)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-3 border-t font-bold text-lg">
              <span>Total:</span>
              <span className="text-blue-700">{formatCurrency(financials.total, companyInfo.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <div className="mt-16 pt-4 border-t text-center text-gray-500 text-sm">
        <p>{companyInfo.name} © {new Date().getFullYear()}</p>
        <p>
          Para cualquier consulta sobre esta proforma, por favor contacte a {companyInfo.email} o llame al {companyInfo.phone}.
        </p>
      </div>
    </div>
  );
};

export default ModernTemplate;