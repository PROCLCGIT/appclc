// src/services/proformaApprovalService.js

const validateApprovalRules = (proforma, user, approvalLevels) => {
    // Validar que la proforma esté en estado válido para aprobación
    if (proforma.status !== 'pending' && proforma.status !== 'in_review') {
      return {
        valid: false,
        error: 'La proforma no está en estado válido para aprobación'
      };
    }
  
    // Obtener el siguiente nivel de aprobación necesario
    const nextLevel = approvalLevels.find(level => level.level === proforma.approval_level + 1);
    if (!nextLevel) {
      return {
        valid: false,
        error: 'No hay más niveles de aprobación disponibles'
      };
    }
  
    // Verificar si el usuario tiene el rol necesario para aprobar
    const hasRequiredRole = nextLevel.roles.some(role => user.roles.includes(role));
    if (!hasRequiredRole) {
      return {
        valid: false,
        error: 'No tiene los permisos necesarios para aprobar este nivel'
      };
    }
  
    // Verificar reglas específicas por nivel
    const levelRules = validateLevelSpecificRules(proforma, nextLevel);
    if (!levelRules.valid) {
      return levelRules;
    }
  
    return { valid: true };
  };
  
  const validateLevelSpecificRules = (proforma, level) => {
    switch (level.type) {
      case 'amount':
        return validateAmountRules(proforma, level);
      case 'margin':
        return validateMarginRules(proforma, level);
      case 'discount':
        return validateDiscountRules(proforma, level);
      default:
        return { valid: true };
    }
  };
  
  const validateAmountRules = (proforma, level) => {
    if (proforma.total > level.maxAmount) {
      return {
        valid: false,
        error: `El monto total excede el límite permitido para este nivel (${level.maxAmount})`
      };
    }
    return { valid: true };
  };
  
  const validateMarginRules = (proforma, level) => {
    const margin = calculateMargin(proforma);
    if (margin < level.minMargin) {
      return {
        valid: false,
        error: `El margen está por debajo del mínimo permitido para este nivel (${level.minMargin}%)`
      };
    }
    return { valid: true };
  };
  
  const validateDiscountRules = (proforma, level) => {
    const maxDiscount = Math.max(...proforma.items.map(item => item.discount_percentage));
    if (maxDiscount > level.maxDiscount) {
      return {
        valid: false,
        error: `El descuento máximo excede lo permitido para este nivel (${level.maxDiscount}%)`
      };
    }
    return { valid: true };
  };
  
  const calculateMargin = (proforma) => {
    const totalCost = proforma.items.reduce((sum, item) => 
      sum + (item.quantity * item.cost_price), 0);
    return ((proforma.total - totalCost) / proforma.total) * 100;
  };
  
  const getApprovalRequirements = (proforma, approvalLevels) => {
    const currentLevel = proforma.approval_level || 0;
    const remainingLevels = approvalLevels.filter(level => level.level > currentLevel);
  
    return remainingLevels.map(level => ({
      level: level.level,
      name: level.name,
      roles: level.roles,
      requirements: getRequirementsForLevel(level),
      current: level.level === currentLevel + 1
    }));
  };
  
  const getRequirementsForLevel = (level) => {
    const requirements = [];
  
    if (level.maxAmount) {
      requirements.push(`Monto máximo: S/ ${level.maxAmount.toLocaleString()}`);
    }
    if (level.minMargin) {
      requirements.push(`Margen mínimo: ${level.minMargin}%`);
    }
    if (level.maxDiscount) {
      requirements.push(`Descuento máximo: ${level.maxDiscount}%`);
    }
  
    return requirements;
  };
  
  const generateApprovalEmailContent = (proforma, level, action, comment) => {
    const subject = `Proforma #${proforma.number} - ${action === 'approved' ? 'Aprobada' : 'Rechazada'} (Nivel ${level})`;
    
    let content = `
      <h2>Actualización de Estado de Proforma</h2>
      <p>La proforma #${proforma.number} ha sido ${action === 'approved' ? 'aprobada' : 'rechazada'} en el nivel ${level}.</p>
      
      <h3>Detalles de la Proforma</h3>
      <ul>
        <li>Cliente: ${proforma.client_name}</li>
        <li>Monto Total: S/ ${proforma.total.toLocaleString()}</li>
        <li>Fecha: ${new Date(proforma.date).toLocaleDateString()}</li>
      </ul>
    `;
  
    if (comment) {
      content += `
        <h3>Comentarios</h3>
        <p>${comment}</p>
      `;
    }
  
    return { subject, content };
  };
  
  const getNextApprovers = (proforma, approvalLevels, users) => {
    const nextLevel = approvalLevels.find(level => level.level === proforma.approval_level + 1);
    if (!nextLevel) return [];
  
    return users.filter(user => 
      nextLevel.roles.some(role => user.roles.includes(role))
    );
  };
  
  const getApprovalAuditData = (proforma, user, action, comment) => {
    return {
      proforma_id: proforma.id,
      user_id: user.id,
      action,
      comment,
      level: proforma.approval_level + 1,
      date: new Date().toISOString(),
      metadata: {
        proforma_amount: proforma.total,
        user_role: user.roles[0],
        client_id: proforma.client_id,
        items_count: proforma.items.length,
        has_discounts: proforma.items.some(item => item.discount_percentage > 0)
      }
    };
  };
  
  const processApproval = async (proforma, user, action, comment, approvalLevels) => {
    // Validar reglas de aprobación
    const validationResult = validateApprovalRules(proforma, user, approvalLevels);
    if (!validationResult.valid) {
      throw new Error(validationResult.error);
    }
  
    // Determinar si es la última aprobación necesaria
    const isLastLevel = proforma.approval_level + 1 === approvalLevels.length;
  
    // Actualizar estado de la proforma
    const newStatus = action === 'approved'
      ? (isLastLevel ? 'approved' : 'in_review')
      : 'rejected';
  
    // Preparar datos de auditoría
    const auditData = getApprovalAuditData(proforma, user, action, comment);
  
    // Preparar notificación por email
    const emailData = generateApprovalEmailContent(
      proforma,
      proforma.approval_level + 1,
      action,
      comment
    );
  
    // Si no es la última aprobación, obtener próximos aprobadores
    let nextApprovers = [];
    if (action === 'approved' && !isLastLevel) {
      nextApprovers = getNextApprovers(proforma, approvalLevels);
    }
  
    return {
      newStatus,
      auditData,
      emailData,
      nextApprovers,
      isLastLevel
    };
  };
  
  const getApprovalStats = (proformas) => {
    return {
      total: proformas.length,
      approved: proformas.filter(p => p.status === 'approved').length,
      rejected: proformas.filter(p => p.status === 'rejected').length,
      pending: proformas.filter(p => ['pending', 'in_review'].includes(p.status)).length,
      averageApprovalTime: calculateAverageApprovalTime(proformas),
      approvalRateByLevel: calculateApprovalRateByLevel(proformas)
    };
  };
  
  const calculateAverageApprovalTime = (proformas) => {
    const approvedProformas = proformas.filter(p => p.status === 'approved');
    if (approvedProformas.length === 0) return 0;
  
    const totalTime = approvedProformas.reduce((sum, p) => {
      const start = new Date(p.created_at);
      const end = new Date(p.approved_at);
      return sum + (end - start);
    }, 0);
  
    return totalTime / approvedProformas.length / (1000 * 60 * 60); // Convertir a horas
  };
  
  const calculateApprovalRateByLevel = (proformas) => {
    const levelStats = {};
  
    proformas.forEach(p => {
      p.approval_history.forEach(h => {
        if (!levelStats[h.level]) {
          levelStats[h.level] = { total: 0, approved: 0 };
        }
        levelStats[h.level].total++;
        if (h.action === 'approved') {
          levelStats[h.level].approved++;
        }
      });
    });
  
    return Object.entries(levelStats).map(([level, stats]) => ({
      level: parseInt(level),
      rate: (stats.approved / stats.total) * 100
    }));
  };
  
  export default {
    validateApprovalRules,
    getApprovalRequirements,
    generateApprovalEmailContent,
    getNextApprovers,
    getApprovalAuditData,
    processApproval,
    getApprovalStats,
    calculateAverageApprovalTime,
    calculateApprovalRateByLevel
  };