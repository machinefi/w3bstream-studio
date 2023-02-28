import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import EditorWidget, { EditorWidgetUIOptions } from '@/components/JSONFormWidgets/EditorWidget/index';
import { eventBus } from '@/lib/event';
import { UiSchema } from '@rjsf/utils';
import { _ } from '@/lib/lodash';
import { definitions } from './definitions';

export const schema = {
  type: 'object',
  properties: {
    protocol: { type: 'string', enum: ['http/https', 'mqtt'], default: 'http/https' }
  },
  dependencies: {
    protocol: {
      oneOf: [
        {
          properties: {
            protocol: { enum: ['http/https'] },
            api: { type: 'string', enum: ['account', 'applet', 'project', 'strategy', 'publisher', 'monitor/contract_log', 'monitor/chain_tx', 'monitor/chain_height'].map((i) => `/api/w3bapp/${i}`) },
            url: { type: 'string' },
            method: { type: 'string', enum: ['get', 'post', 'put', 'delete'] },
            headers: {
              type: 'object',
              title: 'Headers',
              properties: {
                Authorization: { type: 'string' }
              }
            },
            body: { type: 'string' }
          },
          required: ['url', 'method', 'headers', 'body']
        },
        {
          properties: {
            protocol: { enum: ['mqtt'] },
            topic: { $ref: '#/definitions/projects' },
            publisher: { $ref: '#/definitions/publishers', title: 'Publisher' },
            message: { type: 'string' }
          },
          required: ['topic', 'message']
        }
      ]
    }
  }
} as const;

// @ts-ignore
schema.definitions = {
  projects: definitions.projectName,
  publishers: definitions.publishers
};

type SchemaType = FromSchema<typeof schema>;

export default class PostmanModule {
  form = new JSONSchemaFormState<SchemaType, UiSchema & { body: EditorWidgetUIOptions }>({
    //@ts-ignore
    schema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      body: {
        'ui:widget': EditorWidget,
        'ui:options': {
          emptyValue: '{}'
        }
      },
      message: {
        'ui:widget': EditorWidget,
        'ui:options': {
          emptyValue: '{}'
        }
      }
    },
    value: new JSONValue<SchemaType>({
      default: {
        url: '',
        method: 'post',
        headers: {
          Authorization: ''
        },
        body: JSON.stringify({ foo: 'bar' }, null, 2),
        topic: '$PROJECTNAME',
        message: JSON.stringify(
          {
            header: {
              event_type: 'ANY',
              pub_id: '',
              token: '',
              pub_time: Date.now()
            },
            payload: 'payload'
          },
          null,
          2
        )
      },
      onSet(e: any) {
        const { api, method, publisher } = e;
        if ((api && api != this.value.api) || (api && method && method != this.value.method)) {
          const name = api.split('/api/w3bapp/')[1];
          const template = TEMPLATES[name];
          if (!template) {
            return;
          }
          e.url = window.location.origin + api + template[method].suffix;
          e.body = template[method].body;
        }
        if (publisher && publisher != this.value.publisher) {
          const message = JSON.parse(e.message);
          const allPublishers = globalThis.store.w3s.publisher.table.dataSource;
          const token = allPublishers.find((i: any) => i.f_publisher_id === publisher)?.f_token;
          message.header.pub_id = publisher;
          message.header.token = token;
          message.header.pub_time = Date.now();
          e.message = JSON.stringify(message, null, 2);
        }
        return e;
      }
    }),
    afterSubmit: async (e: any) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
    }
  });
}

type TEMPLATES_TYPE = {
  [x: string]: {
    get: {
      suffix: string;
      body: string;
    };
    delete: {
      suffix: string;
      body: string;
    };
    post: {
      suffix: string;
      body: string;
    };
    put: {
      suffix: string;
      body: string;
    };
  };
};

