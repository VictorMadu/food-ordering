import { WebSocket } from 'ws';
import { WebSocketMessage } from './web-socket-message';
import { TextMessage } from './text-message';
import { PingMessage } from './ping-message';

export class WebSocketSession {
  private readonly attributes: Map<unknown, unknown> = new Map();

  public constructor( readonly ws: WebSocket) {}

  setAttribute(key: any, value: any): void {
    this.attributes.set(key, value);
  }

  getAttribute(key: any): any {
    return this.attributes.get(key);
  }

  send(message: WebSocketMessage): void {
    if (message instanceof TextMessage) {
      this.ws.send(message.getPayload());
    } else if (message instanceof PingMessage) {
      this.ws.ping(message.getPayload());
    } else {
      throw new Error('Unexpected WebSocket message type');
    }
  }
}
