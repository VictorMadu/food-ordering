import { Injectable } from '@nestjs/common';
import dataSource from '../datasource';
import { SuperAdmin } from 'src/domain/model/super-admin/super-admin.entity';
import { SuperAdminId } from 'src/domain/model/super-admin/super-admin-id';

@Injectable()
export class SuperAdminRepository {
  private readonly r = dataSource.manager.getRepository(SuperAdmin);

  public async save(entity: SuperAdmin) {
    await this.r.save(entity);
  }

  public async findByEmailOrFail(email: string) {
    return this.r.findOneOrFail({
      where: { email },
    });
  }

  public async isVerified(id: SuperAdminId): Promise<boolean> {
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
