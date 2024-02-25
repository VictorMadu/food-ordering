import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';
import { SuperAdminId } from './super-admin-id';
import { StateBasedAggregate } from '../../state-based-aggregate';
import { idValueTransformer } from 'src/presistence/value-transformers/id.value-transformers';
import { Length } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { Setting } from 'src/setting';

@Entity()
@Unique(["email", "verified"])
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

  @Column()
  verified: boolean

  async createAccount(email: string, password: string) {
    if (email === Setting.superAdmin.email) {
      this.email = email;
      this.hashedPassword = await bcrypt.hash(password, 12);
      this.verified = false;
    } else {
      throw new Error();
    }
  }

  verify() {
    if (this.verified) {
      throw new Error()
    } else {
      this.verified = true
    }
  }
}
