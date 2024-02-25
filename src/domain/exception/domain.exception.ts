import { Expose } from 'class-transformer';

export class DomainException extends Error {
  @Expose()
  public readonly reason: string;

  constructor(reason: string) {
    super();
    this.reason = reason;
  }
}
