import { Injectable } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { CloseStatus } from 'src/lib/websocket/close-status';
import { CommandMessage } from 'src/lib/websocket/command-message';
import { EventMessage } from 'src/lib/websocket/event-message';
import { EventWebSocketHandler } from 'src/lib/websocket/event-web-socket-handler';
import { PongMessage } from 'src/lib/websocket/pong-message';
import { WebSocketSession } from 'src/lib/websocket/web-socket-session';

@Injectable()
export class WebSocketService extends EventWebSocketHandler {
  constructor() {
    super('/');
  }

  private readonly sessions: Map<String, WebSocketSession> = new Map();

  afterConnectionEstablished(
    session: WebSocketSession,
    queryParameters: Map<string, string[]>,
  ): void | Promise<void> {
    console.log('Method not implemented.', session.setAttribute('me', 'you'));
    session.ws.close()
  }

  handleTextMessage(session: WebSocketSession, message: CommandMessage<any>): void | Promise<void> {
    const you = session.getAttribute('me');
    console.log('Method not implemented.');

    session.send(new EventMessage('sent_message', message.getData(Message), new Date()));
  }

  handlePongMessage(session: WebSocketSession, message: PongMessage): void | Promise<void> {
    console.log('Method not implemented.');
  }

  afterConnectionClosed(session: WebSocketSession, status: CloseStatus): void | Promise<void> {
    console.log('Method not implemented.');
  }
}

class Message {
  @Expose()
  message: string;
}
