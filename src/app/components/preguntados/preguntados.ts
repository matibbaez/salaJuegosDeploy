import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesService } from '../../services/games.service';
import { AuthService } from '../../services/auth.service';

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preguntados.html',
  styleUrls: ['./preguntados.scss']
})
export class PreguntadosComponent {
  temas = ['deportes', 'musica', 'entretenimiento', 'historia'];
  temaSeleccionado = signal<string | null>(null);
  preguntas: Question[] = [];
  indice = signal(0);
  correctas = signal(0);
  finalizado = signal(false);
  loading = signal(false);

  constructor(private games: GamesService, private auth: AuthService) {}

  seleccionarTema(tema: string) {
    this.temaSeleccionado.set(tema);
    this.cargarPreguntas(tema);
  }

  async cargarPreguntas(tema: string) {
    this.loading.set(true);
    // 🔹 Podés reemplazar esto luego por una carga desde Supabase si querés hacerlo dinámico
    const banco: Record<string, Question[]> = {
      deportes: [
        { question: '¿Cuántos jugadores hay en un equipo de fútbol?', options: ['9', '10', '11', '12'], correctIndex: 2 },
        { question: '¿Qué deporte practica Lionel Messi?', options: ['Básquet', 'Tenis', 'Fútbol', 'Rugby'], correctIndex: 2 },
      ],
      musica: [
        { question: '¿Quién es el "Rey del Pop"?', options: ['Elvis Presley', 'Michael Jackson', 'Prince', 'Freddie Mercury'], correctIndex: 1 },
        { question: '¿Qué instrumento toca Slash?', options: ['Batería', 'Bajo', 'Guitarra', 'Piano'], correctIndex: 2 },
      ],
      entretenimiento: [
        { question: '¿Qué saga tiene a Darth Vader?', options: ['Harry Potter', 'Star Wars', 'Marvel', 'Matrix'], correctIndex: 1 },
        { question: '¿Quién es el protagonista de "Iron Man"?', options: ['Chris Evans', 'Robert Downey Jr.', 'Tom Holland', 'Mark Ruffalo'], correctIndex: 1 },
      ],
      historia: [
        { question: '¿En qué año fue la Revolución Francesa?', options: ['1789', '1848', '1492', '1914'], correctIndex: 0 },
        { question: '¿Quién fue el primer presidente de EE.UU.?', options: ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'John Adams'], correctIndex: 1 },
      ],
    };

    this.preguntas = banco[tema];
    this.loading.set(false);
  }

  responder(index: number) {
    if (this.finalizado()) return;
    const actual = this.preguntas[this.indice()];
    if (index === actual.correctIndex) this.correctas.update(c => c + 1);

    if (this.indice() + 1 >= this.preguntas.length) {
      this.finalizado.set(true);
      this.guardarResultado();
    } else {
      this.indice.update(i => i + 1);
    }
  }

  async guardarResultado() {
    const user = this.auth.getCurrentUser();
    try {
      await this.games.saveQuizResult({
        user_id: user?.id ?? null,
        username: (user as any)?.email ?? null,
        topic: this.temaSeleccionado(),
        total_questions: this.preguntas.length,
        correct_answers: this.correctas(),
      });
    } catch (e) {
      console.error('❌ Error al guardar resultado de Preguntados', e);
    }
  }

  reiniciar() {
    this.temaSeleccionado.set(null);
    this.indice.set(0);
    this.correctas.set(0);
    this.finalizado.set(false);
  }
}
