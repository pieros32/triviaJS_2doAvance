# Trivia Pop — HTML, CSS y JavaScript (base para el Tercer Avance)

Versión sin frameworks de la trivia: solo **HTML + CSS + JavaScript** (módulos ES) y un backend de lectura con **json-server** (`db.json`). Es el punto de partida limpio desde el cual se migrará a **React** en este mismo branch (`tercer-avance`).

La versión con Angular (Segundo Avance) sigue intacta en la rama `main`.

## Cómo ejecutarlo

Requiere **Node.js LTS**.

```bash
npm install   # solo la primera vez
npm start
```

Abre http://localhost:3000. json-server sirve a la vez la API y la carpeta `public/` (la app).

API de prueba:

- `http://localhost:3000/franquicias`
- `http://localhost:3000/preguntas?franquicia=the-walking-dead&nivel=facil`

## Pantallas (router por hash)

| URL | Qué muestra |
|---|---|
| `#/` | Formulario: franquicia + dificultad |
| `#/jugar/:franquicia/:nivel` | La trivia (por ejemplo `#/jugar/the-walking-dead/facil`) |
| `#/resultado` | Puntaje final |

## Estructura

```
db.json                  ← backend (franquicias y preguntas)
public/index.html        ← página única
public/css/styles.css    ← estilos propios (sobre Bootstrap en css/vendor/)
public/js/main.js        ← router
public/js/vistas.js      ← pantallas de inicio, juego y resultado
public/js/quiz.js        ← estado de la partida
public/js/api.js         ← GET al backend
public/js/utils.js       ← niveles, mezclar (Fisher–Yates), helpers
public/imagenes/         ← imágenes de las preguntas
```
