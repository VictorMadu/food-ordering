import { Injectable } from '@nestjs/common';
import { OptionalAsync } from 'src/lib/optional';
import { EntityManager, Equal, LessThanOrEqual, Repository } from 'typeorm';
import { OrderId } from 'src/domain/model/order/order-id';
import { Order } from 'src/domain/model/order/order.entity';
import { Pagination } from 'src/lib/page';
import { StoreId } from 'src/domain/model/store/store-id';
import { VendorId } from 'src/domain/model/user/vendor-id';

// TODO: Add Redis in each Repository
@Injectable()
export class OrderRepository {
 
  private readonly r: Repository<Order>;

  constructor(manager: EntityManager) {
    this.r = manager.getRepository(Order);
  }

  public async save(entity: Order) {
    await this.r.save(entity);
  }

  public async saveAll(entities: Order[]) {
    await this.r.save(entities);
  }

  public findById(id: OrderId): OptionalAsync<Order> {
    return OptionalAsync.of(
      this.r.findOne({
        where: { id: id.toString() },
      }),
    );
  }

  public countPendingDelivery(): Promise<number> {
    const now = new Date();

    return this.r.count({
      where: {
        deliveryBatch: LessThanOrEqual(now),
        delivered: Equal(false),
      },
    });
  }

  public findManyPendingDelivery(pagination: Pagination): Promise<Order[]> {
    const now = new Date();

    return this.r.find({
      where: {
        deliveryBatch: LessThanOrEqual(now),
        delivered: Equal(false),
      },
      skip: pagination.getOffset(),
      take: pagination.getLimit(),
    });
  }

}
