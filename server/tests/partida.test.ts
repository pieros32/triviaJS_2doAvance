import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';

import type {
  ClientToServerEvents,
  FinPartida,
  PreguntaActual,
  Respuesta,
  RespuestaJugador,
  Revelado,
  ServerToClientEvents,
  SesionSala
} from '@trivia/shared';
import { io as conectar, type Socket } from 'socket.io-client';

import { leerConfig } from '../src/config';
import { Repositorio } from '../src/datos/repositorio';
import { crearServidor, type ServidorTrivia } from '../src/servidor';

type Cliente = Socket<ServerToClientEvents, ClientToServerEvents>;

let servidor: ServidorTrivia;
let url: string;
const clientes: Cliente[] = [];
const repositorio = Repositorio.desdeArchivo(leerConfig().archivoDatos);

before(async () => {
  const config = {
    ...leerConfig({}),
    puerto: 0,
    tiempoPreguntaMs: 2_000,
    tiempoRevelacionMs: 50,
    preguntasPorPartida: 3,
    archivoRanking: null
  };
  servidor = crearServidor(config);
  await new Promise<void>((listo) => servidor.http.listen(0, listo));
  url = `http://localhost:${(servidor.http.address() as AddressInfo).port}`;
});

after(async () => {
  clientes.forEach((c) => c.disconnect());
  servidor.io.close();
});

async function nuevoCliente(): Promise<Cliente> {
  const cliente: Cliente = conectar(url, { transports: ['websocket'] });
  clientes.push(cliente);
  await new Promise<void>((listo) => cliente.on('connect', listo));
  return cliente;
}

function pedir<T = void>(cliente: Cliente, evento: 'sala:crear' | 'sala:unirse' | 'partida:iniciar' | 'partida:responder' | 'partida:revancha', datos?: unknown): Promise<Respuesta<T>> {
  return new Promise((resolver) => {
    const emitir = cliente.emit as unknown as (...args: unknown[]) => void;
    if (datos === undefined) emitir.call(cliente, evento, resolver);
    else emitir.call(cliente, evento, datos, resolver);
  });
}

function esperar<K extends keyof ServerToClientEvents>(cliente: Cliente, evento: K): Promise<Parameters<ServerToClientEvents[K]>[0]> {
  return new Promise((resolver) => {
    (cliente.once as unknown as (e: string, f: (d: unknown) => void) => void)(evento, (datos) =>
      resolver(datos as Parameters<ServerToClientEvents[K]>[0])
    );
  });
}

/** Busca en la base de datos cuál es la respuesta correcta de una pregunta pública. */
function respuestaCorrecta(pregunta: PreguntaActual): string {
  const original = repositorio.preguntas('the-walking-dead', 'facil').find((p) => p.id === pregunta.id);
  assert.ok(original, 'la pregunta debe existir en la base de datos');
  return original.respuesta;
}

describe('API REST', () => {
  it('lista las franquicias', async () => {
    const franquicias = (await (await fetch(`${url}/api/franquicias`)).json()) as unknown[];
    assert.equal(franquicias.length, 6);
  });

  it('nunca expone la respuesta correcta', async () => {
    const respuesta = await fetch(`${url}/api/preguntas?franquicia=the-walking-dead&nivel=facil`);
    const preguntas = (await respuesta.json()) as Record<string, unknown>[];
    assert.equal(preguntas.length, 10);
    assert.ok(preguntas.every((p) => !('respuesta' in p)));
  });

  it('rechaza consultas inválidas con 400', async () => {
    assert.equal((await fetch(`${url}/api/preguntas?franquicia=x&nivel=imposible`)).status, 400);
  });

  it('responde 404 en rutas desconocidas', async () => {
    assert.equal((await fetch(`${url}/api/nada`)).status, 404);
  });
});

