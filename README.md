# Black Triangle BJJ

## Resumen

**Black Triangle BJJ** es un monorepo orientado al aprendizaje de Brazilian Jiu-Jitsu. El proyecto nació como un **visualizador 3D de conocimiento técnico** y hoy evoluciona hacia una **plataforma web de estudio** con autenticación, continuidad de progreso, recomendaciones personalizadas y una identidad visual renovada.

Actualmente, la experiencia principal está en `apps/web`:

- Landing pública con rebranding Black Triangle
- Login con Google usando Firebase Auth
- Home personalizado para usuarios autenticados
- Explorer de cursos/sistemas
- Detalle de curso
- Detalle de video
- Persistencia de métricas en Firestore

El visualizador 3D original **sigue existiendo** y conserva valor arquitectónico e histórico, pero hoy está **dormido** y no forma parte del flujo principal de rutas.

---

## Estado actual del producto

### Experiencia web activa

La web está organizada alrededor de este flujo:

1. `"/"`: Landing pública
2. `"/home"`: entrada principal post-login
3. `"/explorer"`: catálogo de sistemas/cursos
4. `"/course_detail/:systemName"`: detalle del curso
5. `"/video_detail/:systemName/:nodeId"`: detalle del video
6. `"*"`: pantalla 404

Todo el contenido de aprendizaje requiere autenticación. La ruta raíz es pública y funciona como página de bienvenida y conversión.

### Rebranding actual

La app ya fue rebrandizada hacia **Black Triangle BJJ** con:

- nuevos logos SVG
- paleta negro + dorado
- sistema visual centralizado en `shared`
- covers de cursos más consistentes
- landing más editorial y orientada a producto

---

## Contexto histórico: visualizador 3D

El proyecto empezó como un visor técnico de grafos 3D para estudiar relaciones entre técnicas, posiciones y transiciones.

Ese flujo sigue representado sobre todo por:

- [MainAppLayout.tsx](apps/web/src/layouts/MainAppLayout.tsx)
- `GraphScene`
- Zustand para estado del grafo
- parámetros de cámara y escena en `configGlobal`

Hoy ese módulo está **temporalmente fuera del flujo principal**. En [App.tsx](apps/web/src/App.tsx) todavía puede verse la referencia comentada:

- `MainAppLayout`

Esto es importante para cualquier desarrollador nuevo: **la app no empezó como LMS tradicional**, sino como sistema de visualización técnica. La arquitectura compartida todavía refleja esa historia.

---

## Estructura del repositorio

```text
apps/
  mobile/   Cliente móvil / espacio secundario de evolución
  web/      Cliente web principal actual

shared/
  packages/
    assets/         Logos y recursos compartidos
    context/        Tipos, config visual, media editorial
    design-system/  Tokens, superficies, shapes
    services/       Firestore, personalización, caches, tracking
    utils/          Helpers comunes
```

### Áreas clave

- `apps/web/src/screens`: rutas/pantallas principales
- `apps/web/src/components`: UI y piezas reutilizables
- `shared/packages/services`: lógica compartida y acceso a Firestore
- `shared/packages/design-system`: fuente de verdad visual
- `shared/packages/context`: tipos, paletas, media editorial y config compartida

---

## Stack actual

### Frontend

- React 19
- TypeScript
- Vite
- MUI
- React Router
- Zustand
- i18next

### Backend / data

- Firebase Auth
- Firestore

### Legado / base original

- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- `r3f-forcegraph`

---

## Autenticación

La autenticación actual usa **Firebase Auth con Google**.

### Comportamiento

- desktop: prioriza popup
- mobile: maneja el flujo móvil con fallback apropiado
- al autenticar, se crea o actualiza `users/{email}`

### Datos de usuario persistidos

Solo se guardan los datos mínimos:

- `firstName`
- `lastName`
- `email`

Archivo clave:

- `apps/web/src/providers/AuthProvider.tsx`

---

## Firestore: colecciones relevantes hoy

### Catálogo de cursos/sistemas

- `systems_test`
- `systems_sets/essentials/set`
- `systems_test/{course}/nodes`

### Usuarios

- `users/{email}`

### Métricas por usuario

- `users/{email}/course_stats/{courseLabel}`

Campos importantes:

- `lastExplorerAt`
- `lastVideoAt`
- `lastVideoId`
- `lastVideoName`
- `videoViews`
- `watchedVideoIds`
- `courseViews`

### Métricas globales

- `course_metrics/{courseLabel}`

### Métrica por video

Cada nodo/video puede persistir:

- `viewsCount`

Esto permite mostrar vistas globales tipo YouTube en detalle de video.

---

## Personalización del Home

El `/home` no guarda una “homepage ya renderizada”. En su lugar:

1. lee catálogo de sistemas
2. lee métricas del usuario
3. lee métricas globales
4. calcula continuidad, rutas y sugerencias

