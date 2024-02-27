import { ChildEntity, Column, Entity, PrimaryColumn, TableInheritance } from 'typeorm';
import { VendorId } from '../user/vendor-id';
import { StoreId } from './store-id';
import { idValueTransformer } from 'src/presistence/value-transformers/id.value-transformers';
import { OperationStatus, Orchestrator, StoreState } from './operation-status';
import { EventSourcedAggegrate } from 'src/domain/event-sourced-aggregate';
import { Length } from 'class-validator';
import { DomainEvent } from 'src/domain/domain-event';
import { Id } from 'src/domain/id';
import { Expose } from 'class-transformer';
import { DomainException } from 'src/domain/exception/domain.exception';

@Entity()
export class Store extends EventSourcedAggegrate<StoreId, StoreEvent> {
  @PrimaryColumn({
    type: 'uuid',
    transformer: idValueTransformer(StoreId),
  })
  readonly id: StoreId = new StoreId();

  @Length(1, 255)
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'uuid',
    transformer: idValueTransformer(VendorId),
    unique: true,
  })
  owner: VendorId;

  @Column(() => StoreState)
  state: StoreState;

  public setUp(vendorId: VendorId, name: string) {
    if (!this.isNew()) {
      throw new DomainException("ALREADY_SET_UP")
    }

    this.add(new StoreSetup(this.id, this.nextVersion(), vendorId, name));
  }

  public openForSales() {
    if (this.state.isOpened() || this.state.isClosedBySuperAdmin()) {
      throw new DomainException('SHOP_CANT_BE_OPENED');
    } 

      this.add(new OpenedForSale(this.id, this.nextVersion()));
  }

  public closeAfterSales() {
    if (this.state.isClosed()) {
      throw new DomainException('SHOP_CANT_BE_CLOSED');
    }

    this.add(new ClosedAfterSale(this.id, this.nextVersion()));
  }

  public openAfterInspection() {
    if (!this.state.isClosedBySuperAdmin()) {
      throw new DomainException('SHOP_CANT_BE_OPENED');
    }
    this.add(new OpenedAfterInspection(this.id, this.nextVersion()))
  }

  public closeAfterInspection() {
    if (this.state.isClosedBySuperAdmin()) {
      throw new DomainException('SHOP_CANT_BE_CLOSED');
    }
    this.add(new ClosedAfterInspection(this.id, this.nextVersion()))
  }

  public getId(): StoreId {
    return this.id;
  }
}

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class StoreEvent extends DomainEvent<Store> {
  @Column({
    type: 'uuid',
    transformer: idValueTransformer(StoreId),
  })
  readonly aggregateId: StoreId;

  constructor(aggregateId: StoreId, version: number) {
    super(version);
    this.aggregateId = aggregateId;
  }

  public getAggregateId() {
    return this.aggregateId;
  }

}

@ChildEntity()
export class StoreSetup extends StoreEvent {
  @Expose()
  readonly owner: VendorId;

  @Expose()
  readonly name: string;

  public constructor(id: StoreId, version: number, owner: VendorId, name: string) {
    super(id, version);

    this.owner = owner;
    this.name = name;
  }

  protected _applyTo(entity: Store): void {
    entity.owner = this.owner;
    entity.name = this.name;
    entity.state = new StoreState(OperationStatus.CLOSED, Orchestrator.VENDOR);
  }
}

@ChildEntity()
export class OpenedForSale extends StoreEvent {
  public constructor(id: StoreId, version: number) {
    super(id, version);
  }

  protected _applyTo(entity: Store): void {
    entity.state = new StoreState(OperationStatus.OPEN, Orchestrator.VENDOR);
  }
}

@ChildEntity()
export class ClosedAfterSale extends StoreEvent {
  public constructor(id: StoreId, version: number) {
    super(id, version);
  }

  protected _applyTo(entity: Store): void {
    entity.state = new StoreState(OperationStatus.CLOSED, Orchestrator.VENDOR);
  }
}

@ChildEntity()
export class OpenedAfterInspection extends StoreEvent {
  public constructor(id: StoreId, version: number) {
    super(id, version);
  }

  protected _applyTo(entity: Store): void {
    entity.state = new StoreState(OperationStatus.OPEN, Orchestrator.SUPER_ADMIN);
  }
}

@ChildEntity()
export class ClosedAfterInspection extends StoreEvent {
  public constructor(id: StoreId, version: number) {
    super(id, version);
  }

  protected _applyTo(entity: Store): void {
    entity.state = new StoreState(OperationStatus.CLOSED, Orchestrator.SUPER_ADMIN);
  }
}
