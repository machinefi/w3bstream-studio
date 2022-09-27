import { makeAutoObservable } from 'mobx';
import RootStore from '@/store/root';
import { rootStore } from '../../index';
import { w3bstreamConfigSchema } from './config';
import { loginSchema } from './schema/login';

export class W3bStream {
  rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  config = w3bstreamConfigSchema;
  login = loginSchema;

  forms = [this.config, this.login];
}
