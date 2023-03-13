import { makeAutoObservable } from 'mobx';
import { BooleanState } from './base';
import { showNotification } from '@mantine/notifications';

export class PromiseState<T extends (...args: any[]) => Promise<any>, U = ReturnType<T>> {
  loading = new BooleanState();
  value?: Awaited<U> = null;
  defaultValue: any = null;
  function: T;

  autoAlert = true;
  context: any = undefined;

  currentIndex = 0;
  get current() {
    return this.value[this.currentIndex];
  }

  constructor(args: Partial<PromiseState<T, U>> = {}) {
    Object.assign(this, args);
    if (this.defaultValue) {
      this.value = this.defaultValue;
    }
    makeAutoObservable(this);
  }

  onSelect(index: number) {
    this.currentIndex = index;
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
        const message = error.message || error.data?.message;
        showNotification({
          message,
          title: 'Error',
          color: 'red'
        });
        if (message.includes('UNAUTHORIZED')) {
          globalThis.store.w3s.config.logout()
        }
      } else {
        throw error;
      }
    } finally {
      this.loading.setValue(false);
    }
  }
}
