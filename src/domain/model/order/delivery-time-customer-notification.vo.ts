import { Expose } from "class-transformer";
import { IsNotEmpty, IsEmail } from "class-validator";
import { Setting } from "src/setting";
import { MailMessage } from "../mail/mail-message.vo";
import { Mail } from "../mail/mail.vo";
import { OrderId } from "./order-id";
import { Order } from "./order.entity";

export class DeliveryTimeCustomerNotification {
    @Expose()
    @IsNotEmpty()
    readonly orderId: OrderId;
  
    @Expose()
    @IsEmail()
    readonly customerEmail: string;
  
    @Expose()
    @IsNotEmpty()
    readonly deliveryTime: Date;
  
    constructor(orderId: OrderId, customerEmail: string,  deliveryTime: Date) {
      this.orderId = orderId;
      this.deliveryTime = deliveryTime;
      this.customerEmail = customerEmail;
    }

    static from(order: Order) {
        return new DeliveryTimeCustomerNotification(order.getId(), order.getCustomerEmail(), order.deliveryBatch);
      }
  
    getOrderId(){
      return this.orderId;
    }
  
    getMilliSecondsToDelivery() {
      return Math.max(0, +new Date() - +this.deliveryTime - Setting.order.delivery.notificationTimeInMs);
    }
  
    getCustomerMail(): Mail {
      const A_SECOND =  1 *  1000;
      const A_MINUTE =  60 * A_SECOND;
      const AN_HOUR =  60 * A_MINUTE;
      const A_DAY =  24 * AN_HOUR;
    
      const msToDelivery = this.getMilliSecondsToDelivery();
    
      let timeValue: number, timeUnit: string;
    
      const email = this.customerEmail;
      const title = "Order Delivery"
  
      if (msToDelivery >= A_DAY) {
          timeValue = msToDelivery /A_DAY
          timeUnit = "day"
      } else if (msToDelivery >= AN_HOUR) {
          timeValue = msToDelivery /AN_HOUR
          timeUnit = "hour"
      } else if (msToDelivery >= A_MINUTE) {
          timeValue = msToDelivery /A_MINUTE
          timeUnit = "minute"
      } else if (msToDelivery >= A_SECOND) {
          timeValue = msToDelivery /A_SECOND
          timeUnit = "second"
      } else {
         return new Mail(email, new MailMessage(title, "Your order will be delivered very soon."))
      }
      
      if (timeValue >  1) {
        timeUnit += 's';
      }
    
      const body = `Your order will be delivered in ${Math.floor(timeValue)} ${timeUnit}.`;
      return new Mail(email, new MailMessage(title, body));
    }
    
  
    
  }
  