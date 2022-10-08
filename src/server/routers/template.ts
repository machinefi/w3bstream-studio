import { t } from '../trpc';
import { z } from 'zod';

export const templateRouter = t.router({
  hello: t.procedure
    .input(
      z.object({
        text: z.string()
      })
    )
    .query(({ ctx, input }) => {
      return input.text;
    })
});
