import { makeAutoObservable } from 'mobx';
import RootStore from '@/store/root';
import { rootStore } from '../../index';
import { w3bstreamConfigSchema } from './schema/config';
import { loginSchema } from './schema/login';
import { createProjectSchema } from './schema/createProject';
import { PromiseState } from '../../standard/PromiseState';
import { axios } from '../../../lib/axios';
import { eventBus } from '../../../lib/event';
import { hooks } from '../../../lib/hooks';

export class W3bStream {
  rootStore: RootStore;

  config = w3bstreamConfigSchema;
  login = loginSchema;
  createProject = createProjectSchema;

  projects = new PromiseState({
    init: async (i) => {
      await hooks.waitLogin();
      i.call();
    },
    function: async () => {
      const res = await axios.request({
        url: '/srv-applet-mgr/v0/project'
      });
      return res.data;
    }
  });

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get isLogin() {
    return !!this.config.formData.token;
  }

  get forms() {
    return [this.config, this.login, this.createProject];
  }
}
