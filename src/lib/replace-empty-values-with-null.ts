export function replaceEmptyValuesWithNull(obj: any): void {
  if (typeof obj !== 'object' || obj === null) return;

  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (obj[key] === null || obj[key] === undefined) {
      obj[key] = null;
    } else if (typeof obj[key] === 'object') {
      replaceEmptyValuesWithNull(obj[key]);

      const values = Object.values(obj[key]);
      if (values.length > 0 && values.every((v) => v === null || v === undefined)) {
        obj[key] = null;
      }
    }
  }
}
