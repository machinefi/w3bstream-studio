import { makeAutoObservable } from 'mobx';
import { StorageState } from './StorageState';

export class MappingState<T> {
  currentId: any;
  map: {
    [key: string]: T;
  } = {};
  set: T[] = [];
  constructor(args: Partial<MappingState<T>>) {
    Object.assign(this, args);
    this.set = Object.values(this.map);
    makeAutoObservable(this);
  }
  get current(): T {
    return this.map[this.currentId];
  }
  get curId(): any | null {
    // The first item id is returned by default
    return this.currentId ? this.currentId : Object.keys(this.map).length > 0 ? Object.keys(this.map)[0] : null;
  }
  setMap(key: string, value: T) {
    this.map[key] = value;
  }
  setCurrentId(val: any) {
    this.currentId = val;
  }
}

export class MappingStorageState<T> {
  currentId: StorageState<any>;
  map: {
    [key: string]: T;
  };
  constructor(args: Partial<MappingState<T>>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }
  get current(): T {
    return this.map[this.currentId.value];
  }
  setCurrentId(val: any) {
    this.currentId.save(val);
  }
}

export class DynamicMappingState<T> {
  map: {
    [key: string]: T;
  };
  getId: Function;
  constructor(args: Partial<DynamicMappingState<T>>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }
  get current(): T {
    return this.map[this.getId()];
  }
}
