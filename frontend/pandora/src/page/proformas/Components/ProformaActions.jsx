// src/page/proformas/Components/ProformaActions.jsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { saveProforma, generateProformaPDF } from '../Services/proformaService';
import { Save, Printer, FileDown, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * Componente para las acciones de la proforma (guardar, imprimir, exportar)
 */
const ProformaActions = ({ proforma }) => {
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Función para guardar la proforma
  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await saveProforma(proforma);
      console.log('Proforma guardada:', result);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error al guardar la proforma:', error);
      setErrorMessage(error.message || 'Ha ocurrido un error al guardar la proforma');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  // Función para generar PDF
  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const pdfBlob = await generateProformaPDF(proforma);
      
      // Crear URL para el blob y descargar
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Proforma-${proforma.proformaDetails.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setErrorMessage(error.message || 'Ha ocurrido un error al generar el PDF');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  // Función para imprimir
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex justify-end space-x-2 mt-6">
      <Button 
        variant="outline" 
        onClick={handlePrint}
        disabled={loading}
      >
        <Printer className="h-4 w-4 mr-2" /> Imprimir
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleGeneratePDF}
        disabled={loading}
      >
        <FileDown className="h-4 w-4 mr-2" /> Exportar PDF
      </Button>
      
      <Button 
        onClick={handleSave}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Guardando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" /> Guardar Proforma
          </>
        )}
      </Button>

      {/* Diálogo de éxito */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Proforma guardada con éxito
            </AlertDialogTitle>
            <AlertDialogDescription>
              La proforma se ha guardado correctamente y está lista para ser compartida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de error */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Error
            </AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Cerrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProformaActions;