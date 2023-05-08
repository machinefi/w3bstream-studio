import { v4 as uuidv4 } from 'uuid';
import { makeAutoObservable, reaction } from 'mobx';
import { rootStore } from '../index';
import { BooleanState } from '../standard/base';
import { helper } from '../../lib/helper';
import { eventBus } from '@/lib/event';

export interface ContractState {
  address: string;
  abi: any;
  chainId?: number;
}

export class ReadFunction<T = any[], V = ReturnType<any>> {
  name: string;
  //@ts-ignore
  value?: V = '...';
  contract: ContractState;
  autoLoad: boolean = false;
  cacheAble: boolean = false;
  cacheLoaded: boolean = false;
  loading = new BooleanState();
  onSet?: (value: any) => V;
  constructor(args: Partial<ReadFunction<T, V>>) {
    Object.assign(this, args);
    this.loading.setValue(true);
    makeAutoObservable(this);
  }
  preMulticall(args: Partial<CallParams<T>>): Partial<CallParams<T>> {
    return Object.assign({ address: this.contract.address, abi: this.contract.abi, method: this.name, handler: this, chainId: this.contract.chainId }, args);
  }

  setValue(value: any) {
    this.loading.setValue(false);
    // if (this.contract.cache && this.cacheAble) {
    //   this.contract.cache.setValue(this.name, value);
    // }
    if (this.onSet) {
      return (this.value = this.onSet(value));
    }
    //@ts-ignore
    if (this.value.setValue) {
      //@ts-ignore
      this.value.setValue(value);
    } else {
      this.value = value;
    }
  }
}

export interface CallParams<P = any[]> {
  address: string;
  abi: any;
  method: string;
  params?: P;
  options?: Partial<{
    value: string;
    gasLimit: string;
    gasPrice: string;
  }>;
  handler?: any;
  read?: boolean;
}

export class WriteFunction<T> {
  uuid = uuidv4();
  name: string;
  contract: ContractState;
  loading = new BooleanState();
  onAfterCall: (call: { args: Partial<CallParams<T>> }) => void;
  /**
   *  When a transaction is initiated, the transaction history is recorded to the local localStorage.
   *
   */
  showToast: () => {
    title?: string;
    description: string;
    status: 'info' | 'warning' | 'success' | 'error';
  };
  defaultToast: boolean;
  /**
   * This property must be passed in as "reacordHistory()" to pop up after the transaction has completed.
   *
   * Must return a coin object which include in "TransactionItem".
   */
  autoRefresh = true;
  constructor(args: Partial<WriteFunction<T>>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get god() {
    return rootStore.god;
  }

  get network() {
    return rootStore.god.currentNetwork;
  }

  handleToast() {
    if (this.showToast || this.defaultToast) {
      // helper.toast(
      //   this.defaultToast
      //     ? {
      //         title: `${this.name.charAt(0).toUpperCase() + this.name.slice(1)} Success`,
      //         status: 'success'
      //       }
      //     : this.showToast()
      // );
    }
  }

  async call(args: Partial<CallParams<T>>) {
    try {
      this.loading.setValue(true);
      //@ts-ignore
      const res = await this.network.execContract(Object.assign({ address: this.contract.address, abi: this.contract.abi, method: this.name }, args));

      res.wait().then(async (receipt) => {
        this.loading.setValue(false);
        if (this.autoRefresh) {
          // this.god.pollingData();
        }

        if (this.onAfterCall) {
          this.onAfterCall({ args });
        }

        this.handleToast();
      });
      return res;
    } catch (error) {
      console.log(error);
      this.loading.setValue(false);
      // helper.toast({ title: error.data?.message || error.message, status: 'error' });
      throw new Error(error.message);
    }
  }
}
