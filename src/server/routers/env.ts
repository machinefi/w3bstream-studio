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
        } catch (error) {
          console.error(error);
        }

        try {
          // blockChains = await prisma.t_blockchain.findMany({
          //   select: {
          //     f_id: true,
          //     f_chain_id: true,
          //     f_chain_address: true
          //   }
          // });
          const ethClientRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/configuration/eth_client`);
          const clients: { [key: string]: string } = JSON.parse(ethClientRes.data.clients);
          for (let key in clients) {
            const f_chain_address = clients[key];
            const f_chain_id = BigInt(key);
            const f_id = BigInt(key);
            blockChains.push({ f_id, f_chain_id, f_chain_address });
          }
        } catch (error) {
          console.error(error);
        }

        return {
          blockChains,
          w3bstreamVersion,
          studioVersion: pkg.version,
          httpURL: process.env.NEXT_PUBLIC_GATEWAY_HTTP_URL || 'https://dev.w3bstream.com/api/w3bapp/event/:projectName',
          mqttURL: process.env.NEXT_PUBLIC_GATEWAY_MQTT_URL || 'mqtt://dev.w3bstream.com:1883'
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
