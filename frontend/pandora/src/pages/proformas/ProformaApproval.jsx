// src/components/proformas/ProformaApproval.jsx
import { useState, useEffect } from 'react';

const ProformaApproval = ({ proformaId }) => {
  const [proforma, setProforma] = useState(null);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [approvalLevels, setApprovalLevels] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProformaData();
    fetchCurrentUser();
  }, [proformaId]);

  const fetchProformaData = async () => {
    try {
      setLoading(true);
      const [proformaResponse, historyResponse, levelsResponse] = await Promise.all([
        fetch(`/api/proformas/${proformaId}/`),
        fetch(`/api/proformas/${proformaId}/approval-history/`),
        fetch('/api/approval-levels/')
      ]);

      const [proformaData, historyData, levelsData] = await Promise.all([
        proformaResponse.json(),
        historyResponse.json(),
        levelsResponse.json()
      ]);

      setProforma(proformaData);
      setApprovalHistory(historyData);
      setApprovalLevels(levelsData);
    } catch (error) {
      console.error('Error fetching proforma data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/current-user/');
      const userData = await response.json();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleApprove = async () => {
    try {
      await fetch(`/api/proformas/${proformaId}/approve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      });
      
      fetchProformaData();
      setComment('');
    } catch (error) {
      console.error('Error approving proforma:', error);
    }
  };

  const handleReject = async () => {
    try {
      await fetch(`/api/proformas/${proformaId}/reject/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      });
      
      fetchProformaData();
      setComment('');
    } catch (error) {
      console.error('Error rejecting proforma:', error);
    }
  };

  const canApprove = () => {
    if (!currentUser || !proforma) return false;
    
    const nextLevel = getNextApprovalLevel();
    if (!nextLevel) return false;

    return nextLevel.roles.some(role => currentUser.roles.includes(role));
  };

  const getNextApprovalLevel = () => {
    if (!proforma || !approvalLevels.length) return null;

    const currentLevel = proforma.approval_level || 0;
    return approvalLevels.find(level => level.level === currentLevel + 1);
  };

  const renderApprovalStatus = () => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium mb-4">Estado de Aprobación</h3>
      
      <div className="flex items-center space-x-4 mb-6">
        {approvalLevels.map((level, index) => (
          <div
            key={level.id}
            className="flex items-center"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              proforma.approval_level > level.level
                ? 'bg-green-100 text-green-600'
                : proforma.approval_level === level.level
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-gray-100 text-gray-400'
            }`}>
              {proforma.approval_level > level.level ? '✓' : level.level}
            </div>
            
            {index < approvalLevels.length - 1 && (
              <div className="w-12 h-0.5 bg-gray-200" />
            )}
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-600">
        {proforma.status === 'approved' ? (
          <div className="text-green-600">
            Proforma aprobada completamente
          </div>
        ) : proforma.status === 'rejected' ? (
          <div className="text-red-600">
            Proforma rechazada
          </div>
        ) : (
          <div>
            Pendiente de aprobación - Nivel {proforma.approval_level + 1}
          </div>
        )}
      </div>
    </div>
  );

  const renderApprovalHistory = () => (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-6 border-b">
        <h3 className="text-lg font-medium">Historial de Aprobaciones</h3>
      </div>
      
      <div className="divide-y">
        {approvalHistory.map((entry, index) => (
          <div key={index} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">
                  {entry.user.name} - {entry.action}
                </div>
                <div className="text-sm text-gray-600">
                  {entry.comment}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(entry.date).toLocaleString()}
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-sm ${
                entry.action === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {entry.action}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderApprovalActions = () => {
    if (!canApprove()) return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Acción de Aprobación</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentarios
            </label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ingrese sus comentarios..."
            />
          </div>

          <div className="flex space-x-4">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              onClick={handleApprove}
            >
              Aprobar
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              onClick={handleReject}
            >
              Rechazar
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderApprovalStatus()}
      {renderApprovalHistory()}
      {renderApprovalActions()}
    </div>
  );
};

export default ProformaApproval;