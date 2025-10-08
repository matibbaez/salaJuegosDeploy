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

    // Crear un mensaje temporal para mostrarlo al instante
    const tempMessage: Message = {
      id: -1, // Un ID temporal, no se usará
      user_id: this.userId,
      username: this.username,
      message: messageToSend,
      created_at: new Date().toISOString() // Fecha actual
    };

    // Añadir el mensaje temporal al array para que aparezca al instante
    this.messages = [...this.messages, tempMessage];
    setTimeout(() => this.scrollToBottom(), 50); // Hacer scroll

    // Enviar el mensaje a Supabase
    await this.chatService.sendMessage(this.userId, this.username, messageToSend);

    // Opcional: Si quieres reemplazar el mensaje temporal con el real (con el ID de Supabase),
    // podrías añadir lógica en onNewMessage para buscar y actualizar el mensaje con ID -1.
    // Pero con los cambios en onNewMessage y la rapidez de Supabase, no suele ser necesario
    // ya que el mensaje real de Supabase debería llegar muy rápido y ser el siguiente en la lista.
  }

  isMine(m: Message) {
    return m.user_id === this.userId;
  }
}