/**
 * Utilidad para comparar el rendimiento entre las implementaciones original y optimizada de proformas
 * 
 * IMPORTANTE: Este archivo es solo para desarrollo y pruebas, no debe incluirse en producción.
 * 
 * Uso:
 * 1. En consola del navegador: 
 *    import { runPerformanceTest } from "./utils/performanceTest.js"
 *    await runPerformanceTest()
 * 
 * 2. O usar la función globalmente desde consola:
 *    window.runProformaTest()
 */

// Rango de tiempo para emular la navegación por la interfaz
const MIN_ACTION_TIME = 100;  // ms
const MAX_ACTION_TIME = 800;  // ms

// Número de proformas y productos a generar para la prueba
const TEST_PROFORMAS_COUNT = 10;
const TEST_PRODUCTS_COUNT = 50;

/**
 * Genera una demora aleatoria dentro del rango especificado
 */
function randomDelay(min = MIN_ACTION_TIME, max = MAX_ACTION_TIME) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Genera datos aleatorios para proformas de prueba
 */
function generateTestData() {
  // Generar productos
  const products = Array.from({ length: TEST_PRODUCTS_COUNT }, (_, i) => ({
    id: i + 1,
    codigo: `PROD-${i + 1}`,
    nombre: `Producto de prueba ${i + 1}`,
    descripcion: `Descripción detallada del producto ${i + 1}`,
    precio: Math.floor(Math.random() * 1000) + 1,
    unidad: ['Unidad', 'Kg', 'Litro', 'Paquete'][Math.floor(Math.random() * 4)],
    tipo: ['disponible', 'ofertado'][Math.floor(Math.random() * 2)]
  }));
  
  // Generar proformas
  const proformas = Array.from({ length: TEST_PROFORMAS_COUNT }, (_, i) => {
    // Seleccionar productos aleatorios para esta proforma
    const itemCount = Math.floor(Math.random() * 15) + 1;
    const items = Array.from({ length: itemCount }, (_, j) => {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 10) + 1;
      const price = parseFloat(product.precio);
      const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 20) : 0;
      const total = quantity * price * (1 - discount / 100);
      
      return {
        id: `item-${i}-${j}`,
        savedId: Math.floor(Math.random() * 10000) + 1,
        code: product.codigo,
        description: product.nombre,
        unit: product.unidad,
        quantity,
        unitPrice: price,
        discount,
        total,
        source: product.tipo,
        productId: product.id,
        original: product
      };
    });
    
    // Calcular totales
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 12;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    
    return {
      id: i + 1,
      savedId: i + 1,
      quote: {
        number: `PRO-2023-${(i + 1).toString().padStart(4, '0')}`,
        name: `Proforma de prueba ${i + 1}`,
        date: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentTerms: "50% anticipo, 50% contra entrega",
        deliveryTime: "5 días hábiles",
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total: total.toString(),
        taxRate,
        notes: `Notas para proforma de prueba ${i + 1}`
      },
      client: {
        id: Math.floor(Math.random() * 100) + 1,
        name: `Cliente de prueba ${Math.floor(Math.random() * 100) + 1}`,
        attention: "Atención al departamento de compras",
        email: "cliente@example.com",
        phone: "123-456-7890",
        address: "Dirección de ejemplo 123",
        ruc: "1234567890001"
      },
      items,
      estado: ['borrador', 'enviada', 'aprobada'][Math.floor(Math.random() * 3)]
    };
  });
  
  return { products, proformas };
}

/**
 * Ejecuta pruebas de rendimiento para la implementación original
 */
