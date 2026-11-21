<template>
  <div class="pantalla">
    <section class="panel-ranking text-center">
      <h2 class="titulo-seccion">Página no encontrada</h2>
      <p class="texto-ranking">La dirección que escribiste no existe.</p>
      <RouterLink class="btn-accion" :to="{ name: 'inicio' }">Volver al inicio</RouterLink>
    </section>
  </div>
</template>
