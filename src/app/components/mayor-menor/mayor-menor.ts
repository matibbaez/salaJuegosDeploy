import { Component, signal, OnInit } from '@angular/core'; 
import { CommonModule, DecimalPipe } from '@angular/common';
import { GamesService } from '../../services/games.service';
import { AuthService } from '../../services/auth.service';

type Card = { suit: string; value: number; label: string };

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './mayor-menor.html',
  styleUrls: ['./mayor-menor.scss']
})
export class MayorMenorComponent implements OnInit { 
  deck: Card[] = [];
  current?: Card;
  next?: Card;
  correct = signal(0);
  rounds = signal(0);
  animateCard = signal(false);
  finished = signal(false);

  startTime: number = 0;
  elapsedTime = signal(0);

  readonly maxRounds = 10;

  constructor(private games: GamesService, private auth: AuthService) {}

  ngOnInit(): void {
    this.startGame(); // Usamos una nueva función para iniciar
  }

  // 👇 NUEVA FUNCIÓN para empezar el juego
  startGame() {
    this.correct.set(0);
    this.rounds.set(0);
    this.finished.set(false);
    this.elapsedTime.set(0);
    this.resetDeck();
    this.draw();
    this.triggerCardAnimation();
    this.startTime = Date.now(); // 👈 INICIAMOS EL CRONÓMETRO AQUÍ
  }

  resetDeck() {
    this.deck = [];
    const suits = ['♠','♥','♦','♣'];
    for (let s of suits) {
      for (let v = 1; v <= 13; v++) {
        const label = v === 1 ? 'A' : v === 11 ? 'J' : v === 12 ? 'Q' : v === 13 ? 'K' : String(v);
        this.deck.push({ suit: s, value: v, label });
      }
    }
    
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  triggerCardAnimation() {
    this.animateCard.set(true);
    setTimeout(() => {
      this.animateCard.set(false);
    }, 600);
  }

  draw() {
    if (this.deck.length < 2) {
      this.finished.set(true); 
      this.finishGame();
      return; 
    }
    if (!this.current) {
        this.current = this.deck.pop();
        this.next = this.deck.pop();
    } else {
        this.current = this.next;
        this.next = this.deck.pop();
    }
  }

  async guess(higher: boolean) {
    if (!this.current || !this.next || this.finished()) return;
    this.rounds.update(r => r + 1);
    const isCorrect = higher ? this.next.value > this.current.value : this.next.value < this.current.value;
    if (isCorrect) this.correct.update(c => c + 1);
    this.draw();
    this.triggerCardAnimation(); 

    if (this.rounds() >= this.maxRounds) {
      this.finished.set(true);
      await this.finishGame();
    }
  }

  async finishGame() {
    if (this.startTime === 0) return; // Evita calcular si el juego no ha empezado

    const endTime = Date.now();
    const duration = endTime - this.startTime; // Ahora la resta será correcta
    this.elapsedTime.set(duration);
    
    this.startTime = 0; // Reseteamos el startTime para evitar errores

    if (this.rounds() === 0) return;

    const user = this.auth.getCurrentUser();
    try {
      await this.games.saveHigherLowerResult({
        user_id: user?.id,
        username: user?.email, 
        correct_count: this.correct(),
        total_rounds: this.rounds(),
        time_taken_ms: duration
      });
    } catch (e) {
      console.error('❌ Error al guardar resultado', e);
    }
  }

  // El botón de reiniciar ahora llama a startGame
  restart() {
    this.startGame();
  }
}