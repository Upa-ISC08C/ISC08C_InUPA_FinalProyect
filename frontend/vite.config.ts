import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Necesario para que el servidor sea accesible desde fuera del contenedor Docker
    host: true,
    strictPort: true,
    // En Windows/WSL con volumenes montados, el watcher necesita polling
    watch: {
      usePolling: true,
    },
  },
})
