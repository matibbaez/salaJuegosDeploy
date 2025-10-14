import { Component, signal, OnInit } from '@angular/core'; // 👈 Se añade OnInit
import { CommonModule } from '@angular/common';
import { GamesService } from '../../services/games.service';
import { AuthService } from '../../services/auth.service';

type Card = { suit: string; value: number; label: string };

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mayor-menor.html',
  styleUrls: ['./mayor-menor.scss']
})
export class MayorMenorComponent implements OnInit { // 👈 Se implementa OnInit
  deck: Card[] = [];
  current?: Card;
  next?: Card;
  correct = signal(0);
  rounds = signal(0);
  animateCard = signal(false);
  finished = signal(false);

  readonly maxRounds = 10;

  constructor(private games: GamesService, private auth: AuthService) {}

  // Toda la lógica inicial la pasamos al ngOnInit
  ngOnInit(): void {
    this.resetDeck();
    this.draw();
    this.triggerCardAnimation(); // 👈 LLAMADA FALTANTE: para animar la primera carta al cargar
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
    // mezclar
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
    if (this.deck.length < 2) { // Asegurarse de que haya al menos 2 cartas para current y next
      this.finished.set(true); 
      this.finishGame(); // Llamar a finishGame si se acaban las cartas
      return; 
    }
    // Si es la primera vez, sacamos las dos primeras cartas
    if (!this.current) {
        this.current = this.deck.pop();
        this.next = this.deck.pop();
    } else { // Si no, la 'siguiente' se vuelve la 'actual' y sacamos una nueva
        this.current = this.next;
        this.next = this.deck.pop();
    }
  }

  async guess(higher: boolean) {
    if (!this.current || !this.next || this.finished()) return;

    this.rounds.update(r => r + 1);

    const isCorrect = higher ? this.next.value > this.current.value : this.next.value < this.current.value;
    if (isCorrect) this.correct.update(c => c + 1);

    // avanzar a la siguiente carta
    this.draw();
    this.triggerCardAnimation(); // 👈 LLAMADA FALTANTE: para animar en cada ronda

    if (this.rounds() >= this.maxRounds) {
      this.finished.set(true);
      await this.finishGame();
    }
  }

  async finishGame() {
    if (this.rounds() === 0) return;

    const user = this.auth.getCurrentUser();
    try {
      await this.games.saveHigherLowerResult({
        user_id: user?.id,
        username: user?.email, // 👈 Código más limpio
        correct_count: this.correct(),
        total_rounds: this.rounds()
      });
    } catch (e) {
      console.error('❌ Error al guardar resultado', e);
    }
  }

  restart() {
    this.correct.set(0);
    this.rounds.set(0);
    this.finished.set(false);
    this.resetDeck();
    this.draw();
    this.triggerCardAnimation(); // Ya tenías esta, ¡perfecto!
  }
}