import Head from 'next/head';

import Juego from '../../../components/Juego';

// Ruta dinámica: el archivo se llama [franquicia]/[nivel].tsx y Next la expone como /jugar/:franquicia/:nivel
export default function PaginaJuego() {
  return (
    <>
      <Head>
        <title>Jugando · ¡TRIVIA POP!</title>
      </Head>
      <Juego />
    </>
  );
}
