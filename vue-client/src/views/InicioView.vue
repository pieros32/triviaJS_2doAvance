<script lang="ts">
import { NIVELES, NOMBRE_MAX, NOMBRE_MIN, NOMBRES_NIVEL, type Franquicia, type Nivel } from '@trivia/shared';
import { defineComponent } from 'vue';

import Cargando from '../components/Cargando.vue';
import ErrorCarga from '../components/ErrorCarga.vue';
import { obtenerFranquicias } from '../services/api';
import { usePartidaStore } from '../stores/partida';

export default defineComponent({
  name: 'InicioView',
  components: { Cargando, ErrorCarga },
  data() {
    return {
      NIVELES,
      NOMBRES_NIVEL,
      franquicias: [] as Franquicia[],
      cargando: true,
      errorConexion: false,
      nombre: usePartidaStore().jugador,
      franquicia: '',
      nivel: '' as Nivel | '',
      intentado: false
    };
  },
  computed: {
    partida() {
      return usePartidaStore();
    },
    errorNombre(): string {
      const largo = this.nombre.trim().length;
      if (largo < NOMBRE_MIN) return `Escribe al menos ${NOMBRE_MIN} caracteres.`;
      if (largo > NOMBRE_MAX) return `Máximo ${NOMBRE_MAX} caracteres.`;
      return '';
    },
    errorNivel(): string {
      return this.nivel === '' ? 'Elige una dificultad.' : '';
    },
    hayErrores(): boolean {
      return Boolean(this.errorNombre || this.errorNivel || !this.franquicia);
    }
  },
  async mounted() {
    try {
      this.franquicias = await obtenerFranquicias();
      this.franquicia = this.franquicias[0]?.slug ?? '';
    } catch {
      this.errorConexion = true;
    } finally {
      this.cargando = false;
    }
  },
  methods: {
    comenzar() {
      this.intentado = true;
      if (this.hayErrores || this.nivel === '') return;

      const elegida = this.franquicias.find((f) => f.slug === this.franquicia);
      this.partida.configurar(this.nombre.trim(), elegida?.nombre ?? this.franquicia);
      this.$router.push({ name: 'juego', params: { franquicia: this.franquicia, nivel: this.nivel } });
    }
  }
});
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
