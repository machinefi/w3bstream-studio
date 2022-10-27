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

export class PostmanSchema {
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
        // console.log(e.api, this.value.api);
        if (e.api != this.value.api) {
          e.url = config.NEXT_PUBLIC_API_URL + e.api;
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
      if (res.data) {
        await showNotification({ message: 'requset successed' });
        eventBus.emit('postman.request');
        // this.form.reset();
        this.modal.set({ show: false });
      }
    }
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Postman'
    },
    onSet: (e) => {
      this.form.value.set({
        headers: {
          Authorization: `Bearer ${rootStore.w3s.config.form.formData.token}`
        }
      });
      return e;
    }
  });
}
