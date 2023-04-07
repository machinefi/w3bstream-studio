import { FromSchema } from 'json-schema-to-ts';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { BaseNode } from '../baseNode';
import { IFormType, INodeTypeDescription } from '../types';

export const WasmNodeSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', title: 'Node Label' },
    code: { type: 'string', title: 'Code' }
  },
  required: ['label']
} as const;

const template = `
return ctx.input;
`;

export type WasmNodeSchemaType = FromSchema<typeof WasmNodeSchema>;

export class WasmNode extends BaseNode {
  uuid = uuid();
  description: INodeTypeDescription = {
    displayName: 'WASM Code',
    name: 'WasmNode',
    // nodeType: 'code',
    group: 'code',
    groupIcon: 'AiOutlineCode',
    version: '1.0',
    description: 'Webhook node description',
    icon: 'AiOutlineCode',
    withTargetHandle: true,
    withSourceHandle: true
  };

  static node_type = 'WasmNode';
  static async execute({ input, output, node, callStack, callStackCurIdx, flow, webhookCtx }) {
    const previousNodeInstance = callStack[callStackCurIdx - 1];
    node.input = previousNodeInstance.output;
    console.log('wasmnode run', node);
  }

  form: IFormType = {
    title: 'Edit Code Node',
    size: '60%',
    formList: [
      {
        form: [
          {
            key: 'JSONFormKey',
            component: 'JSONForm',
            props: {
              formState: {
                schema: WasmNodeSchema,
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
                value: {
                  label: 'WASM Code',
                  code: ''
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
    this.form.formList[0].form[0].props.formState.value.code = template;
  }
}
