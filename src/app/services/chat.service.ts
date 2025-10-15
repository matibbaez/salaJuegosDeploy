import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Message {
  id: number;
  user_id?: string | null;
  username?: string | null;
  message: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private supabaseService: SupabaseService) {}

  // obtener mensajes - ORDENADO ASCENDENTE 
  async fetchRecent(limit = 50): Promise<Message[]> {
    const { data, error } = await this.supabaseService['supabase']
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true }) 
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  }

  // enviar mensaje
  async sendMessage(user_id: string | null, username: string | null, message: string) {
    const { error } = await this.supabaseService['supabase']
      .from('messages')
      .insert([{ user_id, username, message }]);
    if (error) throw error;
    return true;
  }

  // subscribirse a nuevos mensajes (realtime)
  onNewMessage(callback: (msg: Message) => void) {
    const channel = this.supabaseService['supabase']
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: { new: Message }) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return () => {
      this.supabaseService['supabase'].removeChannel(channel);
    };
  }
}