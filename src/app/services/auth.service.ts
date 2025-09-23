import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    this.checkSession();
  }

  private async checkSession() {
    const { data } = await this.supabase.auth.getSession();
    this.userSubject.next(data.session?.user ?? null);
  }

  // Registro
  async signUp(email: string, password: string, nombre: string, apellido: string, edad: number) {
    // 1️⃣ Verificar si ya existe un perfil con este email
    const { data: existingProfiles } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (existingProfiles && existingProfiles.length > 0) {
      throw new Error('El usuario ya se encuentra registrado');
    }

    // 2️⃣ Crear el usuario en Auth
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      // 3️⃣ Insertar perfil
      await this.supabase.from('profiles').insert({
        id: data.user.id, 
        email,
        nombre,
        apellido,
        edad,
        created_at: new Date()
      });

      // 4️⃣ Mantener usuario en memoria
      this.userSubject.next(data.user);
    }

    return data.user;
  }

  // Login
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;

    if (data.user) this.userSubject.next(data.user);

    return data.user;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
    this.userSubject.next(null);
  }

  getCurrentUser() {
    return this.userSubject.value;
  }
}
