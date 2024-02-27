import { Expose, Type } from 'class-transformer';
import { IsInt, Length, Min } from 'class-validator';
import { FoodCookingSpaceId } from 'src/domain/model/food/food-cooking-space-id';
import { MailMessage } from 'src/domain/model/mail/mail-message.vo';
import { Naira } from 'src/domain/model/naira';
import { Customer } from 'src/domain/model/order/customer.vo';
import { OrderId } from 'src/domain/model/order/order-id';
import { OrderItem } from 'src/domain/model/order/order-item.entity';
import { Card } from 'src/domain/model/payment/card.vo';
import { VerificationType } from 'src/domain/model/verification/verification-type';

export class Account {
  @Expose()
  readonly email: string;

  @Expose()
  readonly password: string;
}

export class Email {
  @Expose()
  readonly email: string;
}

export class VerificationInitialization {
  @Expose()
  readonly email: string;

  // @Expose()
  // readonly verificationType: VerificationType;
}

export class AccountVerification {
  @Expose()
  readonly email: string;

  @Expose()
  readonly otp: string;

  // @Expose()
  // readonly verificationType: VerificationType;
}

export class Store {
  @Expose()
  readonly name: string;
}

export class FoodCookingSpace {
  @Expose()
  readonly foodName: string;

  @Expose()
  readonly pricePerPlateInNaira: number;

  getPricePerPlate() {
    return new Naira(this.pricePerPlateInNaira);
  }
}

export class CookFood {
  @Expose()
  readonly foodCookingSpaceId: string;

  @Expose()
  readonly noOfPlates: number;

  getFoodCookingSpaceId() {
    return new FoodCookingSpaceId(this.foodCookingSpaceId);
  }
}

export class FoodOrderItem {
  @Expose()
  readonly foodCookingSpaceId: string;

  @Expose()
  @IsInt()
  readonly noOfPlates: number;

  getItem(): OrderItem {
    return new OrderItem(new FoodCookingSpaceId(this.foodCookingSpaceId), this.noOfPlates);
  }
}

export class OrderFood {
  @Expose()
  readonly customerEmail: string;

  @Expose()
  @Type(() => FoodOrderItem)
  readonly foods: FoodOrderItem[];

  getCustomer(): Customer {
    return new Customer(this.customerEmail);
  }

  getFoods(): OrderItem[] {
    return this.foods.map((f) => f.getItem());
  }
}

export class OrderPayment {
  @Expose()
  readonly orderId: string;

  @Expose()
  readonly card: Card;

  getOrderId(): OrderId {
    return new OrderId(this.orderId);
  }

  getCard(): Card {
    return this.card;
  }
}

export class DeliveryOrder {
  @Expose()
  readonly mail: MailMessage;

  getMail(): MailMessage {
    return this.mail;
  }
}
