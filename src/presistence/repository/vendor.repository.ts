import { Injectable } from '@nestjs/common';
import { Vendor } from 'src/domain/model/vendor/vendor.entity';
import dataSource from '../datasource';
import { VendorId } from 'src/domain/model/vendor/vendor-id';

// TODO: Add Redis in each Repository
@Injectable()
export class VendorRepository {

  private readonly r = dataSource.manager.getRepository(Vendor);

  public async save(entity: Vendor) {
    await this.r.save(entity);
  }

  public async findByEmailOrFail(email: string) {
    return this.r.findOneOrFail({
      where: { email },
    });
  }

  public async isVerified(id: VendorId): Promise<boolean> {
    const total = await this.r.count({
      where: {
        id: id.toString(),
        verified: true
      },
      take: 1
    })

    return total > 0;
  }
}
