import { JSONValue, JSONSchemaState, JSONSchemaModalState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { rootStore } from '@/store/index';
import { showNotification } from '@mantine/notifications';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';
import { definitions } from './definitions';
import EditorWidget, { EditorWidgetUIOptions } from '@/components/EditorWidget';
import { UiSchema } from '@rjsf/utils';
import { JSONModalValue } from '../../../standard/JSONSchemaState';

export const schema = {
  // title: 'Publish Event',
  definitions: {
    publishers: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    publisher: { $ref: '#/definitions/publishers', title: 'Publisher' },
    payload: { type: 'string', title: 'Payload' }
  },
  required: ['publisher', 'payload']
} as const;

//@ts-ignore
schema.definitions = {
  publishers: definitions.publishers
};

type SchemaType = FromSchema<typeof schema>;

export class PublishEventSchema extends JSONSchemaState<SchemaType, any, UiSchema & { payload: EditorWidgetUIOptions }> {
  constructor(args: Partial<PublishEventSchema> = {}) {
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
        payload: {
          'ui:widget': EditorWidget,
          'ui:options': {
            emptyValue: `{"payload":"xxx yyy zzz"}`
          }
        }
      },

      afterSubmit: async (e) => {
        const { projectName, publisher, payload } = e.formData;
        const { allPublishers } = rootStore.w3s;
        const pub = allPublishers.find((item) => String(item.f_publisher_id) === publisher);
        if (pub) {
          let json = { payload: 'xxx yyy zzz' };
          try {
            json = JSON.parse(payload);
          } catch (error) {}

          const res = await axios.request({
            method: 'post',
            url: `/srv-applet-mgr/v0/event/${projectName}`,
            headers: {
              'Content-Type': 'text/plain'
            },
            data: {
              header: {
                token: pub.f_token,
                event_type: 'ANY',
                pub_id: pub.f_key,
                pub_time: Date.now()
              },
              ...json
            }
          });
          if (res.data) {
            await showNotification({ message: 'publish event successed' });
            eventBus.emit('applet.publish-event');
            this.reset();
            this.modal.set({ show: false });
          }
        }
      },
      value: new JSONValue<SchemaType>({
        default: {
          publisher: '',
          projectName: '',
          payload: JSON.stringify(
            {
              payload: 'xxx yyy zzz'
            },
            null,
            2
          )
        }
      })
    });
  }

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Publish Event'
    }
  });
}
