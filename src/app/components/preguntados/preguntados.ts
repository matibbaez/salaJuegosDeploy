import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgClass } from '@angular/common'; 
import { GamesService } from '../../services/games.service';
import { AuthService } from '../../services/auth.service';
import { QuizService, Question } from '../../services/quiz.service';
import { HttpClientModule } from '@angular/common/http';

// Define una interfaz para el historial de cada pregunta
interface QuestionHistory {
  question: string;
  options: string[];
  correctIndex: number;
  userAnswerIndex: number; 
  isCorrect: boolean;
}

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgIf, NgClass], 
  templateUrl: './preguntados.html',
  styleUrls: ['./preguntados.scss']
})
export class PreguntadosComponent implements OnInit {
  temas = signal<string[]>([]);
  temaSeleccionado = signal<string | null>(null);
  preguntas: Question[] = [];
  indice = signal(0);
  correctas = signal(0);
  finalizado = signal(false);
  loading = signal(false);

  // almacenanamos el historial de preguntas y respuestas
  historialRespuestas: QuestionHistory[] = [];
  
  // controlar el feedback visual en el template
  feedbackClaseRespuesta: { [key: number]: string } = {};

  constructor(
    private games: GamesService,
    private auth: AuthService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.cargarTemas();
  }

  async cargarTemas() {
    this.quizService.getQuizTopics().subscribe(
      (topics) => {
        this.temas.set(topics);
      },
      (error) => {
        console.error('Error al cargar los temas:', error);
      }
    );
  }

  seleccionarTema(tema: string) {
    this.temaSeleccionado.set(tema);
    this.cargarPreguntas(tema);
  }

  async cargarPreguntas(tema: string) {
    this.loading.set(true);
    // limpiar historial al cargar nuevas preguntas
    this.historialRespuestas = []; 
    this.quizService.getQuestionsByTopic(tema).subscribe(
      (questions) => {
        this.preguntas = questions;
        this.loading.set(false);
      },
      (error) => {
        console.error('Error al cargar las preguntas:', error);
        this.loading.set(false);
      }
    );
  }

  responder(index: number) {
    if (this.finalizado()) return;

    const actual = this.preguntas[this.indice()];
    const esCorrecta = (index === actual.correctIndex);

    if (esCorrecta) {
      this.correctas.update(c => c + 1);
    }

    // almacenamos en el historial antes de pasar a la siguiente pregunta
    this.historialRespuestas.push({
      question: actual.question,
      options: actual.options,
      correctIndex: actual.correctIndex,
      userAnswerIndex: index,
      isCorrect: esCorrecta
    });

    this.feedbackClaseRespuesta[index] = esCorrecta ? 'correct-answer-feedback' : 'wrong-answer-feedback';
    if (!esCorrecta) {
        this.feedbackClaseRespuesta[actual.correctIndex] = 'correct-answer-highlight'; // resaltamos la correcta si falló
    }


    setTimeout(() => { 
      this.feedbackClaseRespuesta = {}; 

      if (this.indice() + 1 >= this.preguntas.length) {
        this.finalizado.set(true);
        this.guardarResultado();
      } else {
        this.indice.update(i => i + 1);
      }
    }, 800); 
  }

  async guardarResultado() {
    const user = await this.auth.getCurrentUser();

    try {
      await this.games.saveQuizResult({
        user_id: user?.id ?? null,
        username: user?.email ?? null,
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
    this.historialRespuestas = []; 
    this.feedbackClaseRespuesta = {}; 
    this.cargarTemas();
  }
}