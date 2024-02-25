import { Id } from 'src/domain/id';

export function idValueTransformer<T extends { new (): Id }>(ClassId: T) {
  return {
    to(value: T | null): string | null {
      if (value == null) return null;
      return value.toString();
    },
    from(value: string | null) {
      if (value == null) return null;
      return Id.fromString(ClassId, value);
    },
  };
}
