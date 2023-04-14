import { FromSchema } from 'json-schema-to-ts';
import { IFormType, INodeType, INodeTypeDescription } from './types';
import { v4 as uuid } from 'uuid';
import { BaseNode } from './baseNode';
import { z } from 'zod';

function paramGuard<T extends z.ZodType<any, any>>(data: z.infer<T>, schema: T): string {
  try {
    schema.parse(data);
  } catch (err) {
    return err.message;
  }
}

const mintTokenZod = z.object({
  id: z.string().optional(),
  chainId: z.number({
    required_error: 'chainId is required',
    invalid_type_error: 'chainId must be a number',
  }),
  contract_address: z.string({
    required_error: 'contract_address is required',
    invalid_type_error: 'contract_address must be a string',
  }),
  receiver: z.string({
    required_error: 'receiver is required',
    invalid_type_error: 'receiver must be a string',
  }),
});

export const codeNodeSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', title: 'Node Label' },
    code: { type: 'string', title: 'Code' },
  },
  required: ['label'],
} as const;

const template = `
return ctx.input;
`;

export type CodeNodeSchemaType = FromSchema<typeof codeNodeSchema>;

export class CodeNode extends BaseNode {
  uuid = uuid();
  description: INodeTypeDescription = {
    displayName: 'Code',
    name: 'CodeNode',
    // nodeType: 'code',
    group: 'code',
    groupIcon: 'AiOutlineCode',
    version: '1.0',
    description: 'Webhook node description',
    icon: 'AiOutlineCode',
    withTargetHandle: true,
    withSourceHandle: true,
  };

  // static node_type = 'code';
  static async execute({ input, output, node, callStack, callStackCurIdx, flow, webhookCtx }) {
    const previousNodeInstance = callStack[callStackCurIdx - 1];
    node.input = previousNodeInstance.output;
    const sdk = {
      log({ level = 'debug', msg = '' }: { level?: string; msg?: string } = {}) {
        webhookCtx.logs.push({ level, msg });
      },
      env: {
        get: (key: string) => {
          const envs = flow.env;
          if (envs) {
            if (envs[key]) {
              return envs[key];
            } else {
              webhookCtx.err_msg = 'Env variable not found';
              return;
            }
          } else {
            webhookCtx.err_msg = 'Env variable not found';
            return;
          }
        },
      },
     
    };

    const functionInVm = await input?.vm?.run(`async ctx => {
      const sdk = ctx.sdk
      ${node.data.code}
    }`);
    const res = await functionInVm({ input: node.input, sdk });
    node.output = res;
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
                schema: codeNodeSchema,
                uiSchema: {
                  'ui:submitButtonOptions': {
                    norender: true,
                    submitText: 'OK',
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
                        uri: 'https://github.com/machinefi/waas-flow-sdk-doc/blob/main/README.md',
                      },
                    },
                  },
                  fieldLabelLayout: {
                    direction: 'horizontal',
                    labelWidth: '200px',
                  },
                },
                value: {
                  label: 'Code',
                  code: '',
                },
              },
            },
          },
        ],
      },
    ],
  };

  constructor() {
    super();
    this.form.formList[0].form[0].props.formState.value.code = template;
  }
}
