import { Expose } from 'class-transformer';
import { Length } from 'class-validator';

export class MailMessage {
  @Expose()
  @Length(0, 1023)
  readonly title: string;

  @Expose()
  @Length(0, 65535)
  readonly body: string;

  constructor(title: string, body: string) {
    this.title = title;
    this.body = body;
  }

  getTitle() {
    return this.title;
  }

  getBody() {
    return this.body;
  }
}
