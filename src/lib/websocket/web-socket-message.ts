export abstract class WebSocketMessage {
  abstract getPayload(): string | Buffer | null;
}
