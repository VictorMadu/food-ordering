import { Column, Unique } from 'typeorm';
import { DomainEvent } from './domain-event';
import { Id } from './id';

@Unique(['id', 'version'])
export abstract class EventSourcedAggegrate<I extends Id, D extends DomainEvent<any>> {
  private events: D[] = [];

  @Column({ type: 'int' })
  version: number = 0;

  protected add(d: D) {
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

  public isNew() {
    return this.version === 0;
  }

  public abstract getId(): I;
}
