import { NgIf, PercentPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { NivelNombrePipe } from '../../pipes/nivel-nombre.pipe';
import { QuizService } from '../../services/quiz.service';

// Página de resultado (ruta /resultado). Lee el puntaje desde QuizService.
@Component({
  selector: 'app-resultado',
  imports: [NgIf, RouterLink, PercentPipe, NivelNombrePipe],
  templateUrl: './resultado.component.html'
})
export class ResultadoComponent implements OnInit {
  private readonly router = inject(Router);
  readonly quiz = inject(QuizService);

  ngOnInit(): void {
    // Si alguien abre /resultado directamente (sin haber jugado), lo mandamos al inicio.
    if (!this.quiz.terminado) {
      this.router.navigate(['/']);
    }
  }

  /** Fracción entre 0 y 1; el pipe `percent` la muestra como porcentaje. */
  get porcentaje(): number {
    return this.quiz.total > 0 ? this.quiz.puntaje / this.quiz.total : 0;
  }
}
