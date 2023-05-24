import { FromSchema } from 'json-schema-to-ts';
import { v4 as uuid } from 'uuid';
import { BaseNode } from '../baseNode';
import { IFormType, INodeTypeDescription } from '../types';
import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';

export const DatabaseNodeSchema = {
  type: 'object',
  properties: {
    db: { type: 'string', title: 'Handler' }
  },
  required: ['db']
} as const;

export type DatabaseNodeSchemaType = FromSchema<typeof DatabaseNodeSchema>;

export class DatabaseNode extends BaseNode {
  uuid = uuid();
  description: INodeTypeDescription = {
    displayName: 'Database',
    name: 'DatabaseNode',
    // nodeType: 'code',
    group: 'common',
    groupIcon: 'AiOutlineCode',
    version: '1.0',
    description: 'Webhook node description',
    icon: 'AiOutlineCode',
    withTargetHandle: false,
    withSourceHandle: false,
    isVariableNode: false
  };

  output: {};

  static node_type = 'DatabaseNode';
  static async execute({ input, output, node, callStack, callStackCurIdx, flow, webhookCtx }) {}

  form: IFormType = {
    title: 'Edit Code Node',
    size: '60%',
    formList: [
      {
        label: 'Database',
        form: [
          {
            key: 'JSONFormKey',
            component: 'JSONForm',
            props: {
              formState: new JSONSchemaFormState({
                // @ts-ignore
                schema: DatabaseNodeSchema,
                // afterSubmit: (e) => {
                //   console.log(e, 'xxxx');
                // },
                uiSchema: {
                  'ui:submitButtonOptions': {
                    norender: true,
                    submitText: 'OK'
                  },
                  db: {
                    // @ts-ignore
                    'ui:widget': 'FlowDatabaseWidget',
                    'ui:options': {
                      emptyValue: ``,
                      lang: 'javascript',
                      editorHeight: '400px',
                      docUri: {
                        title: 'SDK Document',
                        uri: 'https://github.com/machinefi/waas-flow-sdk-doc/blob/main/README.md'
                      }
                    }
                  },
                  fieldLabelLayout: {
                    direction: 'horizontal',
                    labelWidth: '200px'
                  }
                },
                value: new JSONValue<any>({
                  default: {
                    db: ''
                  }
                })
              })
            }
          }
        ]
      }
    ]
  };

  constructor() {
    super();
  }
}
