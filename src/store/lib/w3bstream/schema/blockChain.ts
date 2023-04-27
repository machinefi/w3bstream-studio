import { JSONValue, JSONSchemaFormState, JSONModalValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { eventBus } from '@/lib/event';
import { definitions } from './definitions';
import { ChainTxType } from '@/server/routers/w3bstream';
import { PromiseState } from '@/store/standard/PromiseState';
import { trpc } from '@/lib/trpc';
import { defaultOutlineButtonStyle } from '@/lib/theme';
import { axios } from '@/lib/axios';
import toast from 'react-hot-toast';


export default class BlockChainModule {
  allBlockChain = new PromiseState<() => Promise<any>, ChainTxType[]>({
    defaultValue: [],
    function: async () => {
      const res = await trpc.api.blockChain.query();
      console.log('chain', res)
      return res;
    }
  });
}
