import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import svgr from "vite-plugin-svgr";
// import fs from 'fs'

// Configuración de Vite para el proyecto React
// Permite conexiones desde la red y configura alias para simplificar imports
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  base: "/black-triangle-bjj/",
  server: {
    host: true, // Permite conexiones desde la red
    port: 5173, // Cambia el puerto si es necesario
    // https: {
    //   key: fs.readFileSync('./192.168.101.11-key.pem'),
    //   cert: fs.readFileSync('./192.168.101.11.pem'),
    // }
  },
  resolve: {
    alias: {
     // Alias para acceder a la carpeta src de forma más limpia
     "@src": path.resolve(__dirname, "src"),
    },
  },
})
// 