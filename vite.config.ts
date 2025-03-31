import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'


// Configuración de Vite para el proyecto React
// Permite conexiones desde la red y configura alias para simplificar imports
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/black-triangle-bjj/",
  server: {
    host: true, // Permite conexiones desde la red
    port: 5173, // Cambia el puerto si es necesario
  },
  resolve: {
    alias: {
     // Alias para acceder a la carpeta src de forma más limpia
     "@src": path.resolve(__dirname, "src"),
     // Alias para módulos CSS
     "@cssModules": path.resolve(__dirname, "src/components/cssModules"),
    },
  },
})
// 