import { Expose } from 'class-transformer';

export class Duration {
  @Expose()
  ms: number;

  constructor(value: number) {
    this.ms = value;
  }

  static ofDays(days: number): Duration {
    return new Duration(days * 24 * 60 * 60 * 1000);
  }

  static ofHours(hours: number): Duration {
    return new Duration(hours * 60 * 60 * 1000);
  }

  static ofMinutes(minutes: number): Duration {
    return new Duration(minutes * 60 * 1000);
  }

  static ofSeconds(seconds: number): Duration {
    return new Duration(seconds * 1000);
  }

  static ofMilliSeconds(milliSeconds: number): Duration {
    return new Duration(milliSeconds * 1000);
  }

  static between(d1: Date, d2: Date): Duration {
    return new Duration(Math.abs(+d1 - +d2));
  }

  getValue(): number {
    return this.ms;
  }

  getInMilliSeconds(): number {
    return this.ms;
  }

  getInSeconds(): number {
    return Math.floor(this.ms / 1000);
  }

  getInMinutes(): number {
    return Math.floor(this.ms / (1000 * 60));
  }

  getInHours(): number {
    return Math.floor(this.ms / (1000 * 60 * 60));
  }

  getInDays(): number {
    return Math.floor(this.ms / (1000 * 60 * 60 * 24));
  }

  addWith(d: Date): Date {
    const n = new Date();
    n.setMilliseconds(d.getMilliseconds() + this.ms);
    return n;
  }

  removeFrom(d: Date): Date {
    const n = new Date();
    n.setMilliseconds(d.getMilliseconds() - this.ms);
    return n;
  }
}
