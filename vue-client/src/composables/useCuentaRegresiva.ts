import { computed, onScopeDispose, ref, watch, type Ref } from 'vue';

/**
 * Segundos que faltan para `finEn` (marca de tiempo en ms). Solo corre mientras `activa` sea true.
 * Equivale al useRef + setInterval de la versión React: aquí el temporizador vive en el ámbito del componente.
 */
export function useCuentaRegresiva(finEn: Ref<number>, activa: Ref<boolean>) {
  const ahora = ref(Date.now());
  let intervalo: number | null = null;

  function detener() {
    if (intervalo !== null) {
      window.clearInterval(intervalo);
      intervalo = null;
    }
  }

  watch(
    activa,
    (corriendo) => {
      detener();
      if (corriendo) {
        ahora.value = Date.now();
        intervalo = window.setInterval(() => (ahora.value = Date.now()), 250);
      }
    },
    { immediate: true }
  );

  onScopeDispose(detener);

  const segundos = computed(() => Math.max(Math.ceil((finEn.value - ahora.value) / 1000), 0));
  return { segundos };
}
