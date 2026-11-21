import Head from 'next/head';
import Link from 'next/link';

export default function NoEncontrada() {
  return (
    <>
      <Head>
        <title>Página no encontrada · ¡TRIVIA POP!</title>
      </Head>
      <div className="pantalla">
        <section className="panel-ranking text-center">
          <h2 className="titulo-seccion">Página no encontrada</h2>
          <p className="texto-ranking">La dirección que escribiste no existe.</p>
          <Link className="btn-accion" href="/">
            Volver al inicio
          </Link>
        </section>
      </div>
    </>
  );
}
