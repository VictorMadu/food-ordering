import { serialize } from '../serialize';
import { TextMessage } from './text-message';

export class EventMessage<E> extends TextMessage {
  constructor(type: E, payload: object, createdAt: Date) {
    super(
      JSON.stringify({
        type,
        payload: serialize(payload),
        createdAt: serialize(createdAt),
      }),
    );
  }
}
