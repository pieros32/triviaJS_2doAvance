import { NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { BarraEstadoComponent } from '../../components/barra-estado/barra-estado.component';
import { ErrorCargaComponent } from '../../components/error-carga/error-carga.component';
import { TarjetaPreguntaComponent } from '../../components/tarjeta-pregunta/tarjeta-pregunta.component';
import { esNivel } from '../../models/trivia.models';
import { PreguntasService } from '../../services/preguntas.service';
import { QuizService } from '../../services/quiz.service';

// ============================================================
// PÁGINA DE JUEGO (ruta /jugar/:franquicia/:nivel)
// Es el "cerebro": lee la URL, pide las preguntas al backend a través del
// servicio, y coordina a los componentes hijos (barra de estado y tarjeta).
// ============================================================
@Component({
  selector: 'app-juego',
  imports: [NgIf, RouterLink, ErrorCargaComponent, BarraEstadoComponent, TarjetaPreguntaComponent],
  templateUrl: './juego.component.html'
})
export class JuegoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly preguntasService = inject(PreguntasService);
  readonly quiz = inject(QuizService);

  cargando = true;
  error: { titulo: string; mensaje: string } | null = null;

  // Estado de la pregunta que se está mostrando
  respondida = false;
  seleccionada: string | null = null;
  mensaje = '';

  ngOnInit(): void {
    this.quiz.reiniciar();

    // Parámetros de la URL: /jugar/:franquicia/:nivel
    const franquicia = this.route.snapshot.paramMap.get('franquicia') ?? '';
    const nivel = this.route.snapshot.paramMap.get('nivel') ?? '';

    if (!esNivel(nivel)) {
      this.error = {
        titulo: 'Nivel no válido:',
        mensaje: 'El nivel solicitado no existe. Elige Fácil, Intermedio o Experto.'
      };
      this.cargando = false;
      return;
    }

    // GET /preguntas?franquicia=...&nivel=...  → subscribe espera la respuesta
    this.preguntasService.obtenerPreguntas(franquicia, nivel).subscribe({
      next: (preguntas) => {
        if (preguntas.length === 0) {
          this.error = {
            titulo: 'Sin preguntas:',
            mensaje: 'Esta franquicia todavía no tiene preguntas cargadas. Elige otra franquicia.'
          };
        } else {
          this.quiz.iniciar(franquicia, nivel, preguntas);
        }
        this.cargando = false;
      },
      error: () => {
        this.error = {
          titulo: 'Error de conexión:',
          mensaje:
            'No se pudieron cargar las preguntas. Verifica que json-server esté encendido (npm run api) y vuelve a intentarlo.'
        };
        this.cargando = false;
      }
    });
  }

  // Lo llama la tarjeta (@Output elegir) cuando el usuario toca una opción
  elegirOpcion(opcion: string): void {
    if (this.respondida) {
      return;
    }
    this.respondida = true;
    this.seleccionada = opcion;

    const acerto = this.quiz.responder(opcion);
    this.mensaje = acerto
      ? '¡Respuesta correcta!'
      : `Respuesta incorrecta. La respuesta era ${this.quiz.preguntaActual?.respuesta}`;
  }

  // Lo llama la tarjeta (@Output siguiente)
  siguientePregunta(): void {
    // Obliga a responder antes de continuar (igual que en la versión original)
    if (!this.respondida) {
      this.mensaje = 'Debes responder la pregunta actual para continuar.';
      return;
    }

    if (this.quiz.avanzar()) {
      this.respondida = false;
      this.seleccionada = null;
      this.mensaje = '';
    } else {
      this.router.navigate(['/resultado']);
    }
  }
}
