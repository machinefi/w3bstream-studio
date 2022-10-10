import { makeAutoObservable } from 'mobx';

export class IDEStore {
  tabIndex = 0;

  TABS = {
    PROJECT: 'Project Management',
  };

  projectModal: { show: boolean; type: '' | 'add' | 'detail' } = {
    show: false,
    type: 'add'
  };

  appletModal: { show: boolean; type: '' | 'add' | 'detail' } = {
    show: false,
    type: 'add'
  };

  constructor() {
    makeAutoObservable(this);
  }

  get showContent() {
    let curContent: string = '';
    switch (this.tabIndex) {
      case 0:
        curContent = this.TABS.PROJECT;
        break;
      default:
        curContent = this.TABS.PROJECT;
        break;
    }
    return curContent;
  }

  setTabIndex(v: number) {
    this.tabIndex = v;
  }
}
