import { UiSchema, RJSFSchema } from '@rjsf/utils';
import { makeAutoObservable, makeObservable, computed, toJS } from 'mobx';
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
  reactive: boolean;
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

export interface JSONSchemaValue {
  value?: any;
  default?: any;
  options?: { force: boolean };
  set: (value: any, options?: JSONSchemaValue['options']) => void;
  setFormat: (value: any) => any;
  get: () => any;
  reset: () => any;
}

export class JSONValue<T> implements JSONSchemaValue {
  value?: T = null as T;
  default?: T = null as T;

  setFormat = (val: T) => val;

  get() {
    return this.value;
  }
  set(val: T) {
    val = this.setFormat(val);
    const newVal = helper.deepMerge(this.value, val);
    this.value = toJS(newVal);
  }
  reset() {
    this.set(this.default);
  }
  constructor(args: Partial<JSONValue<T>> = {}) {
    if (!args.value && args.default) {
      args.value = args.default;
    }
    Object.assign(this, args);

    makeAutoObservable(this);
  }
}

export interface JSONSchemaModalState {
  show: boolean;
  title?: string;
}
