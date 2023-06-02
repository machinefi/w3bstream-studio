import { FromSchema } from 'json-schema-to-ts';
import { v4 as uuid } from 'uuid';
import { BaseNode } from '../baseNode';
import { IFormType, INodeTypeDescription } from '../types';
import { wasm_vm_sdk } from '@/server/wasmvm/sdk';
import { eventBus } from '@/lib/event';
import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
import { asc } from '@/components/IDE/Labs';

export const AssemblyScriptNodeSchema = {
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

export type AssemblyScriptNodeSchemaType = FromSchema<typeof AssemblyScriptNodeSchema>;

export class AssemblyScriptNode extends BaseNode {
  uuid = uuid();
  description: INodeTypeDescription = {
    displayName: 'AssemblyScript',
    name: 'AssemblyScriptNode',
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

  static node_type = 'AssemblyScriptNode';
  static async execute({ input, output, node, callStack, callStackCurIdx, flow, webhookCtx }) {
    const code = wasm_vm_sdk + node?.data?.code;
    const { error, binary, text, stats, stderr } = await (
      await asc()
    ).compileString(code, {
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
        label: 'Code',
        form: [
          {
            key: 'JSONFormKey',
            component: 'JSONForm',
            props: {
              formState: new JSONSchemaFormState({
                // @ts-ignore
                schema: AssemblyScriptNodeSchema,
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
                      },
                      showCodeSelector: (() => {
                        const files = [];
                        const findAssemblyScriptCode = (arr) => {
                          arr?.forEach((i) => {
                            if (i.data?.dataType === 'assemblyscript') {
                              files.push({ label: i.label, value: i.data.code, id: i.key });
                            } else if (i.type === 'folder') {
                              findAssemblyScriptCode(i.children);
                            }
                          });
                        };
                        findAssemblyScriptCode(globalThis.store?.w3s?.projectManager.curFilesList ?? []);
                        return files || [];
                      })()
                    }
                  },
                  fieldLabelLayout: {
                    direction: 'horizontal',
                    labelWidth: '200px'
                  }
                },
                value: new JSONValue<any>({
                  default: {
                    code: template
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
