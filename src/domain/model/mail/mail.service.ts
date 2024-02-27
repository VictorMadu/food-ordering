import { Injectable } from '@nestjs/common';
import { Mail } from './mail.vo';
import { sleep } from 'src/lib/sleep';
import { Setting } from 'src/setting';
import { validateAsync } from 'src/lib/validiate-async';

@Injectable()
export class MailService {
  // Simulate sending batch emails
  async sendBatchMail(mails: Mail[]) {
    for (let i = 0; i < mails.length; i++) {
        await this.sendMail(mails[i])
    }
  }

  async sendMail(mail: Mail) {
      await validateAsync(mail);

    await sleep(Math.random() * 1500 + 1500); // Simulate delays during api calls
    console.log(
        'From: ' +
          Setting.superAdmin.email +
          '\n' +
          'To: ' +
          mail.email +
          '\n' +
          'Title: ' +
          mail.getTitle() +
          '\n' +
          'Body: ' +
          mail.getBody() +
          '\n\n',
      );
  }
}
