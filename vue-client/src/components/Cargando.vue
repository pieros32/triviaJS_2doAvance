<script setup lang="ts">
withDefaults(defineProps<{ texto?: string }>(), { texto: 'Cargando…' });
</script>

<template>
  <div class="estado-carga d-flex justify-content-center align-items-center gap-2" role="status">
    <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    {{ texto }}
  </div>
</template>
