import { makeAutoObservable } from 'mobx';
import RootStore from '@/store/root';
import { rootStore } from '../../index';
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
import { LoginSchema } from './schema/login';

export class W3bStream {
  rootStore: RootStore;

  config = new W3bstreamConfigState({});
  login = new LoginSchema({});
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
      const res = await trpc.api.projects.query({ accountID: this.config.formData.accountID });
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
      eventBus.emit('instance.deploy');
      return res.data;
    }
  });

  handleInstance = new PromiseState({
    function: async ({ instaceID, event }: { instaceID: string; event: string }) => {
      const res = await axios.request({
        method: 'put',
        url: `/srv-applet-mgr/v0/deploy/${instaceID}/${event}`
      });
      eventBus.emit('instance.handle');
      return res.data;
    }
  });

  publishEvent = new PromiseState({
    function: async ({ projectID, appletID, event = 'start', data = 'test msg' }: { projectID: string; appletID: string; event?: string; data?: string }) => {
      const res = await axios.request({
        method: 'post',
        url: `srv-applet-mgr/v0/event/${projectID}/${appletID}/${event}`,
        headers: {
          publisher: 'admin'
        },
        data
      });
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
    eventBus
      .on('user.login', () => {
        this.allProjects.call();
      })
      .on('project.create', () => {
        this.allProjects.call();
      })
      .on('applet.create', () => {
        this.allProjects.call();
      })
      .on('instance.deploy', () => {
        this.allProjects.call();
      })
      .on('instance.handle', () => {
        this.allProjects.call();
      });
  }

  initHook() {
    hooks.waitLogin().then(() => {
      this.allProjects.call();
    });
  }
}
