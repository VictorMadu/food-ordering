import * as Bull from "bull";
import { DeliveryTimeCustomerNotification } from "src/domain/model/order/delivery-time-customer-notification.vo";
import { Setting } from "src/setting";

export const queue = new Bull<DeliveryTimeCustomerNotification>('CustomerDeliveryTimeSlotNotification', {
    redis: {
        host: Setting.redis.host,
        port: Setting.redis.port,
        password: Setting.redis.password,
        username: Setting.redis.userName,
    }
  } as Bull.QueueOptions);
  
  