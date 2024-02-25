import { Injectable } from '@nestjs/common';
import dataSource from '../datasource';
import { Verification } from 'src/domain/model/verification/verification.entity';
import { VerificationType } from 'src/domain/model/verification/verification-type';

@Injectable()
export class VerificationRepository {
  private readonly r = dataSource.manager.getRepository(Verification);

  public async save(entity: Verification) {
    await this.r.save(entity);
  }

  public async findLatestByEmailAndVerificationTypeOrFail(
    email: string,
    verificationType: VerificationType,
  ) {
    return this.r.findOneOrFail({
      where: {
        email: email,
        verificationType: verificationType,
      },
      order: {
        timeOutAfter: 'DESC',
      },
    });
  }
}
