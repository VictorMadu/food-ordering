export function assign<T extends object>(Clazz: { new (...args: any[]): T }, obj: Partial<T>): T {
  const instance: T = Object.create(Clazz.prototype);
  Object.assign(instance, obj);

  return instance;
}
