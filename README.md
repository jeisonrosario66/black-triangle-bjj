# Black Triangle BJJ

## Descripción general

**Black Triangle BJJ** es un proyecto personal y educativo cuyo objetivo es mapear el Brazilian Jiu-Jitsu (BJJ) como un sistema completo de conocimiento, utilizando un enfoque basado en grafos. Cada técnica, posición, transición, sistema o concepto es representado como un nodo interconectado, permitiendo estudiar el BJJ de forma estructural, relacional y no lineal.

El proyecto está diseñado para crecer a largo plazo, evolucionando desde un visor técnico hacia un sistema integral de aprendizaje, análisis y exploración del arte suave.

---

## 1️⃣ Modelo conceptual

El núcleo del proyecto es un **grafo dirigido** donde:

- **Nodos** representan entidades del BJJ:
  - Técnicas
  - Posiciones
  - Transiciones
  - Sistemas
  - Defensas / escapes
  - Conceptos
- **Enlaces** representan relaciones técnicas y lógicas entre nodos:
  - Continuaciones
  - Dependencias
  - Orígenes y destinos técnicos

Cada nodo puede contener:
- Identificador numérico único (`index`)
- Nombre multilenguaje (ES / EN)
- Grupo o tipo
- Fragmento de video asociado (YouTube)
- Descripción técnica
- Metadatos de carga

El sistema evita estructuras lineales tradicionales y apuesta por una representación **sistémica y navegable** del conocimiento.

---

## 2️⃣ Visualización e interacción principal

La interfaz principal es una **visualización 3D de grafos**, que permite:

- Explorar técnicas de forma espacial
- Expandir o colapsar nodos dinámicamente
- Visualizar relaciones técnicas reales
- Navegar entre sistemas completos de BJJ

### Características clave

- Renderizado con `r3f-forcegraph`
- Expansión controlada por estado (`collapsedMapRef`)
- Carga optimizada desde Firestore
- Interacción directa con nodos (click, foco, detalles)
- Ventanas laterales para información extendida

El grafo no solo muestra información, sino que **invita a explorar**, descubrir rutas técnicas y comprender conexiones profundas entre movimientos.

---

## 3️⃣ Arquitectura técnica

### Stack principal

- **Frontend:** React + TypeScript
- **Estado global:** Zustand
- **Visualización:** Three.js / react-three-fiber / r3f-forcegraph
- **Backend / DB:** Firebase Firestore

### Firestore como sistema central

Firestore se utiliza para:

- Almacenar nodos y enlaces
- Mantener índices globales
- Gestionar categorías y subcategorías
- Asignar taxonomía técnica
- Soportar multilenguaje

### Principios de diseño

- Lecturas paralelas para optimizar rendimiento
- Normalización de datos antes de renderizar
- Separación clara entre datos, estado y vista
- Logs controlados para depuración y auditoría

---

## 4️⃣ Taxonomía y clasificación

El proyecto implementa un sistema de **clasificación jerárquica**:

- Categorías principales
- Subcategorías
- Categorías específicas
- Asociación a pestañas o vistas

Cada nodo puede estar vinculado a múltiples capas taxonómicas, permitiendo:

- Filtrado avanzado
- Rutas de aprendizaje
- Agrupación pedagógica
- Escalabilidad futura

---

## 5️⃣ Gestión de datos

### Inserción de nodos

- Los nodos se agregan con índice global único
- Se crean enlaces opcionales a nodos existentes
- Se actualiza automáticamente el índice global
- Se normalizan textos antes de persistir

### Lectura de datos

- Carga paralela de múltiples colecciones
- Traducción dinámica según idioma del usuario
- Normalización para consumo directo por el grafo

---

## 6️⃣ Visión del proyecto

Este es un **proyecto personal y educativo**, pensado para ser **abierto y accesible para todos**.

A largo plazo, la visión es:

- Mapear **todo el BJJ** como un sistema completo
- Representar relaciones reales entre técnicas
- Facilitar el estudio sistémico del arte suave
- Construir rutas de aprendizaje dinámicas
- Evolucionar hacia análisis técnico avanzado

No busca ser una enciclopedia estática, sino un **ecosistema vivo de conocimiento**, capaz de crecer, adaptarse y profundizar a medida que el entendimiento del BJJ evoluciona.

---

## Estado del proyecto

En desarrollo activo. El sistema está diseñado para escalar progresivamente tanto en volumen de datos como en complejidad conceptual.

---

## Licencia

Uso educativo y experimental. Licencia por definir.

