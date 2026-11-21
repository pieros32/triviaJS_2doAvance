<script setup lang="ts">
import BarraNavegacion from './components/BarraNavegacion.vue';
import Encabezado from './components/Encabezado.vue';
</script>

<template>
  <main class="aplicacion-trivia">
    <Encabezado />
    <BarraNavegacion />
    <RouterView />
  </main>
</template>
