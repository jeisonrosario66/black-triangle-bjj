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
│   ├── 📁 hooks           # Hooks personalizados
│   ├── 📁 services        # Lógica de conexión con Firestore
│   ├── 📁 utils           # Funciones auxiliares
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Punto de entrada de la aplicación
├── [.env.local]         # Variables de entorno (excluidas en Git)
├── [tsconfig.json]      # Configuración de TypeScript
├── [vite.config.ts]     # Configuración de Vite
└── [package.json]       # Dependencias y scripts
```

📦 Instalación
Sigue estos pasos para configurar el proyecto en tu máquina local:

Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/black-triangle-bjj.git
cd black-triangle-bjj
```

Instala las dependencias:
```bash
npm install
```

Configura las variables de entorno:
- Crea un archivo .env.local en la raíz del proyecto.
- Agrega las siguientes variables:
```bash
VITE_FIREBASE_API_KEY=api_key
VITE_FIREBASE_AUTH_DOMAIN=auth_domain
VITE_FIREBASE_PROJECT_ID=project_id
VITE_FIREBASE_STORAGE_BUCKET=storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=messaging_sender_id
VITE_FIREBASE_APP_ID=app_id
VITE_FIREBASE_MEASUREMENT_ID=measurement_id
VITE_YOUTUBE_API_KEY=youtube_api_key
```

Inicia el servidor de desarrollo:
```bash
npm run dev
```


📄 Licencia
Este proyecto está bajo la licencia MIT.

📧 Contacto
Si tienes preguntas o sugerencias, no dudes en contactarme:

Email: jeisonrosario5.com
GitHub: jeisonrosario66