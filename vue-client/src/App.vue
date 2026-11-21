<script lang="ts">
import { defineComponent } from 'vue';

import BarraNavegacion from './components/BarraNavegacion.vue';
import Encabezado from './components/Encabezado.vue';

export default defineComponent({
  name: 'App',
  components: { BarraNavegacion, Encabezado }
});
</script>

<template>
  <main class="aplicacion-trivia">
    <Encabezado />
    <BarraNavegacion />
    <RouterView />
  </main>
</template>
