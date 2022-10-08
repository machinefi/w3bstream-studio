/**
 * This file contains the root router of your tRPC-backend
 */
import { t } from '../trpc';
import { templateRouter } from './template';
import { w3bstreamRouter } from './w3bstream';

/**
 * Create your application's root router
 * If you want to use SSG, you need export this
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */
export const appRouter = t.router({
  dev: templateRouter,
  api: w3bstreamRouter
});
/**
 * Add data transformers
 * @link https://trpc.io/docs/data-transformers
 */

export type AppRouter = typeof appRouter;
