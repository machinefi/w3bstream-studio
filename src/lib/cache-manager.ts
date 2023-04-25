import { caching } from 'cache-manager';

export const memoryCache = await caching('memory', {
  max: 100,
  ttl: 60 * 1000
});
