import { makeAutoObservable } from 'mobx';
import RootStore from '@/store/root';
import { rootStore } from '../../index';
import { w3bstreamConfigSchema } from './schema/config';
import { loginSchema } from './schema/login';
import { createProjectSchema } from './schema/createProject';
import { PromiseState } from '../../standard/PromiseState';
import { axios } from '../../../lib/axios';
import { hooks } from '../../../lib/hooks';
import { deployProjectSchema } from './schema/deployProject';
import { appletListSchema } from './schema/appletList';

export class W3bStream {
  rootStore: RootStore;

  config = w3bstreamConfigSchema;
  login = loginSchema;
  createProject = createProjectSchema;
  deployProject = deployProjectSchema;
  appletList = appletListSchema;

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

  applets = new PromiseState({
    function: async ({ projectID }) => {
      const res = await axios.request({
        url: `/srv-applet-mgr/v0/applet/${projectID}`
      });
      return res.data;
    }
  });

  get projectsEnum() {
    return {
      type: 'string',
      get enum() {
        return rootStore.w3s.projects.value?.data?.map((i) => i.projectID) || [];
      },
      get enumNames() {
        return rootStore.w3s.projects.value?.data?.map((i) => i.name) || [];
      }
    };
  }

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get isLogin() {
    return !!this.config.formData.token;
  }

  // get forms() {
  //   return [this.config, this.login, this.createProject, this.deployProject];
  // }
}
