import { sleep } from './sleep';

export function Retry(options: { maxRetries: number; delayInMs: number }) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let retries = options.maxRetries;
      let lastError: unknown;

      while (retries > 0) {
        try {
          const result = await originalMethod.apply(this, args);
          return result;
        } catch (error) {
          lastError = error;
          retries--;
          await sleep(options.delayInMs);
        }
      }

      throw lastError;
    };

    return descriptor;
  };
}
