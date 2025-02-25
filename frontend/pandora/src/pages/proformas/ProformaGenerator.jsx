// src/components/proformas/ProformaGenerator.jsx

import { useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import ProformaPDF from './ProformaPDF';

/**
 * Componente para generar, previsualizar y enviar una Proforma por email.
 *
 * @param {Object}   props
 * @param {Object}   props.proformaData  - Datos de la proforma (client, number, items, etc.)
 * @param {Function} props.onSend        - Función asíncrona para manejar el envío de correo
 */
const ProformaGenerator = ({ proformaData, onSend }) => {
  // 1) Chequeo inicial: si no hay data, mostramos un mensaje (o un spinner)
  if (!proformaData) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Cargando datos de la proforma...</p>
      </div>
    );
  }

  // 2) Estado para el formulario de correo
  const [emailSettings, setEmailSettings] = useState({
    to: proformaData?.client?.email || '',
    cc: '',
    subject: `Proforma #${proformaData?.number || ''}`,
    message: `Estimado cliente,\n\nAdjunto encontrará la proforma solicitada.\n\nSaludos cordiales.`
  });

  // 3) Manejo de vista previa y envío
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  /**
   * Llama a la función onSend recibida por props para enviar el correo,
   * pasando la información de emailSettings y la ID de la proforma.
   */
  const handleSendEmail = async () => {
    try {
      setSending(true);
      await onSend({
        ...emailSettings,
        proformaId: proformaData.id
      });
      // Aquí podrías mostrar un toast de éxito (p.ej. con react-hot-toast)
    } catch (error) {
      // Manejar error (toast de error, log, etc.)
      console.error('Error sending proforma:', error);
    } finally {
      setSending(false);
    }
  };

  /**
   * Renderiza el formulario de correo (Para, CC, Asunto, Mensaje).
   */
  const renderEmailForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Para
        </label>
        <input
          type="email"
          className="w-full p-2 border rounded-md"
          value={emailSettings.to}
          onChange={(e) =>
            setEmailSettings((prev) => ({ ...prev, to: e.target.value }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CC
        </label>
        <input
          type="email"
          className="w-full p-2 border rounded-md"
          value={emailSettings.cc}
          onChange={(e) =>
            setEmailSettings((prev) => ({ ...prev, cc: e.target.value }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asunto
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded-md"
          value={emailSettings.subject}
          onChange={(e) =>
            setEmailSettings((prev) => ({ ...prev, subject: e.target.value }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje
        </label>
        <textarea
          className="w-full p-2 border rounded-md"
          rows={4}
          value={emailSettings.message}
          onChange={(e) =>
            setEmailSettings((prev) => ({ ...prev, message: e.target.value }))
          }
        />
      </div>
    </div>
  );

  /**
   * Renderiza las acciones: descargar PDF, enviar email, y vista previa.
   */
  const renderActions = () => (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
      {/* Botón Descargar PDF */}
      <PDFDownloadLink
        document={<ProformaPDF data={proformaData} />}
        fileName={`proforma_${proformaData.number || 'sin_numero'}.pdf`}
        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-center"
      >
        {({ loading }) => (loading ? 'Generando PDF...' : 'Descargar PDF')}
      </PDFDownloadLink>

      {/* Botón Enviar por Email */}
      <button
        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={handleSendEmail}
        disabled={sending}
      >
        {sending ? 'Enviando...' : 'Enviar por Email'}
      </button>

      {/* Botón Vista Previa */}
      <button
        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        onClick={() => setShowPreview((prev) => !prev)}
      >
        {showPreview ? 'Ocultar Vista Previa' : 'Vista Previa'}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Bloque para el formulario de Email */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Envío de Proforma</h3>
        {renderEmailForm()}
      </div>

      {/* Bloque de Acciones (descarga PDF, enviar email, vista previa) */}
      <div className="bg-white p-6 rounded-lg shadow">
        {renderActions()}
      </div>

      {/* Bloque de Vista Previa del PDF */}
      {showPreview && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Vista Previa</h3>
          </div>
          <div className="h-screen">
            <PDFViewer width="100%" height="100%">
              <ProformaPDF data={proformaData} />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProformaGenerator;
