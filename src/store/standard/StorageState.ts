import { makeAutoObservable, toJS, makeObservable } from 'mobx';
import { helper } from '@/lib/helper';
import { JSONSchemaValue } from './JSONSchemaState';
import { _ } from '@/lib/lodash';

export class StorageState<T> extends JSONSchemaValue<T> {
  key: string;
  constructor(args: Partial<StorageState<T>>) {
    super(args);
    Object.assign(this, args);
    this.load();
  }
  set(val) {
    const value = super.set(val);
    localStorage.setItem(this.key, JSON.stringify(value));
    return value;
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
