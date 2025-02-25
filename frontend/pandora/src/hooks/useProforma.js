// src/hooks/useProforma.js
import { useState } from 'react';
import axios from 'axios';

const useProforma = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProformas = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`/api/proformas/?${params.toString()}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar las proformas');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchProformaById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/proformas/${id}/`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar la proforma');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createProforma = async (proformaData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/proformas/', proformaData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la proforma');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProforma = async (id, proformaData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/proformas/${id}/`, proformaData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la proforma');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changeProformaStatus = async (id, action, data = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`/api/proformas/${id}/${action}/`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || `Error al ${action} la proforma`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveProforma = (id) => changeProformaStatus(id, 'approve');
  const rejectProforma = (id, reason) => changeProformaStatus(id, 'reject', { reason });
  const sendProforma = (id) => changeProformaStatus(id, 'send');

  const getDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/proformas/dashboard/');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar estadísticas');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchProformas,
    fetchProformaById,
    createProforma,
    updateProforma,
    approveProforma,
    rejectProforma,
    sendProforma,
    getDashboardStats
  };
};

export default useProforma;