import { Injectable } from '@nestjs/common';
import { SuperAdmin } from 'src/domain/model/user/super-admin.entity';
import { SuperAdminId } from 'src/domain/model/user/super-admin-id';
import { OptionalAsync } from 'src/lib/optional';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class SuperAdminRepository {
  private readonly r: Repository<SuperAdmin>;

  constructor(manager: EntityManager) {
    this.r = manager.getRepository(SuperAdmin);
  }

  public async save(entity: SuperAdmin) {
    await this.r.save(entity);
  }

  public findByEmail(email: string): OptionalAsync<SuperAdmin> {
    return OptionalAsync.of(
      this.r.findOne({
        where: { email },
      }),
    );
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

  public async isVerified(id: SuperAdminId): Promise<boolean> {
    const total = await this.r.count({
      where: {
        id: id.toString(),
        verified: true,
      },
      take: 1,
    });

    return total > 0;
  }
}
