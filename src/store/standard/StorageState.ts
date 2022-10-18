import { makeAutoObservable, toJS } from 'mobx';
import { helper } from '@/lib/helper';
import { JSONSchemaValue } from './JSONSchemaState';
import { _ } from '@/lib/lodash';

export class StorageState<T> implements JSONSchemaValue {
  key: string;
  value: T = null as T;
  default: T = null as T;
  constructor(args: Partial<StorageState<T>>) {
    Object.assign(this, args);
    makeAutoObservable(this, {
      default: false
    });
    this.load();
  }

  get() {
    return this.value;
  }
  set(val) {
    const newVal = helper.deepMerge(this.value, val);
    this.value = toJS(newVal);
    localStorage.setItem(this.key, JSON.stringify(this.value));
  }
  setFormat: (value: any) => void;

  reset() {
    this.set(this.default);
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
