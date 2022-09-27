import { makeAutoObservable } from 'mobx';
import RootStore from '@/store/root';
import { rootStore } from '../../index';
import { w3bstreamConfigSchema } from './schema/config';
import { loginSchema } from './schema/login';
import { createProjectSchema } from './schema/createProject';

export class W3bStream {
  rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  config = w3bstreamConfigSchema;
  login = loginSchema;
  createProject = createProjectSchema;

  forms = [this.config, this.login, this.createProject];
}
