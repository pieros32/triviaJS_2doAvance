# Trivia Pop — versión Angular

Versión independiente de la trivia de `TriviaPop_JScurso`, reconstruida con los temas de la **Unidad 2 (Node, TypeScript y Angular)** que encajan de forma natural con el proyecto. El repositorio original no se modificó: esta carpeta es un proyecto aparte.

Contenido: las 30 preguntas originales de The Walking Dead (sin tocar) más **120 preguntas nuevas** (30 por franquicia, 10 por nivel) para Breaking Bad, Game of Thrones, Stranger Things y The Last of Us. Las preguntas nuevas se escribieron de memoria: revísalas por si hay algún dato incorrecto.

## Requisitos

- **Node.js LTS** (versión 20.19 o superior, 22.12 o superior, o 24). Verifica con `node -v`.

## Cómo ejecutarlo

Se necesitan **dos terminales abiertas en esta carpeta**: una para el backend (json-server) y otra para Angular.

```bash
npm install      # solo la primera vez

# Terminal 1: backend (http://localhost:3000)
npm run api

# Terminal 2: aplicación (http://localhost:4200)
npm start
```

Abre http://localhost:4200. Si el backend está apagado, la app muestra un aviso de "Error de conexión".

Puedes probar el backend directamente en el navegador o con el navegador, curl, Postman o Thunder Client:

- `http://localhost:3000/franquicias`
- `http://localhost:3000/preguntas?franquicia=the-walking-dead&nivel=facil`

## Qué tema de la unidad se usa y dónde

| Tema del temario | Dónde está en el proyecto |
|---|---|
| NodeJS (consola, npm) | Se usa como herramienta: `npm install`, `npm start`, `npm run api` |
| TypeScript | `src/app/models/trivia.models.ts` (tipos `Nivel`, `Pregunta`, `Franquicia`) y todo el código de `src/app` |
| Componentes | `src/app/components/` (encabezado, barra de estado, tarjeta de pregunta, banner de error) y `src/app/pages/` (inicio, juego, resultado) |
| Comunicación entre componentes | `@Input()` / `@Output()` en `tarjeta-pregunta`, `barra-estado` y `error-carga` |
| Directivas estructurales | `*ngFor` (opciones, franquicias, niveles) y `*ngIf` (errores, carga, resultado) |
| Directivas de atributo | `[ngClass]` en las opciones (`correcta` / `incorrecta`) y en el botón de nivel (`activo`) |
| Navegación | `src/app/app.routes.ts`, `routerLink`, parámetros de ruta en `juego.component.ts` |
| Pipes | `nivel-nombre.pipe.ts` (pipe propio) y `percent` (en la pantalla de resultado) |
| Formularios | Formulario reactivo con validación en `pages/inicio` |
| Servicios + backend JSON + REST | `db.json` (json-server), `services/preguntas.service.ts` (`GET` con `HttpClient`) y `services/quiz.service.ts` (estado de la partida) |
| Herramientas de prueba REST | Las URLs de arriba (probadas con curl y el navegador; también puedes usar Postman o Thunder Client) |

## Rutas

| URL | Qué muestra |
|---|---|
| `/` | Formulario: franquicia + dificultad |
| `/jugar/:franquicia/:nivel` | La trivia (por ejemplo `/jugar/the-walking-dead/facil`) |
| `/resultado` | Puntaje final, con botones para jugar de nuevo o elegir otro nivel |

## Estructura

```
db.json                          ← backend (franquicias y preguntas)
public/imagenes/                 ← imágenes originales (TWD) + 12 ilustraciones genéricas .svg
src/styles.css                   ← estilos del proyecto original + unos pocos añadidos
src/app/
  models/trivia.models.ts        ← tipos TypeScript
  services/preguntas.service.ts  ← GET al backend
  services/quiz.service.ts       ← estado de la partida (puntaje, pregunta actual)
  pipes/nivel-nombre.pipe.ts     ← "facil" → "Fácil"
  utils/mezclar.ts               ← mezcla de opciones (Fisher–Yates)
  components/                    ← piezas reutilizables
  pages/                         ← una por ruta
  app.routes.ts                  ← navegación
  app.config.ts                  ← configuración (router + HttpClient)
```

