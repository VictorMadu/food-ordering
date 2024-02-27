import * as redis from "redis";
import { Setting } from "src/setting";


const cache: any = redis.createClient({
  url: `redis://${Setting.redis.userName}:${Setting.redis.password}@${Setting.redis.host}:${Setting.redis.port}`,
});
cache.connect()

cache.on('connect', () => {
  console.log('Connected to Redis server');
});

cache.on('error', (err: unknown) => {
  console.log('Error' + err);
});

export type Cache = ReturnType<typeof redis.createClient>

export default function getCache(): Cache {
  return cache;
}


// function Cache(timeout, lruStrategy) {
//     return function (target, propertyKey, descriptor) {
//       const originalMethod = descriptor.value;
//       descriptor.value = async function (...args) {
//         const cacheKey = `${propertyKey}_${JSON.stringify(args)}`;
//         const cachedValue = await client.get(cacheKey);
//         if (cachedValue) {
//           return JSON.parse(cachedValue);
//         }
//         const result = await originalMethod.apply(this, args);
//         await client.setex(cacheKey, timeout, JSON.stringify(result));
//         return result;
//       };
//       return descriptor;
//     };
//   }
  