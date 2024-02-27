import { Injectable } from '@nestjs/common';
import { FoodCookingSpaceRepository } from 'src/presistence/repository/food-cooking-space.repository';
import { Naira } from '../naira';
import { OrderItem } from './order-item.entity';
import { NullException } from 'src/lib/null.exception';

@Injectable()
export class OrderBillCalculatorService {
  constructor(private foodCookingSpaceRepository: FoodCookingSpaceRepository) {}

  async calculateTotal(items: OrderItem[]): Promise<Naira> {
    const foodCookingSpaces = await this.foodCookingSpaceRepository.findManyById(
      items.map((i) => i.getFoodId()),
    );

    if (foodCookingSpaces.length !== items.length) {
      throw new NullException('SOME_NOT_FOUND');
    }

    const total = foodCookingSpaces.reduce(
      (total, foodCookingSpace) => total + foodCookingSpace.getPricePerPlate().getValue(),
      0,
    );

    return new Naira(total);
  }
}
