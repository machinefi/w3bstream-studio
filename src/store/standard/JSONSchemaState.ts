import React from 'react';
import { UiSchema, RJSFSchema } from '@rjsf/utils';
import { makeAutoObservable, observable, makeObservable, computed } from 'mobx';
import validator from '@rjsf/validator-ajv6';
import { observer } from 'mobx-react-lite';
import { IChangeEvent, FormState, FormProps } from '@rjsf/core';

export class JSONSchemaState<T> {
  formData: T = {} as T;
  schema: RJSFSchema;
  uiSchema: UiSchema;
  reactive: boolean;
  liveValidate: boolean = false;
  onSubmit: (e: IChangeEvent<T, any>) => void;
  validator = validator;
  onChange = (e) => {
    console.log(e);
    this.formData = e.formData;
  };

  constructor(args: Partial<JSONSchemaState<T>> = {}) {
    Object.assign(this, args);
    if (this.reactive) {
      makeAutoObservable(this, {
        formData: observable
      });
    }
  }
}
