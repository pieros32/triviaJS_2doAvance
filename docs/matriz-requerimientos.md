# Matriz de requerimientos de funcionalidades — Trivia Pop (React)

Alcance: sesiones 22 a 26 del sílabo.

1. Introducción a React: concepto, instalación, creación de proyectos, JSX, TSX, Bootstrap.
2. Elementos de React: navegación, componentes, formularios.
3. Hooks: state Hooks, context Hooks, ref Hooks, resource Hooks.

Base de partida: trivia con elección de franquicia y nivel, preguntas con opciones y pantalla de resultado (versión HTML/CSS/JS, commit `8cada77`).

| ID | Funcionalidad | Qué aporta | Tema del sílabo | Dónde se ve | Prioridad |
|---|---|---|---|---|---|
| RF-01 | Proyecto React con TSX y Bootstrap | Base de la app con los tipos `Nivel`, `Pregunta` y `Franquicia` | Instalación, creación de proyecto, JSX/TSX, Bootstrap | Toda la app | Imprescindible |
| RF-02 | Componentes reutilizables | Encabezado, barra de estado, tarjeta de pregunta y aviso de error | Componentes | Todas las pantallas | Imprescindible |
| RF-03 | Navegación entre pantallas | Inicio, Juego, Resultado, Ranking y pantalla para rutas inexistentes | Navegación | Barra superior y URLs | Imprescindible |
| RF-04 | Nombre del jugador con validación | Se pide un nombre al empezar (mínimo 2 caracteres); se muestra al jugar y en el resultado | Formularios | Inicio | Imprescindible |
| RF-05 | Estado de la partida | Pregunta actual, puntaje y respuesta elegida | State Hooks (`useState`, `useReducer`) | Juego | Imprescindible |
| RF-06 | Partida compartida entre pantallas | Juego, Resultado y Ranking leen la misma partida sin pasar datos de uno en uno | Context Hooks | Juego, Resultado | Imprescindible |
| RF-07 | Temporizador por pregunta | 20 segundos por pregunta; al agotarse cuenta como incorrecta | Ref Hooks (`useRef` guarda el temporizador) | Barra de estado | Deseable |
| RF-08 | Carga de datos con estado de espera | Mensaje de carga y de error mientras llegan franquicias y preguntas, con `useEffect` y `fetch` | Resource Hooks | Inicio, Juego | Deseable |
| RF-09 | Ranking de partidas | Historial con nombre, franquicia, nivel y puntaje, guardado en el navegador | Navegación, Context, State | Pantalla Ranking | Deseable |
| RF-10 | Filtros del ranking | Filtrar por franquicia y nivel | Formularios | Ranking | Deseable |

## Decisiones

- **RF-08:** se usa `useEffect` con `fetch` y no `use`/`Suspense`, para ajustarse a la versión que trabaja el sílabo.
- **Fuera del alcance:** comodín 50/50 y foco automático (eran RF-11 y RF-12), por ser prescindibles.
- **Fuera del alcance:** guardar el ranking en el servidor (requiere POST, no está en los temas), login, Redux, animaciones y estadísticas avanzadas.
- **Ref Hooks:** quedan cubiertos por el temporizador (RF-07).

## Mapa de temas del sílabo

| Tema | Requerimientos |
|---|---|
| Instalación, JSX, TSX, Bootstrap | RF-01 |
| Componentes | RF-02 |
| Navegación | RF-03, RF-09 |
| Formularios | RF-04, RF-10 |
| State Hooks | RF-05, RF-09 |
| Context Hooks | RF-06, RF-09 |
| Ref Hooks | RF-07 |
| Resource Hooks | RF-08 |
