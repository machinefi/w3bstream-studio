import { IFormType, INodeType, INodeTypeDescription } from './types';
import { v4 as uuid } from 'uuid';
import { FlowNode } from '../../server/types';
import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';

export const BaseNodeSettingSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', title: 'Node Label' }
  },
  required: ['label']
} as const;

export const BaseNodeForm = ({ label }: { label: string }) => {
  return {
    label: 'Setting',
    form: [
      {
        key: 'JSONForm',
        component: 'JSONForm',
        props: {
          formState: new JSONSchemaFormState({
            // @ts-ignore
            schema: BaseNodeSettingSchema,
            uiSchema: {
              'ui:submitButtonOptions': {
                norender: true
              }
            },
            value: new JSONValue<any>({
              default: {
                label
              }
            })
          })
        }
      }
    ]
  };
};

export class BaseNode implements INodeType {
  uuid: string = uuid();
  description: INodeTypeDescription;
  form: IFormType;
  static execute: (ctx: { input: Record<string, any>; output: Record<string, any>; node: FlowNode[]; callStack: INodeType[]; callStackCurIdx: number }) => Promise<any>;

  toJSON() {
    return {
      uuid: this.uuid,
      description: this.description,
      form: this.form
    };
  }

  // jsonSchema = {};
  // setJSONFormValue = (value: any, formIndex?: 0) => {
  //   const jsonForm = this.form.formList[formIndex]?.form?.find((item) => item.component === 'JSONForm');
  //   jsonForm && (jsonForm.props.formState.value = value);
  // };

  setJSONFormValue = (value: any) => {
    this.form?.formList?.forEach((item, index) => {
      const jsonForm = item.form?.find((item) => item.component === 'JSONForm');
      const formState = jsonForm.props.formState as JSONSchemaFormState<any, any>;
      const newValue = {};
      Object.keys(value).forEach((key) => {
        Object.keys(formState.value.value).forEach((formKey) => {
          if (key === formKey) {
            newValue[key] = value[key];
          }
        });
      });
      jsonForm && formState.value.set(newValue);
    });
    return;
  };

  getJSONFormDefaultValue = () => {
    const value = {};
    this.form?.formList?.forEach((item, index) => {
      const jsonForm = item.form?.find((item) => item.component === 'JSONForm');
      const formState = jsonForm.props.formState as JSONSchemaFormState<any, any>;
      Object.keys(formState.value.value).forEach((key) => {
        value[key] = formState.value.default[key];
      });
    });
    return value;
  };

  getJSONFormValue = () => {
    const value = {};
    this.form?.formList?.forEach((item, index) => {
      const jsonForm = item.form?.find((item) => item.component === 'JSONForm');
      const formState = jsonForm.props.formState as JSONSchemaFormState<any, any>;
      Object.keys(formState.value.value).forEach((key) => {
        value[key] = formState.value.value[key];
      });
    });
    return value;
  };

  constructor(args?: Partial<BaseNode>) {
    Object.assign(this, args);
  }
}
