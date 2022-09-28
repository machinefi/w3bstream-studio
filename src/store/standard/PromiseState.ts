import { makeAutoObservable } from 'mobx';
import { BooleanState } from './base';
import { helper } from '../../lib/helper';
import { showNotification } from '@mantine/notifications';
import toast from 'react-hot-toast';
import { rootStore } from '../index';

export class PromiseState<T extends (...args: any[]) => Promise<any>, U = ReturnType<T>> {
  loading = new BooleanState();
  value?: Awaited<U> = null;
  function: T;
  init = (i: this) => {};

  autoAlert = true;
  context: any = undefined;

  constructor(args: Partial<PromiseState<T, U>> = {}) {
    Object.assign(this, args);
    makeAutoObservable(this);
    if (this.init) {
      setTimeout(() => {
        this.init(this);
      }, 100);
    }
  }

  async call(...args: Parameters<T>): Promise<Awaited<U>> {
    try {
      this.loading.setValue(true);
      const res = await this.function.apply(this.context, args);
      this.value = res;
      return res;
    } catch (error) {
      console.log(error);
      if (this.autoAlert) {
        showNotification({
          title: 'Error',
          message: error.data?.message || error.message,
          color: 'red'
        });
      } else {
        throw error;
      }
    } finally {
      this.loading.setValue(false);
    }
  }
}
