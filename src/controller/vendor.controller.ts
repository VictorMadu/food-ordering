import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as req from './common/request.dto';
import { VendorRepository } from 'src/presistence/repository/vendor.repository';
import { Vendor } from 'src/domain/model/vendor/vendor.entity';
import { VerificationRepository } from 'src/presistence/repository/verification.repository';
import { Verification } from 'src/domain/model/verification/verification.entity';
import { VerificationType } from 'src/domain/model/verification/verification-type';
import { AuthenticationService } from 'src/domain/model/auth/authentication.service';
import { JwtToken } from 'src/domain/model/auth/jwt-token.vo';
import { VerifiedVendorGuard } from './common/auth.guard';

@ApiTags('Vendor')
@Controller('api/vendor')
export class VendorController {
  constructor(
    private vendorRepository: VendorRepository,
    private verificationRepository: VerificationRepository,
    private authenticationService: AuthenticationService,
  ) {}

  @Post('account/registration')
  async register(@Body() body: req.Account): Promise<void> {
    const vendor = await Vendor.createAccount(body.email, body.password);
    await this.vendorRepository.save(vendor);
  }

  @Post('account/verification/initialize')
  async initializeAccountVerification(@Body() emailVerification: req.Email): Promise<void> {
    const verification = new Verification();
    await verification.initialize(emailVerification.email, VerificationType.VENDOR_ACCOUNT);
    await this.verificationRepository.save(verification);
  }

  @Post('account/verification')
  async verifyAccount(@Body() otp: req.AccountVerification): Promise<JwtToken> {
    const verification =
      await this.verificationRepository.findLatestByEmailAndVerificationTypeOrFail(
        otp.email,
        VerificationType.VENDOR_ACCOUNT,
      );

    await verification.complete(otp.otp);
    await this.verificationRepository.save(verification);

    const superAdmin = await this.vendorRepository.findByEmailOrFail(otp.email);
    return this.authenticationService.generateJwtTokenFromAdminId(superAdmin.id);
  }

  @Post('shop')
  @UseGuards(VerifiedVendorGuard)
  async createShop(@Body() shop: req.Shop) {

  }
}
