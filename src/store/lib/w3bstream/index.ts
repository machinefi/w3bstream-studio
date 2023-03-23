import NextRouter from 'next/router';
import { configure, makeAutoObservable } from 'mobx';
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

configure({
  enforceActions: 'never'
});

export class W3bStream {
  rootStore: RootStore;
  config = new W3bstreamConfigModule();
  user = new UserModule();
  projectManager = new ProjectManager();
  project = new ProjectModule({
    onLoadCompleted: ({ applets, publishers, strategies, instances }) => {
      this.applet.set({
        allData: applets
      });
      this.publisher.set({
        allData: publishers
      });
      this.instances.table.set({
        dataSource: instances
      });
      this.strategy.table.set({
        dataSource: strategies
      });
    }
  });
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

  showContent:
    | 'CURRENT_APPLETS'
    | 'ALL_APPLETS'
    | 'CURRENT_PUBLISHERS'
    | 'ALL_PUBLISHERS'
    | 'CURRENT_EVENT_LOGS'
    | 'ALL_INSTANCES'
    | 'ALL_STRATEGIES'
    | 'EDITOR'
    | 'DOCKER_LOGS'
    | 'ALL_CONTRACT_LOGS'
    | 'All_CHAIN_TX'
    | 'All_CHAIN_HEIGHT'
    | 'METRICS'
    | 'SETTINGS'
    | 'DB_TABLE' = 'CURRENT_APPLETS';

  headerTabs: 'PROJECTS' | 'LABS' | 'SUPPORT' = 'PROJECTS';

  isReady = false;

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
      .on('project.delete', async () => {
        await this.project.allProjects.call();
      })
      .on('applet.create', async () => {
        await this.project.allProjects.call();
        this.projectManager.sync();
      })
      .on('applet.delete', async () => {
        await this.project.allProjects.call();
        this.projectManager.sync();
      })
      .on('applet.publish-event', () => {})
      .on('instance.deploy', async () => {
        await this.project.allProjects.call();
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
        await this.project.allProjects.call();
        this.projectManager.sync();
      })
      .on('postman.request', async () => {
        await this.project.allProjects.call();
      })
      .on('publisher.update', async () => {
        await this.project.allProjects.call();
      })
      .on('publisher.delete', async () => {
        await this.project.allProjects.call();
      })
      .on('strategy.create', async () => {
        await this.project.allProjects.call();
      })
      .on('strategy.update', async () => {
        await this.project.allProjects.call();
      })
      .on('strategy.delete', async () => {
        await this.project.allProjects.call();
      })
      .on('contractlog.create', async () => {
        this.contractLogs.allContractLogs.call();
      })
      .on('contractlog.delete', async () => {
        this.contractLogs.allContractLogs.call();
      })
      .on('chainTx.create', async () => {
        this.chainTx.allChainTx.call();
      })
      .on('chainTx.delete', async () => {
        this.chainTx.allChainTx.call();
      })
      .on('chainHeight.create', async () => {
        this.chainHeight.allChainHeight.call();
      })
      .on('chainHeight.delete', async () => {
        this.chainHeight.allChainHeight.call();
      });
  }

  initHook() {
    hooks.waitLogin().then(async () => {
      await this.project.allProjects.call();
      this.projectManager.sync();
      this.contractLogs.allContractLogs.call();
      this.chainTx.allChainTx.call();
      this.chainHeight.allChainHeight.call();
    });
  }
}
