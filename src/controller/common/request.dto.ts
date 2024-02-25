import { Expose } from 'class-transformer';

export class Account {
  @Expose()
  email: string;

  @Expose()
  password: string;
}

export class Email {
  @Expose()
  email: string;
}

export class AccountVerification {
  @Expose()
  email: string;

  @Expose()
  otp: string;
}


export class Shop {
  @Expose()
  name: string
}