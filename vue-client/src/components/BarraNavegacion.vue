<template>
  <nav aria-label="Menú principal">
    <ul class="nav nav-pills justify-content-center gap-2 menu-principal">
      <li class="nav-item">
        <RouterLink :to="{ name: 'inicio' }" class="nav-link">Inicio</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'ranking' }" class="nav-link">Ranking</RouterLink>
      </li>
    </ul>
  </nav>
</template>
