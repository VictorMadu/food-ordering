import { validate } from 'class-validator';
import { DomainException } from 'src/domain/exception/domain.exception';

export async function validateAsync(obj: unknown) {
  const errors = await validate(obj as object);

  if (errors.length > 0) {
    throw new DomainException('VALIDATION_ERROR');
  }
}
