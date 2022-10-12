import { makeAutoObservable } from 'mobx';

export class IDEStore {
  showContent: 'ALLAPPLET' | 'ALLINSTANCES' = 'ALLAPPLET';

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
