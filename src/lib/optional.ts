import { NullException } from './null.exception';

export class Optional<T> {
  private constructor(private readonly data: T | null) {}

  static of<T>(data: T | null) {
    return new Optional(data);
  }

  public getOrThrow(err: Error): T {
    if (this.isPresent()) return this.data as T;
    else throw err;
  }

  public orElse(other: T): T {
    if (this.isPresent()) return this.data;
    else return other;
  }

  public get(): T {
    return this.getOrThrow(new NullException());
  }

  public isPresent(): boolean {
    return this.data != null;
  }
}

export class OptionalAsync<T> {
  private constructor(private readonly data: Promise<T | null>) {}

  static of<T>(data: Promise<T | null>) {
    return new OptionalAsync(data);
  }

  public async orElse(other: T | Promise<T>): Promise<T> {
    if (await this.isPresent()) return this.data;
    else return other;
  }

  public async orThrow(err: Error): Promise<T> {
    if (await this.isPresent()) return this.data as T;
    else throw err;
  }

  public async get(): Promise<T> {
    if (await this.isPresent()) return this.data as T;
    else throw new NullException();
  }

  public async isPresent(): Promise<boolean> {
    return (await this.data) != null;
  }
}
