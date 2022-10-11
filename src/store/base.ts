import { makeAutoObservable } from 'mobx';
import { ConfirmState } from './lib/Base/Confirm';

export class Base {
  confirm = new ConfirmState();

  constructor() {
    makeAutoObservable(this);
  }
}