async function testOriginalImplementation(testData) {
  console.log("🔍 Iniciando prueba en implementación ORIGINAL...");
  console.time("⏱️ Tiempo total (Original)");
  
  const { proformas, products } = testData;
  const startMemory = window.performance.memory?.usedJSHeapSize || 0;
  let renderCount = 0;
  
  try {
    // Importar dinámicamente los hooks originales
    const { default: useEnhancedProforma } = await import('../hooks/useEnhancedProforma');
    const { default: useProformaContext } = await import('../hooks/useProformaContext');
    
    // 1. Inicializar hooks
    console.time("⏱️ Inicialización hooks (Original)");
    const originalHooks = useEnhancedProforma();
    renderCount++;
    console.timeEnd("⏱️ Inicialización hooks (Original)");
    
    // 2. Cargar proformas
    console.time("⏱️ Carga de proformas (Original)");
    for (const proforma of proformas.slice(0, 3)) {
      originalHooks.setProformas(prev => [...prev, proforma]);
      originalHooks.setActiveProformaId(proforma.id);
      renderCount++;
      await randomDelay();
    }
    console.timeEnd("⏱️ Carga de proformas (Original)");
    
    // 3. Cambiar entre proformas
    console.time("⏱️ Cambio entre proformas (Original)");
    for (let i = 0; i < 5; i++) {
      const randomId = proformas[Math.floor(Math.random() * 3)].id;
      originalHooks.setActiveProformaId(randomId);
      renderCount++;
      await randomDelay(50, 200);
    }
    console.timeEnd("⏱️ Cambio entre proformas (Original)");
    
    // 4. Editar items
    console.time("⏱️ Edición de items (Original)");
    for (let i = 0; i < 10; i++) {
      const proforma = originalHooks.proformas.find(p => p.id === originalHooks.activeProformaId);
      if (proforma && proforma.items && proforma.items.length > 0) {
        const randomItemIndex = Math.floor(Math.random() * proforma.items.length);
        const item = proforma.items[randomItemIndex];
        const newItems = [...proforma.items];
        newItems[randomItemIndex] = {
          ...item,
          quantity: item.quantity + 1,
          total: item.unitPrice * (item.quantity + 1) * (1 - item.discount / 100)
        };
        
        originalHooks.updateProforma(proforma.id, { items: newItems });
        renderCount++;
        await randomDelay(50, 150);
      }
    }
    console.timeEnd("⏱️ Edición de items (Original)");
    
    // 5. Búsqueda de productos
    console.time("⏱️ Búsqueda de productos (Original)");
    for (let i = 0; i < 5; i++) {
      const searchTerm = products[Math.floor(Math.random() * products.length)].nombre.substring(0, 5);
      // Simular búsqueda
      renderCount++;
      await randomDelay(100, 300);
    }
    console.timeEnd("⏱️ Búsqueda de productos (Original)");
    
    // 6. Cambio de preview
    console.time("⏱️ Cambio de preview (Original)");
    originalHooks.setPreviewMode(true);
    renderCount++;
    await randomDelay();
    originalHooks.setPreviewMode(false);
    renderCount++;
    console.timeEnd("⏱️ Cambio de preview (Original)");
  } catch (error) {
    console.error("❌ Error en prueba Original:", error);
  }
  
  const endMemory = window.performance.memory?.usedJSHeapSize || 0;
  const memoryDiff = endMemory - startMemory;
  
  console.timeEnd("⏱️ Tiempo total (Original)");
  console.log(`🔢 Renders: ${renderCount}`);
  console.log(`🧠 Memoria usada: ${(memoryDiff / (1024 * 1024)).toFixed(2)} MB`);
  
  return { renderCount, memoryUsed: memoryDiff };
}

/**
 * Ejecuta pruebas de rendimiento para la implementación optimizada
 */
