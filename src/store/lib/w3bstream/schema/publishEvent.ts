import { JSONValue, JSONSchemaState, JSONSchemaModalState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { rootStore } from '@/store/index';
import { showNotification } from '@mantine/notifications';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';
import { definitions } from './definitions';

export const schema = {
  // title: 'Publish Event',
  definitions: {
    publishers: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    // publisher: { $ref: '#/definitions/publishers' },
    payload: { type: 'string', title: 'Payload' }
  },
  required: ['payload']
} as const;

//@ts-ignore
schema.definitions = {
  publishers: definitions.publishers
};

type SchemaType = FromSchema<typeof schema>;

type ExtraDataType = {
  modal: JSONSchemaModalState;
};

export class PublishEventSchema extends JSONSchemaState<SchemaType, ExtraDataType> {
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
        }
      },

      afterSubmit: async (e) => {
        const { projectName, publisher, payload } = e.formData;
        // const { allPublishers } = rootStore.w3s;
        // const pub = allPublishers.find((item) => {
        //   return `[Publisher Id]: ${item.f_publisher_id} [Name]: ${item.f_name}` === publisher;
        // });
        // if (pub) {
        //   const res = await axios.request({
        //     method: 'post',
        //     url: `/srv-applet-mgr/v0/event/${projectName}`,
        //     headers: {
        //       'Content-Type': 'text/plain'
        //     },
        //     data: {
        //       payload,
        //       header: {
        //         token: pub.f_token,
        //         event_type: 2147483647,
        //         pub_id: pub.f_key,
        //         pub_time: Date.now()
        //       }
        //     }
        //   });
        //   if (res.data) {
        //     await showNotification({ message: 'publish event successed' });
        //     eventBus.emit('applet.publish-event');
        //     this.reset();
        //     this.extraValue.set({ modal: { show: false } });
        //   }
        // }

        const res = await axios.request({
          method: 'post',
          url: `/srv-applet-mgr/v0/event/${projectName}`,
          headers: {
            'Content-Type': 'text/plain'
          },
          data: {
            payload
          }
        });
        if (res.data) {
          await showNotification({ message: 'publish event successed' });
          eventBus.emit('applet.publish-event');
          this.reset();
          this.extraValue.set({ modal: { show: false } });
        }
      },
      value: new JSONValue<SchemaType>({
        default: {
          projectName: '',
          // publisher: '',
          payload: ''
        }
      }),
      extraValue: new JSONValue<ExtraDataType>({
        default: {
          modal: { show: false, title: 'Publish Event' }
        }
      })
    });
  }
}
