import { validateSync } from 'class-validator';
import { DomainException } from 'src/domain/exception/domain.exception';

export function validate(obj: unknown) {
  const errors = validateSync(obj as object);

  if (errors.length > 0) {
    throw new DomainException('VALIDATION_ERROR')
  }
}


export function validateDefined(obj: unknown) {
  const errors = validateSync(obj as object, {skipUndefinedProperties: true});

  if (errors.length > 0) {
    throw new DomainException('VALIDATION_ERROR')
  }
}
