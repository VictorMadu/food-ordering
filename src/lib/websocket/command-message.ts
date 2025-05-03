import { Expose, Transform } from 'class-transformer';
import { TextMessage } from './text-message';
import { deserialize } from '../deserialize';

export class CommandMessage<C> extends TextMessage {
  private readonly deserialized: DeSerialized<C>;

  constructor(data: string) {
    super(data);
    this.deserialized = deserialize(JSON.parse(this.getPayload()), DeSerialized<C>);
  }

  getData<T>(clazz: { new (...args: any[]): T }): T {
    return deserialize<T>(this.deserialized.payload, clazz);
  }

  getType(): C {
    return this.deserialized.type;
  }
}

class DeSerialized<C> {
  @Expose()
  public type: C | null = null;

  @Expose()
  @Transform(
    ({ key, obj }) => {
      return obj[key];
    },
    { toClassOnly: true },
  )
  public payload: object | null = null;
}
