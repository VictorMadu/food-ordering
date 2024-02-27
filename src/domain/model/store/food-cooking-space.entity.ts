import { EventSourcedAggegrate } from 'src/domain/event-sourced-aggregate';
import { FoodCookingSpaceId } from './food-cooking-space-id';
import { DomainEvent } from 'src/domain/domain-event';
import { Id } from 'src/domain/id';
import { idValueTransformer } from 'src/presistence/value-transformers/id.value-transformers';
import { Entity, TableInheritance, Column, PrimaryColumn, Unique } from 'typeorm';
import { StoreId } from './store-id';
import { Expose } from 'class-transformer';
import { IsInt, Length, Min } from 'class-validator';
import { DomainException } from 'src/domain/exception/domain.exception';
import { Naira } from '../naira';

@Unique(['storeId', 'foodName'])
export class FoodCookingSpace extends EventSourcedAggegrate<
  FoodCookingSpaceId,
  FoodCookingSpaceEvent
> {
  @PrimaryColumn({
    type: 'uuid',
    transformer: idValueTransformer(FoodCookingSpaceId),
  })
  id: FoodCookingSpaceId = new FoodCookingSpaceId();

  @Column({
    type: 'uuid',
    transformer: idValueTransformer(StoreId),
  })
  storeId: StoreId;

  @Length(1, 255)
  @Column({ type: 'varchar', length: 255 })
  foodName: string;

  @IsInt()
  @Min(0)
  @Column({ type: 'int' })
  noOfPlates: number = 0;

  @Column(() => Naira)
  pricePerPlate: Naira;

  public create(storeId: StoreId, foodName: string, pricePerPlate: Naira) {
    if (this.isNew()) {
      this.add(
        new FoodCookingSpaceCreated(this.id, this.nextVersion(), storeId, foodName, pricePerPlate),
      );
    } else {
      throw new DomainException('ALREADY_CREATED');
    }
  }

  public cookFood(noOfPlates: number) {
    this.add(new FoodCooked(this.id, this.nextVersion(), noOfPlates));
  }

  public sell(noOfPlates: number) {
    if (this.noOfPlates - noOfPlates < 0) {
      throw new DomainException('NO_OF_PLATES_NOT_ENOUGH');
    } else {
      this.add(new FoodSold(this.id, this.nextVersion(), noOfPlates));
    }
  }

  public getId(): FoodCookingSpaceId {
    return this.id;
  }

  public getPricePerPlate(): Naira {
    return this.pricePerPlate;
  }
}

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class FoodCookingSpaceEvent extends DomainEvent<FoodCookingSpace> {
  @Column({
    type: 'uuid',
    transformer: idValueTransformer(FoodCookingSpaceId),
  })
  readonly aggregateId: FoodCookingSpaceId;

  constructor(aggregateId: FoodCookingSpaceId, version: number) {
    super(version);
    this.aggregateId = aggregateId;
  }

  public getAggregateId(): Id {
    return this.aggregateId;
  }
}

export class FoodCookingSpaceCreated extends FoodCookingSpaceEvent {
  @Expose()
  storeId: StoreId;

  @Expose()
  foodName: string;

  @Expose()
  pricePerPlate: Naira;

  constructor(
    aggregateId: FoodCookingSpaceId,
    version: number,
    storeId: StoreId,
    foodName: string,
    pricePerPlate: Naira,
  ) {
    super(aggregateId, version);

    this.storeId = storeId;
    this.foodName = foodName;
    this.pricePerPlate = pricePerPlate;
  }

  protected _applyTo(entity: FoodCookingSpace): void {
    entity.storeId = this.storeId;
    entity.foodName = this.foodName;
    entity.noOfPlates = 0;
    entity.pricePerPlate = this.pricePerPlate;
  }
}

export class FoodCooked extends FoodCookingSpaceEvent {
  @Expose()
  noOfPlates: number;

  constructor(aggregateId: FoodCookingSpaceId, version: number, noOfPlates: number) {
    super(aggregateId, version);

    this.noOfPlates = noOfPlates;
  }

  protected _applyTo(entity: FoodCookingSpace): void {
    entity.noOfPlates += this.noOfPlates;
  }
}

export class FoodSold extends FoodCookingSpaceEvent {
  @Expose()
  noOfPlates: number;

  constructor(aggregateId: FoodCookingSpaceId, version: number, noOfPlates: number) {
    super(aggregateId, version);

    this.noOfPlates = noOfPlates;
  }

  protected _applyTo(entity: FoodCookingSpace): void {
    entity.noOfPlates -= this.noOfPlates;
  }
}
