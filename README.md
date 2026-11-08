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
- **CSS propio** (`src/styles.css`) solo para la identidad visual: colores, tarjeta de pregunta, opciones y botones de acción.

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
src/App.tsx                   ← encabezado, menú, rutas y pie
src/styles.css                ← estilos propios (sobre Bootstrap)
src/models/trivia.ts          ← tipos Nivel, Pregunta, Franquicia, RegistroRanking
src/context/PartidaContext.tsx← estado de la partida (useReducer + Context)
src/services/api.ts           ← GET al backend
src/utils/                    ← mezclar (Fisher–Yates) y ranking (localStorage)
src/components/               ← componentes reutilizables
src/pages/                    ← Inicio, Juego, Resultado, Ranking, NoEncontrada
```
