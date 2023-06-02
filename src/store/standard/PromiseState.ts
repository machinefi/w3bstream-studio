import { makeAutoObservable } from 'mobx';
import { BooleanState } from './base';
import toast from 'react-hot-toast';

export class PromiseState<T extends (...args: any[]) => Promise<any>, U = ReturnType<T>> {
  loading = new BooleanState();
  value?: Awaited<U> = null;
  defaultValue: any = null;
  function: T;

  autoAlert = true;
  context: any = undefined;

  loadingText = null;
  loadingId = null;

  currentIndex = 0;
  get current() {
    if (Array.isArray(this.value)) {
      return this.value[this.currentIndex];
    }
    return null;
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
      if (this.loadingText) {
        this.loadingId = toast.loading(this.loadingText);
      }
      const res = await this.function.apply(this.context, args);
      this.value = res;
      return res;
    } catch (error) {
      console.log(error);
      if (this.autoAlert) {
        const message = error.message || error.data?.message;
        if (message.includes('UNAUTHORIZED')) {
          globalThis.store.w3s.config.logout();
        } else {
          toast.error(message);
        }
      } else {
        throw error;
      }
    } finally {
      this.loadingId && toast.dismiss(this.loadingId);
      this.loading.setValue(false);
    }
  }
}
