import type {
  Ack,
  ClientToServerEvents,
  Nivel,
  ServerToClientEvents,
  SesionSala
} from '@trivia/shared';
import type { Server } from 'socket.io';
import type { ZodType } from 'zod';

import type { Emisor } from '../juego/Sala';
import type { GestorSalas } from '../juego/GestorSalas';
import { ErrorJuego } from '../utils/errores';
import { esquemaCrearSala, esquemaResponder, esquemaUnirse } from './esquemas';

export type ServidorSockets = Server<ClientToServerEvents, ServerToClientEvents>;

/** Emisor que envía a todos los sockets de la sala (cada sala es un "room" de Socket.IO). */
export function crearEmisor(io: ServidorSockets, codigo: string): Emisor {
  return {
    estado: (estado) => io.to(codigo).emit('sala:estado', estado),
    pregunta: (pregunta) => io.to(codigo).emit('partida:pregunta', pregunta),
    revelado: (revelado) => io.to(codigo).emit('partida:revelado', revelado),
    fin: (fin) => io.to(codigo).emit('partida:fin', fin)
  };
}

function validar<T>(esquema: ZodType<T>, datos: unknown): T {
  const resultado = esquema.safeParse(datos);
  if (!resultado.success) {
    throw new ErrorJuego(resultado.error.issues[0]?.message ?? 'Datos no válidos.');
  }
  return resultado.data;
}

/** Ejecuta una acción y responde por el ack; los errores de reglas se traducen en { ok: false }. */
function manejar<T>(ack: Ack<T> | undefined, accion: () => T): void {
  if (typeof ack !== 'function') return;
  try {
    ack({ ok: true, data: accion() });
  } catch (error) {
    if (error instanceof ErrorJuego) {
      ack({ ok: false, error: error.message });
    } else {
      console.error('Error inesperado en un evento de socket:', error);
      ack({ ok: false, error: 'Ocurrió un error inesperado en el servidor.' });
    }
  }
}

export function registrarSockets(io: ServidorSockets, gestor: GestorSalas): void {
  io.on('connection', (socket) => {
    const id = socket.id;

    socket.on('sala:crear', (datos, ack) =>
      manejar<SesionSala>(ack, () => {
        const { jugador, franquicia, nivel } = validar(esquemaCrearSala, datos);
        const sala = gestor.crear(id, jugador, franquicia, nivel as Nivel);
        void socket.join(sala.codigo);
        return { codigo: sala.codigo, jugadorId: id, estado: sala.estado() };
      })
    );

    socket.on('sala:unirse', (datos, ack) =>
      manejar<SesionSala>(ack, () => {
        const { codigo, jugador } = validar(esquemaUnirse, datos);
        const sala = gestor.unirse(id, codigo, jugador);
        void socket.join(sala.codigo);
        return { codigo: sala.codigo, jugadorId: id, estado: sala.estado() };
      })
    );

    socket.on('sala:salir', () => gestor.salir(id));

    socket.on('partida:iniciar', (ack) => manejar(ack, () => gestor.salaDe(id).iniciar(id)));

    socket.on('partida:responder', (datos, ack) =>
      manejar(ack, () => {
        const { opcion } = validar(esquemaResponder, datos);
        gestor.salaDe(id).responder(id, opcion);
      })
    );

    socket.on('partida:revancha', (ack) => manejar(ack, () => gestor.salaDe(id).revancha(id)));

    socket.on('disconnect', () => gestor.salir(id));
  });
}
