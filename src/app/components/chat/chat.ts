import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Message } from '../../services/chat.service';
import { SupabaseService } from '../../services/supabase.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeAgoPipe],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  text = '';
  private unsubscribe: (() => void) | null = null;
  private userId: string | null = null;
  private username: string | null = null;

  constructor(
    private chatService: ChatService,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    // obtener usuario logueado
    const { data } = await this.supabaseService.getCurrentUser();
    this.userId = data.user?.id ?? null;
    this.username = data.user?.email ?? 'Invitado';

    // cargar últimos mensajes
    this.messages = await this.chatService.fetchRecent();
    setTimeout(() => this.scrollToBottom(), 100); // Asegurarse de hacer scroll al cargar los mensajes iniciales

    // suscribirse a nuevos mensajes en tiempo real
    this.unsubscribe = this.chatService.onNewMessage((msg) => {
      // Solo añadir si no es un mensaje que ya hemos añadido localmente al enviar
      // Esto es una medida de precaución, el orden de llegada en realtime podría variar
      if (!this.messages.find(m => m.id === msg.id && m.created_at === msg.created_at)) {
        this.messages = [...this.messages, msg];
        setTimeout(() => this.scrollToBottom(), 50); // autoscroll al último mensaje
      }
    });
  }

  scrollToBottom() {
    const chatList = document.getElementById('chat-list');
    if (chatList) {
      chatList.scrollTop = chatList.scrollHeight;
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  async send() {
    if (!this.text.trim()) return;

    const messageToSend = this.text;
    this.text = ''; // Limpiar el input inmediatamente

    // 👇 SIMPLEMENTE ENVIAMOS EL MENSAJE Y ESPERAMOS QUE LLEGUE POR REAL-TIME
    try {
      await this.chatService.sendMessage(this.userId, this.username, messageToSend);
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      // Opcional: podrías volver a poner el texto en el input si falla
      this.text = messageToSend; 
    }
  }

  isMine(m: Message) {
    return m.user_id === this.userId;
  }
}