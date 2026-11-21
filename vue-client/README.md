# Cliente Vue 3 (versión individual)

Trivia para un jugador con **Vue 3 + Vite + TypeScript**. Habla con el mismo servidor Express que la versión Next.

## Ejecutar

Desde la raíz del repositorio, en dos terminales:

```bash
npm install
npm run dev:server    # http://localhost:4000
npm run dev:vue       # http://localhost:5173
```

La URL del servidor se cambia con `VITE_API_URL` (ver `.env.example`).

## Estructura

```
src/
  main.ts                 Arranque: Pinia + Router + estilos
  App.vue                 Marco común y <RouterView>
  router/index.ts         Rutas y guardias
  stores/partida.ts       Estado de la partida (Pinia)
  services/api.ts         Todas las llamadas a Express (fetch)
  composables/            useCuentaRegresiva
  views/                  Inicio, Juego, Resultado, Ranking, NoEncontrada
  components/             Encabezado, BarraNavegacion, BarraEstado, TarjetaPregunta, Cargando, ErrorCarga
```

## Conceptos de Vue y dónde aparecen

| Concepto | Dónde |
|---|---|
| Componentes de un solo archivo (`.vue`) con `<script setup>` | Todos los `.vue` |
| Reactividad: `ref`, `computed`, `watch` | `JuegoView.vue`, `RankingView.vue` |
| Directivas `v-if`, `v-else`, `v-for`, `v-model`, `:class`, `:key`, `@click`, `@submit.prevent` | `InicioView.vue`, `RankingView.vue`, `TarjetaPregunta.vue` |
| Props tipadas y eventos (`defineProps`, `defineEmits`) | `TarjetaPregunta.vue`, `BarraEstado.vue` |
| Pinia (estado compartido) | `stores/partida.ts` |
| Vue Router: rutas con parámetros, guardias `beforeEnter`, carga diferida | `router/index.ts` |
| Composable propio | `composables/useCuentaRegresiva.ts` |
| Consumo de la API REST (GET, POST, DELETE) | `services/api.ts` |

## Equivalencias con los ejemplos del curso

El curso muestra la **API de opciones** (`data()`, `methods`) con Vue CLI y Vuex. Aquí se usa la **API de composición**, que es la recomendada hoy: `data()` equivale a `ref`, `methods` a funciones normales y Vuex a Pinia. El proyecto está creado con Vite (Vue CLI está en mantenimiento).
