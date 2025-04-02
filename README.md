# 🥋 Black Triangle BJJ - Aplicación de Gestión de Técnicas de Jiu-Jitsu

Black Triangle BJJ es una aplicación interactiva para la gestión y visualización de técnicas de Jiu-Jitsu, permitiendo a los usuarios explorar y organizar posiciones, transiciones y estrategias en un entorno visual en 3D.

## 🚀 Características

✅ **Visualización 3D:** Utiliza `@react-three/fiber` y `@react-three/drei` para representar gráficamente las posiciones y transiciones.  
✅ **Gestión de datos con Firestore:** Se almacenan y consultan técnicas de Jiu-Jitsu en una base de datos en tiempo real.  
✅ **Interfaz dinámica:** React con Zustand para gestionar estados de la UI de forma eficiente.  
✅ **Configuración segura:** Variables de entorno protegidas mediante `.env.local`.  
✅ **Estilización modular:** Uso de CSS Modules para mantener los estilos organizados.  

## 📂 Estructura del Proyecto

```bash
📦 BlackTriangleBJJ
├── 📁 src
│   ├── 📁 components      # Componentes reutilizables
│   ├── 📁 context         # Configuración global del proyecto
│   ├── 📁 store           # Estado global con Zustand
│   ├── 📁 styles          # Estilos CSS Modules
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Punto de entrada de la aplicación
├── .env.local             # Variables de entorno (excluidas en Git)
├── tsconfig.json          # Configuración de TypeScript
├── vite.config.ts         # Configuración de Vite
└── package.json           # Dependencias y scripts