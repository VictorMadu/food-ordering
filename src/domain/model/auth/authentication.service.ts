import { Injectable } from '@nestjs/common';
import { JwtToken } from './jwt-token.vo';
import { SuperAdminId } from '../super-admin/super-admin-id';
import { VendorId } from '../vendor/vendor-id';
import * as jwt from 'jsonwebtoken';
import { Setting } from 'src/setting';

@Injectable()
export class AuthenticationService {
  public generateJwtTokenFromAdminId(id: SuperAdminId): JwtToken {
    const data = { id: id.toString(), userType: UserType.SUPER_ADMIN };
    const expiryTime = AuthenticationService.expiryTimeFrom(new Date());
    const exp = Math.floor(+expiryTime / 1000);

    const jwtToken = jwt.sign({ data, exp }, Setting.auth.jwt.secretKey);
    return JwtToken.from(jwtToken, expiryTime);
  }

  public generateJwtTokenFromVendorId(id: VendorId): JwtToken {
    const data = { id: id.toString(), userType: UserType.VENDOR };
    const expiryTime = AuthenticationService.expiryTimeFrom(new Date());
    const exp = Math.floor(+expiryTime / 1000);

    const jwtToken = jwt.sign({ data, exp }, Setting.auth.jwt.secretKey);
    return JwtToken.from(jwtToken, expiryTime);
  }

  public extractAdminId(jwtToken: string): SuperAdminId {
    const { data } = jwt.verify(jwtToken, Setting.auth.jwt.secretKey);
    if (data.userType === UserType.SUPER_ADMIN) {
      return SuperAdminId.fromString(SuperAdminId, data.id);
    } else {
      throw new Error();
    }
  }

  public extractVendorId(jwtToken: string): VendorId {
    const { data } = jwt.verify(jwtToken, Setting.auth.jwt.secretKey);
    if (data.userType === UserType.VENDOR) {
      return VendorId.fromString(VendorId, data.id);
    } else {
      throw new Error();
    }
  }

  public static expiryTimeFrom(time: Date): Date {
    return new Date(time.getTime() + Setting.auth.jwt.durationInSeconds * 1000);
  }
}

enum UserType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
}
