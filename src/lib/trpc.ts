// pages/index.tsx
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/routers/_app';
import superjson from 'superjson';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc'
    })
  ],
  transformer: superjson
});
