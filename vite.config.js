import { defineConfig } from 'vite'

export default defineConfig({
  // Configuración para variables de entorno
  define: {
    // Esto permite que las variables de entorno estén disponibles en el cliente
    'process.env': process.env
  },
  server: {
    port: 3001, // Puerto para el servidor de desarrollo
    open: true  // Abre automáticamente el navegador
  }
})
