import { UiSchema, RJSFSchema } from '@rjsf/utils';
import { makeObservable, computed, toJS, observable, action } from 'mobx';
import validator from '@rjsf/validator-ajv6';
import { IChangeEvent } from '@rjsf/core';
import { helper } from '@/lib/helper';
import { ButtonProps, TableContainerProps } from '@chakra-ui/react';

export class JSONSchemaFormState<T, U = UiSchema> {
  value: JSONValue<T> = new JSONValue();
  schema: RJSFSchema;
  uiSchema: U;
  reactive: boolean = true;
  readonly = false;
  liveValidate = false;
  validator = validator;

  get formData() {
    return this.value.get();
  }
  set formData(value: T) {
    this.value.set(value);
  }
  get dynamicData() {
    return this.getDymaicData();
  }
  getDymaicData = () => {
    return { ready: true };
  };
  onChange = (e: IChangeEvent<T>) => {
    this.value.set(e.formData);
    if (this.afterChange) {
      this.afterChange(e);
    }
  };
  onSubmit = (e: IChangeEvent<T>) => {
    if (this.afterSubmit) {
      this.afterSubmit(e);
    }
  };
  afterSubmit: (e: IChangeEvent<T>) => void;
  afterChange: (e: IChangeEvent<T>) => void;
  reset({ force = false } = {}) {
    if (force) {
      this.value.value = this.value.default;
    } else {
      this.value.reset();
    }
    return this;
  }

  constructor(args: Partial<JSONSchemaFormState<T, U>> = {}) {
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
  set(value: Partial<T>, { onSet = true } = {}) {
    value = this.onSet(value);
    const newVal = helper.deepMerge(this.value, value);
    this.value = toJS(newVal);
    return this.value;
  }
  onSet(value: Partial<T>) {
    return value;
  }
  get() {
    return this.getFormat(this.value);
  }
  getFormat(value: T) {
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

export class JSONModalValue extends JSONSchemaValue<{
  show: boolean;
  title: string;
  autoReset: boolean;
}> {
  constructor(args: Partial<JSONModalValue> = {}) {
    super(args);
  }
}

export type ActionButtonType = {
  props?: ButtonProps;
  text: string;
};
export type Column<T> = { key: string; label: string; render?: (item: T) => any; actions?: (item: T) => ActionButtonType[] };
export type ExtendedTable<U> = {
  key: string;
  columns: Column<U>[];
};
export class JSONSchemaTableState<T = object> {
  columns: Column<T>[] = [];
  dataSource: T[] = [];
  rowKey: string = '';
  extendedTables?: ExtendedTable<any>[] = [];
  initPagination?: {
    page: number;
    limit: number;
  } = {
    page: 1,
    limit: 8
  };
  containerProps?: TableContainerProps = {};

  set(v: Partial<JSONSchemaTableState<T>>) {
    Object.assign(this, v);
  }

  constructor(args: Partial<JSONSchemaTableState<T>> = {}) {
    Object.assign(this, args);
    makeObservable(this, {
      dataSource: observable,
      set: action
    });
  }
}
