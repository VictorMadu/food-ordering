import { Body, Controller, Post,UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SuperAdmin } from 'src/domain/model/user/super-admin.entity';
import { SuperAdminRepository } from 'src/presistence/repository/super-admin.repository';
import * as req from '../request.dto';
import { AuthenticationService } from 'src/domain/model/auth/authentication.service';
import { JwtToken } from 'src/domain/model/auth/jwt-token.vo';
import { DomainException } from 'src/domain/exception/domain.exception';
import { Verification } from 'src/domain/model/verification/verification.entity';
import { VerificationType } from 'src/domain/model/verification/verification-type';
import { VerificationRepository } from 'src/presistence/repository/verification.repository';

@ApiTags('Super Admin Account')
@Controller('api/account/super-admin')
export class SuperAdminAccountController {
  constructor(
    private authenticationService: AuthenticationService,
    private superAdminRepository: SuperAdminRepository,
    private verificationRepository: VerificationRepository,
  ) {}

  @Post('register')
  async register(@Body() body: req.Account): Promise<void> {
    const admin = new SuperAdmin();

    await admin.createAccount(body.email, body.password);
    await this.superAdminRepository.save(admin);
  }

  @Post('verification/initialize')
  async initializeForSuperAdmin(@Body() body: req.VerificationInitialization): Promise<void> {
    const existsAndUnVerified = await this.superAdminRepository.existsAndUnVerifiedByEmail(body.email);

    if (existsAndUnVerified) {
      const verification = new Verification();
      await verification.initialize(body.email, VerificationType.ADMIN);
      await this.verificationRepository.save(verification);
    } else {
      throw new DomainException('NOT_UNVERIFIED');
    }
  }

  @Post("verification/verify")
  async verifyAccount(@Body() body: req.AccountVerification): Promise<JwtToken> {
    const verification = await this.verificationRepository
      .findLatestByEmailAndVerificationTypeOrFail(body.email, VerificationType.ADMIN)
      .get();

    await verification.complete(body.otp);
    await this.verificationRepository.save(verification);

    const admin = await this.superAdminRepository.findByEmail(body.email).get();
    return this.authenticationService.generateJwtTokenFromAdminId(admin.id);
  }

  @Post('login')
  async login(@Body() body: req.Account): Promise<JwtToken> {
    const superAdmin = await this.superAdminRepository
      .findByEmail(body.email)
      .orThrow(new DomainException('WRONG_LOGIN'));

    if ((await superAdmin.isPassword(body.password)) && superAdmin.isVerified()) {
      return this.authenticationService.generateJwtTokenFromAdminId(superAdmin.id);
    } else {
      throw new DomainException('WRONG_LOGIN');
    }
  }
}
