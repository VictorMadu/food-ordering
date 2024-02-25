import { Module } from '@nestjs/common';
import { AuthenticationService } from './model/auth/authentication.service';

@Module({
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class DomainModule {}
