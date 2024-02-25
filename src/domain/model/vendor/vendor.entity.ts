import { IsEmail, Length } from 'class-validator';
import { ChildEntity, Column, Entity, PrimaryColumn, TableInheritance } from 'typeorm';
import { Expose } from 'class-transformer';
import { Wallet } from '../wallet';
import { EventSourcedAggegrate } from '../../event-sourced-aggregate';
import { DomainEvent } from '../../domain-event';
import * as bcrypt from 'bcrypt';
import { VendorId } from './vendor-id';
import { idValueTransformer } from 'src/presistence/value-transformers/id.value-transformers';
import { Naira } from '../naira';

@Entity()
export class Vendor extends EventSourcedAggegrate<VendorEvent> {
  @PrimaryColumn({
    type: 'uuid',
    transformer: idValueTransformer(VendorId),
  })
  id: VendorId;

  @IsEmail()
  @Length(1, 127)
  @Column({ type: 'varchar', length: 127, unique: true })
  @Expose()
  email: string;

  @Length(1, 127)
  @Column({ type: 'varchar', length: 127, unique: true })
  hashedPassword: string;

  @Column(() => Wallet)
  wallet: Wallet;

  @Column()
  verified: boolean;

  @Column()
  approved: boolean;

  static async createAccount(email: string, password: string) {
    const vendor = new Vendor();
    await vendor._createAccount(email, password);

    return vendor;
  }

  private async _createAccount(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const id = new VendorId();
    this.add(new VendorAccountCreated(id, this.nextVersion(), email, hashedPassword));
  }

  public verify() {}

  public approve() {}

  public creditWallet() {}
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

  public applyTo(entity: Vendor): void {
    entity.id = this.aggregateId;
    entity.version = this.version;
    entity.email = this.email;
    entity.hashedPassword = this.hashedPassword;
    entity.wallet = new Wallet(new Naira(0));
    entity.approved = false;
    entity.verified = false;
  }
}
