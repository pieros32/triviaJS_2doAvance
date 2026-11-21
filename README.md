# ¡TRIVIA POP! Multijugador

Trivia de cine y series en tiempo real, hasta 4 jugadores por sala. Este repositorio sirve para **comparar dos frontends (Vue.js y Next.js) contra el mismo backend (Express + Socket.IO)**.

## Ramas

| Rama | Contenido |
|---|---|
| `ultimo-avance` | La trivia individual en React (proyecto anterior, intacto). |
| `base-multijugador` | Solo el backend compartido (`server/`) y los recursos comunes (`shared/`). Sin interfaz. |
| `implementacion-vue` | Base + cliente Vue 3 (`vue-client/`). |
| `implementacion-next` | Base + cliente Next.js (`next-client/`). |

Las dos implementaciones salen de `base-multijugador`, así que comparten **exactamente** el mismo servidor, el mismo contrato de eventos y el mismo CSS. Lo único que cambia entre ellas es el framework del cliente.

## Estructura

```
server/    Express (REST) + Socket.IO (tiempo real). Es la autoridad del juego.
shared/    Tipos TypeScript del contrato (src/) y estilos CSS comunes (estilos/).
```

## Cómo ejecutar el servidor

```bash
npm install
npm run dev:server     # http://localhost:4000
npm test               # 15 pruebas (unitarias y de integración)
```

Variables opcionales: `PORT`, `CORS_ORIGINS`, `TIEMPO_PREGUNTA_MS`, `TIEMPO_REVELACION_MS`, `PREGUNTAS_POR_PARTIDA`, `ARCHIVO_RANKING`.

## Reglas del juego

- Una persona crea la sala (elige franquicia y dificultad) y recibe un **código de 4 letras**; las demás entran con ese código.
- Mínimo 2 y máximo 4 jugadores. Solo el **anfitrión** inicia la partida y pide la revancha.
- 10 preguntas por partida, 15 segundos cada una. Todos ven la misma pregunta a la vez.
- Acertar da 100 puntos + hasta 100 de bono por rapidez. Si todos responden, se revela sin esperar el tiempo.
- Al terminar, los resultados se guardan en el **ranking global**.
- No se puede entrar a una partida en curso. Si un jugador se desconecta a mitad de partida, queda marcado como desconectado; si se recarga la página, pierde su lugar (no hay reconexión).

## Por qué el servidor manda

El navegador **nunca recibe la respuesta correcta**: solo envía qué opción eligió y el servidor decide si acertó, controla el temporizador y calcula los puntos. Así nadie puede hacer trampa mirando la pestaña Network. Por la misma razón el ranking es de solo lectura por REST: lo escribe el servidor al terminar una partida.

## API REST (`http://localhost:4000`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/franquicias` | Lista de franquicias. |
| GET | `/api/preguntas?franquicia=&nivel=` | Preguntas **sin** la respuesta y con las opciones mezcladas. |
| GET | `/api/ranking?franquicia=&nivel=&limite=` | Ranking global ordenado por puntaje. |
| GET | `/api/salud` | Comprobación de estado. |
| GET | `/imagenes/...` | Imágenes de las preguntas. |

## Contrato de Socket.IO

Los tipos exactos están en `shared/src/index.ts` (`ClientToServerEvents` y `ServerToClientEvents`). Los dos clientes lo cumplen igual.

**Cliente → servidor** (todos responden con un `ack`: `{ ok: true, data }` o `{ ok: false, error }`)

| Evento | Datos | Quién |
|---|---|---|
| `sala:crear` | `{ jugador, franquicia, nivel }` → `{ codigo, jugadorId }` | cualquiera |
| `sala:unirse` | `{ codigo, jugador }` → `{ codigo, jugadorId }` | cualquiera |
| `sala:salir` | — | jugador en sala |
| `partida:iniciar` | — | anfitrión |
| `partida:responder` | `{ opcion }` | jugador |
| `partida:revancha` | — | anfitrión |

**Servidor → todos los de la sala**

| Evento | Cuándo |
|---|---|
| `sala:estado` | Cambia algo de la sala (jugadores, fase, quién respondió). |
| `partida:pregunta` | Empieza una pregunta (incluye `duracionMs`). |
| `partida:revelado` | Termina una pregunta: respuesta correcta y puntos de cada jugador. |
| `partida:fin` | Termina la partida: clasificación final. |

Fases de la sala: `espera` → `pregunta` ⇄ `revelado` → `terminada` → (revancha) → `espera`.
