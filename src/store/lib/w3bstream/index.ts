import NextRouter from 'next/router';
import { configure, makeAutoObservable, toJS } from 'mobx';
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
import { AppletType, ProjectsType, InstanceType, PublisherType, StrategieType } from '@/server/routers/w3bstream';
import { ProjectManager } from './project';
import { PostmanSchema } from './schema/postman';

configure({
  enforceActions: 'never'
});

export class W3bStream {
  rootStore: RootStore;
  config = new W3bstreamConfigState({});
  login = new LoginSchema({});
  projectManager = new ProjectManager();
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
  postman = new PostmanSchema({});
  projectList = new ProjectListSchema({
    getDymaicData: () => {
      return {
        ready: this.allProjects.value.length > 0
      };
    }
  });
  allProjects = new PromiseState<() => Promise<any>, ProjectsType[]>({
    defaultValue: [],
    function: async () => {
      const res = await trpc.api.projects.query({ accountID: this.config.formData.accountID });
      if (res) {
        const applets = [];
        const instances = [];
        let strategies = [];
        let publishers = [];
        res.forEach((p: ProjectsType) => {
          // p.project_files = new FilesListSchema();
          p.applets.forEach((a: AppletType) => {
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

  allApplets: AppletType[] = [];
  allInstances: InstanceType[] = [];
  allStrategies: StrategieType[] = [];
  allPublishers: PublisherType[] = [];

  curProjectIndex = 0;
  get curProject() {
    return this.allProjects.value ? this.allProjects.value[this.curProjectIndex] : null;
  }

  curAppletIndex = 0;
  get curApplet() {
    return this.curProject ? this.curProject.applets[this.curAppletIndex] : null;
  }

  // get curFilesList() {
  //   return this.curProject ? this.curProject.project_files.extraData.files : [];
  // }
  // get curFilesListSchema() {
  //   return this.curProject ? this.curProject.project_files : null;
  // }
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

  showContent: 'CURRENT_APPLETS' | 'ALL_APPLETS' | 'ALL_INSTANCES' | 'ALL_STRATEGIES' | 'ALL_PUBLISHERS' | 'EDITOR' | 'DOCKER_LOGS' = 'CURRENT_APPLETS';

  isReady = false;

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
        this.isReady = true;
        if (this.isLogin) {
          await axios.request({
            method: 'get',
            url: '/srv-applet-mgr/v0/project'
          });
          // this.projectManager.sync();
        }
      })
      .on('user.login', async () => {
        await this.allProjects.call();
        this.projectManager.sync();
        NextRouter.push('/');
      })
      .on('user.update-pwd', () => {})
      .on('project.create', async () => {
        await this.allProjects.call();
        this.projectManager.sync();
      })
      .on('applet.create', async () => {
        await this.allProjects.call();
        this.projectManager.sync();
      })
      .on('applet.publish-event', () => {})
      .on('instance.deploy', async () => {
        await this.allProjects.call();
        this.projectManager.sync();
      })
      .on('instance.handle', async () => {
        await this.allProjects.call();
        this.projectManager.sync();
      })
      .on('publisher.create', async () => {
        await this.allProjects.call();
        this.projectManager.sync();
      })
      .on('postman.request', async () => {
        await this.allProjects.call();
      });
  }

  initHook() {
    hooks.waitLogin().then(async () => {
      console.log('====================================');
      console.log('waitLogin');
      console.log('====================================');
      await this.allProjects.call();
      this.projectManager.sync();
    });
  }
}
