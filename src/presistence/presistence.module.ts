import { Module } from '@nestjs/common';
import { SuperAdminRepository } from './repository/super-admin.repository';
import { VendorRepository } from './repository/vendor.repository';
import { VerificationRepository } from './repository/verification.repository';

@Module({
  imports: [],
  providers: [SuperAdminRepository, VendorRepository, VerificationRepository],
  exports: [SuperAdminRepository, VendorRepository, VerificationRepository],
})
export class PresistenceModule {}
