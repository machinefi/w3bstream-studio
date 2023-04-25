import { trpc } from '@/lib/trpc';
import { EnvsType } from '@/server/routers/env';
import { PromiseState } from '@/store/standard/PromiseState';

export default class ENVModule {
  envs = new PromiseState<() => Promise<any>, EnvsType>({
    function: async () => {
      const data = await trpc.env.envs.query();
      return data;
    }
  });
}