describe('Sala multijugador', () => {
  it('valida los datos de entrada', async () => {
    const a = await nuevoCliente();
    const respuesta = await pedir(a, 'sala:crear', { jugador: 'x', franquicia: 'the-walking-dead', nivel: 'facil' });
    assert.equal(respuesta.ok, false);
  });

  it('rechaza códigos inexistentes, nombres repetidos y salas llenas', async () => {
    const [a, b, c, d, e] = await Promise.all([1, 2, 3, 4, 5].map(nuevoCliente));
    const creada = await pedir<SesionSala>(a!, 'sala:crear', { jugador: 'Ana', franquicia: 'the-walking-dead', nivel: 'facil' });
    assert.ok(creada.ok);
    const codigo = creada.data.codigo;

    assert.equal((await pedir(b!, 'sala:unirse', { codigo: 'ZZZZ', jugador: 'Beto' })).ok, false);
    assert.equal((await pedir(b!, 'sala:unirse', { codigo, jugador: 'ana' })).ok, false);
    assert.ok((await pedir(b!, 'sala:unirse', { codigo, jugador: 'Beto' })).ok);
    assert.ok((await pedir(c!, 'sala:unirse', { codigo, jugador: 'Cris' })).ok);
    assert.ok((await pedir(d!, 'sala:unirse', { codigo, jugador: 'Dani' })).ok);

    const llena = await pedir(e!, 'sala:unirse', { codigo, jugador: 'Eva' });
    assert.equal(llena.ok, false);
  });

  it('solo el anfitrión puede iniciar y hacen falta 2 jugadores', async () => {
    const a = await nuevoCliente();
    const b = await nuevoCliente();
    const creada = await pedir<SesionSala>(a, 'sala:crear', { jugador: 'Ana', franquicia: 'the-walking-dead', nivel: 'facil' });
    assert.ok(creada.ok);

    assert.equal((await pedir(a, 'partida:iniciar')).ok, false); // sola
    await pedir(b, 'sala:unirse', { codigo: creada.data.codigo, jugador: 'Beto' });
    assert.equal((await pedir(b, 'partida:iniciar')).ok, false); // no es anfitrión
    assert.ok((await pedir(a, 'partida:iniciar')).ok);
  });

  it('juega una partida completa y guarda el ranking', async () => {
    const ana = await nuevoCliente();
    const beto = await nuevoCliente();
    const creada = await pedir<SesionSala>(ana, 'sala:crear', { jugador: 'Ana', franquicia: 'the-walking-dead', nivel: 'facil' });
    assert.ok(creada.ok);
    await pedir(beto, 'sala:unirse', { codigo: creada.data.codigo, jugador: 'Beto' });

    const fin = esperar(ana, 'partida:fin');
    let primera = esperar(ana, 'partida:pregunta');
    assert.ok((await pedir(ana, 'partida:iniciar')).ok);

    for (let i = 0; i < 3; i++) {
      const pregunta: PreguntaActual = await primera;
      assert.equal(pregunta.indice, i);
      assert.equal(pregunta.total, 3);
      assert.ok(!('respuesta' in pregunta), 'la pregunta enviada no debe traer la respuesta');

      const correcta = respuestaCorrecta(pregunta);
      const incorrecta = pregunta.opciones.find((o) => o !== correcta)!;
      const revelado = esperar(ana, 'partida:revelado');
      if (i < 2) primera = esperar(ana, 'partida:pregunta');

      assert.ok((await pedir(ana, 'partida:responder', { opcion: correcta })).ok);
      assert.equal((await pedir(ana, 'partida:responder', { opcion: correcta })).ok, false); // ya respondió
      assert.equal((await pedir(beto, 'partida:responder', { opcion: 'opción inventada' })).ok, false);
      assert.ok((await pedir(beto, 'partida:responder', { opcion: incorrecta })).ok);

      const resultado: Revelado = await revelado; // al responder todos se revela sin esperar el tiempo
      assert.equal(resultado.correcta, correcta);
      assert.equal(resultado.esUltima, i === 2);
      const deAna: RespuestaJugador = resultado.respuestas.find((r) => r.jugadorId === creada.data.jugadorId)!;
      assert.equal(deAna.correcta, true);
      assert.ok(deAna.puntos >= 100 && deAna.puntos <= 200);
    }

    const resultadoFinal: FinPartida = await fin;
    assert.equal(resultadoFinal.clasificacion[0]!.nombre, 'Ana');
    assert.equal(resultadoFinal.clasificacion[0]!.aciertos, 3);
    assert.equal(resultadoFinal.clasificacion[1]!.aciertos, 0);

    const ranking = (await (await fetch(`${url}/api/ranking?franquicia=the-walking-dead`)).json()) as { jugador: string }[];
    assert.equal(ranking[0]!.jugador, 'Ana');
    assert.equal(ranking.length, 2);

    // revancha: vuelve a la sala de espera con los puntajes en cero
    const estado = esperar(ana, 'sala:estado');
    assert.ok((await pedir(ana, 'partida:revancha')).ok);
    const sala = await estado;
    assert.equal(sala.fase, 'espera');
    assert.ok(sala.jugadores.every((j) => j.puntaje === 0));
  });

  it('pasa solo a la siguiente fase cuando se acaba el tiempo', async () => {
    const ana = await nuevoCliente();
    const beto = await nuevoCliente();
    const creada = await pedir<SesionSala>(ana, 'sala:crear', { jugador: 'Ana', franquicia: 'breaking-bad', nivel: 'facil' });
    assert.ok(creada.ok);
    await pedir(beto, 'sala:unirse', { codigo: creada.data.codigo, jugador: 'Beto' });

    const revelado = esperar(ana, 'partida:revelado');
    await pedir(ana, 'partida:iniciar');
    const resultado = await revelado; // nadie respondió: lo revela el temporizador del servidor
    assert.ok(resultado.respuestas.every((r) => r.opcion === null && r.puntos === 0));
  });

  it('si el anfitrión se va, otro jugador toma su lugar y la sala se elimina al vaciarse', async () => {
    const ana = await nuevoCliente();
    const beto = await nuevoCliente();
    const creada = await pedir<SesionSala>(ana, 'sala:crear', { jugador: 'Ana', franquicia: 'dragon-ball', nivel: 'facil' });
    assert.ok(creada.ok);
    await pedir(beto, 'sala:unirse', { codigo: creada.data.codigo, jugador: 'Beto' });

    const antes = servidor.gestor.cantidadSalas();
    const estado = esperar(beto, 'sala:estado');
    ana.emit('sala:salir');
    const sala = await estado;
    assert.equal(sala.jugadores.length, 1);
    assert.equal(sala.jugadores[0]!.esAnfitrion, true);

    beto.emit('sala:salir');
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(servidor.gestor.cantidadSalas(), antes - 1);
  });
});
