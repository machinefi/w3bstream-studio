// pages/index.tsx
import { createTRPCClient } from '@trpc/client';
import { AppRouter } from '../server/routers/_app';
import superjson from 'superjson';

export const trpc = createTRPCClient<AppRouter>({
  url: '/api/trpc',
  transformer: superjson
});
