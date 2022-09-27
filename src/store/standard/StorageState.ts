import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import { helper } from '@/lib/helper';
import { JSONSchemaValue } from './JSONSchemaState';

export class StorageState<T> implements JSONSchemaValue {
  key: string;
  value: T | any = null;
  default: T | any = null;
  constructor(args: Partial<StorageState<T>>) {
    Object.assign(this, args);
    makeAutoObservable(this);
    this.load();
  }

  get() {
    return this.value;
  }
  set(val) {
    this.value = { ...this.value, ...val };
    localStorage.setItem(this.key, JSON.stringify(this.value));
  }

  load() {
    const value = global?.localStorage?.getItem(this.key);
    this.value = helper.json.safeParse(value);
    if (this.value == null) {
      this.value = this.default;
    }
    return this.value;
  }

  save(value?: any) {
    if (value) {
      this.value = value;
    }
    global?.localStorage.setItem(this.key, JSON.stringify(value));
  }

  clear() {
    localStorage.removeItem(this.key);
  }
}
