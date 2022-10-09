import { Web3Provider } from '@ethersproject/providers';
import { InjectedConnector } from '@web3-react/injected-connector';
import { providers as EthersProviders, ethers } from 'ethers';

export function getLibrary(provider: any): Web3Provider {
  const library = new EthersProviders.Web3Provider(provider);
  library.pollingInterval = 12000;
  //@ts-ignore
  return library;
}

export const injected = new InjectedConnector({});

