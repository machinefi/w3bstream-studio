import { t } from '../trpc';
import { inferProcedureOutput, TRPCError } from '@trpc/server';
import { z } from 'zod';
import Axios from 'axios';

export const webhookRouter = t.router({
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
        path: '/webhook/{id}'
      }
    })
    .input(
      z.object({
        id: z.string()
      })
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const path = ctx.req.query.trpc[ctx.req.query.trpc.length - 1];
      await Axios.request({
        method: 'POST',
        url: `${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/event/${path}`,
        headers: {
          'Content-Type': 'text/plain'
        },
        data: {
          events: [{ header: { event_type: 'ANY', pub_id: '', token: '', pub_time: Date.now() }, payload: btoa(JSON.stringify(ctx.req.body)) }]
        }
      });

      return { ok: true };
    })
});
