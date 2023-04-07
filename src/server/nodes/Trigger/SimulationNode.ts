import { FromSchema } from 'json-schema-to-ts';
import { v4 as uuid } from 'uuid';
import { JSONSchemaRenderData } from '@/components/JSONRender';
import { BaseNode } from '../baseNode';
import { IFormType, INodeTypeDescription } from '../types';

export const dataSimulationNodeSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', title: 'ID', readonly: true },
    code: { type: 'string', title: 'Code' }
  },
  required: ['id', 'code']
} as const;

export const dataSimulationNodeSettingSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', title: 'Node Label' }
  },
  required: ['label']
} as const;

export type dataSimulationNodeSchemaType = FromSchema<typeof dataSimulationNodeSchema>;

export class SimulationNode extends BaseNode {
  uuid = uuid();
  description: INodeTypeDescription = {
    displayName: 'Simulation',
    name: 'SimulationNode',
    // nodeType: 'simulation',
    icon: 'TbWebhook',
    group: 'trigger',
    groupIcon: '/images/icons/icon_trigger.png',
    version: '1.0',
    description: 'Simulation node description',
    withTargetHandle: false,
    withSourceHandle: true
  };

  static node_type = 'SimulationNode';
  static async execute({ input, output, node, callStack, callStackCurIdx }) {
    node.input = {};
    node.output = {
      code: node.data.code
    };
    console.log('simulation', node);
    //sdk https://github.com/nuysoft/Mock/wiki/Getting-Started mockjs
  }

  form: IFormType = {
    title: 'Edit Webhook Node',
    size: '70%',
    formList: [
      {
        label: 'Simulation',
        form: [
          {
            key: 'JSONForm',
            component: 'JSONForm',
            props: {
              formState: {
                schema: dataSimulationNodeSchema,
                uiSchema: {
                  'ui:submitButtonOptions': {
                    norender: true,
                    submitText: 'OK'
                  },
                  code: {
                    // @ts-ignore
                    'ui:widget': 'EditorWidget',
                    'ui:options': {
                      emptyValue: ``,
                      lang: 'javascript',
                      editorHeight: '400px'
                    }
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
                schema: dataSimulationNodeSettingSchema,
                uiSchema: {
                  'ui:submitButtonOptions': {
                    norender: true
                  }
                },
                value: {
                  label: 'Simulation'
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
