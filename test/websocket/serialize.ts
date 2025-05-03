import { instanceToPlain } from 'class-transformer';
import "reflect-metadata"

export function serialize(value: object) {
  return instanceToPlain(value, {
    exposeDefaultValues: true,
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
  });
}
