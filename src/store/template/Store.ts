import { makeAutoObservable } from 'mobx';
import RootStore from '@/store/root';

export class TodoStore {
  rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
}
