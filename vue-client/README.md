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
  stores/partida.ts       Estado de la partida (Pinia: state, getters, actions)
  services/api.ts         Todas las llamadas a Express (Axios)
  views/                  Inicio, Juego, Resultado, Ranking, NoEncontrada
  components/             Encabezado, BarraNavegacion, BarraEstado, TarjetaPregunta, Cargando, ErrorCarga
```

## Cómo se relaciona con el PowerPoint de la semana 16

| En el PowerPoint | En este proyecto |
|---|---|
| Framework reactivo: la vista se actualiza al cambiar los datos | `data()`, `computed` y `watch` en todos los componentes |
| Componentes reutilizables en archivos `.vue` | `components/` y `views/` |
| Directivas `v-if`, `v-for`, `v-bind` | `v-if`/`v-else` (carga y errores), `v-for` (opciones, filas), `:class`, `:key`, `:src` |
| `v-model` (ejemplo de la lista de tareas) | Nombre y filtros en `InicioView.vue` y `RankingView.vue` |
| API de opciones: `data()` y `methods` | Todos los componentes con lógica usan `defineComponent({ data, computed, methods, watch })` |
| `<template>`, `<script>` y `<style scoped>` | `ResultadoView.vue` y `RankingView.vue` tienen su `<style scoped>` |
| Vuex para el estado | Pinia, su reemplazo oficial, con la misma estructura (`state`, `getters`, `actions`) |
| Vue Router para el enrutamiento | `router/index.ts` (parámetros, guardias, carga diferida) |
| Servicio REST consumido con Axios (diapositiva 14) | `services/api.ts` |

**Hooks de ciclo de vida usados:** `mounted` (pedir los datos) y `beforeUnmount` (detener el reloj del juego).

### Diferencias respecto al PowerPoint

- **Instalación:** el curso usa `vue create` (Vue CLI), que hoy está en mantenimiento. Este proyecto se creó con Vite, la herramienta que recomienda Vue ahora.
- **Tareas:** el ejemplo del curso es una lista de tareas local. Aquí el mismo patrón (formulario, `v-for`, `v-model`) sirve para una trivia que consume una API.
