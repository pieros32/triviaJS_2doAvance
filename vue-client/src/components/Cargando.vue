<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Cargando',
  props: { texto: { type: String, default: 'Cargando…' } }
});
</script>

<template>
  <div class="estado-carga d-flex justify-content-center align-items-center gap-2" role="status">
    <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    {{ texto }}
  </div>
</template>
