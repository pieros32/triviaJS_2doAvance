import { useEffect, useState } from 'react';

/** Segundos que faltan para `finEn` (marca de tiempo en ms). Solo corre mientras `activa` sea true. */
export function useCuentaRegresiva(finEn: number, activa: boolean): number {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    if (!activa) return;
    setAhora(Date.now());
    const intervalo = window.setInterval(() => setAhora(Date.now()), 250);
    return () => window.clearInterval(intervalo); // limpieza al salir de la pantalla
  }, [activa, finEn]);

  return Math.max(Math.ceil((finEn - ahora) / 1000), 0);
}
