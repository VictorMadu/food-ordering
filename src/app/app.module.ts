import { Module, ValidationPipe } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { PresistenceModule } from 'src/presistence/presistence.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { SuperAdminAccountController } from './account/super-admin-account.controller';
import { AllExceptionsFilter } from './all.exceptions.filter';
import { LoggingInterceptor } from './logging.interceptor';
import { VendorAccountController } from './account/vendor-account.controller';
import { DeliveryCustomerNotificationProcessor } from './order/delivery-customer-notification/delivery-customer-notification.processor';
import { OrderDeliveryController } from './order/delivery.controller';
import { OrderingController } from './order/ordering.controller';
import { StoreController } from './store/store.controller';
import { HealthCheckController } from './info/info.controller';


@Module({
  imports: [PresistenceModule, DomainModule],
  controllers: [
    SuperAdminAccountController,
    VendorAccountController,
    OrderingController,
    OrderDeliveryController,
    StoreController,
    HealthCheckController
  ],
  providers: [
    DeliveryCustomerNotificationProcessor,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [],
})
export class AppModule {}
