import { Injectable } from '@nestjs/common';
import { VendorId } from 'src/domain/model/user/vendor-id';
import { Vendor } from 'src/domain/model/user/vendor.entity';
import { OptionalAsync } from 'src/lib/optional';
import { EntityManager, Repository } from 'typeorm';
import getCache from '../cache';

// TODO: Add Redis in each Repository

@Injectable()
export class VendorRepository {
  private readonly r: Repository<Vendor>;
  private cache = getCache();

  constructor(manager: EntityManager) {
    this.r = manager.getRepository(Vendor);
  }

  public async save(entity: Vendor) {
    await this.r.save(entity);
  }

  public findByEmail(email: string): OptionalAsync<Vendor> {
    return OptionalAsync.of(
      this.r.findOne({
        where: { email },
      }),
    );
  }

  public findById(id: VendorId): OptionalAsync<Vendor> {
    return OptionalAsync.of(
      this.r.findOne({
        where: { id: id.toString() },
      }),
    );
  }

  public async isVerified(id: VendorId): Promise<boolean> {
    const total = await this.r.count({
      where: {
        id: id.toString(),
        verified: true,
      },
      take: 1,
    });

    return total > 0;
  }

  public async existsAndUnVerifiedByEmail(email: string): Promise<boolean> {
    const total = await this.r.count({
      where: {
        email,
        verified: false,
      },
      take: 1,
    });

    return total > 0;
  }
}
