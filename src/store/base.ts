import { ConfirmProps } from '@/components/Common/Confirm';
import { makeAutoObservable } from 'mobx';
import { JSONSchemaFormState } from './standard/JSONSchemaState';

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

export type FormListType = {
  label?: string;
  form: JSONSchemaFormState<any>;
};

export class FormModalState {
  isOpen = false;
  title = '';
  size?: string = '2xl';
  formList: FormListType[] = [];
  children?: JSX.Element;

  constructor(args?: Partial<FormModalState>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  setData(v: Partial<FormModalState>) {
    Object.assign(this, v);
  }
}

export class Base {
  confirm = new ConfirmState();
  formModal = new FormModalState();

  constructor() {
    makeAutoObservable(this);
  }
}
