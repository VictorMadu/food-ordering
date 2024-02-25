import { Column, PrimaryColumn, Unique } from 'typeorm';
import { EventSourcedAggegrate } from './event-sourced-aggregate';
import { EventId } from './event-id';
import { idValueTransformer } from 'src/presistence/value-transformers/id.value-transformers';

@Unique(['aggregateId', 'version'])
export abstract class DomainEvent<A extends EventSourcedAggegrate<any>> {
  @PrimaryColumn({
    type: 'uuid',
    transformer: idValueTransformer(EventId),
  })
  readonly id: EventId;

  @Column({ type: 'int' })
  readonly version: number;

  @Column({ type: 'timestamptz' })
  readonly occurredAt: Date;

  @Column({ type: 'varchar' })
  readonly payload: string;

  constructor(version: number) {
    this.id = new EventId();
    this.version = version;
    this.occurredAt = new Date();
  }

  public abstract applyTo(entity: A): void;
}
