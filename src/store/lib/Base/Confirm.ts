import { makeAutoObservable } from 'mobx';
import { ConfirmProps } from '@/components/Confirm';

export class ConfirmState {
  isOpen = false;

  confirmProps: ConfirmProps = {};

  constructor() {
    makeAutoObservable(this);
  }

  toggleOpen(val: boolean) {
    this.isOpen = val;
  }

  setConfirmProps(val: Partial<ConfirmProps>) {
    Object.assign(this.confirmProps, val);
  }

  show(confirmProps: Partial<ConfirmProps>) {
    this.setConfirmProps(confirmProps);
    this.toggleOpen(true);
  }
}
