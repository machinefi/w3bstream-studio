import { authProcedure, t } from '../trpc';
import { z } from 'zod';
import { inferProcedureOutput } from '@trpc/server';
import { helper } from '@/lib/helper';

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
        // publishers: {
        //   select: {
        //     f_project_id: true,
        //     f_publisher_id: true,
        //     f_name: true,
        //     f_key: true,
        //     f_created_at: true,
        //     f_token: true
        //   }
        // },
        applets: {
          select: {
            f_name: true,
            f_applet_id: true,
            f_project_id: true,
            f_resource_id: true,
            // strategies: {
            //   select: {
            //     f_strategy_id: true,
            //     f_applet_id: true,
            //     f_project_id: true,
            //     f_event_type: true,
            //     f_handler: true
            //   }
            // },
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
        // cronJobs: {
        //   select: {
        //     f_cron_job_id: true,
        //     f_project_id: true,
        //     f_cron_expressions: true,
        //     f_event_type: true,
        //     f_created_at: true
        //   }
        // },
        // contractLogs: {
        //   select: {
        //     f_contractlog_id: true,
        //     f_project_name: true,
        //     f_event_type: true,
        //     f_chain_id: true,
        //     f_contract_address: true,
        //     f_block_start: true,
        //     f_block_current: true,
        //     f_block_end: true,
        //     f_topic0: true,
        //     f_created_at: true,
        //     f_updated_at: true
        //   }
        // },
        // chainHeights: {
        //   select: {
        //     f_chain_height_id: true,
        //     f_project_name: true,
        //     f_finished: true,
        //     f_event_type: true,
        //     f_chain_id: true,
        //     f_height: true,
        //     f_created_at: true,
        //     f_updated_at: true
        //   }
        // },
        // chainTxs: {
        //   select: {
        //     f_chaintx_id: true,
        //     f_project_name: true,
        //     f_finished: true,
        //     f_event_type: true,
        //     f_chain_id: true,
        //     f_tx_address: true,
        //     f_created_at: true,
        //     f_updated_at: true
        //   }
        // }
      }
    });

    return projects;
  }),
  projectDetail: authProcedure
    .input(
      z.object({
        projectID: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const accountID = BigInt(ctx.user.Payload);
      const projects = await ctx.prisma.t_project.findMany({
        where: {
          f_account_id: {
            equals: accountID
          },
          f_project_id: {
            equals: BigInt(input.projectID)
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
          },
          contractLogs: {
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
              f_updated_at: true,
              f_paused: true
            }
          },
          chainHeights: {
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
          },
          chainTxs: {
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
          }
        }
      });

      return projects;
    }),
  publishers: authProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/publishers'
      }
    })
    .input(
      z.object({
        projectID: z.string(),
        name: z.string().optional()
      })
    )
    .output(z.any())
    .query(async ({ ctx, input }) => {
      const publishers = await ctx.prisma.t_publisher.findMany({
        where: {
          f_project_id: {
            equals: BigInt(input.projectID)
          },
          f_name: {
            contains: input.name
          }
        },
        select: {
          f_project_id: true,
          f_publisher_id: true,
          f_name: true,
          f_key: true,
          f_created_at: true,
          f_token: true
        }
      });
      return { result: helper.json.safeResult(publishers), ok: true };
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
    }),
  userSetting: authProcedure.query(async ({ ctx, input }) => {
    const res = await ctx.prisma.t_access_key.findMany({
      where: {
        f_account_id: {
          equals: BigInt(ctx.user.Payload)
        },
        f_identity_type: 1
      },
      select: {
        f_name: true,
        f_updated_at: true,
        f_expired_at: true,
        f_desc: true,
        f_identity_type: true
      }
    });
    return {
      apikeys: res
    };
  })
});

export type W3bstreamRouter = typeof w3bstreamRouter;
export type ProjectOriginalType = inferProcedureOutput<W3bstreamRouter['projectDetail']>[0];
export type AppletType = ProjectOriginalType['applets'][0] & { project_name: string };
export type StrategyType = AppletType['strategies'][0];
export type InstanceType = AppletType['instances'][0] & { project_name: string; applet_name: string };
export type PublisherType = ProjectOriginalType['publishers'][0] & { project_id: string; project_name: string };
export type ProjectType = ProjectOriginalType & {
  name: string;
  envs: {
    env: [string, any][];
  };
};
export type ContractLogType = ProjectOriginalType['contractLogs'][0];
export type ChainTxType = ProjectOriginalType['chainTxs'][0];
export type ChainHeightType = ProjectOriginalType['chainHeights'][0];
export type CronJobsType = ProjectOriginalType['cronJobs'][0];
export type WasmLogType = inferProcedureOutput<W3bstreamRouter['wasmLogs']>;
export type UserSettingType = inferProcedureOutput<W3bstreamRouter['userSetting']>;
