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
import { eventBus } from '../../../lib/event';

export class W3bStream {
  rootStore: RootStore;

  config = w3bstreamConfigSchema;
  login = loginSchema;
  createProject = createProjectSchema;
  deployProject = deployProjectSchema;
  appletList = appletListSchema;

  projects = new PromiseState({
    function: async () => {
      const { data = [] } = await axios.request({
        url: '/srv-applet-mgr/v0/project'
      });
      if (data) {
        eventBus.emit('project.list', data.data);
      }
      return data;
    }
  });

  applets = new PromiseState({
    function: async ({ projectID }) => {
      const { data = [] } = await axios.request({
        url: `/srv-applet-mgr/v0/applet/${projectID}`
      });
      return data;
    }
  });

  get isLogin() {
    return !!this.config.formData.token;
  }

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.initEvent();
    setTimeout(() => {
      this.initHook();
    }, 100);
  }
  initEvent() {
    eventBus.on('user.login', () => {
      this.projects.call();
    });
    eventBus.on('project.list', (projects) => {
      const [project] = projects;
      if (project) {
        [this.deployProject.formData.info, this.appletList.formData].forEach((i) => {
          if (!i.projectID) {
            i.projectID = project.projectID;
          }
        });
        this.applets.call({ projectID: project.projectID });
      }
    });
  }

  initHook() {
    hooks.waitLogin().then(() => {
      this.projects.call();
    });
  }
}
