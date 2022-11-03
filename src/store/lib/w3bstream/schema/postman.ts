import { JSONSchemaFormState, JSONValue, JSONModalValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import EditorWidget, { EditorWidgetUIOptions } from '@/components/EditorWidget/index';
import { gradientButtonStyle } from '@/lib/theme';
import { config } from '@/lib/config';
import { rootStore } from '../../../index';
import { showNotification } from '@mantine/notifications';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { UiSchema } from '@rjsf/utils';

export const schema = {
  type: 'object',
  properties: {
    url: { type: 'string' },
    api: { type: 'string', enum: ['account', 'applet', 'project', 'strategy', 'publisher', 'monitor'].map((i) => `/srv-applet-mgr/v0/${i}`) },
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
      }
    },
    value: new JSONValue<SchemaType>({
      default: {
        url: config.NEXT_PUBLIC_API_URL,
        method: 'post',
        headers: {
          Authorization: ''
        },
        body: JSON.stringify({ foo: 'bar' }, null, 2)
      },
      onSet(e) {
        const { api, method } = e;
        if ((api && api != this.value.api) || (method && method != this.value.method)) {
          const name = api.split('/srv-applet-mgr/v0/')[1];
          const template = TEMPLATES[name];
          if (!template) {
            return;
          }
          e.url = config.NEXT_PUBLIC_API_URL + api + template[method].suffix;
          e.body = template[method].body;
        }

        return e;
      }
    }),
    afterSubmit: async (e) => {
      const res = await axios.request({
        url: e.formData.url,
        method: e.formData.method,
        data: JSON.parse(e.formData.body)
      });
      await showNotification({ message: 'requset successed' });
      eventBus.emit('postman.request');
      // this.form.reset();
      // this.modal.set({ show: false });
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
            Authorization: `Bearer ${rootStore.w3s.config.form.formData.token}`
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
  monitor: {
    get: {
      suffix: '',
      body: '{}'
    },
    delete: {
      suffix: '/$PROJECTID',
      body: JSON.stringify(
        {
          contractlogID: '',
          chaintxID: '',
          chainHeightID: ''
        },
        null,
        2
      )
    },
    post: {
      suffix: '/$PROJECTID',
      body: JSON.stringify(
        {
          contractLog: {
            eventType: 'DEFAULT',
            chainID: 4690,
            contractAddress: '${contractAddress}',
            blockStart: '${blockStart}',
            blockEnd: '${blockEnd}',
            topic0: '${topic0}'
          },
          chainTx: {
            eventType: 'DEFAULT',
            chainID: 4690,
            txAddress: '${txAddress}'
          },
          chainHeight: {
            eventType: 'DEFAULT',
            chainID: 4690,
            height: '${height}'
          }
        },
        null,
        2
      )
    },
    put: {
      suffix: '/$PROJECTID',
      body: JSON.stringify({}, null, 2)
    }
  }
};
