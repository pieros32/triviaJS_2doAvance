# ¡TRIVIA POP! Versión individual

Trivia de cine y series para un jugador. Este repositorio sirve para **comparar dos frontends (Vue.js y Next.js) contra el mismo backend Express**, que ofrece una API REST con CRUD completo.

## Ramas

| Rama | Contenido |
|---|---|
| `ultimo-avance` | La trivia en React con json-server (proyecto anterior, intacto). |
| `base-individual` | Solo el backend Express (`server/`) y los recursos comunes (`shared/`). Sin interfaz. |
| `implementacion-vue-individual` | Base + cliente Vue 3 (`vue-client/`). |
| `implementacion-next-individual` | Base + cliente Next.js (`next-client/`). |
| `base-multijugador` y `implementacion-*` | Versión multijugador con Socket.IO (trabajo aparte, opcional). |

Las dos implementaciones salen de `base-individual`: comparten el mismo servidor, la misma API y el mismo CSS. Lo único que cambia entre ellas es el framework del cliente.

## Estructura

```
server/    Express: API REST, imágenes y "base de datos" en archivos JSON.
shared/    Tipos TypeScript del contrato (src/) y estilos CSS comunes (estilos/).
```

## Cómo ejecutar el servidor

```bash
npm install
npm run dev:server     # http://localhost:4000
npm test               # 13 pruebas de la API
```

Variables opcionales: `PORT`, `CORS_ORIGINS`, `ARCHIVO_RANKING`.

## API REST (`http://localhost:4000`)

| Método | Ruta | Descripción | Código |
|---|---|---|---|
| GET | `/api/franquicias` | Lista de franquicias. | 200 |
| GET | `/api/preguntas?franquicia=&nivel=` | Preguntas **sin** la respuesta y con las opciones mezcladas. | 200 / 400 |
| POST | `/api/preguntas/:id/respuesta` | Cuerpo `{ "opcion": "..." }` (o `null` si se acabó el tiempo). Responde `{ correcta, respuestaCorrecta }`. | 200 / 400 / 404 |
| GET | `/api/ranking?franquicia=&nivel=&limite=` | Ranking ordenado por porcentaje de aciertos. | 200 / 400 |
| POST | `/api/ranking` | Guarda una partida: `{ jugador, franquicia, nivel, puntaje, total }`. | **201** / 400 |
| DELETE | `/api/ranking/:id` | Borra una partida. | **204** / 404 |
| DELETE | `/api/ranking` | Borra todo el historial. | **204** |
| GET | `/imagenes/...` | Imágenes de las preguntas (`express.static`). | 200 |

Probar con curl:

```bash
curl http://localhost:4000/api/franquicias
curl -X POST http://localhost:4000/api/preguntas/1/respuesta -H "Content-Type: application/json" -d '{"opcion":"Rick Grimes"}'
curl -X POST http://localhost:4000/api/ranking -H "Content-Type: application/json" -d '{"jugador":"Ana","franquicia":"dragon-ball","nivel":"facil","puntaje":7,"total":10}'
curl -X DELETE http://localhost:4000/api/ranking
```

## Qué de Express se usa

| Concepto | Dónde |
|---|---|
| `express()` y `app.listen` | `src/app.ts`, `src/index.ts` |
| Middleware: `express.json`, `cors`, `express.static` | `src/app.ts` |
| Middleware propio de 404 y de errores | `src/middleware/errores.ts` |
| Rutas modulares con `Router` | `src/rutas/*.ts` |
| `req.query`, `req.params`, `req.body` | `rutas/preguntas.ts`, `rutas/ranking.ts` |
| Códigos de estado 200, 201, 204, 400, 404 | `rutas/*.ts` |
| Archivo JSON como base de datos (`fs`) | `src/ranking/almacen.ts`, `src/datos/repositorio.ts` |

## Decisiones

- **La respuesta correcta no viaja al navegador.** El cliente envía la opción y el servidor responde si acertó.
- **Validación simple del ranking:** el servidor comprueba que los datos sean coherentes y que el puntaje no supere el total posible. No impide que alguien envíe un puntaje falso dentro de ese rango; para un curso es suficiente.
