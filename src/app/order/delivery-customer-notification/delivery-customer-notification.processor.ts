import { Injectable } from '@nestjs/common';
import { MailService } from 'src/domain/model/mail/mail.service';
import { queue } from './delivery-customer-notification.queue';
import { DeliveryTimeCustomerNotification } from 'src/domain/model/order/delivery-time-customer-notification.vo';
import { deserialize } from 'src/lib/deserialize';



@Injectable()
export class DeliveryCustomerNotificationProcessor {
  constructor( mailService: MailService) {
    queue.process(async (cb) => {
        const notification = deserialize(cb.data, DeliveryTimeCustomerNotification);
        await mailService.sendMail(notification.getCustomerMail())
    })
 
  }
}