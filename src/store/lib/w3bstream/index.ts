import { makeAutoObservable } from 'mobx';
import RootStore from '@/store/root';
import { rootStore } from '../../index';
import { loginSchema } from './schema/login';
import { CreateProjectSchema } from './schema/createProject';
import { PromiseState } from '../../standard/PromiseState';
import { axios } from '../../../lib/axios';
import { hooks } from '../../../lib/hooks';
import { eventBus } from '../../../lib/event';
import { publishEventSchema } from './schema/publishEvent';
import { W3bstreamConfigState } from './schema/config';
import { UploadWASMSChema } from './schema/uploadWASM';
import { ProjectListSchema } from './schema/projectList';
import { _ } from '../../../lib/lodash';
import { trpc } from '../../../lib/trpc';

export class W3bStream {
  rootStore: RootStore;

  config = new W3bstreamConfigState({});
  login = loginSchema;
  createProject = new CreateProjectSchema({});
  uploadWASMScript = new UploadWASMSChema({
    getDymaicData: () => {
      return {
        ready: this.allProjects.value.length > 0
      };
    }
  });
  projectList = new ProjectListSchema({
    getDymaicData: () => {
      return {
        ready: this.allProjects.value.length > 0
      };
    }
  });

  allProjects = new PromiseState({
    defaultValue: [],
    function: async () => {
      const res = await trpc.query('api.projects');
      return res;
    }
  });

  curProjectIndex = 0;
  get curProject() {
    return this.allProjects.value ? this.allProjects.value[this.curProjectIndex] : null;
  }

  curAppletIndex = 0;
  get curApplet() {
    return this.curProject ? this.curProject.applets[this.curAppletIndex] : null;
  }
  deployApplet = new PromiseState({
    function: async ({ appletID }: { appletID: string }) => {
      const res = await axios.request({
        method: 'post',
        url: `/srv-applet-mgr/v0/deploy/applet/${appletID}`
      });
      return res.data;
    }
  });

  handleInstance = new PromiseState({
    function: async ({ instaceID, event }: { instaceID: string; event: string }) => {
      const res = await axios.request({
        method: 'put',
        url: `/srv-applet-mgr/v0/deploy/${instaceID}/${event}`
      });
      setTimeout(() => {
        this.allProjects.call();
      }, 500);
      return res.data;
    }
  });

  publishEvent = new PromiseState({
    function: async ({ projectID, appletID, event = 'start', data = 'test msg', publisher = 'admin' }: { projectID: string; appletID: string; event?: string; data?: string }) => {
      const res = await axios.request({
        method: 'post',
        url: `/srv-applet-mgr/v0/event/${projectID}/${appletID}/${event}`,
        headers: {
          publisher: publisher,
          'Content-Type': 'text/plain'
        },
        data
      });
      setTimeout(() => {
        this.allProjects.call();
      }, 500);
      return res.data;
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
      this.allProjects.call();
    });
  }

  initHook() {
    hooks.waitLogin().then(() => {
      this.allProjects.call();
    });
  }
}
