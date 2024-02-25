import { Expose } from 'class-transformer';
import { assign } from 'src/lib/assign';

export class JwtToken {
  @Expose()
  token: string;

  @Expose()
  expiryTime: Date;

  static from(token: string, expiryTime: Date): JwtToken {
    return assign(JwtToken, { token, expiryTime });
  }
}
