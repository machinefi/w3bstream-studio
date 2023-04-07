import { FromSchema } from 'json-schema-to-ts';
import { v4 as uuid } from 'uuid';
import { JSONSchemaRenderData } from '@/components/JSONRender';
import { BaseNode } from '../baseNode';
import { IFormType, INodeTypeDescription } from '../types';

export const vmRunTimeNodeSchema = {
  type: 'object',
  properties: {
    handler: { type: 'string', title: 'Handler' },
    console: { type: 'string', title: 'Console' }
  },
  required: ['handler']
} as const;

export const vmRunTimeNodeSettingSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', title: 'Node Label' }
  },
  required: ['label']
} as const;

export type vmRunTimeNodeSchemaType = FromSchema<typeof vmRunTimeNodeSchema>;

export class VmRunTimeNode extends BaseNode {
  uuid = uuid();
  description: INodeTypeDescription = {
    displayName: 'VM runtime',
    name: 'VmRunTimeNode',
    // nodeType: 'runtime',
    icon: 'TbWebhook',
    group: 'runtime',
    groupIcon: '/images/icons/icon_trigger.png',
    version: '1.0',
    description: 'Simulation node description',
    withTargetHandle: true,
    withSourceHandle: false
  };

  static node_type = 'VmRunTimeNode';
  static async execute({ input, output, node, callStack, callStackCurIdx }) {
    node.input = {};
    console.log('VmRunTimeNode', node);
  }

  form: IFormType = {
    title: 'Edit Webhook Node',
    size: '70%',
    formList: [
      {
        label: 'Runtime',
        form: [
          {
            key: 'JSONForm',
            component: 'JSONForm',
            props: {
              formState: {
                schema: vmRunTimeNodeSchema,
                uiSchema: {
                  'ui:submitButtonOptions': {
                    norender: true,
                    submitText: 'OK'
                  },
                  console: {
                    'ui:widget': 'RuntimeConsoleWidget'
                  },
                  fieldLabelLayout: {
                    direction: 'horizontal',
                    labelWidth: '200px'
                  }
                },
                value: {
                  id: '={{uuid()}}',
                  code: 'template'
                }
              }
            }
          }
        ]
      },
      {
        label: 'Setting',
        form: [
          {
            key: 'JSONForm',
            component: 'JSONForm',
            props: {
              formState: {
                schema: vmRunTimeNodeSettingSchema,
                uiSchema: {
                  'ui:submitButtonOptions': {
                    norender: true
                  }
                },
                value: {
                  label: 'VM Runtime'
                }
              }
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
