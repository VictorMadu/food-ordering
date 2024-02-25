import { plainToInstance } from 'class-transformer';

export function deserialize<T>(value: object, Class: { new (...args: any[]): T }): T {
  return plainToInstance(Class, value, {
    exposeDefaultValues: true,
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  });
}
