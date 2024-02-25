import { Module } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { PresistenceModule } from 'src/presistence/presistence.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { LoggingInterceptor } from './common/logging.interceptor';
import { AllExceptionsFilter } from './common/all.exceptions.filter';
import { ValidationPipe } from './common/validation.pipe';
import { VendorController } from './vendor.controller';
import { SuperAdminController } from './super-admin.controller';
import { SettingTestController } from './setting.test.controller';
import { DatabaseTestController } from './database.test.controller';

@Module({
  imports: [PresistenceModule, DomainModule],
  controllers: [
    SuperAdminController,
    VendorController,
    SettingTestController,
    DatabaseTestController,
  ],
  providers: [
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
export class ControllerModule {}
