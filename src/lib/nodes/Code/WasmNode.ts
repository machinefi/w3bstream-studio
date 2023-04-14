import { FromSchema } from 'json-schema-to-ts';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { BaseNode, BaseNodeForm } from '../baseNode';
import { IFormType, INodeTypeDescription } from '../types';
import { asc } from 'pages/_app';
import { wasm_vm_sdk } from '@/server/wasmvm/sdk';
import { FlowState } from '@/store/standard/FlowState';
import { rootStore } from '@/store/index';
import { eventBus } from '@/lib/event';

export const WasmNodeSchema = {
  type: 'object',
  properties: {
    code: { type: 'string', title: 'Code' }
  },
  required: ['label']
} as const;

const template = `
export function start(rid: i32): i32 {
  Log("start from typescript");
  const message = GetDataByRID(rid);
  Log("wasm received message:" + message);
  return 0;
}
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
    withTargetHandle: false,
    withSourceHandle: false,
    isVariableNode: true
  };

  output: {
    wasm: Uint8Array | null;
  };

  static node_type = 'WasmNode';
  static async execute({ input, output, node, callStack, callStackCurIdx, flow, webhookCtx }) {
    const code = wasm_vm_sdk + node?.data?.code;
    const { error, binary, text, stats, stderr } = await asc.compileString(code, {
      optimizeLevel: 4,
      runtime: 'stub',
      lib: 'assemblyscript-json/assembly/index',
      debug: true
    });
    if (error) {
      console.log(error);
      eventBus.emit('flow.run.result', {
        flowId: node.id,
        success: false,
        errMsg: error.message
      });
      return (node.output = {
        wasm: null
      });
    }
    console.log('wasmnode run', binary);
    node.output = {
      wasm: binary
    };
    eventBus.emit('flow.run.result', {
      flowId: node.id,
      success: true
    });
  }

  form: IFormType = {
    title: 'Edit Code Node',
    size: '60%',
    formList: [
      {
        label: 'WASM Code',
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
                      },
                      showCodeSelector: `={{(()=>{
                          const files = [];
                          const findWasmCode = (arr) => {
                            arr?.forEach((i) => {
                              if (i.data?.dataType === 'assemblyscript') {
                                files.push({ label: i.label, value: i.data.code , id: i.key});
                              } else if (i.type === 'folder') {
                                findWasmCode(i.children);
                              }
                            });
                          };
                          findWasmCode(globalThis.store.w3s.projectManager.curFilesList ?? []);
                          return files || [];
                        })()}}=`
                        .replace(/[\n]/g, '')
                        .replace(/\s+/g, ' ')
                    }
                  },
                  fieldLabelLayout: {
                    direction: 'horizontal',
                    labelWidth: '200px'
                  }
                },
                value: {
                  code: ''
                }
              }
            }
          }
        ]
      },
      BaseNodeForm({ label: 'WASM' })
    ]
  };

  constructor() {
    super();
    this.form.formList[0].form[0].props.formState.value.code = template;
  }
}
