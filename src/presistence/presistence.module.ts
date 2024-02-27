import { Module } from '@nestjs/common';
import { SuperAdminRepository } from './repository/super-admin.repository';
import { VendorRepository } from './repository/vendor.repository';
import { VerificationRepository } from './repository/verification.repository';
import { EntityManager } from 'typeorm';
import dataSource from './datasource';
import { StoreRepository } from './repository/store.repository';
import { FoodCookingSpaceRepository } from './repository/food-cooking-space.repository';
import { OrderRepository } from './repository/order.repository';

@Module({
  imports: [],
  providers: [
    {
      provide: EntityManager,
      useValue: dataSource.manager,
    },
    SuperAdminRepository,
    VendorRepository,
    VerificationRepository,
    FoodCookingSpaceRepository,
    OrderRepository,
    StoreRepository
  ],
  exports: [
    SuperAdminRepository,
    VendorRepository,
    VerificationRepository,
    FoodCookingSpaceRepository,
    OrderRepository,
    StoreRepository,
  ],
})
export class PresistenceModule {}
