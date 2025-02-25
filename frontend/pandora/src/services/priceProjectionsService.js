// src/services/priceProjectionsService.js

const calculateLinearRegression = (data) => {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data.map(d => d.price);
  
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i];
    }
  
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
  
    return { slope, intercept };
  };
  
  const calculateSeasonalFactors = (data) => {
    // Agrupar datos por mes
    const monthlyData = data.reduce((acc, point) => {
      const month = new Date(point.date).getMonth();
      if (!acc[month]) acc[month] = [];
      acc[month].push(point.price);
      return acc;
    }, {});
  
    // Calcular factores estacionales
    const seasonalFactors = {};
    Object.entries(monthlyData).forEach(([month, prices]) => {
      const avgPrice = prices.reduce((a, b) => a + b) / prices.length;
      const overallAvg = data.reduce((a, b) => a + b.price, 0) / data.length;
      seasonalFactors[month] = avgPrice / overallAvg;
    });
  
    return seasonalFactors;
  };
  
  const calculateConfidenceInterval = (data, slope, intercept, confidenceLevel) => {
    const n = data.length;
    const predictions = data.map((_, i) => slope * i + intercept);
    
    // Calcular error estándar
    const residuals = data.map((point, i) => point.price - predictions[i]);
    const sumSquaredResiduals = residuals.reduce((a, b) => a + b * b, 0);
    const standardError = Math.sqrt(sumSquaredResiduals / (n - 2));
    
    // Factor Z para el nivel de confianza
    const zScore = {
      90: 1.645,
      95: 1.96,
      99: 2.576
    }[confidenceLevel] || 1.96;
  
    return {
      standardError,
      marginOfError: zScore * standardError
    };
  };
  
  const calculateCompetitiveAdjustment = (historicalData) => {
    // Calcular el diferencial promedio con la competencia
    const competitiveDiffs = historicalData
      .filter(point => point.competitor_price)
      .map(point => (point.price - point.competitor_price) / point.competitor_price);
  
    if (competitiveDiffs.length === 0) return 1;
  
    return 1 + (competitiveDiffs.reduce((a, b) => a + b, 0) / competitiveDiffs.length);
  };
  
  const calculateReliability = (data, predictions) => {
    // Calcular el error medio cuadrático normalizado (NMSE)
    const n = Math.min(data.length, predictions.length);
    let sumSquaredError = 0;
    let sumSquaredActual = 0;
  
    for (let i = 0; i < n; i++) {
      const error = data[i].price - predictions[i].projectedPrice;
      sumSquaredError += error * error;
      sumSquaredActual += data[i].price * data[i].price;
    }
  
    const nmse = sumSquaredError / sumSquaredActual;
    return (1 - nmse) * 100; // Convertir a porcentaje
  };
  
  const generateProjections = (historicalData, settings) => {
    const {
      projectionMonths = 6,
      confidenceInterval = 95,
      includeSeasonal = true,
      includeCompetitive = true
    } = settings;
  
    // Calcular regresión lineal base
    const { slope, intercept } = calculateLinearRegression(historicalData);
    const { standardError, marginOfError } = calculateConfidenceInterval(
      historicalData,
      slope,
      intercept,
      confidenceInterval
    );
  
    // Obtener factores estacionales y competitivos
    const seasonalFactors = includeSeasonal ? calculateSeasonalFactors(historicalData) : null;
    const competitiveAdjustment = includeCompetitive ? calculateCompetitiveAdjustment(historicalData) : 1;
  
    // Generar proyecciones
    const lastDate = new Date(historicalData[historicalData.length - 1].date);
    const projections = [];
  
    for (let i = 1; i <= projectionMonths; i++) {
      const projectedDate = new Date(lastDate);
      projectedDate.setMonth(lastDate.getMonth() + i);
  
      const baseProjection = slope * (historicalData.length + i) + intercept;
      const month = projectedDate.getMonth();
  
      let projection = {
        date: projectedDate.toISOString(),
        projectedPrice: baseProjection,
        upperBound: baseProjection + marginOfError,
        lowerBound: baseProjection - marginOfError
      };
  
      // Ajuste estacional
      if (includeSeasonal && seasonalFactors[month]) {
        projection.seasonalPrice = baseProjection * seasonalFactors[month];
      }
  
      // Ajuste competitivo
      if (includeCompetitive) {
        projection.competitivePrice = baseProjection * competitiveAdjustment;
      }
  
      projections.push(projection);
    }
  
    // Calcular estadísticas
    const reliability = calculateReliability(historicalData, projections);
    const trend = ((projections[projections.length - 1].projectedPrice - historicalData[historicalData.length - 1].price) / 
                   historicalData[historicalData.length - 1].price) * 100;
  
    return {
      projections,
      statistics: {
        trend,
        reliability,
        projectedPrice: projections[projections.length - 1].projectedPrice,
        standardError,
        seasonalImpact: seasonalFactors ? Object.values(seasonalFactors).reduce((a, b) => a + Math.abs(b - 1), 0) / 12 : 0,
        competitiveGap: (competitiveAdjustment - 1) * 100
      },
      recommendations: generateRecommendations(trend, reliability, seasonalFactors, competitiveAdjustment)
    };
  };
  
  const generateRecommendations = (trend, reliability, seasonalFactors, competitiveAdjustment) => {
    const recommendations = [];
  
    // Recomendaciones basadas en la tendencia
    if (Math.abs(trend) > 10) {
      recommendations.push({
        title: `Tendencia ${trend > 0 ? 'Alcista' : 'Bajista'} Significativa`,
        description: `Se proyecta un cambio del ${trend.toFixed(1)}% en los precios. ${
          trend > 0 
            ? 'Considerar estrategias para mantener competitividad.' 
            : 'Evaluar impacto en márgenes y rentabilidad.'
        }`,
        priority: Math.abs(trend) > 20 ? 'high' : 'medium'
      });
    }
  
    // Recomendaciones basadas en estacionalidad
    if (seasonalFactors) {
      const maxSeasonalImpact = Math.max(...Object.values(seasonalFactors)) - 1;
      if (maxSeasonalImpact > 0.1) {
        recommendations.push({
          title: 'Impacto Estacional Significativo',
          description: `Considerar ajustes estacionales de hasta ${(maxSeasonalImpact * 100).toFixed(1)}% en los precios.`,
          priority: maxSeasonalImpact > 0.2 ? 'high' : 'medium'
        });
      }
    }
  
    // Recomendaciones basadas en competitividad
    if (Math.abs(competitiveAdjustment - 1) > 0.05) {
      recommendations.push({
        title: 'Ajuste Competitivo Necesario',
        description: `Los precios están ${
          competitiveAdjustment > 1 ? 'por encima' : 'por debajo'
        } del mercado en un ${Math.abs(competitiveAdjustment - 1) * 100}%.`,
        priority: Math.abs(competitiveAdjustment - 1) > 0.1 ? 'high' : 'medium'
      });
    }
  
    // Recomendaciones basadas en confiabilidad
    if (reliability < 80) {
      recommendations.push({
        title: 'Baja Confiabilidad en Proyecciones',
        description: 'Considerar factores adicionales y monitorear cambios frecuentemente.',
        priority: reliability < 70 ? 'high' : 'medium'
      });
    }
  
    return recommendations;
  };
  
  export default {
    generateProjections,
    calculateLinearRegression,
    calculateSeasonalFactors,
    calculateConfidenceInterval,
    calculateReliability
  };