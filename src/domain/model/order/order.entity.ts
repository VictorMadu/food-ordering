import { EventSourcedAggegrate } from 'src/domain/event-sourced-aggregate';
import { OrderId } from './order-id';
import { idValueTransformer } from 'src/presistence/value-transformers/id.value-transformers';
import { DomainEvent } from 'src/domain/domain-event';
import { Id } from 'src/domain/id';
import { PrimaryColumn, Entity, TableInheritance, Column, ChildEntity, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Length } from 'class-validator';
import { Customer } from './customer.vo';
import { DomainException } from 'src/domain/exception/domain.exception';
import { Expose } from 'class-transformer';
import { Naira } from '../naira';
import { PaymentId } from '../payment/payment-id';
import { Setting } from 'src/setting';
import { OrderEarnings } from './order-earnings.vo';
import { StoreId } from '../store/store-id';


@Entity()
export class Order extends EventSourcedAggegrate<OrderId, OrderEvent> {
 
  @Expose()
  @PrimaryColumn({
    type: 'uuid',
    transformer: idValueTransformer(OrderId),
  })
  readonly id: OrderId = new OrderId();

  @Expose()
  @Column({
    type: 'uuid',
    transformer: idValueTransformer(StoreId),
  })
  store: StoreId

  @Expose()
  @Length(1, 20, { each: true })
  @OneToMany(() => OrderItem, (item) => item.order, { eager: true, cascade: true })
  items: OrderItem[];

  @Expose()
  @Column(() => Customer)
  customer: Customer;

  @Expose()
  @Column(() => Naira)
  totalBill: Naira;

  @Expose()
  @Column(() => OrderEarnings)
  earnings: OrderEarnings

  @Expose()
  @Column(() => PaymentId)
  paymentId: PaymentId | null;

  @Expose()
  @Column({ type: 'timestamptz', nullable: true })
  deliveryBatch: Date | null;

  @Expose()
  @Column()
  delivered: boolean;

  public create(customer: Customer, store: StoreId, items: OrderItem[], totalBill: Naira) {
    if (!this.isNew()) {
      throw new DomainException('ORDER_ALREADY_CREATED');
    }

    const earnings = OrderEarnings.calculate(totalBill, Setting.order.earningDisbursement.vendorToAdminSplit)

    this.add(new OrderCreated(this.id, this.nextVersion(), customer, store, items, totalBill, earnings));
  }

  payBill(paymentId: PaymentId) {
    if (this.hasBillPaid()) {
      throw new DomainException('ALREADY_PAID_BILL');
    }

    const now = new Date();
    const nowInMs = now.getTime();
    const intervalTimeInMs = Setting.order.batchIntervalInMs;
    const currentInterval = parseInt((nowInMs / intervalTimeInMs).toString());
    const nextDeliveryBatch = new Date((currentInterval + 1) * 1000);

    this.add(new OrderBillPaid(this.id, this.nextVersion(), paymentId, nextDeliveryBatch));
  }

  deliver() {
    if (this.hasBeenDelivered()) {
      throw new DomainException('ALREADY_DELIVERED');
    }

    this.add(new OrderDelivered(this.id, this.nextVersion()));
  }

  public getId(): OrderId {
    return this.id;
  }

  public getTotalBill(): Naira {
    return this.totalBill;
  }

  public getSuperAdminEarning(): Naira {
    return this.earnings.superAdmin
  }

  public getVendorEarning(): Naira {
    return this.earnings.vendor;
  }

  public getCustomerEmail(): string {
    return this.customer.getEmail();
  }

  public hasBillPaid() {
    return this.paymentId != null;
  }

  public hasBeenDelivered() {
    return this.delivered;
  }

  public  getStoreId(): StoreId {
    return this.store;
}
}

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class OrderEvent extends DomainEvent<Order> {
  @Column({
    type: 'uuid',
    transformer: idValueTransformer(OrderId),
  })
  readonly aggregateId: OrderId;

  constructor(aggregateId: OrderId, version: number) {
    super(version);
    this.aggregateId = aggregateId;
  }

  public getAggregateId() {
    return this.aggregateId;
  }
}

@ChildEntity()
export class OrderCreated extends OrderEvent {
  @Expose()
  readonly customer: Customer;

  @Expose()
  readonly store: StoreId;

  @Expose()
  readonly items: OrderItem[];

  @Expose()
  readonly totalBill: Naira;

  @Expose()
  readonly earnings: OrderEarnings;

  @Expose()
  readonly vendorEarning: Naira;

  public constructor(
    id: OrderId,
    version: number,
    customer: Customer,
    store: StoreId,
    items: OrderItem[],
    totalBill: Naira,
    earnings: OrderEarnings
  ) {
    super(id, version);

    this.customer = customer;
    this.store = store;
    this.items = items;
    this.totalBill = totalBill;
    this.earnings = earnings;
  }

  protected _applyTo(entity: Order): void {
    entity.customer = this.customer;
    entity.store = this.store;
    entity.items = this.items;
    entity.totalBill = this.totalBill;
    entity.earnings = this.earnings;
    entity.paymentId = null;
    entity.deliveryBatch = null;
    entity.delivered = false;
  }
}

@ChildEntity()
export class OrderBillPaid extends OrderEvent {
  @Expose()
  readonly paymentId: PaymentId;

  @Expose()
  readonly deliveryBatch: Date;

  public constructor(id: OrderId, version: number, paymentId: PaymentId, deliveryBatch: Date) {
    super(id, version);

    this.paymentId = paymentId;
    this.deliveryBatch = deliveryBatch;
  }

  protected _applyTo(entity: Order): void {
    entity.paymentId = this.paymentId;
    entity.deliveryBatch = this.deliveryBatch;
  }
}

@ChildEntity()
export class OrderDelivered extends OrderEvent {
  public constructor(id: OrderId, version: number) {
    super(id, version);
  }

  protected _applyTo(entity: Order): void {
    entity.delivered = true;
  }
}
