import { AbstractWebSocketHandler } from './abstract-web-socket-handler';
import { CommandMessage } from './command-message';
import { PongMessage } from './pong-message';
import { TextMessage } from './text-message';
import { WebSocketMessage } from './web-socket-message';
import { WebSocketSession } from './web-socket-session';

export abstract class EventWebSocketHandler extends AbstractWebSocketHandler {
  handleMessage(session: WebSocketSession, message: WebSocketMessage): void | Promise<void> {
    if (message instanceof TextMessage) {
      this.handleTextMessage(session, new CommandMessage(message.getPayload()));
    } else if (message instanceof PongMessage) {
      this.handlePongMessage(session, message);
    } else {
      throw new Error('Unexpected message type');
    }
  }

  abstract handleTextMessage(
    session: WebSocketSession,
    message: CommandMessage<any>,
  ): void | Promise<void>;
}
