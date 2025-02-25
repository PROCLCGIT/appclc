// src/services/proformaDashboardService.js

const calculateSummary = (proformas) => {
    return {
      totalProformas: proformas.length,
      pendingApproval: proformas.filter(p => p.status === 'draft').length,
      sent: proformas.filter(p => p.status === 'sent').length,
      approved: proformas.filter(p => p.status === 'approved').length,
      expired: proformas.filter(p => p.status === 'expired').length,
      totalAmount: proformas
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + p.total, 0)
    };
  };
  
  const calculateTrends = (proformas) => {
    // Agrupar por fecha
    const byDate = proformas.reduce((acc, proforma) => {
      const date = proforma.date.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          count: 0,
          amount: 0,
          approvedCount: 0,
          approvedAmount: 0
        };
      }
      acc[date].count++;
      acc[date].amount += proforma.total;
      if (proforma.status === 'approved') {
        acc[date].approvedCount++;
        acc[date].approvedAmount += proforma.total;
      }
      return acc;
    }, {});
  
    // Convertir a array y ordenar
    return Object.entries(byDate)
      .map(([date, data]) => ({
        date,
        ...data
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  const calculateStatusDistribution = (proformas) => {
    const distribution = proformas.reduce((acc, proforma) => {
      if (!acc[proforma.status]) {
        acc[proforma.status] = {
          count: 0,
          amount: 0
        };
      }
      acc[proforma.status].count++;
      acc[proforma.status].amount += proforma.total;
      return acc;
    }, {});
  
    return Object.entries(distribution).map(([status, data]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      count: data.count,
      amount: data.amount
    }));
  };
  
  const calculateClientDistribution = (proformas) => {
    // Agrupar por cliente
    const byClient = proformas.reduce((acc, proforma) => {
      const clientId = proforma.client.id;
      if (!acc[clientId]) {
        acc[clientId] = {
          name: proforma.client.name,
          count: 0,
          amount: 0,
          approvedCount: 0,
          approvedAmount: 0
        };
      }
      acc[clientId].count++;
      acc[clientId].amount += proforma.total;
      if (proforma.status === 'approved') {
        acc[clientId].approvedCount++;
        acc[clientId].approvedAmount += proforma.total;
      }
      return acc;
    }, {});
  
    // Convertir a array, ordenar por monto y tomar los top 10
    return Object.values(byClient)
      .sort((a, b) => b.approvedAmount - a.approvedAmount)
      .slice(0, 10);
  };
  
  const getRecentActivity = (proformas, limit = 10) => {
    return proformas
      .map(proforma => ({
        date: proforma.updated_at,
        proformaNumber: proforma.number,
        description: getActivityDescription(proforma),
        type: proforma.status,
        amount: proforma.total,
        client: proforma.client.name,
        user: proforma.updated_by?.name
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  };
  
  const getActivityDescription = (proforma) => {
    switch (proforma.status) {
      case 'draft':
        return 'Proforma creada';
      case 'sent':
        return 'Proforma enviada al cliente';
      case 'approved':
        return 'Proforma aprobada';
      case 'expired':
        return 'Proforma expirada';
      case 'rejected':
        return 'Proforma rechazada';
      default:
        return 'Actualización de proforma';
    }
  };
  
  const calculatePerformanceMetrics = (proformas) => {
    const totalProformas = proformas.length;
    if (totalProformas === 0) return defaultPerformanceMetrics();
  
    const approvedProformas = proformas.filter(p => p.status === 'approved');
    const conversionRate = (approvedProformas.length / totalProformas) * 100;
    const averageResponseTime = calculateAverageResponseTime(proformas);
    
    const totalAmount = proformas.reduce((sum, p) => sum + p.total, 0);
    const approvedAmount = approvedProformas.reduce((sum, p) => sum + p.total, 0);
    
    return {
      conversionRate,
      averageResponseTime,
      totalAmount,
      approvedAmount,
      averageAmount: totalAmount / totalProformas,
      averageApprovedAmount: approvedProformas.length > 0 
        ? approvedAmount / approvedProformas.length 
        : 0
    };
  };
  
  const calculateAverageResponseTime = (proformas) => {
    const responseTimes = proformas
      .filter(p => p.status !== 'draft' && p.sent_date && p.updated_at)
      .map(p => {
        const sentDate = new Date(p.sent_date);
        const responseDate = new Date(p.updated_at);
        return (responseDate - sentDate) / (1000 * 60 * 60 * 24); // días
      });
  
    return responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;
  };
  
  const defaultPerformanceMetrics = () => ({
    conversionRate: 0,
    averageResponseTime: 0,
    totalAmount: 0,
    approvedAmount: 0,
    averageAmount: 0,
    averageApprovedAmount: 0
  });
  
  const filterByTimeRange = (proformas, timeRange) => {
    const now = new Date();
    const cutoffDate = new Date();
  
    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return proformas;
    }
  
    return proformas.filter(p => new Date(p.date) >= cutoffDate);
  };
  
  const generateDashboardData = (proformas, timeRange) => {
    const filteredProformas = filterByTimeRange(proformas, timeRange);
    
    return {
      summary: calculateSummary(filteredProformas),
      trends: calculateTrends(filteredProformas),
      byStatus: calculateStatusDistribution(filteredProformas),
      byClient: calculateClientDistribution(filteredProformas),
      recentActivity: getRecentActivity(filteredProformas),
      performance: calculatePerformanceMetrics(filteredProformas)
    };
  };
  
  export default {
    generateDashboardData,
    calculateSummary,
    calculateTrends,
    calculateStatusDistribution,
    calculateClientDistribution,
    getRecentActivity,
    calculatePerformanceMetrics,
    filterByTimeRange
  };