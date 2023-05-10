import { defaultNetworks } from '@/constants/chain';
import { SqlDB } from '@/server/wasmvm/sqldb';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { makeAutoObservable } from 'mobx';
import { configureChains, createClient } from 'wagmi';
import { Chain, mainnet, polygon, avalanche, iotex, bsc } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { ChainState } from './network/ChainState';
import { CoinState } from './network/CoinState';
import { EthNetworkState } from './network/EthNetworkState';
import { BooleanState } from './standard/base';
import { MappingState } from './standard/MappingState';

export class GodStore {
  eth: EthNetworkState;
  wagmiClient: any = null;
  wagmiChains: Chain[] = [];
  isWrongNetwork = new BooleanState();
  sqlDBInstance: SqlDB;

  get sqlDB(): SqlDB {
    if (!this.sqlDBInstance) {
      this.initSQLDB();
    }
    return this.sqlDBInstance;
  }

  initSQLDB() {
    if (!this.sqlDBInstance) {
      this.sqlDBInstance = new SqlDB();
    }
  }
  constructor() {
    makeAutoObservable(this);
    this.eth = new EthNetworkState({
      god: this,
      chain: new MappingState({
        currentId: 4689,
        map: defaultNetworks
          .map(
            (i) =>
              new ChainState({
                name: i.name,
                chainId: i.chainId,
                explorerName: i.explorerName,
                explorerURL: i.explorerUrl,
                info: { theme: { bgGradient: '' } },
                logoUrl: i.logoUrl,
                rpcUrl: i.rpcUrl,
                //@ts-ignore
                type: i.type,
                Coin: new CoinState({
                  symbol: i.nativeCoin,
                  decimals: 18
                })
              })
          )
          .reduce((p, c) => {
            p[c.chainId] = c;
            return p;
          }, {})
      })
    });
    this.setWagmiClient();
  }

  get isConnect() {
    return !!this.currentNetwork.account;
  }

  get currentNetwork() {
    return this.eth;
  }

  get currentChain(): ChainState {
    return this.currentNetwork.currentChain;
  }

  get Coin() {
    return this.currentChain.Coin;
  }

  setWagmiClient() {
    const chains = [
      {
        ...iotex,
        iconUrl: 'https://coingecko-proxy.iopay.me/coins/images/3334/large/iotex-logo.png?1547037941'
      },
      mainnet,
      polygon,
      bsc,
      avalanche,
    ];
    const connectors = connectorsForWallets([
      {
        groupName: 'Recommended',
        wallets: [metaMaskWallet({ chains }), walletConnectWallet({ chains })]
      }
    ]);
    const { provider, webSocketProvider } = configureChains(chains, [publicProvider()]);
    this.wagmiClient = createClient({
      autoConnect: true,
      connectors,
      provider,
      webSocketProvider
    });
    this.wagmiChains = chains;
  }

  getNetworkByChainId(chainId: number) {
    return this.currentNetwork.chain.map[chainId];
  }

  setChainId(chianId) {
    this.isWrongNetwork.setValue(false);
    this.currentNetwork.chain.setCurrentId(chianId);
  }

  setChain(val: number) {
    this.currentNetwork.chain.setCurrentId(val);
  }
}
