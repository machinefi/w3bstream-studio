import { ChainState } from './ChainState';
import { MappingState } from '../standard/MappingState';
import { GodStore } from '../god';

export interface NetworkState {
  god: GodStore;
  chain: MappingState<ChainState>;
  allowChains: number[];
  account: string;
  walletInfo: { visible: boolean };
  currentChain: ChainState;
  set: (args: Partial<NetworkState>) => void;
  loadBalance: Function;
  isAddress(address: string): boolean;
}
