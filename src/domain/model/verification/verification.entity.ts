import { ChildEntity, Column, Entity, PrimaryColumn, TableInheritance } from 'typeorm';
import { VerificationId } from './verification-id';
import { idValueTransformer } from 'src/presistence/value-transformers/id.value-transformers';
import { EventSourcedAggegrate } from '../../event-sourced-aggregate';
import { DomainEvent } from '../../domain-event';
import { VerificationType } from './verification-type';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Env, Setting } from 'src/setting';
import { Expose } from 'class-transformer';
import { IsEmail, Length } from 'class-validator';

// TODO: Clean stale Verification and respective events
// A verification is stale if timeOutAfter exceeded or there is duplicate (same email and verificationType) which was created earlier

@Entity()
export class Verification extends EventSourcedAggegrate<VerificationEvent> {
  @PrimaryColumn({
    type: 'uuid',
    transformer: idValueTransformer(VerificationId),
  })
  readonly id: VerificationId = new VerificationId();

  @Column()
  hashedOtp: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  @IsEmail()
  @Length(1, 255)
  email: string;

  @Column()
  verificationType: VerificationType;

  @Column({ type: 'timestamptz' })
  timeOutAfter: Date;

  @Column()
  verified: boolean;

  public async initialize(email: string, verificationType: VerificationType): Promise<string> {
    const otp =
      Setting.env === Env.DEVELOPMENT && Setting.verification.testOtp != null
        ? Setting.verification.testOtp
        : parseInt(crypto.randomBytes(3).toString('hex'), 16).toString().substring(0, 6);

    const hashedOtp = await bcrypt.hash(otp, 10);

    this.add(
      new VerificationInitialized(this.id, this.nextVersion(), email, hashedOtp, verificationType),
    );

    return otp;
  }

  public async complete(otp: string) {
    if (await bcrypt.compare(otp, this.hashedOtp)) {
      this.add(new VerificationCompleted(this.id, this.nextVersion()));
    } else {
      throw new Error();
    }
  }

  public static expiryTimeFrom(time: Date): Date {
    return new Date(time.getTime() + Setting.verification.durationInSeconds * 1000);
  }
}

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class VerificationEvent extends DomainEvent<Verification> {
  @Column({
    type: 'uuid',
    transformer: idValueTransformer(VerificationId),
  })
  readonly aggregateId: VerificationId;

  constructor(aggregateId: VerificationId, version: number) {
    super(version);
    this.aggregateId = aggregateId;
  }
}

@ChildEntity()
export class VerificationInitialized extends VerificationEvent {
  @Expose()
  hashedOtp: string;

  @Expose()
  email: string;

  @Expose()
  verificationType: VerificationType;

  @Expose()
  expiryTime: Date;

  public constructor(
    id: VerificationId,
    version: number,
    email: string,
    hashedOtp: string,
    verificationType: VerificationType,
  ) {
    super(id, version);

    this.hashedOtp = hashedOtp;
    this.email = email;
    this.verificationType = verificationType;
  }

  public applyTo(entity: Verification): void {
    entity.hashedOtp = this.hashedOtp;
    entity.email = this.email;
    entity.verificationType = this.verificationType;
    entity.timeOutAfter = Verification.expiryTimeFrom(this.occurredAt);
    entity.verified = false;
    entity.version = this.version;
  }
}

@ChildEntity()
export class VerificationCompleted extends VerificationEvent {
  public constructor(id: VerificationId, version: number) {
    super(id, version);
  }

  public applyTo(entity: Verification): void {
    entity.verified = true;
    entity.version = this.version;
  }
}
