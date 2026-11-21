<script setup lang="ts">
import { NIVELES, NOMBRE_MAX, NOMBRE_MIN, NOMBRES_NIVEL, type Franquicia, type Nivel } from '@trivia/shared';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import Cargando from '../components/Cargando.vue';
import ErrorCarga from '../components/ErrorCarga.vue';
import { obtenerFranquicias } from '../services/api';
import { usePartidaStore } from '../stores/partida';

const router = useRouter();
const partida = usePartidaStore();

const franquicias = ref<Franquicia[]>([]);
const cargando = ref(true);
const errorConexion = ref(false);

const nombre = ref(partida.jugador);
const franquicia = ref('');
const nivel = ref<Nivel | ''>('');
const intentado = ref(false);

onMounted(async () => {
  try {
    franquicias.value = await obtenerFranquicias();
    franquicia.value = franquicias.value[0]?.slug ?? '';
  } catch {
    errorConexion.value = true;
  } finally {
    cargando.value = false;
  }
});

const errorNombre = computed(() => {
  const largo = nombre.value.trim().length;
  if (largo < NOMBRE_MIN) return `Escribe al menos ${NOMBRE_MIN} caracteres.`;
  if (largo > NOMBRE_MAX) return `Máximo ${NOMBRE_MAX} caracteres.`;
  return '';
});
const errorNivel = computed(() => (nivel.value === '' ? 'Elige una dificultad.' : ''));
const hayErrores = computed(() => Boolean(errorNombre.value || errorNivel.value || !franquicia.value));

function comenzar() {
  intentado.value = true;
  if (hayErrores.value || nivel.value === '') return;

  const elegida = franquicias.value.find((f) => f.slug === franquicia.value);
  partida.configurar(nombre.value.trim(), elegida?.nombre ?? franquicia.value);
  router.push({ name: 'juego', params: { franquicia: franquicia.value, nivel: nivel.value } });
}
</script>

<template>
  <Cargando v-if="cargando" texto="Cargando franquicias…" />

  <div v-else class="pantalla">
    <ErrorCarga
      v-if="errorConexion"
      titulo="Error de conexión:"
      mensaje="No se pudo contactar con el servidor. Verifica que esté encendido (npm run dev:server) y recarga la página."
    />

    <form class="panel-configuracion" aria-label="Configuración de la trivia" novalidate @submit.prevent="comenzar">
      <div class="row g-4">
        <div class="col-md-6">
          <label class="etiqueta-configuracion mb-2" for="campoNombre">Nombre del jugador</label>
          <input
            id="campoNombre"
            v-model="nombre"
            type="text"
            class="form-control form-control-lg"
            :class="{ 'is-invalid': intentado && errorNombre }"
            placeholder="Ej. Rick"
            autocomplete="off"
          />
          <div class="invalid-feedback">{{ errorNombre }}</div>
        </div>

        <div class="col-md-6">
          <label class="etiqueta-configuracion mb-2" for="selectorFranquicia">Selecciona una Franquicia</label>
          <select id="selectorFranquicia" v-model="franquicia" class="form-select form-select-lg">
            <option v-for="f in franquicias" :key="f.id" :value="f.slug">{{ f.nombre }}</option>
          </select>
        </div>

        <div class="col-12">
          <span class="etiqueta-configuracion d-block mb-2">Dificultad</span>
          <div class="row g-2" role="group" aria-label="Dificultad">
            <div v-for="n in NIVELES" :key="n" class="col-4">
              <button
                type="button"
                class="btn btn-nivel w-100"
                :class="{ activo: nivel === n }"
                :aria-pressed="nivel === n"
                @click="nivel = n"
              >
                {{ NOMBRES_NIVEL[n] }}
              </button>
            </div>
          </div>
          <div v-if="intentado && errorNivel" class="text-danger small mt-2">{{ errorNivel }}</div>
        </div>

        <div class="col-12">
          <button type="submit" class="btn-accion" :disabled="franquicias.length === 0">Comenzar</button>
        </div>
      </div>
    </form>
  </div>
</template>
