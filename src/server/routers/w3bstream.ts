import { t } from '../trpc';
import { z } from 'zod';
import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server';

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
    }),
  contractLogs: t.procedure.query(({ ctx, input }) => {
    return ctx.monitor.t_contractlog.findMany({
      select: {
        f_contractlog_id: true,
        f_project_name: true,
        f_event_type: true,
        f_chain_id: true,
        f_contract_address: true,
        f_block_start: true,
        f_block_current: true,
        f_block_end: true,
        f_topic0: true,
        f_created_at: true,
        f_updated_at: true
      }
    });
  })
});

export type W3bstreamRouter = typeof w3bstreamRouter;
export type ProjectOriginalType = inferProcedureOutput<W3bstreamRouter['projects']>[0];
export type AppletType = ProjectOriginalType['applets'][0] & { project_name: string };
export type StrategyType = AppletType['strategies'][0];
export type InstanceType = AppletType['instances'][0] & { project_name: string; applet_name: string };
export type PublisherType = ProjectOriginalType['publishers'][0] & { project_id: string; project_name: string };
export type ProjectType = ProjectOriginalType & {
  applets: AppletType[];
  publishers: PublisherType[];
};
export type ContractLogType = inferProcedureOutput<W3bstreamRouter['contractLogs']>[0];
