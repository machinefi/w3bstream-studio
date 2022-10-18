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
        where: { f_account_id: Number(input.accountID) },
        select: {
          f_project_id: true,
          f_name: true,

          publishers: {
            select: {
              f_publisher_id: true,
              f_name: true,
              f_key: true,
              f_created_at: true,
              f_token: true
            }
          },
          applets: {
            select: {
              f_name: true,
              f_applet_id: true,
              f_project_id: true,
              // @ts-ignore
              strategies: {
                select: {
                  f_strategy_id: true,
                  f_applet_id: true,
                  f_project_id: true,
                  f_event_type: true,
                  f_handler: true
                }
              },
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
