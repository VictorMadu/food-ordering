import { validateSync } from 'class-validator';

export function validate(obj: unknown) {
  const errors = validateSync(obj as object);

  if (errors.length > 0) {
    throw new Error();
  }
}
