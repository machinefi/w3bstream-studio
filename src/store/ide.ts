import { makeAutoObservable } from 'mobx';

export class IDEStore {
  tabIndex = 0;
  TABS = {
    PROJECT: 'Project Management',
    APPLETS: 'Applets',
    INSTANCE: 'Instance'
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
      case 1:
        curContent = this.TABS.APPLETS;
        break;
      case 2:
        curContent = this.TABS.INSTANCE;
        break;
      default:
        curContent = this.TABS.PROJECT;
        break;
    }
    return curContent;
  }
}
