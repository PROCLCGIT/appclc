// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// Define __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // Ya no eliminar el prefijo /api, mantenerlo para compatibilidad con el backend
        rewrite: (path) => path,
        // Configuración para solucionar problemas de cors y otros
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxy request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      },
      // Proxies directos sin prefijo para casos donde el frontend puede estar utilizando rutas directas
      '/core': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`
      },
      '/pandora': {
        target: 'http://localhost:8000/api',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`
      },
      '/clientes': {
        target: 'http://localhost:8000/api/core',
        changeOrigin: true,
        rewrite: (path) => `/api/core${path}`
      }
    }
  }
})