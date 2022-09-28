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
import { DeployAppletSchma } from './schema/deployApplet';
import { AppletListSchema } from './schema/appletList';

export class W3bStream {
  rootStore: RootStore;

  config = new W3bstreamConfigState({});
  login = loginSchema;
  createProject = new CreateProjectSchema({});
  deployApplet = new DeployAppletSchma({
    getDymaicData: () => {
      return {
        ready: this.projects.value
      };
    }
  });
  appletList = new AppletListSchema({
    getDymaicData: () => {
      return {
        ready: this.projects.value
      };
    }
  });
  // publishEvent = publishEventSchema;

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
      if (data) {
        eventBus.emit('applet.list', data.data);
      }
      return data;
    }
  });

  publishEvent = new PromiseState({
    function: async ({ projectID, appletID, event, msg = 'input a test sentence', publisher = Math.random() }) => {
      const res = await axios.request({
        method: 'post',
        url: `/srv-applet-mgr/v0/event/${projectID}/${appletID}/${event}`,
        headers: {
          publisher,
          'Content-Type': 'text/plain'
        },
        data: msg
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
    eventBus.on('user.login', () => {
      this.projects.call();
    });
    eventBus.on('project.list', (datas) => {
      const [data] = datas;
      if (data) {
        [this.deployApplet.formData.info, this.appletList.formData].forEach((i) => {
          if (!i.projectID) {
            i.projectID = data.projectID;
          }
        });
        this.applets.call({ projectID: data.projectID });
      }
    });
  }

  initHook() {
    hooks.waitLogin().then(() => {
      this.projects.call();
    });
  }
}
