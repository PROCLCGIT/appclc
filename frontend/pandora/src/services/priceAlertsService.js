// src/services/priceAlertsService.js

export const generatePriceAlerts = (prices, settings = {}) => {
    const alerts = [];
    const {
      priceChangeThreshold = 5,
      competitorChangeThreshold = 5,
      minimumMargin = 15,
      marketShareAlert = true,
      marginAlert = true
    } = settings;
  
    // Analizar cambios en nuestros precios
    prices.forEach((price, index) => {
      if (index === 0) return;
  
      const previousPrice = prices[index - 1];
      const change = ((price.price - previousPrice.price) / previousPrice.price) * 100;
  
      if (Math.abs(change) >= priceChangeThreshold) {
        alerts.push({
          type: 'price_change',
          severity: Math.abs(change) >= priceChangeThreshold * 2 ? 'high' : 'medium',
          title: `Cambio significativo de precio (${change.toFixed(1)}%)`,
          description: `El precio cambió de ${previousPrice.price.toFixed(2)} a ${price.price.toFixed(2)}`,
          data: { change, oldPrice: previousPrice.price, newPrice: price.price }
        });
      }
    });
  
    // Analizar márgenes
    if (marginAlert) {
      prices.forEach(price => {
        const margin = ((price.price - price.cost) / price.price) * 100;
        if (margin < minimumMargin) {
          alerts.push({
            type: 'low_margin',
            severity: 'high',
            title: `Margen por debajo del mínimo (${margin.toFixed(1)}%)`,
            description: `El margen actual está por debajo del mínimo establecido de ${minimumMargin}%`,
            data: { margin, minimumMargin, price: price.price, cost: price.cost }
          });
        }
      });
    }
  
    // Analizar precios de competencia
    if (prices.some(p => p.competitor_price)) {
      prices.forEach(price => {
        if (!price.competitor_price) return;
  
        const difference = ((price.price - price.competitor_price) / price.competitor_price) * 100;
        if (Math.abs(difference) >= competitorChangeThreshold) {
          alerts.push({
            type: 'competitive_position',
            severity: Math.abs(difference) >= competitorChangeThreshold * 2 ? 'high' : 'medium',
            title: `Diferencia significativa con competencia (${difference.toFixed(1)}%)`,
            description: `Tu precio está ${difference > 0 ? 'por encima' : 'por debajo'} de la competencia`,
            data: { difference, ourPrice: price.price, competitorPrice: price.competitor_price }
          });
        }
      });
    }
  
    // Analizar participación de mercado
    if (marketShareAlert && prices.some(p => p.market_share)) {
      const latestPrice = prices[prices.length - 1];
      const previousPrice = prices[prices.length - 2];
  
      if (latestPrice.market_share && previousPrice.market_share) {
        const shareChange = latestPrice.market_share - previousPrice.market_share;
        if (shareChange < -2) { // Pérdida de más del 2% de participación
          alerts.push({
            type: 'market_share',
            severity: shareChange < -5 ? 'high' : 'medium',
            title: `Disminución de participación de mercado (${shareChange.toFixed(1)}%)`,
            description: `La participación de mercado bajó de ${previousPrice.market_share.toFixed(1)}% a ${latestPrice.market_share.toFixed(1)}%`,
            data: { shareChange, oldShare: previousPrice.market_share, newShare: latestPrice.market_share }
          });
        }
      }
    }
  
    return alerts;
  };
  
  export const getAlertRecommendations = (alert) => {
    const recommendations = [];
  
    switch (alert.type) {
      case 'price_change':
        if (alert.data.change > 0) {
          recommendations.push({
            action: 'Monitorear ventas',
            description: 'Vigilar el impacto del incremento de precio en el volumen de ventas'
          });
          recommendations.push({
            action: 'Analizar competencia',
            description: 'Verificar si la competencia realiza ajustes similares'
          });
        } else {
          recommendations.push({
            action: 'Revisar costos',
            description: 'Analizar si la reducción de precio afecta los márgenes'
          });
          recommendations.push({
            action: 'Evaluar estrategia',
            description: 'Determinar si la reducción es parte de una estrategia temporal'
          });
        }
        break;
  
      case 'low_margin':
        recommendations.push({
          action: 'Revisar estructura de costos',
          description: 'Identificar oportunidades de reducción de costos'
        });
        recommendations.push({
          action: 'Analizar precio de venta',
          description: 'Evaluar posibilidad de incremento de precio'
        });
        recommendations.push({
          action: 'Negociar con proveedores',
          description: 'Buscar mejores condiciones de compra'
        });
        break;
  
      case 'competitive_position':
        if (alert.data.difference > 0) {
          recommendations.push({
            action: 'Evaluar reducción de precio',
            description: 'Analizar impacto de alinear precios con la competencia'
          });
        } else {
          recommendations.push({
            action: 'Revisar estrategia de precio',
            description: 'Evaluar si se puede incrementar el precio sin perder competitividad'
          });
        }
        recommendations.push({
          action: 'Análisis competitivo',
          description: 'Realizar un análisis detallado de la posición competitiva'
        });
        break;
  
      case 'market_share':
        recommendations.push({
          action: 'Análisis de causa',
          description: 'Identificar factores que contribuyen a la pérdida de participación'
        });
        recommendations.push({
          action: 'Revisión de precios',
          description: 'Evaluar si los precios actuales son competitivos'
        });
        recommendations.push({
          action: 'Estrategia comercial',
          description: 'Desarrollar plan de acción para recuperar participación'
        });
        break;
  
      default:
        recommendations.push({
          action: 'Análisis general',
          description: 'Realizar un análisis detallado de la situación'
        });
    }
  
    return recommendations;
  };
  
  export const formatAlertMessage = (alert) => {
    let message = `[${alert.severity.toUpperCase()}] ${alert.title}\n`;
    message += `${alert.description}\n`;
  
    const recommendations = getAlertRecommendations(alert);
    if (recommendations.length > 0) {
      message += '\nRecomendaciones:\n';
      recommendations.forEach((rec, index) => {
        message += `${index + 1}. ${rec.action}: ${rec.description}\n`;
      });
    }
  
    return message;
  };
  
  export const getPriceAlertStats = (alerts) => {
    return {
      total: alerts.length,
      bySeverity: {
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      },
      byType: {
        price_change: alerts.filter(a => a.type === 'price_change').length,
        low_margin: alerts.filter(a => a.type === 'low_margin').length,
        competitive_position: alerts.filter(a => a.type === 'competitive_position').length,
        market_share: alerts.filter(a => a.type === 'market_share').length
      }
    };
  };
  
  export default {
    generatePriceAlerts,
    getAlertRecommendations,
    formatAlertMessage,
    getPriceAlertStats
  };