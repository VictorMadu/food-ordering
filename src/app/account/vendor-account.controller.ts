import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as req from '../request.dto';
import { VendorRepository } from 'src/presistence/repository/vendor.repository';
import { AuthenticationService } from 'src/domain/model/auth/authentication.service';
import { JwtToken } from 'src/domain/model/auth/jwt-token.vo';
import { DomainException } from 'src/domain/exception/domain.exception';
import { Vendor } from 'src/domain/model/user/vendor.entity';
import { VerificationRepository } from 'src/presistence/repository/verification.repository';
import { VerificationType } from 'src/domain/model/verification/verification-type';
import { Verification } from 'src/domain/model/verification/verification.entity';

@ApiTags('Vendor Account')
@Controller('api/account/vendor')
export class VendorAccountController {
  constructor(
    private authenticationService: AuthenticationService,
    private vendorRepository: VendorRepository,
    private verificationRepository: VerificationRepository,
  ) {}

  @Post('register')
  async register(@Body() body: req.Account): Promise<void> {
    const vendor = new Vendor();

    await vendor.createAccount(body.email, body.password);
    await this.vendorRepository.save(vendor);
  }

  @Post('verification/initialize')
  async initializeForSuperAdmin(@Body() body: req.VerificationInitialization): Promise<void> {
    const existsAndUnVerified = await this.vendorRepository.existsAndUnVerifiedByEmail(body.email);

    if (existsAndUnVerified) {
      const verification = new Verification();
      await verification.initialize(body.email, VerificationType.VENDOR);
      await this.verificationRepository.save(verification);
    } else {
      throw new DomainException('NOT_UNVERIFIED');
    }
  }

  @Post("verification/verify")
  async verifyAccount(@Body() body: req.AccountVerification): Promise<JwtToken> {
    const verification = await this.verificationRepository
      .findLatestByEmailAndVerificationTypeOrFail(body.email, VerificationType.VENDOR)
      .get();

    await verification.complete(body.otp);
    await this.verificationRepository.save(verification);

    const vendor = await this.vendorRepository.findByEmail(body.email).get();
    return this.authenticationService.generateJwtTokenFromVendorId(vendor.getId());
  }

  @Post('login')
  async login(@Body() body: req.Account): Promise<JwtToken> {
    const vendor = await this.vendorRepository
      .findByEmail(body.email)
      .orThrow(new DomainException('WRONG_LOGIN'));

    if ((await vendor.isPassword(body.password)) && vendor.isVerified()) {
      return this.authenticationService.generateJwtTokenFromAdminId(vendor.id);
    } else {
      throw new DomainException('WRONG_LOGIN');
    }
  }


}
