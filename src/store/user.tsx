import { makeAutoObservable } from 'mobx';
import { StorageState } from './standard/StorageState';

export class UserStore {
  userMode = new StorageState<'default' | 'general'>({ key: 'userMode', value: 'default' });

  constructor() {
    makeAutoObservable(this);
  }
}
