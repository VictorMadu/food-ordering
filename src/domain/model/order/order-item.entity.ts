import { Expose } from 'class-transformer';
import { FoodCookingSpaceId } from '../store/food-cooking-space-id';
import { IsInt } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { OrderItemId } from './order-item-id';
import { idValueTransformer } from 'src/presistence/value-transformers/id.value-transformers';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryColumn({
    type: 'uuid',
    transformer: idValueTransformer(OrderItemId),
  })
  readonly id: OrderItemId = new OrderItemId();

  @Expose()
  @Column({
    type: 'uuid',
    transformer: idValueTransformer(FoodCookingSpaceId),
  })
  food: FoodCookingSpaceId;

  @Expose()
  @IsInt()
  noOfPlates: number;

  @ManyToOne(() => Order, (order) => order.items, { eager: false })
  readonly order: Order | null;

  constructor(food: FoodCookingSpaceId, noOfPlates: number) {
    this.food = food;
    this.noOfPlates = noOfPlates;
  }

  getId(): OrderItemId {
    return this.id;
  }

  getFoodId(): FoodCookingSpaceId {
    return this.food;
  }
}
