import { instanceToPlain, plainToInstance } from 'class-transformer';
import { DomainEvent } from 'src/domain/domain-event';
import { EventSourcedAggegrate } from 'src/domain/event-sourced-aggregate';
import { StateBasedAggregate } from 'src/domain/state-based-aggregate';
import { replaceEmptyValuesWithNull } from 'src/lib/replace-empty-values-with-null';
import { validateAsync } from 'src/lib/validiate-async';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  LoadEvent,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export class EntitySubscriber implements EntitySubscriberInterface {
  afterLoad(entity: any, event?: LoadEvent<any>): void | Promise<any> {
    if (event.entity instanceof StateBasedAggregate) {
      replaceEmptyValuesWithNull(event.entity);
    } else if (event.entity instanceof EventSourcedAggegrate) {
      replaceEmptyValuesWithNull(event.entity);
    } else if (event.entity instanceof DomainEvent) {
      const deserializedPayload = plainToInstance(
        event.entity.constructor as any,
        event.entity.payload,
        {
          exposeDefaultValues: false,
          enableImplicitConversion: true,
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        },
      );
      event.entity = Object.assign(event.entity, deserializedPayload);
    }
  }

  async beforeInsert(event: InsertEvent<any>): Promise<void> {
    await beforeSave(event);
  }

  async beforeUpdate(event: UpdateEvent<any>): Promise<void> {
    await beforeSave(event);
  }

  async afterInsert(event: InsertEvent<any>): Promise<void> {
    await afterSave(event);
  }

  async afterUpdate(event: UpdateEvent<any>): Promise<void> {
    await afterSave(event);
  }
}

async function afterSave(event: InsertEvent<any> | UpdateEvent<any>): Promise<void> {
  if (event.entity instanceof EventSourcedAggegrate) {
    await event.manager.save(event.entity.pushOutPendingEvents());
  }
}

async function beforeSave(event: InsertEvent<any> | UpdateEvent<any>) {
  if (event.entity instanceof StateBasedAggregate) {
    await validateAsync(event.entity);
    event.entity.version++;
  } else if (event.entity instanceof EventSourcedAggegrate) {
    await validateAsync(event.entity);
  } else if (event.entity instanceof DomainEvent) {
    const copy: any = Object.assign({}, event.entity);
    delete copy.id;
    delete copy.version;
    delete copy.occurredAt;
    delete copy.aggregateId;

    (event.entity as any)['payload'] = instanceToPlain(copy, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
      exposeUnsetFields: false,
    }) as any;
  }
}
