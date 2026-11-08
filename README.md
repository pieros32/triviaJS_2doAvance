# Trivia Pop — React + TSX (Tercer Avance)

Trivia de cine y series hecha con **React, TypeScript (TSX) y Bootstrap**, construida con Vite. El backend de lectura es **json-server** (`db.json`).

Historia del proyecto:

- Rama `main`: versión con Angular (Segundo Avance).
- Commit `8cada77`: base limpia en HTML, CSS y JS puro.
- Esta rama (`tercer-avance`): migración a React.

Los requerimientos de funcionalidades están en [`docs/matriz-requerimientos.md`](docs/matriz-requerimientos.md).

## Cómo ejecutarlo

Requiere **Node.js LTS**.

```bash
npm install   # solo la primera vez
npm start     # levanta la API (3000) y la app (5173) a la vez
```

Abre http://localhost:5173. También puedes levantarlos por separado con `npm run api` y `npm run dev`.

API de prueba:

- `http://localhost:3000/franquicias`
- `http://localhost:3000/preguntas?franquicia=the-walking-dead&nivel=facil`

## Estructura

```
db.json                ← backend (franquicias y preguntas)
index.html             ← página única de Vite
public/imagenes/       ← imágenes de las preguntas (se sirven en /imagenes/...)
src/main.tsx           ← punto de entrada (carga Bootstrap y styles.css)
src/App.tsx            ← componente raíz
src/styles.css         ← estilos propios (sobre Bootstrap)
src/models/trivia.ts   ← tipos Nivel, Pregunta, Franquicia
```
