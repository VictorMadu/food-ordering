import { Column } from 'typeorm';
import * as uuid from 'uuid';

const c = Symbol()

export class PaymentId {
  [c] = "c"
  
  @Column({ type: 'varchar', length: 511, nullable: true })
  readonly value: string;

  constructor(email: string) {
    this.value = email + '_' + uuid.v4();
  }
}
