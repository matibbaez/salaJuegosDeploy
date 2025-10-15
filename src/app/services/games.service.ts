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
    time_taken_ms: number; 
  }) {
    await this.supabaseService.saveGameResult('higher_lower_results', payload);
    return true;
  }

  async saveQuizResult(payload: {
    user_id?: string | null;
    username?: string | null;
    topic: string | null;
    total_questions: number;
    correct_answers: number;
  }) {
    await this.supabaseService.saveGameResult('quiz_results', payload);
    return true;
  }

  // --- NUEVO MÉTODO PARA ADIVINA LA BANDERA ---
  async saveFlagGuesserResult(payload: {
    user_id?: string | null;
    username?: string | null;
    score: number;
    time_taken_ms: number;
    flags_guessed: number;
    total_attempts: number;
  }) {
    // La tabla en Supabase será 'adivina_bandera_scores'
    await this.supabaseService.saveGameResult('adivina_bandera_scores', payload);
    return true;
  }
}