Para entender el código, léelo en este orden: `models` → `services` → `pipes` → `components` → `pages` → `app.routes.ts`. Los archivos tienen comentarios que explican cada concepto.

## Cambios respecto a la versión en JavaScript puro

- **Flujo en tres pantallas.** Antes, tocar un nivel iniciaba el juego de inmediato. Ahora se elige franquicia y nivel en un formulario y se pulsa **Comenzar** (queda deshabilitado hasta elegir un nivel). La pantalla de resultado tiene botones para volver a jugar, que antes no existían.
- **Datos desde un backend.** Las preguntas ya no están dentro del JS: se piden con `GET` a json-server. Si una franquicia no tiene preguntas muestra el aviso "Sin preguntas", y si el servidor está apagado, "Error de conexión". Antes el banner de error se mostraba de forma simulada.
- **Mezcla de opciones corregida.** Se reemplazó `sort(() => Math.random() - 0.5)` (mezcla sesgada) por Fisher–Yates.
- **Respuesta comparada tal cual.** Se quitó el `toLowerCase().trim()`, innecesario porque las opciones y la respuesta salen del mismo JSON.
- **`#errorCarga` en el CSS.** Ya no se oculta con la clase `.visible`: el componente solo existe cuando hay error.

Las preguntas de The Walking Dead no se modificaron. Al revisarlas, hay algunas repetidas o casi repetidas entre niveles (por ejemplo, la profesión de Hershel en fácil e intermedio, Edwin Jenner/CDC en fácil y experto, y varias sobre Woodbury y el Gobernador). Puedes editarlas directamente en `db.json`; json-server recarga solo.

## Imágenes de las franquicias nuevas

Son ilustraciones genéricas originales (silueta, pin de mapa, maletín), una por tipo de pregunta y franquicia, sin capturas, afiches ni logos de las series. Para usar tus propias imágenes: copia el archivo a `public/imagenes/` y cambia el campo `imagen` de la pregunta en `db.json`.

## Qué no se incluyó (a propósito)

No se agregó lo que habría quedado forzado en este proyecto:

- **Bootstrap.** El proyecto ya tiene un diseño propio completo (tema oscuro, 560 líneas de CSS). Instalarlo chocaría con ese diseño. Si el docente lo exige, se puede agregar (`npm install bootstrap` y un `import` en `angular.json`) usándolo solo para la cuadrícula de layout.
- **`POST`, `PUT` y `DELETE`.** No hay ninguna función que los necesite (no hay ranking, ni edición de preguntas). `POST` tendría sentido si se agrega un ranking de jugadores.
- **`ngStyle`.** Con `ngClass` y el CSS existente no hay dónde aplicarla de forma natural.

Confirma con el docente si la rúbrica exige alguno de estos puntos de forma explícita.

## Notas técnicas

- Proyecto creado con **Angular 20** (componentes standalone, `zone.js`). Se usa `*ngIf` / `*ngFor` porque es lo que cubre el temario; las versiones recientes de Angular recomiendan la sintaxis nueva `@if` / `@for`, que funciona igual.
- Los archivos usan el sufijo clásico (`.component.ts`, `.service.ts`, `.pipe.ts`) porque es el que usan la mayoría de tutoriales y materiales de curso.
- json-server está fijado en la versión **0.17.4**. La 1.x (todavía en beta) cambió su forma de uso, así que el script `npm run api` podría no funcionar igual con ella.
- `ng build` (producción) descarga las fuentes de Google al compilar, así que necesita internet.

## Problemas comunes

- **`'ng' no se reconoce`** → ejecuta `npm install` dentro de esta carpeta (el comando `npm start` usa el Angular local).
- **El puerto 3000 o 4200 está ocupado** → cierra la terminal que lo usa o cambia el puerto (`--port 3001` en `npm run api`; en ese caso actualiza `api` en `preguntas.service.ts`).
- **La app carga pero muestra "Error de conexión"** → falta encender `npm run api` en la otra terminal.
