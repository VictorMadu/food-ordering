import { IsCreditCard, Length } from 'class-validator';

export class Card {
  @IsCreditCard()
  number: string;

  @Length(3, 4)
  cvv: string;

  @Length(2, 2)
  expiryYear: string;

  @Length(2, 2)
  expiryMonth: string;

  public hasExpired() {
    const now = new Date();
    const month = +this.expiryMonth - 1;
    const year = now.getUTCFullYear().toString().slice(0, 2) + this.expiryYear;
    const expiryTime = new Date(Date.UTC(+year, +month));

    return expiryTime > now;
  }
}
