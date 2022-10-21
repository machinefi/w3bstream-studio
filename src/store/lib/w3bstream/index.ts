import NextRouter from 'next/router';
import { makeAutoObservable, toJS } from 'mobx';
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
import { FilesListSchema } from './schema/filesList';
import { PublishEventSchema } from './schema/publishEvent';
import { CreatePublisherSchema } from './schema/createPublisher';
import { SpotlightAction } from '@mantine/spotlight';

type Publisher = {
  f_publisher_id: string;
  f_name: string;
  f_key: string;
  f_created_at: string;
  f_token: string;
};

type Strategy = {
  f_strategy_id: string;
  f_applet_id: string;
  f_project_id: string;
  f_event_type: string;
  f_handler: string;
};

type Instance = {
  f_instance_id: string;
  f_state: string;
};

type Applet = {
  f_name: string;
  f_applet_id: string;
  f_project_id: string;
  project_name: string;
  strategies: Strategy[];
  instances: Instance[];
};

type Project = {
  f_project_id: string;
  f_name: string;
  f_applet_id: string;
  project_files: FilesListSchema;
  publishers: Publisher[];
  applets: Applet[];
};

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
  updatePassword = new UpdatePasswordSchema({});
  createPublisher = new CreatePublisherSchema({});
  projectList = new ProjectListSchema({
    getDymaicData: () => {
      return {
        ready: this.allProjects.value.length > 0
      };
    }
  });

  allProjects = new PromiseState<() => Promise<any>, Project[]>({
    defaultValue: [],
    function: async () => {
      const res = await trpc.api.projects.query({ accountID: this.config.formData.accountID });
      if (res) {
        const applets = [];
        const instances = [];
        let strategies = [];
        let publishers = [];
        res.forEach((p: any) => {
          p.project_files = new FilesListSchema();
          p.applets.forEach((a) => {
            a.project_name = p.f_name;
            a.instances.forEach((i) => {
              instances.push({
                project_id: p.f_project_id,
                project_name: p.f_name,
                applet_id: a.f_applet_id,
                applet_name: a.f_name,
                ...i
              });
            });
            applets.push({
              ...a,
              project_name: p.f_name
            });
            strategies = strategies.concat(a.strategies);
          });
          publishers = publishers.concat(p.publishers);
        });
        this.allApplets = applets;
        this.allInstances = instances;
        this.allStrategies = strategies;
        this.allPublishers = publishers;
        console.log(toJS(res));
      }
      return res;
    }
  });

  allApplets: Applet[] = [];
  allInstances: Instance[] = [];
  allStrategies: Strategy[] = [];
  allPublishers: Publisher[] = [];

  curProjectIndex = 0;
  get curProject() {
    return this.allProjects.value ? this.allProjects.value[this.curProjectIndex] : null;
  }

  curAppletIndex = 0;
  get curApplet() {
    return this.curProject ? this.curProject.applets[this.curAppletIndex] : null;
  }
  get curFilesList() {
    return this.curProject ? this.curProject.project_files.extraData.files : [];
  }
  get curFilesListSchema() {
    return this.curProject ? this.curProject.project_files : null;
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

  publishEvent = new PublishEventSchema({});

  showContent: 'CURRENT_APPLETS' | 'ALL_APPLETS' | 'ALL_INSTANCES' | 'ALL_STRATEGIES' | 'ALL_PUBLISHERS' | 'EDITOR' | 'LOGS' = 'CURRENT_APPLETS';

  get isLogin() {
    return !!this.config.formData.token;
  }

  get actions(): SpotlightAction[] {
    return [this.createProject, this.createApplet, this.createPublisher].map((i) => ({ title: i.extraData.modal.title, onTrigger: () => i.extraValue.set({ modal: { show: true } }) }));
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
      .on('app.ready', async () => {
        if (this.isLogin) {
          await axios.request({
            method: 'get',
            url: '/srv-applet-mgr/v0/project'
          });
        }
      })
      .on('user.login', () => {
        this.allProjects.call();
        NextRouter.push('/');
      })
      .on('user.update-pwd', () => {})
      .on('project.create', () => {
        this.allProjects.call();
      })
      .on('applet.create', () => {
        this.allProjects.call();
      })
      .on('applet.publish-event', () => {})
      .on('instance.deploy', () => {
        this.allProjects.call();
      })
      .on('instance.handle', () => {
        this.allProjects.call();
      })
      .on('publisher.create', () => {
        this.allProjects.call();
      });
  }

  initHook() {
    hooks.waitLogin().then(() => {
      this.allProjects.call();
    });
  }
}
