import { JSONSchemaFormState, JSONValue, JSONModalValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import EditorWidget, { EditorWidgetUIOptions } from '@/components/EditorWidget/index';
import { gradientButtonStyle } from '@/lib/theme';
import { showNotification } from '@mantine/notifications';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { UiSchema } from '@rjsf/utils';

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
              title: '',
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
            topic: { type: 'string' },
            message: { type: 'string' }
          },
          required: ['topic', 'message']
        }
      ]
    }
  }
} as const;

type SchemaType = FromSchema<typeof schema>;

export default class PostmanModule {
  form = new JSONSchemaFormState<SchemaType, UiSchema & { body: EditorWidgetUIOptions }>({
    //@ts-ignore
    schema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit',
        props: {
          w: '100%',
          h: '32px',
          ...gradientButtonStyle
        }
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
            payload: ''
          },
          null,
          2
        )
      },
      onSet(e: any) {
        const { api, method } = e;
        if ((api && api != this.value.api) || (api && method && method != this.value.method)) {
          const name = api.split('/api/w3bapp/')[1];
          const template = TEMPLATES[name];
          if (!template) {
            return;
          }
          e.url = window.location.origin + api + template[method].suffix;
          e.body = template[method].body;
        }
        return e;
      }
    }),
    afterSubmit: async (e: any) => {
      const { protocol } = e.formData;
      if (protocol === 'http/https') {
        await axios.request({
          url: e.formData.url,
          method: e.formData.method,
          data: JSON.parse(e.formData.body)
        });
      }

      if (protocol === 'mqtt') {
        await axios.request({
          url: '/api/mqtt',
          method: 'post',
          data: {
            topic: e.formData.topic,
            message: JSON.parse(e.formData.message)
          }
        });
      }

      await showNotification({ message: 'requset successed' });
      eventBus.emit('postman.request');
    }
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Postman',
      autoReset: false
    },
    onSet: (e) => {
      if (e.show) {
        this.form.value.set({
          headers: {
            Authorization: `Bearer ${globalThis.store.w3s.config.form.formData.token}`
          }
        });
      }

      return e;
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
