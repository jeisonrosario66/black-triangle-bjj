import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import svgr from "vite-plugin-svgr";
// import fs from 'fs'

const usePolling = process.env.CHOKIDAR_USEPOLLING === "true";

// Configuración de Vite para el proyecto React
// Permite conexiones desde la red y configura alias para simplificar imports
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(), svgr()
    ],
    base: '/',
    server: {
        host: true, // Permite conexiones desde la red
        port: 5173,
        allowedHosts: [
            '.trycloudflare.com'
        ],
        watch: {
            // Fallback útil cuando el sistema agota los watchers de inotify.
            usePolling,
            interval: usePolling ? 300 : undefined,
            ignored: [
                "**/.git/**",
                "**/dist/**",
                "**/coverage/**",
            ],
        },
    },
    build: {
        target: "es2022",
    },
    resolve: {
        alias: { // Alias para acceder a la carpeta src de forma más limpia
            "@src": path.resolve(__dirname, "src"),
            "@bt/shared": path.resolve(__dirname, "../../shared/packages")
        }
    }
})
//
