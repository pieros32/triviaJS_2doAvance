import type { Franquicia } from '@trivia/shared';
import type { GetStaticProps } from 'next';
import Head from 'next/head';

import ErrorCarga from '../components/ErrorCarga';
import FormularioInicio from '../components/FormularioInicio';
import { obtenerFranquicias } from '../lib/api';

interface Props {
  franquicias: Franquicia[];
  errorConexion: boolean;
}

// Generación estática (SSG): la lista de franquicias casi nunca cambia, así que se pide a Express
// una vez y la página queda lista como HTML. Se regenera cada hora (ISR); si Express estaba
// apagado, se vuelve a intentar a los 5 segundos.
export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    const franquicias = await obtenerFranquicias();
    return { props: { franquicias, errorConexion: false }, revalidate: 3600 };
  } catch {
    return { props: { franquicias: [], errorConexion: true }, revalidate: 5 };
  }
};

export default function Inicio({ franquicias, errorConexion }: Props) {
  return (
    <>
      <Head>
        <title>¡TRIVIA POP! Cine &amp; Series (Next)</title>
      </Head>
      <div className="pantalla">
        {errorConexion && (
          <ErrorCarga
            titulo="Error de conexión:"
            mensaje="No se pudo contactar con el servidor. Verifica que esté encendido (npm run dev:server) y recarga la página."
          />
        )}
        <FormularioInicio franquicias={franquicias} />
      </div>
    </>
  );
}