### Qué muestra hoy

- **Continuar curso**
  - parte del último curso abierto desde `Explorer`
  - `Explorer` es la fuente de verdad para continuidad

- **Rutas de aprendizaje recomendadas**
  - se construyen según afinidad por `set`, `coach` y popularidad
  - ahora muestran una selección real de cursos, no un único destino

- **Explorar sistemas**
  - mezcla interés del usuario + popularidad global

Archivo clave:

- `shared/packages/services/personalizationShared.ts`

---

## UX y comportamiento actuales

### Web pública

- landing de bienvenida
- CTA hacia login
- branding Black Triangle

### Zona autenticada

- acceso protegido con `RequireAuth`
- `/home` como entrada principal post-login
- `Explorer`, curso y video protegidos

### Video detail

- reproductor embebido
- contador global de vistas
- indicador de videos ya vistos
- navegación entre videos del mismo curso

### Curso detail

- lista de módulos por curso
- marcadores sutiles de videos visitados

### Explorer

- búsqueda y filtrado
- covers generados consistentes
- deduplicación y caching

---

## Sistema visual actual

La UI se apoya en una línea visual sobria y de alto contraste:

- fondo principal oscuro
- acentos dorados
- cards y superficies centralizadas en `shared`
- logos SVG rebrandizados
- imágenes editoriales opcionales con fallback visual

Fuentes de verdad:

- `shared/packages/design-system/tokens.ts`
- `shared/packages/design-system/surfaces.ts`
- `shared/packages/context/visualShared.ts`

### Assets editoriales

Las imágenes editoriales viven en:

- `apps/web/public/images/editorial`

Se usan como apoyo visual, pero la UI no depende completamente de ellas porque existen fallbacks elegantes.

---

## Internacionalización

La app usa `i18next` con recursos principales en:

- `apps/web/src/locales/es/translation.json`
- `apps/web/src/locales/en/translation.json`

Regla práctica para cambios nuevos:

- no dejar textos nuevos hardcodeados si forman parte de la UI final
- extraerlos a `i18n`

---

## Performance y caches

Se han hecho varias optimizaciones para reducir lecturas y mejorar percepción de velocidad:

- cache en memoria para sistemas
- cache en memoria para nodos de curso
- cache en memoria para métricas del usuario
- cache/merge optimista para progreso del usuario
- menor número de escrituras redundantes en Firestore

Esto es importante porque el proyecto ha sido sensible al límite gratuito de Firestore.

---

## Cómo ejecutar el proyecto web

### Requisitos

- Node `v20.20.0`
- npm `v10.8.2`

La referencia actual está documentada en `.nvmrc`.

### Instalación

Desde `apps/web`:

```bash
npm install
```

### Desarrollo

```bash
cd apps/web
npm run dev
```

### Build

```bash
cd apps/web
npm run build
```

### Preview local

```bash
cd apps/web
npm run preview
```

---

## Variables y entorno

La web depende de configuración Firebase en entorno local.

En particular:

- configuración del proyecto Firebase
- Auth con Google habilitado
- dominios autorizados para login
- Firestore accesible según tus reglas

Nota importante para desarrollo móvil en red local:

- si abres la app desde una IP del tipo `http://192.168.x.x:5173`, ese origen debe estar autorizado en Firebase Auth o el login móvil puede fallar

---

## Guía rápida para desarrolladores

### Si vas a trabajar UI

- respeta la paleta y surfaces en `shared`
- prioriza mobile-first
- evita duplicar colores o tokens en `apps/web`

### Si vas a tocar datos o métricas

- centraliza cambios en `shared/packages/services`
- no pongas writes de Firestore repartidos en múltiples screens si pueden vivir en servicios compartidos
- ten cuidado con cuota de Firestore

### Si vas a tocar el Home

- `Explorer` sigue siendo la fuente de verdad para continuidad
- las rutas recomendadas se calculan desde métricas, no se hardcodean

### Si vas a tocar el visualizador 3D

- revisa primero `MainAppLayout.tsx`
- considera que es un módulo legado/dormido, no el flujo principal actual
- intenta no romper sus stores o utilidades compartidas aunque hoy no estén activas por ruta

---

## Convenciones útiles del proyecto

- preferencia por lógica compartida en `shared`
- estilos visuales centralizados siempre que sea posible
- evitar sobreingeniería
- código limpio y tipado
- enfoque claro en continuidad de aprendizaje

---

## Roadmap implícito

El proyecto hoy convive entre dos visiones complementarias:

1. **plataforma de aprendizaje consumible**
2. **mapa/visualizador sistémico del conocimiento de BJJ**

La web activa resuelve la primera. El visualizador 3D preserva el ADN de la segunda y sigue siendo una vía futura para reactivar exploración espacial, rutas técnicas y relaciones profundas entre nodos.

---

## Licencia

Uso privado / experimental. Licencia formal pendiente.
