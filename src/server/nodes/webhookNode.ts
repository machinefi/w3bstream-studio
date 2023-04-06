import { FromSchema } from 'json-schema-to-ts';
import { IFormType, INodeType, INodeTypeDescription } from './types';
import { v4 as uuid } from 'uuid';
import { BaseNode } from './baseNode';
import { JSONSchemaRenderData } from '@/components/JSONRender';

export const webhookNodeSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', title: 'ID', readonly: true },
    // authentication: {
    //   type: 'string',
    //   title: 'Authentication',
    // },
    // method: {
    //   type: 'string',
    //   title: 'Method',
    //   enum: ['GET', 'POST', 'PUT', 'DELETE'],
    //   default: 'GET',
    // },
    // body: { type: 'string', title: 'Example Event' },
    // submit: { type: 'string', title: ' ' },
  },
  required: ['label', 'authentication', 'method']
} as const;

export const webhookNodeSettingSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', title: 'Node Label' }
  },
  required: ['label']
} as const;

export type WebhookNodeSchemaType = FromSchema<typeof webhookNodeSchema>;

export class WebhookNode extends BaseNode {
  uuid = uuid();
  description: INodeTypeDescription = {
    displayName: 'Webhook',
    name: 'WebhookNode',
    nodeType: 'webhook',
    icon: 'TbWebhook',
    group: 'trigger',
    groupIcon: '/icons/icon_trigger.png',
    version: '1.0',
    description: 'Webhook node description',
    withTargetHandle: false,
    withSourceHandle: true
  };

  static node_type = 'webhook';
  static async execute({ input, output, node, callStack, callStackCurIdx }) {
    node.input = {};
    node.output = {
      url: output.url,
      method: output.method,
      body: output.body,
      headers: output.headers
    };
  }

  form: IFormType = {
    title: 'Edit Webhook Node',
    size: '70%',
    formList: [
      {
        label: 'Webhook',
        form: [
          {
            key: 'JSONForm',
            component: 'JSONForm',
            props: {
              formState: {
                schema: webhookNodeSchema,
                uiSchema: {
                  'ui:submitButtonOptions': {
                    norender: true,
                    submitText: 'OK'
                  },
                  id: {
                    'ui:widget': 'PrefixWidget',
                    'ui:options': {
                      prefix: '={{`${window.location.origin}/api/openapi/webhook/`}}'
                    }
                  },
                  fieldLabelLayout: {
                    direction: 'horizontal',
                    labelWidth: '200px'
                  }
                },
                value: {
                  id: '={{uuid()}}'
                }
              }
            }
          },
          {
            key: 'WebhookSubmitWidget',
            component: 'WebhookSubmitWidget',
            props: {
              templateValue: JSON.stringify(
                {
                  user: '0x0000000000000000000000000000000000000000',
                  point: 10
                },
                null,
                2
              )
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
                schema: webhookNodeSettingSchema,
                uiSchema: {
                  'ui:submitButtonOptions': {
                    norender: true,
                  },
                },
                value: {
                  label: 'Webhook'
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
