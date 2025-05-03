import { WebSocketMessage } from './web-socket-message';

export class PingMessage extends WebSocketMessage {
  constructor(private readonly data: string | null = null) {
    super();
  }

  getPayload(): string | null {
    return this.data;
  }
}
