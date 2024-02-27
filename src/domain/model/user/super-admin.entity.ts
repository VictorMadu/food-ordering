import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';
import { SuperAdminId } from './super-admin-id';
import { StateBasedAggregate } from '../../state-based-aggregate';
import { idValueTransformer } from 'src/presistence/value-transformers/id.value-transformers';
import { Length } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { Setting } from 'src/setting';
import { DomainException } from 'src/domain/exception/domain.exception';
import { Naira } from '../naira';

@Entity()
@Unique(['email', 'verified'])
export class SuperAdmin extends StateBasedAggregate {
 
  @PrimaryColumn({
    type: 'uuid',
    transformer: idValueTransformer(SuperAdminId),
  })
  readonly id: SuperAdminId = new SuperAdminId();

  @Length(1, 127)
  @Column({ type: 'varchar', length: 127 })
  email: string;

  @Length(1, 127)
  @Column({ type: 'varchar', length: 127 })
  hashedPassword: string;

  @Column(() => Naira)
  earningBalance: Naira;

  @Column()
  verified: boolean;

  async createAccount(email: string, password: string): Promise<void> {
    if (email === Setting.superAdmin.email) {
      this.email = email;
      this.hashedPassword = await bcrypt.hash(password, 12);
      this.verified = false;
    } else {
      throw new DomainException('NOT_SUPER_ADMIN');
    }
  }

  verify(): void {
    if (this.verified) {
      throw new DomainException('ALREADY_VERIFIED');
    } else {
      this.verified = true;
    }
  }

  credit(amount: Naira) {
    this.earningBalance = this.earningBalance.add(amount)
}

  isVerified(): boolean {
    return this.verified;
  }

  isPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.hashedPassword);
  }
}
