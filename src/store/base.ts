import { ConfirmProps } from '@/components/Common/Confirm';
import { makeAutoObservable } from 'mobx';

export class ConfirmState {
  isOpen = false;
  confirmProps: ConfirmProps = {};

  constructor() {
    makeAutoObservable(this);
  }

  toggleOpen(val: boolean) {
    this.isOpen = val;
  }

  show(confirmProps: Partial<ConfirmProps>) {
    Object.assign(this.confirmProps, confirmProps);
    this.toggleOpen(true);
  }
}

export class Base {
  confirm = new ConfirmState();

  constructor() {
    makeAutoObservable(this);
  }
}
