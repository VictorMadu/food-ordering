import { WebSocketMessage } from './web-socket-message';

export class PongMessage extends WebSocketMessage {
  constructor(private readonly data: string | null = null) {
    super();
  }

  getPayload(): string | null {
    return this.data;
  }
}
