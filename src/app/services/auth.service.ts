import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    this.checkSession();
    this.listenForAuthChanges(); // 🟢 NUEVO
  }

  private async checkSession() {
    const { data } = await this.supabase.auth.getSession();
    this.userSubject.next(data.session?.user ?? null);
  }

  // 🟢 Escuchar cambios globales de sesión
  private listenForAuthChanges() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.userSubject.next(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.userSubject.next(null);
        this.router.navigate(['/login']); // 🚪 Redirige al login automático
      }
    });
  }

  async signUp(email: string, password: string, nombre: string, apellido: string, edad: number) {
    const { data: existingProfiles } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (existingProfiles && existingProfiles.length > 0) {
      throw new Error('El usuario ya se encuentra registrado');
    }

    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      await this.supabase.from('profiles').insert({
        id: data.user.id,
        email,
        nombre,
        apellido,
        edad,
        created_at: new Date(),
      });

      this.userSubject.next(data.user);
    }

    return data.user;
  }

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
    await this.router.navigate(['/login']);
  }

  getCurrentUser() {
    return this.userSubject.value;
  }
}
