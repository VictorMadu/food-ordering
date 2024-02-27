import { Injectable } from '@nestjs/common';
import { Verification } from 'src/domain/model/verification/verification.entity';
import { VerificationType } from 'src/domain/model/verification/verification-type';
import { Repository, EntityManager } from 'typeorm';
import { VerificationId } from 'src/domain/model/verification/verification-id';
import { OptionalAsync } from 'src/lib/optional';

@Injectable()
export class VerificationRepository {
  private readonly r: Repository<Verification>;

  constructor(manager: EntityManager) {
    this.r = manager.getRepository(Verification);
  }

  public async save(entity: Verification) {
    await this.r.save(entity);
  }

  public findById(id: VerificationId): OptionalAsync<Verification> {
    return OptionalAsync.of(
      this.r.findOne({
        where: { id: id.toString() },
      }),
    );
  }

  public findLatestByEmailAndVerificationTypeOrFail(
    email: string,
    verificationType: VerificationType,
  ): OptionalAsync<Verification> {
    return OptionalAsync.of(
      this.r.findOne({
        where: {
          email: email,
          verificationType: verificationType,
        },
        order: {
          timeOutAfter: 'DESC',
        },
      }),
    );
  }
}
