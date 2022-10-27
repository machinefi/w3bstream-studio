import { JSONSchemaModalState, JSONSchemaState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from '@/store/lib/w3bstream/schema/definitions';
import EditorWidget, { EditorWidgetUIOptions } from '../../../../components/EditorWidget/index';
import { gradientButtonStyle } from '../../../../lib/theme';
import { config } from '../../../../lib/config';
import { rootStore } from '../../../index';
import { hooks } from '../../../../lib/hooks';
import { showNotification } from '@mantine/notifications';
import { axios } from '../../../../lib/axios';
import { eventBus } from '../../../../lib/event';
import { toJS } from 'mobx';
import { UiSchema } from '@rjsf/utils';

export const schema = {
  // export const schema: JSONSchema7 = {
  // title: 'Postman',
  type: 'object',
  properties: {
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
} as const;

type SchemaType = FromSchema<typeof schema>;

type ExtraDataType = {
  modal: JSONSchemaModalState;
};
export class PostmanSchema extends JSONSchemaState<SchemaType, ExtraDataType, UiSchema & { body: EditorWidgetUIOptions }> {
  constructor(args: Partial<PostmanSchema> = {}) {
    super(args);
    this.init({
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
        }
      }),

      afterSubmit: async (e) => {
        const res = await axios.request({
          baseURL: e.formData.url,
          method: e.formData.method,
          url: e.formData.api,
          data: JSON.parse(e.formData.body)
        });
        if (res.data) {
          await showNotification({ message: 'requset successed' });
          eventBus.emit('postman.request');
          //  this.reset()
        }
      },
      extraValue: new JSONValue<ExtraDataType>({
        //@ts-ignore
        default: {
          modal: { show: false, title: 'Postman' }
        },
        onSet: (e) => {
          this.value.set({
            headers: {
              Authorization: `Bearer ${rootStore.w3s.config.formData.token}`
            }
          });
          return e;
        }
      })
    });
  }
}
