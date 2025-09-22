// src/app/services/games.service.ts
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class GamesService {
  constructor(private supabaseService: SupabaseService) {}

  async saveHangmanResult(payload: {
    user_id?: string | null;
    username?: string | null;
    word: string;
    won: boolean;
    time_ms: number;
    guesses: number;
    wrong_guesses: number;
  }) {
    await this.supabaseService.saveGameResult('hangman_results', payload);
    return true;
  }

  async saveHigherLowerResult(payload: {
    user_id?: string | null;
    username?: string | null;
    correct_count: number;
    total_rounds: number;
  }) {
    await this.supabaseService.saveGameResult('higher_lower_results', payload);
    return true;
  }
}
