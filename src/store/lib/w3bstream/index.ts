import { makeAutoObservable } from 'mobx';
import RootStore from '@/store/root';
import { rootStore } from '../../index';
import { w3bstreamConfigSchema } from './schema/config';
import { loginSchema } from './schema/login';
import { createProjectSchema } from './schema/createProject';

export class W3bStream {
  rootStore: RootStore;

  config = w3bstreamConfigSchema;
  login = loginSchema;
  createProject = createProjectSchema;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get forms() {
    return [this.config, this.login, this.createProject];
  }
}
