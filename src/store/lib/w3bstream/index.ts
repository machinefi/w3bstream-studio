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
import FlowModule from './schema/flow';
import LabModule from './schema/lab';
import CronJobModule from './schema/cronJob';
import ENVModule from './schema/envs';
import BlockChainModule from './schema/blockChain';

configure({
  enforceActions: 'never'
});

export class W3bStream {
  rootStore: RootStore;
  config = new W3bstreamConfigModule();
  user = new UserModule();
  flowModule = new FlowModule();
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
      this.strategy.set({
        allData: strategies
      });
    },
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
  lab = new LabModule();
  cronJob = new CronJobModule();
  env = new ENVModule();
  blockChain = new BlockChainModule();

  showContent:
    | 'CURRENT_APPLETS'
    | 'ALL_APPLETS'
    | 'CURRENT_PUBLISHERS'
    | 'ALL_PUBLISHERS'
    | 'CURRENT_EVENT_LOGS'
    | 'ALL_INSTANCES'
    | 'STRATEGIES'
    | 'EDITOR'
    | 'DOCKER_LOGS'
    | 'CONTRACT_LOGS'
    | 'CHAIN_TX'
    | 'CHAIN_HEIGHT'
    | 'METRICS'
    | 'SETTINGS'
    | 'DB_TABLE' = 'CURRENT_APPLETS';

  currentHeaderTab: 'PROJECTS' | 'LABS' | 'SUPPORT' | 'FLOW' = 'PROJECTS';

  isReady = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.initEvent();
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
        this.contractLogs.allContractLogs.call();
        this.chainTx.allChainTx.call();
        this.chainHeight.allChainHeight.call();
      })
      .on('applet.create', async () => {
        await this.project.allProjects.call();
        this.projectManager.sync();
      })
      .on('applet.update', async () => {
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
      })
      .on('cronJob.create', async (projectId: bigint) => {
        this.cronJob.fetchCronJobs(projectId);
      })
      .on('cronJob.delete', async (projectId: bigint) => {
        this.cronJob.fetchCronJobs(projectId);
      })
      .on('metrics.timerange', async (startTime: Date, endTime: Date, step: number) => {
        this.metrics.allMetrics.call(startTime, endTime, step);
      });
  }

  async init() {
    hooks.waitLogin().then(async () => {
      await this.project.allProjects.call();
      this.projectManager.sync();
      this.contractLogs.allContractLogs.call();
      this.chainTx.allChainTx.call();
      this.chainHeight.allChainHeight.call();
      this.metrics.allDBState.call();
      this.env.envs.call();
      this.blockChain.allBlockChain.call();
    });
  }
}
