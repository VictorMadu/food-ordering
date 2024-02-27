import { DomainEvent } from 'src/domain/domain-event';
import { EntityManager, EntitySubscriberInterface, InsertEvent } from 'typeorm';

export abstract class DomainEventListener<D extends DomainEvent<any>>
  implements EntitySubscriberInterface
{
  listenTo() {
    return this.event();
  }

  async afterInsert(event: InsertEvent<any>): Promise<void> {
    await this.on(event.entity as D, event.manager);
  }

  abstract event(): { new (...args: any[]): D };
  abstract on(event: D, manager: EntityManager): void | Promise<void>;
}
