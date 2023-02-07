import { t } from '../trpc';
import { z } from 'zod';
import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';

enum ProjectConfigType {
  CONFIG_TYPE__PROJECT_SCHEMA = 1,
  CONFIG_TYPE__INSTANCE_CACHE = 2,
  CONFIG_TYPE__PROJECT_ENV = 3
}
export const w3bstreamRouter = t.router({
  projects: t.procedure
    .input(
      z.object({
        accountID: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      // TODO: verify
      const res = await ctx.prisma.t_project.findMany({
        where: {
          f_account_id: {
            equals: BigInt(input.accountID)
          }
        },
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
      console.log(res);
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
