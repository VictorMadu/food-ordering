import { Module } from '@nestjs/common';
import { AuthenticationService } from './model/auth/authentication.service';
import { PresistenceModule } from 'src/presistence/presistence.module';
import { OrderBillCalculatorService } from './model/order/order-bill-calculator.service';
import { PaymentService } from './model/payment/payment.service';
import { MailService } from './model/mail/mail.service';

@Module({
  imports: [PresistenceModule],
  providers: [AuthenticationService, OrderBillCalculatorService, PaymentService, MailService],
  exports: [AuthenticationService, OrderBillCalculatorService, PaymentService, MailService],
})
export class DomainModule {}
