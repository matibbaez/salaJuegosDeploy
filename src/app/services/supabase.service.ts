// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  // ========= AUTENTICACIÓN =========
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  getCurrentUser() {
    return this.supabase.auth.getUser();
  }

  // ========= JUEGOS =========
  async saveGameResult(table: string, result: any) {
    const { data, error } = await this.supabase.from(table).insert([result]);
    if (error) throw error;
    return data;
  }

  async getTableResults(table: string, orderBy: string, ascending: boolean = false) {
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending });

    if (error) throw error;
    return data;
  }

  // ========= CHAT =========
  async sendMessage(userId: string, message: string) {
    const { data, error } = await this.supabase.from('chat').insert([
      {
        user_id: userId,
        message: message,
      },
    ]);
    if (error) throw error;
    return data;
  }

  getMessages() {
    return this.supabase
      .from('chat')
      .select('*')
      .order('created_at', { ascending: true });
  }

  subscribeToMessages(callback: (payload: any) => void) {
    return this.supabase
      .channel('chat-room')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat' },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  }

  // ========= PERFILES =========
  async obtenerPerfilUsuario(idUsuario: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('es_admin') // Seleccionamos la columna que creamos
      .eq('id', idUsuario)
      .single(); 

    if (error) throw error;
    return data;
  }

  // ========= ENCUESTA =========
  async guardarResultadoEncuesta(resultado: any) {
    // El nombre de la tabla debe coincidir con el SQL que ejecutaste
    const { data, error } = await this.supabase.from('encuestas').insert([resultado]);
    if (error) throw error;
    return data;
  }

  async obtenerResultadosEncuestas() {
    const { data, error } = await this.supabase
      .from('encuestas')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }
}
