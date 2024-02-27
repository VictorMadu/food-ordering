import { Injectable } from '@nestjs/common';
import { Naira } from '../naira';
import { Card } from './card.vo';
import { Setting } from 'src/setting';
import { DomainException } from 'src/domain/exception/domain.exception';
import { PaymentId } from './payment-id';
import { sleep } from 'src/lib/sleep';
import { Retry } from 'src/lib/retry';

// TODO: We can create entity to save Payment (successful and failed) later for analysis
@Injectable()
export class PaymentService {
  // Simulate payment with external service like: Stripe, Paypal, Paystack
  @Retry({ maxRetries: Setting.payment.retry.max, delayInMs: Setting.payment.retry.delayInMs })
  async makePayment(email: string, card: Card, amount: Naira): Promise<PaymentId> {
    await sleep(Math.random() * 1500 + 1500); // Simulating the delays in waiting for response after api call

    if (Setting.payment.test.card.successFull.has(card.number) && amount.getValue() > 0) {
      return new PaymentId(email);
    } else {
      throw new DomainException('PAYMENT_FAILED');
    }
  }
}
