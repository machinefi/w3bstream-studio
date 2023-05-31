import { BlockchainType } from '@/server/routers/w3bstream';
import { makeObservable, observable } from 'mobx';

export default class BlockChainModule {
  allBlockChain: BlockchainType[] = [];

  constructor() {
    makeObservable(this, {
      allBlockChain: observable
    });
  }
}
