import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calcularPuntos, PUNTOS_BASE, PUNTOS_BONO_MAXIMO } from '../src/juego/puntaje';

describe('calcularPuntos', () => {
  it('no da puntos si se falla o no se responde', () => {
    assert.equal(calcularPuntos(false, 10_000, 15_000), 0);
  });

  it('da base + bono completo si se responde al instante', () => {
    assert.equal(calcularPuntos(true, 15_000, 15_000), PUNTOS_BASE + PUNTOS_BONO_MAXIMO);
  });

  it('da solo la base si se responde justo al final', () => {
    assert.equal(calcularPuntos(true, 0, 15_000), PUNTOS_BASE);
  });

  it('reduce el bono de forma proporcional', () => {
    assert.equal(calcularPuntos(true, 7_500, 15_000), PUNTOS_BASE + PUNTOS_BONO_MAXIMO / 2);
  });

  it('ignora tiempos fuera de rango', () => {
    assert.equal(calcularPuntos(true, 99_999, 15_000), PUNTOS_BASE + PUNTOS_BONO_MAXIMO);
    assert.equal(calcularPuntos(true, -5, 15_000), PUNTOS_BASE);
  });
});
