import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SuperAdmin } from 'src/domain/model/super-admin/super-admin.entity';
import { SuperAdminRepository } from 'src/presistence/repository/super-admin.repository';
import { Account, AccountVerification, Email } from './common/request.dto';
import { VerificationRepository } from 'src/presistence/repository/verification.repository';
import { Verification } from 'src/domain/model/verification/verification.entity';
import { VerificationType } from 'src/domain/model/verification/verification-type';
import { AuthenticationService } from 'src/domain/model/auth/authentication.service';
import { JwtToken } from 'src/domain/model/auth/jwt-token.vo';

@ApiTags('Super Admin')
@Controller('api/super-admin')
export class SuperAdminController {
  constructor(
    private adminRepository: SuperAdminRepository,
    private verificationRepository: VerificationRepository,
    private authenticationService: AuthenticationService,
  ) {}

  @Post('account/registration')
  async register(@Body() body: Account): Promise<void> {
    const admin = new SuperAdmin();

    await admin.createAccount(body.email, body.password);
    await this.adminRepository.save(admin);
  }

  @Post('account/verification/initialize')
  async initializeAccountVerification(@Body() emailVerification: Email): Promise<void> {
    const verification = new Verification();
    await verification.initialize(emailVerification.email, VerificationType.ADMIN_ACCOUNT);
    await this.verificationRepository.save(verification);
  }

  @Post('account/verification')
  async verifyAccount(@Body() otp: AccountVerification): Promise<JwtToken> {
    const verification =
      await this.verificationRepository.findLatestByEmailAndVerificationTypeOrFail(
        otp.email,
        VerificationType.ADMIN_ACCOUNT,
      );

    await verification.complete(otp.otp);
    await this.verificationRepository.save(verification);

    const superAdmin = await this.adminRepository.findByEmailOrFail(otp.email);
    return this.authenticationService.generateJwtTokenFromAdminId(superAdmin.id);
  }
}

// curl -s http://localhost:8080/docs-yaml --output sdk2/api.yaml
// $ docker run --rm   -v ${PWD}/sdk2:/local openapitools/openapi-generator-cli generate   -i /local/api.yaml   -g go   -o /local/out/go --skip-validate-spec
