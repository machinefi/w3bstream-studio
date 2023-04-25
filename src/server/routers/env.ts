import { t } from '../trpc';
import axios from 'axios';
import { memoryCache } from '@/lib/cache-manager';
import { inferProcedureOutput } from '@trpc/server';

export const envRouter = t.router({
  envs: t.procedure.query(async () => {
    return memoryCache.wrap(
      'envs',
      async () => {
        let w3bstreamVersion = '';
        try {
          const url = `${process.env.NEXT_PUBLIC_API_URL}/version`;
          const res = await axios.get(url);
          w3bstreamVersion = res?.data || '';
        } catch (error) {}
        return {
          w3bstreamVersion,
          studioVersion: process.env.NEXT_PUBLIC_VERSION || 'v0.1.5',
          httpURL: process.env.NEXT_PUBLIC_GATEWAY_HTTP_URL || 'https://dev.w3bstream.com/api/w3bapp/event/:projectName',
          mqttURL: process.env.NEXT_PUBLIC_GATEWAY_MQTT_URL || 'mqtt://dev.w3bstream.com:1883'
        };
      },
      1000 * 120
    );
  })
});

export type PgRouter = typeof envRouter;
export type EnvsType = inferProcedureOutput<PgRouter['envs']>;
