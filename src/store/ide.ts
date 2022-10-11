import { makeAutoObservable } from 'mobx';

export class IDEStore {
  tabIndex = 0;

  TABS = {
    ALLAPPLET: 'ALLAPPLET',
    ALLINSTANCES: 'ALLINSTANCES'
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
        curContent = this.TABS.ALLAPPLET;
        break;
      case 1:
        curContent = this.TABS.ALLINSTANCES;
        break;
      default:
        curContent = this.TABS.ALLAPPLET;
        break;
    }
    return curContent;
  }

  setTabIndex(v: number) {
    this.tabIndex = v;
  }
}
