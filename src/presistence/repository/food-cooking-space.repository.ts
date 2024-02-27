import { Injectable } from '@nestjs/common';
import { OptionalAsync } from 'src/lib/optional';
import { EntityManager, In, Repository } from 'typeorm';
import { StoreId } from 'src/domain/model/store/store-id';
import { FoodCookingSpace } from 'src/domain/model/store/food-cooking-space.entity';
import { FoodCookingSpaceId } from 'src/domain/model/store/food-cooking-space-id';
import { VendorId } from 'src/domain/model/user/vendor-id';

// TODO: Add Redis in each Repository
@Injectable()
export class FoodCookingSpaceRepository {
  private readonly r: Repository<FoodCookingSpace>;

  constructor(manager: EntityManager) {
    this.r = manager.getRepository(FoodCookingSpace);
  }

  public async save(entity: FoodCookingSpace) {
    await this.r.save(entity);
  }

  public findById(id: FoodCookingSpaceId): OptionalAsync<FoodCookingSpace> {
    return OptionalAsync.of(
      this.r.findOne({
        where: { id: id.toString() },
      }),
    );
  }

  public findManyById(id: FoodCookingSpaceId[]): Promise<FoodCookingSpace[]> {
    return this.r.find({
      where: { id: In(id.map((i) => i.toString())) },
    });
  }

  public findByStoreId(storeId: StoreId): OptionalAsync<FoodCookingSpace> {
    return OptionalAsync.of(
      this.r.findOne({
        where: { storeId: storeId.toString() },
      }),
    );
  }

  public findByIdAndStoreId(id: FoodCookingSpaceId, storeId: StoreId) {
    return OptionalAsync.of(
      this.r.findOne({
        where: { id: id.toString(), storeId: storeId.toString() },
      }),
    );
  }

  public async findDistinctStore(ids: FoodCookingSpaceId[], max: number) : Promise<StoreId[]>{
    const results = await this.r.createQueryBuilder("f").select(["f.storeId"]).whereInIds(ids.map(i => i.toString())).distinctOn(["storeId"]).limit(max).getRawMany<string>()

    return results.map(r => new StoreId(r))
  }
}