const TEMPLATES: TEMPLATES_TYPE = {
  account: {
    get: {
      suffix: '',
      body: '{}'
    },
    delete: {
      suffix: '',
      body: '{}'
    },
    post: {
      suffix: '',
      body: JSON.stringify({})
    },
    put: {
      suffix: '',
      body: JSON.stringify({})
    }
  },
  applet: {
    get: {
      suffix: '',
      body: '{}'
    },
    delete: {
      suffix: '',
      body: '{}'
    },
    post: {
      suffix: '/$PROJECTID',
      body: JSON.stringify({ file: '$WASMFILE', info: { projectID: '', appletName: '' } }, null, 2)
    },
    put: { suffix: '/$PROJECTID/$APPLETID', body: JSON.stringify({ file: '$WASMFILE', info: { projectID: '', appletName: '' } }, null, 2) }
  },
  project: {
    get: {
      suffix: '',
      body: '{}'
    },
    delete: {
      suffix: '/$PROJECTNAME',
      body: '{}'
    },
    post: {
      suffix: '',
      body: JSON.stringify({ name: 'project_01' }, null, 2)
    },
    put: {
      suffix: '/$PROJECTID',
      body: JSON.stringify({ name: 'project_01' }, null, 2)
    }
  },
  strategy: {
    get: {
      suffix: '/$PROJECTNAME/$STRATEGYID',
      body: '{}'
    },
    delete: {
      suffix: '/$PROJECTNAME?strategyID=$STRATEGYID',
      body: '{}'
    },
    post: {
      suffix: '/$PROJECTNAME',
      body: JSON.stringify(
        {
          strategies: [
            {
              appletID: '',
              eventType: '2147483647',
              handler: 'start'
            }
          ]
        },
        null,
        2
      )
    },
    put: {
      suffix: '/$PROJECTNAME/$STRATEGYID',
      body: JSON.stringify({ appletID: '', eventType: '2147483647', handler: 'start' }, null, 2)
    }
  },
  publisher: {
    get: {
      suffix: '/$PROJECTNAME/$PUBLISHERID',
      body: '{}'
    },
    delete: {
      suffix: '/$PROJECTNAME?publisherID=$PUBLISHERID',
      body: '{}'
    },
    post: {
      suffix: '/$PROJECTID',
      body: JSON.stringify({ name: '', key: '' }, null, 2)
    },
    put: {
      suffix: '/$PROJECTNAME/$PUBLISHERID',
      body: JSON.stringify({ name: '', key: '' }, null, 2)
    }
  },
  'monitor/contract_log': {
    get: {
      suffix: '',
      body: '{}'
    },
    delete: {
      suffix: '/$PROJECTNAME',
      body: JSON.stringify(
        {
          contractlogID: ''
        },
        null,
        2
      )
    },
    post: {
      suffix: '/$PROJECTNAME',
      body: JSON.stringify(
        {
          eventType: 'DEFAULT',
          chainID: 4690,
          contractAddress: '${contractAddress}',
          blockStart: '${blockStart}',
          blockEnd: '${blockEnd}',
          topic0: '${topic0}'
        },
        null,
        2
      )
    },
    put: {
      suffix: '/$PROJECTNAME',
      body: JSON.stringify({}, null, 2)
    }
  },
  'monitor/chain_tx': {
    get: {
      suffix: '',
      body: '{}'
    },
    delete: {
      suffix: '/$PROJECTNAME',
      body: JSON.stringify(
        {
          chaintxID: ''
        },
        null,
        2
      )
    },
    post: {
      suffix: '/$PROJECTNAME',
      body: JSON.stringify(
        {
          eventType: 'DEFAULT',
          chainID: 4690,
          txAddress: '${txAddress}'
        },
        null,
        2
      )
    },
    put: {
      suffix: '/$PROJECTNAME',
      body: JSON.stringify({}, null, 2)
    }
  },
  'monitor/chain_height': {
    get: {
      suffix: '',
      body: '{}'
    },
    delete: {
      suffix: '/$PROJECTNAME',
      body: JSON.stringify(
        {
          chainHeightID: ''
        },
        null,
        2
      )
    },
    post: {
      suffix: '/$PROJECTNAME',
      body: JSON.stringify(
        {
          eventType: 'DEFAULT',
          chainID: 4690,
          height: '${height}'
        },
        null,
        2
      )
    },
    put: {
      suffix: '/$PROJECTNAME',
      body: JSON.stringify({}, null, 2)
    }
  }
};
