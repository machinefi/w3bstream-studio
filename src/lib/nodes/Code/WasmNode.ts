import { FromSchema } from 'json-schema-to-ts';
import { v4 as uuid } from 'uuid';
import { BaseNode } from '../baseNode';
import { IFormType, INodeTypeDescription } from '../types';
import { eventBus } from '@/lib/event';
import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
import { helper } from '@/lib/helper';

export const WasmNodeSchema = {
  type: 'object',
  properties: {
    wasmRaw: { $ref: '#/definitions/wasms', title: 'Wasms' }
  },
  required: ['wasmRaw']
} as const;
//@ts-ignore
WasmNodeSchema.definitions = {
  wasms: {
    type: 'string',
    get enum() {
      const files = [];
      const findAssemblyScriptCode = (arr) => {
        arr?.forEach((i) => {
          if (i.data?.dataType === 'wasm') {
            files.push(helper.Uint8ArrayToBase64(i.data?.extraData?.raw));
          } else if (i.type === 'folder') {
            findAssemblyScriptCode(i.children);
          }
        });
      };
      findAssemblyScriptCode(globalThis.store?.w3s?.projectManager.curFilesList ?? []);
      return files || [];
    },
    get enumNames() {
      const files = [];
      const findAssemblyScriptCode = (arr) => {
        arr?.forEach((i) => {
          if (i.data?.dataType === 'wasm') {
            files.push(i.label);
          } else if (i.type === 'folder') {
            findAssemblyScriptCode(i.children);
          }
        });
      };
      findAssemblyScriptCode(globalThis.store?.w3s?.projectManager.curFilesList ?? []);
      return files || [];
    }
  }
};

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
    node.output = {
      // @ts-ignore
      wasm: helper.base64ToUint8Array(node?.data?.wasmRaw)
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
        label: 'WASM',
        form: [
          {
            key: 'JSONFormKey',
            component: 'JSONForm',
            props: {
              formState: new JSONSchemaFormState({
                // @ts-ignore
                schema: WasmNodeSchema,
                // afterSubmit: (e) => {
                //   console.log(e, 'xxxx');
                // },
                uiSchema: {
                  'ui:submitButtonOptions': {
                    norender: true,
                    submitText: 'OK'
                  },
                  code: {
                    // @ts-ignore
                    'ui:widget': 'EditorWidget',
                    'ui:options': {
                      editorTheme: 'vs-light',
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
                    wasmRaw: ''
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
