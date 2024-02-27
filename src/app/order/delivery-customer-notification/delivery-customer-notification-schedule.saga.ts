import { DeliveryTimeCustomerNotification } from "src/domain/model/order/delivery-time-customer-notification.vo";
import { OrderBillPaid } from "src/domain/model/order/order.entity";
import { validateAsync } from "src/lib/validiate-async";
import { DomainEventListener } from "src/presistence/domain-event-listener";
import { OrderRepository } from "src/presistence/repository/order.repository";
import { EventSubscriber, EntityManager } from "typeorm";
import { queue } from "./delivery-customer-notification.queue";
import { serialize } from "src/lib/serialize";

@EventSubscriber()
export class CustomerDeliveryTimeSlotNotificationScheduler extends DomainEventListener<OrderBillPaid> {
  event(): new (...args: any[]) => OrderBillPaid {
    return OrderBillPaid;
  }

  on(event: OrderBillPaid, manager: EntityManager): void {
    new Promise<void>(async (resolve) => {
        const orderRepository = new OrderRepository(manager);
        const order = await orderRepository.findById(event.getAggregateId()).get()
        const notification = DeliveryTimeCustomerNotification.from(order);
      
    await validateAsync(order);
      await queue.add(serialize(notification) as DeliveryTimeCustomerNotification, {
        delay: notification.getMilliSecondsToDelivery(),
        attempts: 5,
        removeOnFail: true,
        removeOnComplete: true,
        timeout: 5 * 1000,
        jobId: notification.getOrderId().toString(),
      });

      resolve();
    });
  }
}
