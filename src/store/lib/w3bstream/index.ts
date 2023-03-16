import NextRouter from 'next/router';
import { configure, makeAutoObservable } from 'mobx';
import RootStore from '@/store/root';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { _ } from '@/lib/lodash';
import { trpc } from '@/lib/trpc';
import { hooks } from '@/lib/hooks';
import { PromiseState } from '@/store/standard/PromiseState';
import { AppletType, ChainHeightType, ChainTxType, ContractLogType, ProjectType } from '@/server/routers/w3bstream';
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

configure({
  enforceActions: 'never'
});

export class W3bStream {
  rootStore: RootStore;
  config = new W3bstreamConfigModule();
  user = new UserModule();
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

  allProjects = new PromiseState<() => Promise<any>, ProjectType[]>({
    defaultValue: [],
    function: async () => {
      const res = await trpc.api.projects.query({ accountID: this.config.form.formData.accountID });
      if (res) {
        const applets = [];
        const instances = [];
        let strategies = [];
        let publishers = [];
        res.forEach((p: ProjectType) => {
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
          p.publishers.forEach((pub) => {
            // @ts-ignore
            pub.project_id = p.f_project_id;
            // @ts-ignore
            pub.project_name = p.f_name;
            publishers.push(pub);
          });
        });

        // console.log(toJS(res));

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

      return res;
    }
  });

  get curProject() {
    return this.allProjects.current;
  }

  deployApplet = new PromiseState({
    function: async ({ appletID }: { appletID: string }) => {
      const res = await axios.request({
        method: 'post',
        url: `/api/w3bapp/deploy/applet/${appletID}`
      });
      eventBus.emit('instance.deploy');
      return res.data;
    }
  });

  handleInstance = new PromiseState({
    function: async ({ instaceID, event }: { instaceID: string; event: string }) => {
      const res = await axios.request({
        method: 'put',
        url: `/api/w3bapp/deploy/${instaceID}/${event}`
      });
      eventBus.emit('instance.handle');
      return res.data;
    }
  });

  allContractLogs = new PromiseState<() => Promise<any>, ContractLogType[]>({
    defaultValue: [],
    function: async () => {
      const res = await trpc.api.contractLogs.query();
      if (res) {
        this.contractLogs.table.set({
          dataSource: res
        });
      }
      return res;
    }
  });
  allChainTx = new PromiseState<() => Promise<any>, ChainTxType[]>({
    defaultValue: [],
    function: async () => {
      const res = await trpc.api.chainTx.query();
      if (res) {
        this.chainTx.table.set({
          dataSource: res
        });
      }
      return res;
    }
  });
  allChainHeight = new PromiseState<() => Promise<any>, ChainHeightType[]>({
    defaultValue: [],
    function: async () => {
      const res = await trpc.api.chainHeight.query();
      if (res) {
        this.chainHeight.table.set({
          dataSource: res
        });
      }
      return res;
    }
  });

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
    | 'DB_TABLE' = 'CURRENT_APPLETS';

  isReady = false;

  get isLogin() {
    return !!this.config.form.formData.token;
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
            url: '/api/w3bapp/project'
          });
        }
      })
      .on('user.login', async () => {
        NextRouter.push('/');
      })
      .on('user.update-pwd', () => {})
      .on('project.create', async () => {
        await this.allProjects.call();
        this.projectManager.sync();
      })
      .on('project.delete', async () => {
        await this.allProjects.call();
      })
      .on('applet.create', async () => {
        await this.allProjects.call();
        this.projectManager.sync();
      })
      .on('applet.delete', async () => {
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
      .on('instance.delete', async () => {
        await this.allProjects.call();
        this.projectManager.sync();
      })
      .on('publisher.create', async () => {
        await this.allProjects.call();
        this.projectManager.sync();
      })
      .on('postman.request', async () => {
        await this.allProjects.call();
      })
      .on('publisher.update', async () => {
        await this.allProjects.call();
      })
      .on('publisher.delete', async () => {
        await this.allProjects.call();
      })
      .on('strategy.create', async () => {
        await this.allProjects.call();
      })
      .on('strategy.update', async () => {
        await this.allProjects.call();
      })
      .on('strategy.delete', async () => {
        await this.allProjects.call();
      })
      .on('contractlog.create', async () => {
        this.allContractLogs.call();
      })
      .on('contractlog.delete', async () => {
        this.allContractLogs.call();
      })
      .on('chainTx.create', async () => {
        this.allChainTx.call();
      })
      .on('chainTx.delete', async () => {
        this.allChainTx.call();
      })
      .on('chainHeight.create', async () => {
        this.allChainHeight.call();
      })
      .on('chainHeight.delete', async () => {
        this.allChainHeight.call();
      });
  }

  initHook() {
    hooks.waitLogin().then(async () => {
      await this.allProjects.call();
      this.projectManager.sync();
      this.allContractLogs.call();
      this.allChainTx.call();
      this.allChainHeight.call();
    });
  }
}
