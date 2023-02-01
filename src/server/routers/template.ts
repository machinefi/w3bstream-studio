import { t } from '../trpc';
import { inferProcedureOutput, TRPCError } from '@trpc/server';
import { z } from 'zod';

export const templateRouter = t.router({
  test: t.procedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/test'
      }
    })
    .input(z.object({}))
    .output(z.any())
    .query(async ({ ctx }) => {
      return 'Hello, world!';
    }),
  test_with_auth: t.procedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/test_with_auth',
        protect: true
      }
    })
    .input(
      z.object({
        id: z.number()
      })
    )
    .output(z.any())
    .mutation(async ({ ctx }) => {
      // if (!ctx.user) {
      //   throw new TRPCError({ code: 'UNAUTHORIZED' });
      // }
      return 'Hello, world!';
    })
});
