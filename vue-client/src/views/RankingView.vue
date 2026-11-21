<script setup lang="ts">
import { NIVELES, NOMBRES_NIVEL, type Franquicia, type Nivel, type RegistroRanking } from '@trivia/shared';
import { onMounted, ref, watch } from 'vue';

import Cargando from '../components/Cargando.vue';
import ErrorCarga from '../components/ErrorCarga.vue';
import { eliminarPartida, obtenerFranquicias, obtenerRanking, vaciarRanking } from '../services/api';

const COLOR_NIVEL: Record<Nivel, string> = {
  facil: 'text-bg-success',
  intermedio: 'text-bg-warning',
  experto: 'text-bg-danger'
};

const registros = ref<RegistroRanking[]>([]);
const franquicias = ref<Franquicia[]>([]);
const filtroFranquicia = ref('');
const filtroNivel = ref<Nivel | ''>('');
const cargando = ref(true);
const error = ref('');

let ultimaPeticion = 0;

async function cargar() {
  const numero = ++ultimaPeticion;
  cargando.value = true;
  error.value = '';
  try {
    const datos = await obtenerRanking(filtroFranquicia.value, filtroNivel.value);
    if (numero === ultimaPeticion) registros.value = datos; // descarta respuestas viejas
  } catch (e) {
    if (numero === ultimaPeticion) error.value = (e as Error).message;
  } finally {
    if (numero === ultimaPeticion) cargando.value = false;
  }
}

watch([filtroFranquicia, filtroNivel], cargar);

onMounted(async () => {
  await cargar();
  try {
    franquicias.value = await obtenerFranquicias();
  } catch {
    // sin lista de franquicias el filtro queda solo con "Todas"
  }
});

async function borrar(id: string) {
  try {
    await eliminarPartida(id); // DELETE /api/ranking/:id
    await cargar();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

async function borrarHistorial() {
  if (!window.confirm('¿Borrar todo el historial del ranking? Esta acción no se puede deshacer.')) return;
  try {
    await vaciarRanking(); // DELETE /api/ranking
    filtroFranquicia.value = '';
    filtroNivel.value = '';
    await cargar();
  } catch (e) {
    error.value = (e as Error).message;
  }
}
</script>

<template>
  <div class="pantalla">
    <section class="panel-ranking">
      <h2 class="titulo-seccion">Ranking</h2>

      <form class="row g-3 mb-4" aria-label="Filtros del ranking" @submit.prevent>
        <div class="col-md-5">
          <label class="etiqueta-configuracion mb-2" for="filtroFranquicia">Franquicia</label>
          <select id="filtroFranquicia" v-model="filtroFranquicia" class="form-select">
            <option value="">Todas</option>
            <option v-for="f in franquicias" :key="f.id" :value="f.slug">{{ f.nombre }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="etiqueta-configuracion mb-2" for="filtroNivel">Dificultad</label>
          <select id="filtroNivel" v-model="filtroNivel" class="form-select">
            <option value="">Todas</option>
            <option v-for="n in NIVELES" :key="n" :value="n">{{ NOMBRES_NIVEL[n] }}</option>
          </select>
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button type="button" class="btn btn-outline-danger w-100" @click="borrarHistorial">Borrar historial</button>
        </div>
      </form>

      <Cargando v-if="cargando" texto="Cargando ranking…" />
      <ErrorCarga v-else-if="error" titulo="Error:" :mensaje="error" />
      <p v-else-if="registros.length === 0" class="texto-ranking text-center mb-0">
        Todavía no hay partidas con esos filtros. ¡Juega una para aparecer aquí!
      </p>
      <div v-else class="table-responsive">
        <table class="table table-striped table-hover align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Jugador</th>
              <th scope="col">Franquicia</th>
              <th scope="col">Nivel</th>
              <th scope="col" class="text-end">Puntaje</th>
              <th scope="col" class="text-end d-none d-md-table-cell">Fecha</th>
              <th scope="col"><span class="visually-hidden">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in registros" :key="r.id">
              <th scope="row">{{ i + 1 }}</th>
              <td class="fw-bold">{{ r.jugador }}</td>
              <td>{{ r.franquiciaNombre }}</td>
              <td>
                <span class="badge" :class="COLOR_NIVEL[r.nivel]">{{ NOMBRES_NIVEL[r.nivel] }}</span>
              </td>
              <td class="text-end">
                {{ r.puntaje }}/{{ r.total }}
                <span class="text-secondary">({{ Math.round((r.puntaje / r.total) * 100) }}%)</span>
              </td>
              <td class="text-end d-none d-md-table-cell">{{ new Date(r.fecha).toLocaleDateString('es-PE') }}</td>
              <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-danger" :aria-label="`Borrar la partida de ${r.jugador}`" @click="borrar(r.id)">
                  Borrar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
