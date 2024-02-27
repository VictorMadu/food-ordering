import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as req from '../request.dto';
import { OrderRepository } from 'src/presistence/repository/order.repository';
import { Order } from 'src/domain/model/order/order.entity';
import { OrderBillCalculatorService } from 'src/domain/model/order/order-bill-calculator.service';
import { PaymentService } from 'src/domain/model/payment/payment.service';
import { FoodCookingSpaceRepository } from 'src/presistence/repository/food-cooking-space.repository';
import { DomainException } from 'src/domain/exception/domain.exception';

@ApiTags('Order')
@Controller('api/order')
export class OrderingController {
  constructor(
    private orderBillCalculatorService: OrderBillCalculatorService,
    private orderRepository: OrderRepository,
    private paymentService: PaymentService,
    private foodCookingSpaceRepository: FoodCookingSpaceRepository
  ) {}

  @Post('ordering/init')
  async orderFood(@Body() body: req.OrderFood): Promise<Order> {
    const order = new Order();
    const foods = body.getFoods();
    const totalBill = await this.orderBillCalculatorService.calculateTotal(foods);
    const distinctStores = await this.foodCookingSpaceRepository.findDistinctStore(foods.map(f => f.getFoodId()), 2);

    if (distinctStores.length !== 1) {
        throw new DomainException("ORDER_CAN_ONLY_BE_FROM_ONE_SHOP")
    }

    order.create(body.getCustomer(),distinctStores[0], foods, totalBill);
    await this.orderRepository.save(order);

    return order;
  }

  @Post('ordering/pay')
  async makeOrderPayment(@Body() body: req.OrderPayment): Promise<Order> {
    const order = await this.orderRepository.findById(body.getOrderId()).get();
    const totalBill = order.getTotalBill();

    const paymentId = await this.paymentService.makePayment(
      order.getCustomerEmail(),
      body.getCard(),
      totalBill,
    );

    order.payBill(paymentId);
    await this.orderRepository.save(order);

    return order;
  }

}
