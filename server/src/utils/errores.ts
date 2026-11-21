/** Error esperado de las reglas del juego: su mensaje se le muestra tal cual al jugador. */
export class ErrorJuego extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorJuego';
  }
}
