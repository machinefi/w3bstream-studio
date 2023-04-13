import { IFormType, INodeType, INodeTypeDescription } from './types';
import { v4 as uuid } from 'uuid';
import { FlowNode } from '../../server/types';
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
          formState: {
            schema: BaseNodeSettingSchema,
            uiSchema: {
              'ui:submitButtonOptions': {
                norender: true
              }
            },
            value: {
              label
            }
          }
        }
      }
    ]
  };
};

export abstract class BaseNode implements INodeType {
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
  setJSONFormValue = (value: any, formIndex?: 0) => {
    const jsonForm = this.form.formList[formIndex]?.form?.find((item) => item.component === 'JSONForm');
    jsonForm && (jsonForm.props.formState.value = value);
  };

  
}
