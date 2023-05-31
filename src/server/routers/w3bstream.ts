import { authProcedure, t } from '../trpc';
import { z } from 'zod';
import { inferProcedureOutput } from '@trpc/server';

export const w3bstreamRouter = t.router({
  projects: authProcedure.query(async ({ ctx }) => {
    const accountID = BigInt(ctx.user.Payload);
    const projects = await ctx.prisma.t_project.findMany({
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
            f_project_id: true,
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
        },
        cronJobs: {
          select: {
            f_cron_job_id: true,
            f_project_id: true,
            f_cron_expressions: true,
            f_event_type: true,
            f_created_at: true
          }
        }
      }
    });

    const contractLogs = await ctx.monitor.t_contract_log.findMany({
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

    const chainTxs = await ctx.monitor.t_chain_tx.findMany({
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

    const chainHeights = await ctx.monitor.t_chain_height.findMany({
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

    const blockChains = await ctx.monitor.t_blockchain.findMany({
      select: {
        f_id: true,
        f_chain_id: true,
        f_chain_address: true
      }
    });

    return {
      projects,
      contractLogs,
      chainTxs,
      chainHeights,
      blockChains
    };
  }),
  wasmLogs: authProcedure
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
  wasmName: authProcedure
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
export type ProjectOriginalType = inferProcedureOutput<W3bstreamRouter['projects']>['projects'][0];
export type AppletType = ProjectOriginalType['applets'][0] & { project_name: string };
export type StrategyType = AppletType['strategies'][0];
export type InstanceType = AppletType['instances'][0] & { project_name: string; applet_name: string };
export type PublisherType = ProjectOriginalType['publishers'][0] & { project_id: string; project_name: string };
export type ProjectType = ProjectOriginalType & {
  name: string;
};
export type ContractLogType = inferProcedureOutput<W3bstreamRouter['projects']>['contractLogs'][0];
export type ChainTxType = inferProcedureOutput<W3bstreamRouter['projects']>['chainTxs'][0];
export type ChainHeightType = inferProcedureOutput<W3bstreamRouter['projects']>['chainHeights'][0];
export type BlockchainType = inferProcedureOutput<W3bstreamRouter['projects']>['blockChains'][0];
export type CronJobsType = ProjectOriginalType['cronJobs'][0];
export type WasmLogType = inferProcedureOutput<W3bstreamRouter['wasmLogs']>;
