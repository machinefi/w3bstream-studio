import { makeAutoObservable } from 'mobx';

export class IDEStore {
  showContent: 'CURRENT_APPLETS' | 'ALL_APPLETS' | 'ALL_INSTANCES' = 'CURRENT_APPLETS';

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
}
