import { Id } from 'src/domain/id';

export function idValueTransformer<T extends { new (value: string | null): Id }>(ClassId: T) {
  return {
    to(value: T | null): string | null {
      if (value == null) return null;
      return value.toString();
    },
    from(value: string | null) {
      if (value == null) return null;
      return new ClassId(value);
    },
  };
}
