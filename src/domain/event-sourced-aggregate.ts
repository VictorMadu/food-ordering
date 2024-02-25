import { Column, Unique } from 'typeorm';
import { DomainEvent } from './domain-event';

@Unique(['id', 'version'])
export abstract class EventSourcedAggegrate<D extends DomainEvent<any>> {
  private events: D[] = [];

  @Column({ type: 'int' })
  version: number = 0;

  public add(d: D) {
    this.events.push(d);
    this.apply(d);
  }

  public apply(d: D): void {
    d.applyTo(this);
  }

  public pushOutPendingEvents(): D[] {
    const events = this.events;
    this.events = [];

    return events;
  }

  public nextVersion() {
    return this.version + 1;
  }
}
