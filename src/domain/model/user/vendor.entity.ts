import { IsEmail, Length } from 'class-validator';
import { ChildEntity, Column, Entity, PrimaryColumn, TableInheritance } from 'typeorm';
import { Expose } from 'class-transformer';
import { EventSourcedAggegrate } from '../../event-sourced-aggregate';
import { DomainEvent } from '../../domain-event';
import * as bcrypt from 'bcrypt';
import { VendorId } from './vendor-id';
import { idValueTransformer } from 'src/presistence/value-transformers/id.value-transformers';
import { Naira } from '../naira';
import { DomainException } from 'src/domain/exception/domain.exception';
import { Id } from 'src/domain/id';

@Entity()
export class Vendor extends EventSourcedAggegrate<VendorId, VendorEvent> {
  @PrimaryColumn({
    type: 'uuid',
    transformer: idValueTransformer(VendorId),
  })
  readonly id: VendorId = new VendorId();

  @IsEmail()
  @Length(1, 127)
  @Column({ type: 'varchar', length: 127, unique: true })
  @Expose()
  email: string;

  @Length(1, 127)
  @Column({ type: 'varchar', length: 127, unique: true })
  hashedPassword: string;

  @Column(() => Naira)
  earningBalance: Naira;

  @Column()
  verified: boolean;

  async createAccount(email: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 12);
    this.add(new VendorAccountCreated(this.id, this.nextVersion(), email, hashedPassword));
  }

  public verify(): void {
    if (this.verified) {
      throw new DomainException('ALREADY_VERIFIED');
    } else {
      this.add(new VendorVerified(this.id, this.nextVersion()));
      this.verified = true;
    }
  }

  public credit(amount: Naira) {
    this.add(new VendorCredited(this.id, this.nextVersion(), amount))
  }

  public getId(): VendorId {
    return this.id;
  }

  public isVerified(): boolean {
    return this.verified;
  }

  public isPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.hashedPassword);
  }
}

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class VendorEvent extends DomainEvent<Vendor> {
  @Column({
    type: 'uuid',
    transformer: idValueTransformer(VendorId),
  })
  readonly aggregateId: VendorId;

  constructor(aggregateId: VendorId, version: number) {
    super(version);
    this.aggregateId = aggregateId;
  }

  public getAggregateId() {
    return this.aggregateId;
  }
}

@ChildEntity()
export class VendorAccountCreated extends VendorEvent {
  @Expose()
  readonly email: string;

  @Expose()
  readonly hashedPassword: string;

  public constructor(id: VendorId, version: number, email: string, hashedPassword: string) {
    super(id, version);

    this.email = email;
    this.hashedPassword = hashedPassword;
  }

  protected _applyTo(entity: Vendor): void {
    entity.email = this.email;
    entity.hashedPassword = this.hashedPassword;
    entity.earningBalance = new Naira(0);
    entity.verified = false;
  }
}

@ChildEntity()
export class VendorVerified extends VendorEvent {
  public constructor(id: VendorId, version: number) {
    super(id, version);
  }

  protected _applyTo(entity: Vendor): void {
    entity.verified = true;
  }
}

@ChildEntity()
export class VendorCredited extends VendorEvent {
  @Expose()
  readonly amount: Naira;

  public constructor(id: VendorId, version: number, amount: Naira) {
    super(id, version);
  }

  protected _applyTo(entity: Vendor): void {
    entity.verified = true;
    entity.earningBalance = entity.earningBalance.add(this.amount)
  }
}
