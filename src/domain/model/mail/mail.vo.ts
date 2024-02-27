import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNotIn, Length } from 'class-validator';
import { MailMessage } from './mail-message.vo';

export class Mail {
  @Expose()
  @Length(0, 511)
  @IsNotIn([null, undefined])
  readonly email: string;

  @Expose()
  @IsNotEmpty()
  readonly message: MailMessage;

  constructor(email: string, message: MailMessage) {
    this.email = email;
    this.message = message;
  }

  getTitle() {
    return this.message.getTitle();
  }

  getBody() {
    return this.message.getBody();
  }
}
