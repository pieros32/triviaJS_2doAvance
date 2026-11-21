import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';

import type { RegistroRanking, RespuestaVerificada } from '@trivia/shared';

import { crearApp } from '../src/app';
import { leerConfig } from '../src/config';
import { Repositorio } from '../src/datos/repositorio';
import { AlmacenRanking } from '../src/ranking/almacen';

let servidor: Server;
let url: string;
const config = { ...leerConfig({}), archivoRanking: null };
const repositorio = Repositorio.desdeArchivo(config.archivoDatos);

before(async () => {
  const app = crearApp({ config, repositorio, ranking: new AlmacenRanking(null) });
  servidor = await new Promise<Server>((listo) => {
    const s = app.listen(0, () => listo(s));
  });
  url = `http://localhost:${(servidor.address() as AddressInfo).port}`;
});

after(() => {
  servidor.close();
});

const enviar = (metodo: string, ruta: string, cuerpo?: unknown) =>
  fetch(url + ruta, {
    method: metodo,
    headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo)
  });

const registroValido = { jugador: 'Ana', franquicia: 'dragon-ball', nivel: 'facil', puntaje: 7, total: 10 };

describe('Franquicias y preguntas', () => {
  it('lista las franquicias', async () => {
    const franquicias = (await (await enviar('GET', '/api/franquicias')).json()) as unknown[];
    assert.equal(franquicias.length, 6);
  });

  it('entrega las preguntas sin la respuesta correcta', async () => {
    const respuesta = await enviar('GET', '/api/preguntas?franquicia=the-walking-dead&nivel=facil');
    const preguntas = (await respuesta.json()) as Record<string, unknown>[];
    assert.equal(preguntas.length, 10);
    assert.ok(preguntas.every((p) => !('respuesta' in p)));
  });

  it('rechaza consultas inválidas con 400', async () => {
    assert.equal((await enviar('GET', '/api/preguntas?franquicia=x&nivel=imposible')).status, 400);
    assert.equal((await enviar('GET', '/api/preguntas')).status, 400);
  });

  it('sirve las imágenes y responde 404 en rutas desconocidas', async () => {
    assert.equal((await enviar('GET', '/imagenes/rick.jpg')).status, 200);
    assert.equal((await enviar('GET', '/api/nada')).status, 404);
  });
});

describe('POST /api/preguntas/:id/respuesta', () => {
  const pregunta = repositorio.preguntas('the-walking-dead', 'facil')[0]!;
  const incorrecta = pregunta.opciones.find((o) => o !== pregunta.respuesta)!;

  it('dice si la opción es correcta', async () => {
    const acierto = (await (await enviar('POST', `/api/preguntas/${pregunta.id}/respuesta`, { opcion: pregunta.respuesta })).json()) as RespuestaVerificada;
    assert.deepEqual(acierto, { correcta: true, respuestaCorrecta: pregunta.respuesta });

    const fallo = (await (await enviar('POST', `/api/preguntas/${pregunta.id}/respuesta`, { opcion: incorrecta })).json()) as RespuestaVerificada;
    assert.deepEqual(fallo, { correcta: false, respuestaCorrecta: pregunta.respuesta });
  });

  it('acepta opcion null cuando se acaba el tiempo', async () => {
    const r = (await (await enviar('POST', `/api/preguntas/${pregunta.id}/respuesta`, { opcion: null })).json()) as RespuestaVerificada;
    assert.equal(r.correcta, false);
  });

  it('valida el cuerpo y el id', async () => {
    assert.equal((await enviar('POST', `/api/preguntas/${pregunta.id}/respuesta`, { opcion: 'inventada' })).status, 400);
    assert.equal((await enviar('POST', `/api/preguntas/${pregunta.id}/respuesta`, {})).status, 400);
    assert.equal((await enviar('POST', `/api/preguntas/${pregunta.id}/respuesta`)).status, 400);
    assert.equal((await enviar('POST', '/api/preguntas/999999/respuesta', { opcion: null })).status, 404);
    assert.equal((await enviar('POST', '/api/preguntas/abc/respuesta', { opcion: null })).status, 404);
  });
});

describe('Ranking (CRUD)', () => {
  it('empieza vacío', async () => {
    assert.deepEqual(await (await enviar('GET', '/api/ranking')).json(), []);
  });

  it('POST guarda la partida y responde 201', async () => {
    const respuesta = await enviar('POST', '/api/ranking', registroValido);
    assert.equal(respuesta.status, 201);
    const registro = (await respuesta.json()) as RegistroRanking;
    assert.equal(registro.franquiciaNombre, 'Dragon Ball');
    assert.ok(registro.id && registro.fecha);
  });

  it('POST rechaza datos incoherentes con 400', async () => {
    const malos = [
      { ...registroValido, jugador: 'x' },
      { ...registroValido, franquicia: 'no-existe' },
      { ...registroValido, nivel: 'imposible' },
      { ...registroValido, total: 11 }, // más que las preguntas disponibles
      { ...registroValido, puntaje: 11 }, // más que el total
      { ...registroValido, puntaje: -1 },
      { ...registroValido, puntaje: 2.5 }
    ];
    for (const cuerpo of malos) {
      assert.equal((await enviar('POST', '/api/ranking', cuerpo)).status, 400, JSON.stringify(cuerpo));
    }
    assert.equal((await enviar('POST', '/api/ranking')).status, 400);
  });

  it('GET ordena por porcentaje y filtra', async () => {
    await enviar('POST', '/api/ranking', { ...registroValido, jugador: 'Beto', puntaje: 9 });
    await enviar('POST', '/api/ranking', { ...registroValido, jugador: 'Cris', franquicia: 'breaking-bad', puntaje: 10 });

    const todos = (await (await enviar('GET', '/api/ranking')).json()) as RegistroRanking[];
    assert.deepEqual(todos.map((r) => r.jugador), ['Cris', 'Beto', 'Ana']);

    const soloDragon = (await (await enviar('GET', '/api/ranking?franquicia=dragon-ball&nivel=facil')).json()) as RegistroRanking[];
    assert.deepEqual(soloDragon.map((r) => r.jugador), ['Beto', 'Ana']);

    assert.equal((await enviar('GET', '/api/ranking?nivel=imposible')).status, 400);
    assert.equal((await enviar('GET', '/api/ranking?limite=0')).status, 400);
  });

  it('DELETE /:id borra una partida (204) y luego da 404', async () => {
    const [primero] = (await (await enviar('GET', '/api/ranking')).json()) as RegistroRanking[];
    assert.equal((await enviar('DELETE', `/api/ranking/${primero!.id}`)).status, 204);
    assert.equal((await enviar('DELETE', `/api/ranking/${primero!.id}`)).status, 404);
    assert.equal(((await (await enviar('GET', '/api/ranking')).json()) as unknown[]).length, 2);
  });

  it('DELETE borra todo el historial (204)', async () => {
    assert.equal((await enviar('DELETE', '/api/ranking')).status, 204);
    assert.deepEqual(await (await enviar('GET', '/api/ranking')).json(), []);
  });
});
