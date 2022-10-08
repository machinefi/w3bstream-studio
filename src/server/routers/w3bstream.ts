import { t } from '../trpc';
import { z } from 'zod';

export const w3bstreamRouter = t.router({
  projects: t.procedure
    .input(
      z.object({
        accountID: z.string()
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.t_project.findMany({
        where: { f_account_id: input.accountID },
        select: {
          f_project_id: true,
          f_name: true,
          f_version: true,
          applets: {
            select: {
              f_name: true,
              f_applet_id: true,
              f_project_id: true,
              instances: {
                select: {
                  f_instance_id: true,
                  f_state: true
                }
              }
            }
          }
        }
      });
    })
});
