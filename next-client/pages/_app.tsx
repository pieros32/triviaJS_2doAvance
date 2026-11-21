import 'bootstrap/dist/css/bootstrap.min.css';
import '@trivia/shared/estilos';
import '../styles/next.css';

import type { AppProps } from 'next/app';

import BarraNavegacion from '../components/BarraNavegacion';
import Encabezado from '../components/Encabezado';
import { PartidaProvider } from '../context/PartidaContext';

// Marco común de todas las páginas. El estado de la partida vive aquí, así que
// sobrevive a la navegación entre páginas.
export default function App({ Component, pageProps }: AppProps) {
  return (
    <div id="root">
      <PartidaProvider>
        <main className="aplicacion-trivia">
          <Encabezado />
          <BarraNavegacion />
          <Component {...pageProps} />
        </main>
      </PartidaProvider>
    </div>
  );
}
