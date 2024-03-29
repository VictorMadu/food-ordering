import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { assign } from 'src/lib/assign';
import * as uuid from 'uuid';

export abstract class Id {
  @Expose()
  @IsUUID()
  private value: string | null;

  public constructor(value: string | null = null) {
    this.value = value;
  }

  public toString(): string {
    if (this.value == null) {
      this.value = uuid.v4();
    }

    return this.value;
  }

  // public static fromString<T extends Id>(ClassId: { new (): T }, value: string): T {
  //   return assign(ClassId, { value } as any);
  // }

  public static readonly  c: unique symbol = Symbol()

  public equals(other: object): boolean {
    return (
      other instanceof Id &&
      this.constructor === other.constructor &&
      this.toString() === other.toString()
    );
  }
}
