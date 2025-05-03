import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as req from '../request.dto';
import { OrderRepository } from 'src/presistence/repository/order.repository';
import { Order } from 'src/domain/model/order/order.entity';
import { VerifiedSuperAdminGuard } from '../auth.guard';
import { Pagination } from 'src/lib/page';
import { Setting } from 'src/setting';

@ApiTags('Order')
@Controller('api/order')
export class OrderDeliveryController {
  constructor(private orderRepository: OrderRepository) {}

  @Post('admin/deliver')
  @UseGuards(VerifiedSuperAdminGuard)
  async deliveryNextOrder(@Body() body: req.DeliveryOrder): Promise<void> {
    // Because it might involve large number of orders, we have the response returned before we handle the request
    new Promise<void>(async (resolve) => {
      // We deliver the order in batches for performance
      const total = await this.orderRepository.countPendingDelivery();
      let pagination = new Pagination(1, Setting.order.delivery.maxBatch);
      let offset = 0;
      let orders: Order[];

      while (offset < total) {
        orders = await this.orderRepository.findManyPendingDelivery(pagination);

        for (let i = 0; i < orders.length; i++) {
          orders[i].deliver();
        }

        await this.orderRepository.saveAll(orders);
      }

      resolve();
    });
  }
}
