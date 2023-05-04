import { helper } from '@/lib/helper';
import { makeAutoObservable } from 'mobx';

export class JSONHistoryState<T = any> {
  key: string;
  size: number = 5;
  list: T[] = [];
  currentIndex = 0;
  get current() {
    return this.list[this.currentIndex];
  }

  constructor(args: { key: string; size?: number }) {
    Object.assign(this, args);
    makeAutoObservable(this);
    this.load();
  }

  push(value: T) {
    this.list.push(value);
    if (this.list.length > this.size) {
      this.list.shift();
    }
    this.currentIndex = this.list.length - 1;
    this.save();
  }

  load() {
    const value = global?.localStorage?.getItem(this.key);
    this.list = helper.json.safeParse(value) || [];
    this.currentIndex = this.list.length - 1;
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.list));
  }

  clear() {
    localStorage.removeItem(this.key);
    this.list = [];
  }
}
