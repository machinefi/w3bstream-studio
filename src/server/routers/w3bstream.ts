import { authProcedure, t } from '../trpc';
import { z } from 'zod';
import { inferProcedureOutput } from '@trpc/server';

export const w3bstreamRouter = t.router({
  projects: authProcedure.query(async ({ ctx }) => {
    const accountID = BigInt(ctx.user.Payload);
    const res = await ctx.prisma.t_project.findMany({
      where: {
        f_account_id: {
          equals: accountID
        }
      },
      orderBy: {
        f_created_at: 'desc'
      },
      select: {
        f_project_id: true,
        f_name: true,
        f_description: true,
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
            f_resource_id: true,
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
        },
        configs: {
          select: {
            f_value: true,
            f_type: true
          }
        }
      }
    });
    return res;
  }),
  contractLogs: t.procedure.query(({ ctx, input }) => {
    return ctx.monitor.t_contract_log.findMany({
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
  }),
  chainTx: t.procedure.query(({ ctx, input }) => {
    return ctx.monitor.t_chain_tx.findMany({
      select: {
        f_chaintx_id: true,
        f_project_name: true,
        f_finished: true,
        f_event_type: true,
        f_chain_id: true,
        f_tx_address: true,
        f_created_at: true,
        f_updated_at: true
      }
    });
  }),
  chainHeight: t.procedure.query(({ ctx, input }) => {
    return ctx.monitor.t_chain_height.findMany({
      select: {
        f_chain_height_id: true,
        f_project_name: true,
        f_finished: true,
        f_event_type: true,
        f_chain_id: true,
        f_height: true,
        f_created_at: true,
        f_updated_at: true
      }
    });
  }),
  blockChain: t.procedure.query(({ ctx, input }) => {
    return ctx.monitor.t_blockchain.findMany({
      select: {
        f_id: true,
        f_chain_id: true,
        f_chain_address: true
      }
    });
  }),
  wasmLogs: t.procedure
    .input(
      z.object({
        projectName: z.string(),
        limit: z.number().min(1).max(100).nullish(),
        gt: z.number().optional(),
        lt: z.number().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, projectName, gt, lt } = input;
      const where = {
        f_project_name: {
          equals: projectName
        }
      };
      if (gt) {
        where['f_created_at'] = {
          gt
        };
      }
      if (lt) {
        where['f_created_at'] = {
          lt
        };
      }
      const data = await ctx.prisma.t_wasm_log.findMany({
        where,
        take: limit,
        orderBy: {
          f_created_at: 'desc'
        },
        select: {
          f_id: true,
          f_level: true,
          f_msg: true,
          f_log_time: true,
          f_created_at: true
        }
      });
      return data;
    }),
  cronJobs: t.procedure
    .input(
      z.object({
        projectId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.prisma.t_cron_job.findMany({
        where: {
          f_project_id: {
            equals: BigInt(input.projectId)
          }
        },
        select: {
          f_cron_job_id: true,
          f_project_id: true,
          f_cron_expressions: true,
          f_event_type: true,
          f_created_at: true
        }
      });
      return res;
    }),
  wasmName: t.procedure
    .input(
      z.object({
        resourceId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.prisma.t_resource_ownership.findFirst({
        where: {
          f_resource_id: {
            equals: BigInt(input.resourceId)
          }
        },
        select: {
          f_filename: true
        }
      });
      return res;
    })
});

export type W3bstreamRouter = typeof w3bstreamRouter;
export type ProjectOriginalType = inferProcedureOutput<W3bstreamRouter['projects']>[0];
export type AppletType = ProjectOriginalType['applets'][0] & { project_name: string };
export type StrategyType = AppletType['strategies'][0];
export type InstanceType = AppletType['instances'][0] & { project_name: string; applet_name: string };
export type PublisherType = ProjectOriginalType['publishers'][0] & { project_id: string; project_name: string };
export type ProjectType = ProjectOriginalType & {
  name: string;
  applets: AppletType[];
  publishers: PublisherType[];
};
export type ContractLogType = inferProcedureOutput<W3bstreamRouter['contractLogs']>[0];
export type ChainTxType = inferProcedureOutput<W3bstreamRouter['chainTx']>[0];
export type ChainHeightType = inferProcedureOutput<W3bstreamRouter['chainHeight']>[0];
export type WasmLogType = inferProcedureOutput<W3bstreamRouter['wasmLogs']>;
export type CronJobsType = inferProcedureOutput<W3bstreamRouter['cronJobs']>[0];
