import { Injectable } from '@nestjs/common';
import { VendorId } from 'src/domain/model/user/vendor-id';
import { OptionalAsync } from 'src/lib/optional';
import { EntityManager, Equal, Repository } from 'typeorm';
import { Store } from 'src/domain/model/store/store.entity';
import { StoreId } from 'src/domain/model/store/store-id';
import { OperationStatus } from 'src/domain/model/store/operation-status';

// TODO: Add Redis in each Repository
@Injectable()
export class StoreRepository {
  private readonly r: Repository<Store>;

  constructor(manager: EntityManager) {
    this.r = manager.getRepository(Store);
  }

  public async save(entity: Store) {
    await this.r.save(entity);
  }

  public findById(id: StoreId): OptionalAsync<Store> {
    return OptionalAsync.of(
      this.r.findOne({
        where: { id: id.toString() },
      }),
    );
  }

  public findByOwner(owner: VendorId): OptionalAsync<Store> {
    return OptionalAsync.of(
      this.r.findOne({
        where: { owner: owner.toString() },
      }),
    );
  }

  public findOpenedByOwner(owner: VendorId): OptionalAsync<Store> {
    return OptionalAsync.of(
      this.r.findOne({
        where: { owner: owner.toString(), state: { operationStatus: Equal(OperationStatus.OPEN) } },
      }),
    );
  }
}
