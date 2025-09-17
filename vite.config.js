import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    // Configuración base
    base: './',
    
    // Configuración del servidor de desarrollo
    server: {
      port: 5173,
      open: true
    },
    
    // Definir variables de entorno para el cliente
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL || 'http://localhost:4000'),
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME || 'TaskFlow'),
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0')
    },
    
    // Configuración de build
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  }
})
