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
