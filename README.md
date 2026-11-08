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
npm start     # levanta la API (3000) y la app (Vite) a la vez
```

Abre la dirección que indique Vite (normalmente http://localhost:5173). También puedes levantarlos por separado con `npm run api` y `npm run dev`.

API de prueba:

- `http://localhost:3000/franquicias`
- `http://localhost:3000/preguntas?franquicia=the-walking-dead&nivel=facil`

## Preguntas e imágenes

`db.json` tiene 6 franquicias con 30 preguntas cada una (10 por nivel: fácil, intermedio y experto). Los campos `imagen` y `tipo` de una pregunta son **opcionales**:

- Si una pregunta no tiene imagen ni tipo, la tarjeta se muestra en una sola columna, sin espacio vacío ni adornos.
- Dragon Ball no tiene imágenes todavía (`"imagen": null`). Para agregar una más adelante:
  1. Copia el archivo a `public/imagenes/`, por ejemplo `public/imagenes/goku.jpg`.
  2. En `db.json`, cambia en esa pregunta `"imagen": null` por `"imagen": "imagenes/goku.jpg"`.
  3. Opcionalmente agrega `"tipo": "Personaje"` (o `"Lugar"`, `"Profesión"`) para mostrar la insignia.

## Pantallas (React Router)

| URL | Qué muestra |
|---|---|
| `/` | Formulario: nombre del jugador, franquicia y dificultad (con validación) |
| `/jugar/:franquicia/:nivel` | La trivia, con temporizador de 20 s por pregunta |
| `/resultado` | Puntaje final (se guarda en el ranking) |
| `/ranking` | Historial de partidas con filtros por franquicia y dificultad |
| cualquier otra | Página no encontrada |

## Bootstrap y estilos propios

- **Bootstrap** se usa en el marcado (JSX): grilla `row`/`col`, formularios (`form-control`, `form-select`, `is-invalid`), `nav-pills`, `table`, `alert`, `badge`, `progress`, `spinner-border` y utilidades. El tema oscuro se activa con `data-bs-theme="dark"` en `index.html`.
- **CSS propio** (`src/styles/`) solo para la identidad visual, con estética **retrofuturista sobria**: fondo oscuro con rejilla tenue, acentos neón (verde, cian, magenta) y botones tipo pill. Está dividido en secciones:

| Archivo | Contenido |
|---|---|
| `index.css` | Índice: importa todas las secciones en orden |
| `variables.css` | Paleta y fuentes (se cambian aquí) |
| `bootstrap.css` | Ajustes de colores a componentes de Bootstrap (alertas, tabla, progreso, campos) |
| `base.css` | Fondo con rejilla y contenedor |
| `encabezado.css` | Marca, título y menú |
| `botones.css` | Botón de acción, secundario y selector de dificultad |
| `formularios.css` | Panel de inicio y etiquetas |
| `juego.css` | Marcador, tarjeta de pregunta, imagen y opciones |
| `resultado-ranking.css` | Pantalla de resultado, ranking y páginas informativas |

Fuentes: Orbitron (títulos) y Outfit (texto), cargadas desde Google Fonts en `index.html`.

## Temas del sílabo y dónde se usan

| Tema | Dónde |
|---|---|
| JSX / TSX, instalación, Bootstrap | Todo `src/` (archivos `.tsx`), `package.json`, `src/main.tsx` |
| Componentes | `src/components/` (Encabezado, BarraNavegacion, BarraEstado, TarjetaPregunta, ErrorCarga, Cargando) y `src/pages/` |
| Navegación | `src/App.tsx` (`Routes`), `NavLink`, `Link`, `useNavigate`, `useParams` |
| Formularios | `src/pages/Inicio.tsx` (formulario controlado con validación) y filtros de `src/pages/Ranking.tsx` |
| State Hooks | `useState` en las páginas; `useReducer` en `src/context/PartidaContext.tsx` |
| Context Hooks | `PartidaContext` (`createContext`, `useContext` en `usePartida`) |
| Ref Hooks | `useRef` guarda el id del temporizador en `src/pages/Juego.tsx` |
| Resource Hooks | `useEffect` + `fetch` en `Inicio.tsx` y `Juego.tsx`, con estados de carga y error |

## Estructura

```
db.json                       ← backend (franquicias y preguntas)
index.html                    ← página única de Vite
public/imagenes/              ← imágenes de las preguntas (se sirven en /imagenes/...)
src/main.tsx                  ← punto de entrada (Bootstrap, estilos, Router y contexto)
src/App.tsx                   ← encabezado, menú y rutas
src/styles/                   ← estilos propios por secciones (ver tabla arriba)
src/models/trivia.ts          ← tipos Nivel, Pregunta, Franquicia, RegistroRanking
src/context/PartidaContext.tsx← estado de la partida (useReducer + Context)
src/services/api.ts           ← GET al backend
src/utils/                    ← mezclar (Fisher–Yates) y ranking (localStorage)
src/components/               ← componentes reutilizables
src/pages/                    ← Inicio, Juego, Resultado, Ranking, NoEncontrada
```
