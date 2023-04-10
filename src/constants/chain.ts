export type NetworkObject = {
  name: string;
  chainId: number;
  rpcUrl: string;
  logoUrl: string;
  explorerUrl: string;
  explorerName: string;
  nativeCoin: string;
  // blockPerSeconds: number;
  // multicallAddr: string;
  type: 'mainnet' | 'testnet';
};

export const defaultNetworks: NetworkObject[] = [
  {
    name: 'ETH',
    chainId: 1,
    rpcUrl: `https://rpc.ankr.com/eth`,
    logoUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/icon/eth.svg',
    explorerUrl: 'https://etherscan.io',
    explorerName: 'EtherScan',
    nativeCoin: 'ETH',
    type: 'mainnet'
  },
  {
    name: 'Polygon',
    chainId: 137,
    logoUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/icon/matic.svg',
    rpcUrl: 'https://polygon-rpc.com/',
    explorerUrl: 'https://explorer-mainnet.maticvigil.com/',
    explorerName: 'PolygonScan',
    nativeCoin: 'MATIC',
    type: 'mainnet'
  },
  {
    name: 'BSC',
    chainId: 56,
    rpcUrl: 'https://rpc.ankr.com/bsc',
    logoUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/icon/bnb.svg',
    explorerUrl: 'https://bscscan.com',
    explorerName: 'BscScan',
    nativeCoin: 'BNB',
    type: 'mainnet'
  },
  {
    name: 'IoTeX',
    chainId: 4689,
    rpcUrl: 'https://babel-api.mainnet.iotex.io/',
    logoUrl: 'https://coingecko-proxy.iopay.me/coins/images/3334/large/iotex-logo.png?1547037941',
    explorerUrl: 'https://iotexscan.io',
    explorerName: 'IotexScan',
    nativeCoin: 'IOTX',
    type: 'mainnet'
  },
  {
    name: 'Avalanche',
    chainId: 43114,
    rpcUrl: 'https://rpc.ankr.com/avalanche',
    logoUrl: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/icon/avax.svg',
    explorerUrl: 'https://subnets.avax.network/',
    explorerName: 'AVAXScan',
    nativeCoin: 'AVAX',
    type: 'mainnet'
  }
];
