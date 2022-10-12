import NextRouter from 'next/router';
import { makeAutoObservable } from 'mobx';
import RootStore from '@/store/root';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { _ } from '@/lib/lodash';
import { trpc } from '@/lib/trpc';
import { hooks } from '@/lib/hooks';
import { PromiseState } from '@/store/standard/PromiseState';
import { LoginSchema } from './schema/login';
import { W3bstreamConfigState } from './schema/config';
import { CreateAppletSchema } from './schema/createApplet';
import { ProjectListSchema } from './schema/projectList';
import { CreateProjectSchema } from './schema/createProject';
import { UpdatePasswordSchema } from './schema/updatePassword';


export class W3bStream {
  rootStore: RootStore;
  config = new W3bstreamConfigState({});
  login = new LoginSchema({});
  createProject = new CreateProjectSchema({});
  createApplet = new CreateAppletSchema({
    getDymaicData: () => {
      return {
        ready: this.allProjects.value.length > 0
      };
    }
  });
  updatePassword = new UpdatePasswordSchema({})
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
      if (res) {
        const applets = [];
        const instances = [];
        res.forEach((p) => {
          p.applets.forEach((a) => {
            a.instances.forEach((i) => {
              instances.push({
                project_id: p.f_project_id,
                project_name: p.f_name,
                applet_id: a.f_applet_id,
                applet_name: a.f_name,
                ...i
              });
            });
            applets.push(a);
          });
        });
        this.allApplets = applets;
        this.allInstances = instances;
      }

      return res;
    }
  });

  allApplets = [];
  allInstances = [];

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

  showContent: 'CURRENT_APPLETS' | 'ALL_APPLETS' | 'ALL_INSTANCES' = 'CURRENT_APPLETS';

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
        NextRouter.push('/');
      })
      .on('user.updatepwd', () => {

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
