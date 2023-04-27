import { authProcedure, t } from '../trpc';
import { z } from 'zod';
import { inferProcedureOutput } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

enum ProjectConfigType {
  CONFIG_TYPE__PROJECT_SCHEMA = 1,
  CONFIG_TYPE__INSTANCE_CACHE = 2,
  CONFIG_TYPE__PROJECT_ENV = 3
}

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
            f_wasm_name: true,
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
    res.forEach((i: ProjectOriginalType) => {
      i.config = {};
      i.configs.forEach((c: ConfigsType) => {
        //buffer to string cause by prisma client parse error
        c.f_value && (c.f_value = JSON.parse(c.f_value.toString()));
        switch (c.f_type) {
          case ProjectConfigType.CONFIG_TYPE__PROJECT_SCHEMA:
            i.config.schema = c.f_value;
            break;
          case ProjectConfigType.CONFIG_TYPE__PROJECT_ENV:
            const values = c.f_value.env as unknown as Array<Array<string>>;
            i.config.env = [];
            if (values) {
              values.forEach((v) => {
                i.config.env.push({
                  id: uuidv4(),
                  key: v[0],
                  value: v[1]
                });
              });
            }
            break;
        }
      });
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
        limit: z.number().optional().default(10),
        offset: z.number().optional().default(0),
        createdAt: z.number().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        f_project_name: {
          equals: input.projectName
        }
      };
      if (input.createdAt) {
        where['f_created_at'] = {
          gte: input.createdAt
        };
      }
      return ctx.prisma.t_wasm_log.findMany({
        where,
        take: input.limit,
        skip: input.offset,
        orderBy: {
          f_created_at: 'desc'
        },
        select: {
          f_id: true,
          f_level: true,
          f_msg: true,
          f_created_at: true
        }
      });
    }),
  dbState: t.procedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.$queryRaw<{ size: bigint }[]>`SELECT pg_database_size(DATname) AS size FROM pg_database WHERE DATname != 'template1'`; //!=template1 tempalte0
    console.log(result);
    const sizes = result.map((r) => Number(r.size));
    const usedSize = (sizes.reduce((acc, size) => acc + size, 0) / 1024 / 1024).toFixed(4); // mb

    const stats = await ctx.prisma.$queryRaw`SELECT datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    tup_returned,
    tup_fetched,
    tup_inserted,
    tup_updated,
    tup_deleted
FROM pg_stat_database where DATname='w3bstream';
`;

    return { usedSize, stats };
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
    })
});

export type W3bstreamRouter = typeof w3bstreamRouter;
export type ProjectOriginalType = inferProcedureOutput<W3bstreamRouter['projects']>[0] & { config: ConfigType };
export type ConfigType = { env?: EnvType[]; schema?: string };
export type EnvType = { id: string; key: string; value: string };
export type ConfigsType = ProjectOriginalType['configs'][0] & { f_value: string & { env: string[][] } };
export type AppletType = ProjectOriginalType['applets'][0] & { project_name: string };
export type StrategyType = AppletType['strategies'][0];
export type InstanceType = AppletType['instances'][0] & { project_name: string; applet_name: string };
export type PublisherType = ProjectOriginalType['publishers'][0] & { project_id: string; project_name: string };
export type ProjectType = ProjectOriginalType & {
  applets: AppletType[];
  publishers: PublisherType[];
};
export type ContractLogType = inferProcedureOutput<W3bstreamRouter['contractLogs']>[0];
export type ChainTxType = inferProcedureOutput<W3bstreamRouter['chainTx']>[0];
export type ChainHeightType = inferProcedureOutput<W3bstreamRouter['chainHeight']>[0];
export type WasmLogType = inferProcedureOutput<W3bstreamRouter['wasmLogs']>[0];
export type CronJobsType = inferProcedureOutput<W3bstreamRouter['cronJobs']>[0];
