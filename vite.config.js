import { defineConfig, loadEnv } from 'vite'

/**
 * Vite configuration file.
 * 
 * This configuration dynamically loads environment variables
 * based on the current mode (development, production, etc.)
 * and sets up the build and dev server options.
 * 
 * @function defineConfig
 * @param {Object} config - Vite config context.
 * @param {"serve"|"build"} config.command - The current command being executed.
 * @param {string} config.mode - The mode in which Vite is running (e.g., "development", "production").
 * @returns {import('vite').UserConfig} Vite configuration object.
 */

export default defineConfig(({ command, mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, process.cwd(), '')

  return {
     /**
     * Base public path when serving or building the project.
     * Using './' ensures relative paths for deployment.
     */    
    base: './',
    
    /**
     * Development server configuration.
     * @type {import('vite').ServerOptions}
     */
    server: {
      port: 5173,
      open: true
    },
    
    /**
     * Define global constants that can be replaced
     * at build time for client-side usage.
     */
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL),
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME),
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION)
    },
    
    /**
     * Build configuration for production output.
     * @type {import('vite').BuildOptions}
     */
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  }
})
