import { Column } from 'typeorm';
import { Naira } from './naira';

export class Wallet {
  @Column(() => Naira)
  balance: Naira;

  constructor(balance: Naira) {
    this.balance = balance;
  }
}
