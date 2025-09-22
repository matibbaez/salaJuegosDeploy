import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesService } from '../../services/games.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ahorcado.html',
  styleUrls: ['./ahorcado.scss']
})
export class AhorcadoComponent {
  // palabras de ejemplo 
  private words = ['angular','supabase','memoria','juego','prueba','component'];

  // estado del juego
  word = this.words[Math.floor(Math.random()*this.words.length)];
  revealed = signal(new Array(this.word.length).fill(false));
  guessed = signal(new Set<string>());
  wrong = signal(0);
  maxWrong = 6;
  startTime = Date.now();
  finished = signal(false);
  won = signal(false);

  alphabet = 'abcdefghijklmnñopqrstuvwxyz'.split('');

  constructor(private games: GamesService, private auth: AuthService) {}

  letterDisabled(letter: string) {
    return this.guessed().has(letter) || this.finished();
  }

  pick(letter: string) {
    if (this.finished()) return;
    this.guessed().add(letter);
    const idxs = [];
    for (let i = 0; i < this.word.length; i++) {
      if (this.word[i] === letter) idxs.push(i);
    }
    if (idxs.length === 0) {
      this.wrong.update(w => w + 1);
      if (this.wrong() >= this.maxWrong) {
        this.end(false);
      }
    } else {
      const arr = [...this.revealed()];
      idxs.forEach(i => arr[i] = true);
      this.revealed.set(arr);
      if (arr.every(Boolean)) this.end(true);
    }
  }

  async end(didWin: boolean) {
    this.finished.set(true);
    this.won.set(didWin);
    const time_ms = Date.now() - this.startTime;
    const user = this.auth.getCurrentUser();
    try {
      await this.games.saveHangmanResult({
        user_id: user?.id ?? null,
        username: (user as any)?.email ?? null,
        word: this.word,
        won: didWin,
        time_ms,
        guesses: this.guessed().size,
        wrong_guesses: this.wrong()
      });
    } catch (e) {
      console.error('Save hangman failed', e);
    }
  }

  reset() {
    this.word = this.words[Math.floor(Math.random()*this.words.length)];
    this.revealed.set(new Array(this.word.length).fill(false));
    this.guessed.set(new Set<string>());
    this.wrong.set(0);
    this.startTime = Date.now();
    this.finished.set(false);
    this.won.set(false);
  }
}
