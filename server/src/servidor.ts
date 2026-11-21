import { createServer, type Server as ServidorHttp } from 'node:http';

import { Server } from 'socket.io';

import { crearApp } from './app';
import type { ConfigServidor } from './config';
import { Repositorio } from './datos/repositorio';
import { GestorSalas } from './juego/GestorSalas';
import { AlmacenRanking } from './ranking/almacen';
import { crearEmisor, registrarSockets, type ServidorSockets } from './sockets/registrar';

export interface ServidorTrivia {
  http: ServidorHttp;
  io: ServidorSockets;
  gestor: GestorSalas;
}

/** Arma Express + Socket.IO sobre el mismo servidor HTTP, sin ponerlo a escuchar todavía. */
export function crearServidor(config: ConfigServidor): ServidorTrivia {
  const repositorio = Repositorio.desdeArchivo(config.archivoDatos);
  const ranking = new AlmacenRanking(config.archivoRanking);

  const http = createServer(crearApp({ config, repositorio, ranking }));
  const io: ServidorSockets = new Server(http, { cors: { origin: config.origenesPermitidos } });

  const gestor = new GestorSalas({
    repositorio,
    tiempos: config,
    crearEmisor: (codigo) => crearEmisor(io, codigo),
    alTerminarPartida: (registros) => ranking.agregar(registros)
  });
  registrarSockets(io, gestor);

  return { http, io, gestor };
}
