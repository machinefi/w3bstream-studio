import React from 'react';
import { UiSchema, RJSFSchema } from '@rjsf/utils';
import { makeAutoObservable, observable, makeObservable, computed, action, reaction, toJS } from 'mobx';
import validator from '@rjsf/validator-ajv6';
import { IChangeEvent, FormState, FormProps } from '@rjsf/core';
import { helper } from '../../lib/helper';

export class JSONSchemaState<T> {
  value: JSONSchemaValue = new JSONValue();
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
  liveValidate: boolean = false;
  validator = validator;
  onChange = (e: IChangeEvent<T, any>) => {
    console.log(456, e);
    if (!e.edit) return;
    this.formData = e.formData;
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

  setData(data: T) {
    this.value.set(data);
  }

  constructor(args: Partial<JSONSchemaState<T>> = {}) {
    Object.assign(this, args);
    if (this.reactive) {
      //@ts-ignore
      makeAutoObservable(this, {
        schema: false,
        uiSchema: false,
        validator: false
      });
      // makeAutoObservable(this, {
      //   formData: observable,
      //   onChange: action.bound,
      //   onSubmit: action.bound
      // });
    }
  }
}

export interface JSONSchemaValue {
  value: any;
  set: (value: any) => void;
  get: () => any;
}

class JSONValue {
  value = {};
  get() {
    return this.value;
  }
  set(val) {
    this.value = { ...this.value, ...val };
  }
  constructor(args: Partial<JSONValue> = {}) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }
}
