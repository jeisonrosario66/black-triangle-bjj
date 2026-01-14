import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import svgr from "vite-plugin-svgr";
// import fs from 'fs'

// Configuración de Vite para el proyecto React
// Permite conexiones desde la red y configura alias para simplificar imports
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(), svgr()
    ],
    base: "/",
    server: {
        host: true, // Permite conexiones desde la red
        port: 5173,
    },
    build: {
        target: "es2022",
    },
    resolve: {
        alias: { // Alias para acceder a la carpeta src de forma más limpia
            "@src": path.resolve(__dirname, "src"),
            "@bt/shared": path.resolve(__dirname, "../../packages/shared/src")
        }
    }
})
//
