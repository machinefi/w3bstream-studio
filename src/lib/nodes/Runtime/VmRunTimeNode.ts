import { FromSchema } from 'json-schema-to-ts';
import { v4 as uuid } from 'uuid';
import { JSONSchemaRenderData } from '@/components/JSONRender';
import { BaseNode, BaseNodeForm } from '../baseNode';
import { IFormType, INodeTypeDescription } from '../types';
import { WASM } from '@/server/wasmvm';
import { eventBus } from '@/lib/event';

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
    withSourceHandle: false,
    withVariableHandle: ['wasm']
  };

  static node_type = 'VmRunTimeNode';
  static async execute({ input, output, node, callStack, callStackCurIdx, variables }) {
    const preNode = callStack[callStackCurIdx - 1];
    try {
      const buffer = Buffer.from(variables.wasm);
      const wasi = new WASM(buffer);
      wasi.sendEvent(JSON.stringify(preNode.output));
      const { stderr, stdout } = await wasi.start(node?.data?.handler);
      // const { stderr, stdout } = await eval(`wasi.${node?.data?.handler}()`);
      node.input = {};
      node.output = {};
      eventBus.emit('flow.run.result', {
        flowId: node.id,
        success: true,
        extra: {
          stdout,
          stderr
        }
      });
    } catch (e) {
      eventBus.emit('flow.run.result', {
        flowId: node.id,
        success: false,
        errMsg: e.message
      });
    }
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
                    'ui:widget': 'RuntimeConsoleWidget',
                    'ui:options': {
                      // id: '={{uuid()}}='
                    }
                  },
                  fieldLabelLayout: {
                    direction: 'horizontal',
                    labelWidth: '200px'
                  }
                },
                value: {
                  // id: '={{uuid()}}',
                  // code: 'template'
                  handler: 'start'
                }
              }
            }
          }
        ]
      },
      BaseNodeForm({ label: 'VM runtime' })
    ]
  };

  constructor() {
    super();
  }
}