async function testOptimizedImplementation(testData) {
  console.log("🔍 Iniciando prueba en implementación OPTIMIZADA...");
  console.time("⏱️ Tiempo total (Optimizada)");
  
  const { proformas, products } = testData;
  const startMemory = window.performance.memory?.usedJSHeapSize || 0;
  let renderCount = 0;
  
  try {
    // Importar dinámicamente los hooks optimizados
    const { useProformaQuery } = await import('@/hooks/queries/useProformaQuery');
    
    // 1. Inicializar hooks
    console.time("⏱️ Inicialización hooks (Optimizada)");
    const optimizedHooks = useProformaQuery();
    renderCount++;
    console.timeEnd("⏱️ Inicialización hooks (Optimizada)");
    
    // 2. Cargar proformas
    console.time("⏱️ Carga de proformas (Optimizada)");
    for (const proforma of proformas.slice(0, 3)) {
      // Simular carga mediante el sistema optimizado
      optimizedHooks.updateProforma(proforma);
      renderCount++;
      await randomDelay();
    }
    console.timeEnd("⏱️ Carga de proformas (Optimizada)");
    
    // 3. Cambiar entre proformas
    console.time("⏱️ Cambio entre proformas (Optimizada)");
    for (let i = 0; i < 5; i++) {
      const randomProforma = proformas[Math.floor(Math.random() * 3)];
      optimizedHooks.setActiveProforma(randomProforma.id);
      renderCount++;
      await randomDelay(50, 200);
    }
    console.timeEnd("⏱️ Cambio entre proformas (Optimizada)");
    
    // 4. Editar items
    console.time("⏱️ Edición de items (Optimizada)");
    for (let i = 0; i < 10; i++) {
      const activeProforma = optimizedHooks.activeProforma;
      if (activeProforma && activeProforma.items && activeProforma.items.length > 0) {
        const randomItemIndex = Math.floor(Math.random() * activeProforma.items.length);
        const item = activeProforma.items[randomItemIndex];
        const updatedItem = {
          ...item,
          quantity: item.quantity + 1,
          total: item.unitPrice * (item.quantity + 1) * (1 - item.discount / 100)
        };
        
        optimizedHooks.updateItem(item.id, updatedItem);
        renderCount++;
        await randomDelay(50, 150);
      }
    }
    console.timeEnd("⏱️ Edición de items (Optimizada)");
    
    // 5. Búsqueda de productos
    console.time("⏱️ Búsqueda de productos (Optimizada)");
    // Importar hook de búsqueda
    const { useProductSearchQuery } = await import('@/hooks/queries/useProformaQuery');
    const productSearchHook = useProductSearchQuery();
    renderCount++;
    
    for (let i = 0; i < 5; i++) {
      const searchTerm = products[Math.floor(Math.random() * products.length)].nombre.substring(0, 5);
      // Simular búsqueda
      await productSearchHook.searchProducts(searchTerm);
      renderCount++;
      await randomDelay(100, 300);
    }
    console.timeEnd("⏱️ Búsqueda de productos (Optimizada)");
    
    // 6. Cambio de preview
    console.time("⏱️ Cambio de preview (Optimizada)");
    optimizedHooks.setPreviewMode(true);
    renderCount++;
    await randomDelay();
    optimizedHooks.setPreviewMode(false);
    renderCount++;
    console.timeEnd("⏱️ Cambio de preview (Optimizada)");
  } catch (error) {
    console.error("❌ Error en prueba Optimizada:", error);
  }
  
  const endMemory = window.performance.memory?.usedJSHeapSize || 0;
  const memoryDiff = endMemory - startMemory;
  
  console.timeEnd("⏱️ Tiempo total (Optimizada)");
  console.log(`🔢 Renders: ${renderCount}`);
  console.log(`🧠 Memoria usada: ${(memoryDiff / (1024 * 1024)).toFixed(2)} MB`);
  
  return { renderCount, memoryUsed: memoryDiff };
}

/**
 * Función principal para ejecutar pruebas comparativas
 */
export async function runPerformanceTest() {
  console.log("🧪 INICIANDO PRUEBAS DE RENDIMIENTO 🧪");
  console.log("======================================");
  
  // Generar datos de prueba
  console.log("🔄 Generando datos de prueba...");
  const testData = generateTestData();
  console.log(`📊 Datos generados: ${testData.proformas.length} proformas, ${testData.products.length} productos`);
  
  // Prueba implementación original
  console.log("\n");
  const originalResults = await testOriginalImplementation(testData);
  
  // Prueba implementación optimizada
  console.log("\n");
  const optimizedResults = await testOptimizedImplementation(testData);
  
  // Comparativa final
  console.log("\n");
  console.log("📊 RESULTADOS COMPARATIVOS 📊");
  console.log("============================");
  console.log(`🔄 Renders: Original ${originalResults.renderCount} vs. Optimizada ${optimizedResults.renderCount}`);
  console.log(`🧠 Memoria: Original ${(originalResults.memoryUsed / (1024 * 1024)).toFixed(2)} MB vs. Optimizada ${(optimizedResults.memoryUsed / (1024 * 1024)).toFixed(2)} MB`);
  
  // Calcular porcentajes de mejora
  const renderImprovement = ((originalResults.renderCount - optimizedResults.renderCount) / originalResults.renderCount * 100).toFixed(2);
  const memoryImprovement = ((originalResults.memoryUsed - optimizedResults.memoryUsed) / originalResults.memoryUsed * 100).toFixed(2);
  
  console.log(`✅ Mejora en renders: ${renderImprovement}%`);
  console.log(`✅ Mejora en memoria: ${memoryImprovement}%`);
  
  return {
    original: originalResults,
    optimized: optimizedResults,
    improvements: {
      renders: renderImprovement,
      memory: memoryImprovement
    }
  };
}

// Exponer función para uso en consola durante desarrollo
if (typeof window !== 'undefined') {
  window.runProformaTest = runPerformanceTest;
}