import { instanceToPlain } from 'class-transformer';

export function serialize(value: object) {
  return instanceToPlain(value, {
    exposeDefaultValues: true,
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  });
}
