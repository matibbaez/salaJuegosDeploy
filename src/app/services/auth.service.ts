import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;

  // Mantener el estado del usuario logueado
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    this.checkSession();
  }

  // Verificar si ya hay sesión activa
  private async checkSession() {
    const { data } = await this.supabase.auth.getSession();
    this.userSubject.next(data.session?.user ?? null);
  }

  // Registrar usuario y crear perfil
  async signUp(email: string, password: string, firstName: string, lastName: string, age: number) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { id } = data.user;
      const { error: profileError } = await this.supabase.from('profiles').insert({
        id,
        email,
        first_name: firstName,
        last_name: lastName,
        age,
        created_at: new Date(),
      });

      if (profileError) throw profileError;

      this.userSubject.next(data.user);
    }

    return data.user;
  }

  // Iniciar sesión
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) this.userSubject.next(data.user);

    return data.user;
  }

  // Cerrar sesión
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;

    this.userSubject.next(null);
  }

  // Obtener usuario actual de manera síncrona
  getCurrentUser() {
    return this.userSubject.value;
  }
}
