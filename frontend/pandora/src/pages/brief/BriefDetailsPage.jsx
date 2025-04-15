import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Search, UserPlus, Edit, Clock, ArrowLeft, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { briefService, briefItemsService } from '@/services/api';
import './BriefDetails.css';

const BriefDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [brief, setBrief] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Client and unit references
  const [clientName, setClientName] = useState('');
  const [unitNames, setUnitNames] = useState({});

  useEffect(() => {
    const fetchBriefDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch brief and its items
        const [briefData, itemsData] = await Promise.all([
          briefService.getById(id),
          briefItemsService.getByBrief(id)
        ]);
        
        // Set client name directly if available in response
        if (briefData.cliente_nombre) {
          setClientName(briefData.cliente_nombre);
        } else if (briefData.cliente) {
          try {
            const clientData = await fetch(`/api/v1/pandora/clientes/${briefData.cliente}/`);
            if (clientData.ok) {
              const clientJson = await clientData.json();
              setClientName(clientJson.nombre);
            }
          } catch (clientErr) {
            console.error('Error fetching client details:', clientErr);
          }
        }
        
        // Get unit data for each item
        const uniqueUnitIds = [...new Set(itemsData.map(item => item.unidad))];
        const unitMap = {};
        
        // Try to use unidad_nombre from response first if available
        itemsData.forEach(item => {
          if (item.unidad_nombre) {
            unitMap[item.unidad] = item.unidad_nombre;
          }
        });
        
        // For any missing unit names, fetch them
        const missingUnitIds = uniqueUnitIds.filter(id => !unitMap[id]);
        if (missingUnitIds.length > 0) {
          try {
            for (const unitId of missingUnitIds) {
              try {
                const unitResponse = await fetch(`/api/v1/pandora/unidades/${unitId}/`);
                if (unitResponse.ok) {
                  const unitData = await unitResponse.json();
                  unitMap[unitId] = unitData.nombre;
                }
              } catch (e) {
                unitMap[unitId] = 'Desconocida';
              }
            }
          } catch (unitErr) {
            console.error('Error fetching unit details:', unitErr);
          }
        }
        
        setBrief(briefData);
        setItems(itemsData);
        setUnitNames(unitMap);
      } catch (err) {
        console.error('Error fetching brief details:', err);
        setError('No se pudo cargar los detalles del brief. Por favor, inténtelo de nuevo.');
        toast.error('Error al cargar los detalles del brief');
      } finally {
        setLoading(false);
      }
    };

    fetchBriefDetails();
  }, [id]);

  // Use formatDate from utils.js

  // Format currency as $X,XXX.XX
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    navigate(`/briefs/edit/${id}`);
  };

  const handleExportPDF = async () => {
    try {
      toast.info('Generando PDF...');
      await briefService.exportPdf(id);
      toast.success('PDF generado correctamente');
    } catch (err) {
      console.error('Error exporting brief to PDF:', err);
      toast.error('Error al generar el PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="brief-details-error">
        <h3>Error</h3>
        <p>{error || 'No se pudo cargar el brief solicitado'}</p>
        <button 
          className="back-button"
          onClick={() => navigate('/briefs')}
        >
          <ArrowLeft size={18} />
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="brief-card-container">
      <div className="brief-nav print-hide">
        <button 
          className="back-button"
          onClick={() => navigate('/briefs')}
        >
          <ArrowLeft size={18} />
          Volver
        </button>
      </div>
      
      <div className="brief-card">
        <div className="brief-card-header">
          <div className="brief-card-title">
            <FileText size={24} className="brief-icon" />
            <h2>Brief</h2>
          </div>
          
          <div className="brief-card-actions print-hide">
            <button className="icon-button" title="Buscar">
              <Search size={20} />
            </button>
            <button className="icon-button" title="Nuevo">
              <UserPlus size={20} />
            </button>
            <button className="icon-button" title="Editar" onClick={handleEdit}>
              <Edit size={20} />
            </button>
            <button className="icon-button" title="Historial">
              <Clock size={20} />
            </button>
          </div>
        </div>
        
        <div className="brief-card-body">
          <div className="info-row">
            <div className="info-label">Código:</div>
            <div className="info-value">{brief.codigo}</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Fecha:</div>
            <div className="info-value">{formatDate(brief.fecha)}</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Cliente:</div>
            <div className="info-value">{clientName || 'No especificado'}</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Origen:</div>
            <div className="info-value">{brief.origen}</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Presupuesto Ref.:</div>
            <div className="info-value">{formatCurrency(brief.presupuestoref)}</div>
          </div>
          
          <div className="info-row">
            <div className="info-label">Observaciones:</div>
            <div className="info-value observations">{brief.observaciones || 'Sin observaciones'}</div>
          </div>
        </div>
      </div>
      
      <div className="brief-items-section">
        <h3>Ítems del Brief</h3>
        
        {items.length === 0 ? (
          <div className="no-items-message">
            No hay ítems asociados a este brief
          </div>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.nombre}</td>
                  <td>{item.descripcion || 'Sin descripción'}</td>
                  <td>{unitNames[item.unidad] || 'Desconocida'}</td>
                  <td className="text-right">{item.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="brief-actions-footer print-hide">
        <button 
          className="action-button export-button"
          onClick={handleExportPDF}
        >
          <Download size={18} />
          Exportar PDF
        </button>
        
        <button 
          className="action-button print-button"
          onClick={handlePrint}
        >
          <Printer size={18} />
          Imprimir
        </button>
      </div>
    </div>
  );
};

export default BriefDetailsPage;