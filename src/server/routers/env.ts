import { t } from '../trpc';
import axios from 'axios';
import { memoryCache } from '@/lib/cache-manager';
import { inferProcedureOutput } from '@trpc/server';
import pkg from '../../../package.json';
import { prisma } from '../prisma';

export const envRouter = t.router({
  envs: t.procedure.query(async () => {
    return memoryCache.wrap(
      'envs',
      async () => {
        let w3bstreamVersion = '';
        let blockChains: BlockchainType[] = [];

        try {
          const url = `${process.env.NEXT_PUBLIC_API_URL}/version`;
          const res = await axios.get(url);
          w3bstreamVersion = res?.data ? res?.data.match(/v(\d+\.\d+\.\d+(?:-\w+)?)/)[0] : '';
          w3bstreamVersion = w3bstreamVersion.split('_')[0];
          if (!w3bstreamVersion.includes('-rc')) {
            w3bstreamVersion = w3bstreamVersion.split('-')[0];
          }
        } catch (error) {
          console.error(error);
        }

        try {
          const ethClientRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/configuration/chain_config`);
          const chains: { chainID: number, name: string, endpoint: string }[] = JSON.parse(ethClientRes.data.chains);
          chains.forEach(i => {
            if (i.chainID) {
              blockChains.push({ f_id: BigInt(i.chainID), f_chain_id: BigInt(i.chainID), f_chain_address: i.endpoint })
            }
          })
        } catch (error) {
          console.error(error);
        }

        return {
          blockChains,
          w3bstreamVersion,
          studioVersion: 'v' + pkg.version,
          httpURL: process.env.NEXT_PUBLIC_GATEWAY_HTTP_URL || 'https://dev.w3bstream.com/api/w3bapp/event/:projectName',
          mqttURL: process.env.NEXT_PUBLIC_GATEWAY_MQTT_URL || 'mqtt://dev.w3bstream.com:1883',
          depinScanURL: process.env.NEXT_PUBLIC_DEPIN_SCAN_URL || 'https://depinscan.io/',
        };
      },
      1000 * 120
    );
  })
});

export type EnvRouter = typeof envRouter;
export type EnvsType = inferProcedureOutput<EnvRouter['envs']>;
export type BlockchainType = {
  f_id: bigint;
  f_chain_id: bigint;
  f_chain_address: string;
};
