/**
 * This file contains the root router of your tRPC-backend
 */
import { t } from '../trpc';
import { w3bstreamRouter } from './w3bstream';

import '@/lib/superjson';
import { z } from 'zod';
import { webhookRouter } from './webhook';
import { pgRouter } from './pg';

/**
 * Create your application's root router
 * If you want to use SSG, you need export this
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */
export const appRouter = t.router({
  api: w3bstreamRouter,
  webhook: webhookRouter,
  pg: pgRouter
});
/**
 * Add data transformers
 * @link https://trpc.io/docs/data-transformers
 */
export type AppRouter = typeof appRouter;
