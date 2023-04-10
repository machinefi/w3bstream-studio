import { makeAutoObservable } from 'mobx';
import { Signer, utils } from 'ethers';
import { MappingState } from '../standard/MappingState';
import { ChainState } from './ChainState';
import { NetworkState } from './NetworkState';
import { GodStore } from '../god';
import BigNumber from 'bignumber.js';

export class EthNetworkState implements NetworkState {
  god: GodStore;
  chain: MappingState<ChainState> = new MappingState({ currentId: '' });
  signer: Signer;
  account: string = '';
  allowChains: number[];
  walletInfo = {
    visible: false
  };

  constructor(args: Partial<EthNetworkState>) {
    Object.assign(this, args);
    makeAutoObservable(this);
    this.allowChains = Object.values(this.chain.map).map((i) => i.chainId);
  }

  get currentChain() {
    return this.chain.current;
  }

  async loadBalance() {
    if (!this.signer || !this.account) {
      return this.currentChain.Coin.balance.setValue(new BigNumber(0));
    }
    const balance = await this.signer.provider.getBalance(this.account);
    this.currentChain.Coin.balance.setValue(new BigNumber(balance.toString()));
  }

  set(args: Partial<EthNetworkState>) {
    Object.assign(this, args);
  }

  isAddress(address: string): boolean {
    return utils.isAddress(address);
  }
}
