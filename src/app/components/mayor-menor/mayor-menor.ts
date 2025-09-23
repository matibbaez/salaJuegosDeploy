import { Component, signal } from '@angular/core';
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
export class MayorMenorComponent {
  deck: Card[] = [];
  current?: Card;
  next?: Card;
  correct = signal(0);
  rounds = signal(0);
  finished = signal(false);

  readonly maxRounds = 10; // 🔹 límite de rondas

  constructor(private games: GamesService, private auth: AuthService) {
    this.resetDeck();
    this.draw();
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

  draw() {
    if (this.deck.length === 0) { 
      this.finished.set(true); 
      return; 
    }
    this.current = this.next ?? this.deck.pop();
    this.next = this.deck.pop();
  }

  async guess(higher: boolean) {
    if (!this.current || !this.next || this.finished()) return;

    this.rounds.update(r => r + 1);

    const nextVal = this.next.value;
    const isCorrect = higher ? nextVal > this.current.value : nextVal < this.current.value;
    if (isCorrect) this.correct.update(c => c + 1);

    // avanzar cartas
    this.current = this.next;
    this.next = this.deck.pop();

    // 🔹 condición de fin: o se acaban rondas o se acaban cartas
    if (this.rounds() >= this.maxRounds || !this.current || !this.next) {
      this.finished.set(true);
      await this.finishGame();
    }
  }

  async finishGame() {
    // 🔹 solo guardar si alcanzamos al menos 1 ronda
    if (this.rounds() === 0) return;

    const user = this.auth.getCurrentUser();
    try {
      await this.games.saveHigherLowerResult({
        user_id: user?.id ?? null,
        username: (user as any)?.email ?? null,
        correct_count: this.correct(),
        total_rounds: this.rounds()
      });
    } catch (e) {
      console.error('❌ Error al guardar resultado', e);
    }
  }

  restart() {
    this.resetDeck();
    this.correct.set(0);
    this.rounds.set(0);
    this.finished.set(false);
    this.draw();
  }
}
