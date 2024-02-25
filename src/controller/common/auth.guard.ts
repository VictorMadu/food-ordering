import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { SuperAdminId } from 'src/domain/model/super-admin/super-admin-id';
import { AuthenticationService } from 'src/domain/model/auth/authentication.service';
import { VendorId } from 'src/domain/model/vendor/vendor-id';
import { Setting } from 'src/setting';
import { VendorRepository } from 'src/presistence/repository/vendor.repository';
import { SuperAdminRepository } from 'src/presistence/repository/super-admin.repository';

const adminId = Symbol();
const vendorId = Symbol();

@Injectable()
export class VerifiedSuperAdminGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService, private superAdminRepository: SuperAdminRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring('Bearer '.length);
        request[adminId] = this.authenticationService.extractAdminId(token);

        return this.superAdminRepository.isVerified(request[adminId]);
      }

      return false;
    } catch (error) {
      return false;
    }
  }
}


@Injectable()
export class VerifiedVendorGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService, private vendorRepository: VendorRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring('Bearer '.length);
        request[vendorId] = this.authenticationService.extractVendorId(token);

       return this.vendorRepository.isVerified(request[vendorId])
      }

      return false;
    } catch (error) {
      return false;
    }
  }
}


@Injectable()
export class TestPurposeGuard implements CanActivate {
  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (Setting.env === 'production') throw new NotFoundException();
    return true;
  }
}

export const AuthAdminId = createParamDecorator((data: unknown, ctx: ExecutionContext): SuperAdminId => {
  const request = ctx.switchToHttp().getRequest();

  return request[adminId];
});

export const AuthVendorId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): VendorId => {
    const request = ctx.switchToHttp().getRequest();

    return request[vendorId];
  },
);
