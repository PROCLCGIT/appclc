// src/hooks/usePriceAnalysis.js
import { useState, useEffect } from 'react';

const usePriceAnalysis = (historyData) => {
  const [statistics, setStatistics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [projections, setProjections] = useState(null);

  useEffect(() => {
    if (historyData?.length > 0) {
      calculateStatistics();
      analyzeTrends();
      generateAlerts();
      calculateProjections();
    }
  }, [historyData]);

  // Funciones de utilidad para cálculos estadísticos
  const calculateAverage = (numbers) => {
    return numbers.reduce((acc, val) => acc + val, 0) / numbers.length;
  };

  const calculateMedian = (numbers) => {
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  };

  const calculateStdDev = (numbers) => {
    const avg = calculateAverage(numbers);
    const squareDiffs = numbers.map(value => Math.pow(value - avg, 2));
    const variance = calculateAverage(squareDiffs);
    return Math.sqrt(variance);
  };

  const calculateVolatility = (prices) => {
    const returns = prices.slice(1).map((price, index) => {
      return (price - prices[index]) / prices[index];
    });
    return calculateStdDev(returns);
  };

  // Cálculo de estadísticas principales
  const calculateStatistics = () => {
    const prices = historyData.map(record => record.price);
    const competitorPrices = historyData
      .map(record => record.competitor_price)
      .filter(price => price != null);

    setStatistics({
      current: prices[prices.length - 1],
      average: calculateAverage(prices),
      median: calculateMedian(prices),
      stdDev: calculateStdDev(prices),
      volatility: calculateVolatility(prices),
      range: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      competitors: competitorPrices.length > 0 ? {
        average: calculateAverage(competitorPrices),
        median: calculateMedian(competitorPrices),
        range: {
          min: Math.min(...competitorPrices),
          max: Math.max(...competitorPrices)
        }
      } : null
    });
  };

  // Análisis de tendencias
  const analyzeTrends = () => {
    const calculateTrend = (data) => {
      const n = data.length;
      if (n < 2) return 0;

      // Regresión lineal simple
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      data.forEach((record, index) => {
        sumX += index;
        sumY += record.price;
        sumXY += index * record.price;
        sumX2 += index * index;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      return slope;
    };

    setTrends({
      shortTerm: calculateTrend(historyData.slice(-30)),  // último mes
      mediumTerm: calculateTrend(historyData.slice(-90)), // últimos 3 meses
      longTerm: calculateTrend(historyData),              // todo el periodo
      seasonality: detectSeasonality(historyData)
    });
  };

  // Detección de estacionalidad
  const detectSeasonality = (data) => {
    // Agrupa los datos por mes
    const monthlyData = data.reduce((acc, record) => {
      const month = new Date(record.date).getMonth();
      if (!acc[month]) acc[month] = [];
      acc[month].push(record.price);
      return acc;
    }, {});

    // Calcula promedios mensuales
    const monthlyAverages = Object.entries(monthlyData).map(([month, prices]) => ({
      month: parseInt(month),
      average: calculateAverage(prices)
    }));

    return monthlyAverages;
  };

  // Cálculo de proyecciones
  const calculateProjections = () => {
    const calculateLinearProjection = () => {
      const n = historyData.length;
      const dates = historyData.map((_, i) => i);
      const prices = historyData.map(record => record.price);

      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      for (let i = 0; i < n; i++) {
        sumX += dates[i];
        sumY += prices[i];
        sumXY += dates[i] * prices[i];
        sumX2 += dates[i] * dates[i];
      }

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Proyecta los próximos 3 meses
      const projections = [];
      const lastDate = new Date(historyData[n - 1].date);

      for (let i = 1; i <= 3; i++) {
        const projectedDate = new Date(lastDate);
        projectedDate.setMonth(lastDate.getMonth() + i);
        
        const projectedPrice = slope * (n + i) + intercept;
        projections.push({
          date: projectedDate,
          price: projectedPrice,
          confidenceInterval: calculateConfidenceInterval(projectedPrice, statistics.stdDev)
        });
      }

      return projections;
    };

    const calculateConfidenceInterval = (price, stdDev) => {
      const confidence = 0.95; // 95% de intervalo de confianza
      const z = 1.96; // Valor Z para 95%
      return {
        lower: price - z * stdDev,
        upper: price + z * stdDev
      };
    };

    setProjections({
      linear: calculateLinearProjection(),
      seasonalAdjusted: adjustForSeasonality(calculateLinearProjection())
    });
  };

  // Ajuste estacional de proyecciones
  const adjustForSeasonality = (projections) => {
    if (!trends.seasonality) return projections;

    return projections.map(projection => {
      const month = projection.date.getMonth();
      const seasonalFactor = trends.seasonality.find(s => s.month === month)?.average || 1;
      return {
        ...projection,
        price: projection.price * seasonalFactor
      };
    });
  };

  // Generación de alertas
  const generateAlerts = () => {
    const newAlerts = [];
    const prices = historyData.map(record => record.price);
    const currentPrice = prices[prices.length - 1];

    // Alerta de precio fuera de rango
    if (Math.abs(currentPrice - statistics.average) > 2 * statistics.stdDev) {
      newAlerts.push({
        type: 'price_anomaly',
        severity: 'high',
        message: 'Precio actual fuera del rango estadístico normal',
        details: {
          current: currentPrice,
          average: statistics.average,
          deviation: statistics.stdDev
        }
      });
    }

    // Alerta de tendencia significativa
    if (Math.abs(trends.shortTerm) > 0.1) {
      newAlerts.push({
        type: 'trend',
        severity: 'medium',
        message: `Tendencia ${trends.shortTerm > 0 ? 'alcista' : 'bajista'} significativa`,
        details: {
          trend: trends.shortTerm
        }
      });
    }

    // Alerta de competitividad
    if (statistics.competitors) {
      const competitorAvg = statistics.competitors.average;
      const priceDiff = ((currentPrice - competitorAvg) / competitorAvg) * 100;
      
      if (Math.abs(priceDiff) > 15) {
        newAlerts.push({
          type: 'competitive_position',
          severity: 'medium',
          message: `Precio ${priceDiff > 0 ? 'superior' : 'inferior'} al promedio del mercado`,
          details: {
            difference: priceDiff,
            marketAverage: competitorAvg
          }
        });
      }
    }

    setAlerts(newAlerts);
  };

  return {
    statistics,
    trends,
    alerts,
    projections,
    isLoading: !statistics,
    hasData: historyData?.length > 0
  };
};

export default usePriceAnalysis;