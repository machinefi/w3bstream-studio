// pages/index.tsx
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/routers/_app';
import superjson from 'superjson';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers() {
        return {
          authorization: globalThis.store.w3s.config.form.formData.token ? `Bearer ${globalThis.store.w3s.config.form.formData.token}` : undefined
        };
      }
    })
  ],
  transformer: superjson
});
