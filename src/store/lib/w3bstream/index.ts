import NextRouter from 'next/router';
import { configure, makeAutoObservable, reaction } from 'mobx';
import RootStore from '@/store/root';
import { eventBus } from '@/lib/event';
import { _ } from '@/lib/lodash';
import { hooks } from '@/lib/hooks';
import { ProjectManager } from './project';
import W3bstreamConfigModule from './schema/config';
import UserModule from './schema/user';
import ProjectModule from './schema/project';
import PublisherModule from './schema/publisher';
import StrategyModule from './schema/strategy';
import AppletModule from './schema/applet';
import InstancesModule from './schema/instances';
import PostmanModule from './schema/postman';
import ContractLogModule from './schema/contractLog';
import ChainTxModule from './schema/chainTx';
import ChainHeightModule from './schema/chainHeight';
import DBTableModule from './schema/dbTable';
import MetricsModule from './schema/metrics';
import FlowModule from './schema/flow';
import LabModule from './schema/lab';
import CronJobModule from './schema/cronJob';
import ENVModule from './schema/envs';

configure({
  enforceActions: 'never'
});

export class W3bStream {
  rootStore: RootStore;
  config = new W3bstreamConfigModule();
  user = new UserModule();
  flowModule = new FlowModule();
  projectManager = new ProjectManager();
  project = new ProjectModule();
  applet = new AppletModule();
  instances = new InstancesModule();
  publisher = new PublisherModule();
  postman = new PostmanModule();
  strategy = new StrategyModule();
  contractLogs = new ContractLogModule();
  chainTx = new ChainTxModule();
  chainHeight = new ChainHeightModule();
  dbTable = new DBTableModule();
  metrics = new MetricsModule();
  lab = new LabModule();
  cronJob = new CronJobModule();
  env = new ENVModule();

  showContent:
    | 'METRICS'
    | 'CURRENT_PUBLISHERS'
    | 'CURRENT_EVENT_LOGS'
    | 'EDITOR'
    | 'DOCKER_LOGS'
    | 'CONTRACT_LOGS'
    | 'CHAIN_TX'
    | 'CHAIN_HEIGHT'
    | 'SETTINGS'
    | 'DB_TABLE' = 'METRICS';

  currentHeaderTab: 'PROJECTS' | 'LABS' | 'SUPPORT' | 'FLOW' = 'PROJECTS';

  isReady = false;

  actions = {
    goHome: () => {
      this.currentHeaderTab = 'PROJECTS';
      this.project.allProjects.onSelect(-1);
      this.project.projectDetail.value = null;
    }
  };

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.initEvent();
    this.initWatch();
  }

  initWatch() {
    reaction(
      () => this.currentHeaderTab,
      () => {
        if (this.currentHeaderTab == 'PROJECTS') {
          this.project.allProjects.onSelect(-1);
        }
      }
    );
  }

  initEvent() {
    eventBus
      .on('app.ready', async () => {
        this.isReady = true;
        this.project.allProjects.onSelect(-1);
      })
      .on('user.login', async () => {
        NextRouter.push('/');
      })
      .on('user.update-pwd', () => {})
      .on('project.create', async () => {
        await this.project.allProjects.call();
        this.projectManager.sync();
      })
      .on('project.update', async () => {
        await this.project.allProjects.call();
        await this.project.projectDetail.call();
        this.projectManager.sync();
      })
      .on('project.delete', async () => {
        await this.project.allProjects.call();
      })
      .on('applet.create', async () => {
        await this.project.allProjects.call();
        this.projectManager.sync();
      })
      .on('applet.update', async () => {
        await this.project.allProjects.call();
        await this.project.projectDetail.call();
        this.projectManager.sync();
      })
      .on('applet.delete', async () => {
        await this.project.allProjects.call();
        await this.project.projectDetail.call();
        this.projectManager.sync();
      })
      .on('applet.publish-event', () => {})
      .on('instance.deploy', async () => {
        await this.project.allProjects.call();
        await this.project.projectDetail.call();
        this.projectManager.sync();
      })
      .on('instance.handle', async () => {
        await this.project.allProjects.call();
        this.projectManager.sync();
      })
      .on('instance.delete', async () => {
        await this.project.allProjects.call();
        this.projectManager.sync();
      })
      .on('publisher.create', async () => {
        await this.project.projectDetail.call();
        this.projectManager.sync();
      })
      .on('postman.request', async () => {
        await this.project.projectDetail.call();
      })
      .on('publisher.update', async () => {
        await this.project.projectDetail.call();
      })
      .on('publisher.delete', async () => {
        await this.project.projectDetail.call();
      })
      .on('strategy.create', async () => {
        await this.project.projectDetail.call();
      })
      .on('strategy.update', async () => {
        await this.project.projectDetail.call();
      })
      .on('strategy.delete', async () => {
        await this.project.projectDetail.call();
      })
      .on('contractlog.create', async () => {
        this.project.projectDetail.call();
      })
      .on('contractlog.delete', async () => {
        this.project.projectDetail.call();
      })
      .on('chainTx.create', async () => {
        this.project.projectDetail.call();
      })
      .on('chainTx.delete', async () => {
        this.project.projectDetail.call();
      })
      .on('chainHeight.create', async () => {
        this.project.projectDetail.call();
      })
      .on('chainHeight.delete', async () => {
        this.project.projectDetail.call();
      })
      .on('cronJob.create', async () => {
        this.project.projectDetail.call();
      })
      .on('cronJob.delete', async () => {
        this.project.projectDetail.call();
      });
  }

  async init() {
    hooks.waitLogin().then(async () => {
      await this.project.allProjects.call();
      this.projectManager.sync();
      this.env.envs.call();
    });
  }
}
