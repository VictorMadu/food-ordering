import { IsEmail } from 'class-validator';

export class Customer {
  @IsEmail()
  readonly email: string;

  constructor(email: string) {
    this.email = email;
  }

  public getEmail(): string {
    return this.email;
  }
}
