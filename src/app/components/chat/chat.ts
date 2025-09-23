import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Message } from '../../services/chat.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

    // suscribirse a nuevos mensajes en tiempo real
    this.unsubscribe = this.chatService.onNewMessage((msg) => {
      this.messages = [...this.messages, msg]; // ahora aparece abajo
      setTimeout(() => this.scrollToBottom(), 50); // autoscroll al último mensaje
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
    await this.chatService.sendMessage(this.userId, this.username, this.text);
    this.text = '';
  }

  isMine(m: Message) {
    return m.user_id === this.userId;
  }
}
