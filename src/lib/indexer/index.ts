import { rootStore } from '@/store/index';
import { JSONHistoryState } from '@/store/standard/JSONHistoryState';
import { StorageState } from '@/store/standard/StorageState';
import { ethers } from 'ethers';
import { helper } from '../helper';
import { metamaskUtils } from '../metaskUtils';

export class Indexer {
  blockLimit = 100;
  interval = 5000;
  formData = {
    contractAddress: '',
    startBlock: 0,
    contractEventName: '',
    abi: [],
    chainId: 4689
  };
  status = 'stop'; // stop, running
  static indexderHistory = new JSONHistoryState<{
    contractAddress: string;
    startBlock: number;
    contractEventName: string;
    contract: string;
    chainId: number;
    handleFunc: string;
  }>({
    size: 10,
    key: 'lab.indexerHistory'
  });
  get provider() {
    return rootStore.god.currentNetwork.signer.provider;
  }
  get signer() {
    return rootStore.god.currentNetwork.signer;
  }

  get contract() {
    return new ethers.Contract(this.formData.contractAddress, this.formData.abi as any, this.signer);
  }

  constructor(args: Partial<Indexer> = {}) {
    Object.assign(this, args);
  }

  async start() {
    return new Promise(async (resolve, reject) => {
      try {
        const from = Number(this.formData.startBlock);
        const to = from + this.blockLimit;
        if (from >= to) {
          return;
        }
        this.status = 'running';
        if (this.status === 'running') {
          if (this.formData.chainId !== rootStore.god.currentNetwork.currentChain.chainId) {
            await helper.setChain(rootStore.god, this.formData.chainId);
          }
          //@ts-ignore
          await this.contract.queryFilter(this.contract.filters[this.formData.contractEventName], from, to).then(async (e) => {
            console.log(e);
            this.formData.startBlock = to;
            resolve(e?.length > 0 ? e[0] : null);
          });
        }
      } catch (e) {
        await new Promise((res) => setTimeout(res, this.interval));
        // this.start();
        reject(null);
      }
    });
  }
  stop() {
    this.status = 'stop';
  }
}
