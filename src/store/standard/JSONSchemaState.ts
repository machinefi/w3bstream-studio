import { UiSchema, RJSFSchema } from '@rjsf/utils';
import { makeAutoObservable, makeObservable, computed, toJS, observable, action } from 'mobx';
import validator from '@rjsf/validator-ajv6';
import { IChangeEvent } from '@rjsf/core';
import { _ } from '@/lib/lodash';
import { helper } from '../../lib/helper';

export class JSONSchemaState<T, V = any> {
  extraValue: JSONValue<V> = new JSONValue();
  value: JSONValue<T> = new JSONValue();

  get extraData(): V {
    return this.extraValue.get();
  }
  set extraData(value: V) {
    console.log('set')
    this.extraValue.set(value);
  }

  // formData: T = {} as T;
  get formData() {
    return this.value.get();
  }
  set formData(value: T) {
    this.value.set(value);
  }
  schema: RJSFSchema;
  uiSchema: UiSchema;
  reactive: boolean = true;
  readonly = false;
  liveValidate = false;
  validator = validator;

  get dynamicData() {
    return this.getDymaicData();
  }
  getDymaicData = () => {
    return { ready: true };
  };

  onChange = (e: IChangeEvent<T, any>) => {
    console.log(e)
    this.value.set(e.formData);
    if (this.afterChange) {
      this.afterChange(e);
    }
  };
  onSubmit = (e: IChangeEvent<T, any>) => {
    if (this.afterSubmit) {
      this.afterSubmit(e);
    }
  };
  afterSubmit: (e: IChangeEvent<T, any>) => void;
  afterChange: (e: IChangeEvent<T, any>) => void;

  init(data: Partial<JSONSchemaState<T, V>>) {
    Object.assign(this, data);
    return this;
  }

  reset({ force = false } = {}) {
    if (force) {
      this.value.value = this.value.default;
    } else {
      this.value.reset();
    }
    return this;
  }

  constructor(args: Partial<JSONSchemaState<T, V>> = {}) {
    Object.assign(this, args);
    if (this.reactive) {
      //@ts-ignore
      makeObservable(this, {
        formData: computed
      });
    }
  }
}

export abstract class JSONSchemaValue<T> {
  value?: T = null as T;
  default?: T = null as T;
  constructor(args: Partial<JSONSchemaValue<T>> = {}) {
    if (!args.value && args.default) {
      args.value = args.default;
    }
    Object.assign(this, args);
    makeObservable(this, {
      value: observable,
      set: action
    });
  }
  set(value: any) {
    console.log('deepMerge set',value)
    value = this.setFormat(value);
    console.log('deepMerge set',value)
    const newVal = helper.deepMerge(this.value, value);
    console.log('deepMerge set',newVal)
    this.value = toJS(newVal);
    return this.value;
  }
  setFormat(value: any) {
    return value;
  }
  get() {
    console.log('deepMerge get',this.value)
    return this.getFormat(this.value);
  }
  getFormat(value: any) {
    return value;
  }
  reset() {
    this.set(this.default);
  }
}

export class JSONValue<T> extends JSONSchemaValue<T> {
  constructor(args: Partial<JSONValue<T>> = {}) {
    super(args);
  }
}

export interface JSONSchemaModalState {
  show: boolean;
  title?: string;
}
