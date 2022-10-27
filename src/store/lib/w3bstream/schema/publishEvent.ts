import { JSONValue, JSONSchemaFormState, JSONModalValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { rootStore } from '@/store/index';
import { showNotification } from '@mantine/notifications';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';
import { definitions } from './definitions';
import EditorWidget, { EditorWidgetUIOptions } from '@/components/EditorWidget';
import { UiSchema } from '@rjsf/utils';

export const schema = {
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

export class PublishEventSchema {
  form = new JSONSchemaFormState<SchemaType, UiSchema & { payload: EditorWidgetUIOptions }>({
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
      const { projectName, payload } = e.formData;
      let data = { payload: 'xxx yyy zzz' };
      try {
        data = JSON.parse(payload);
      } catch (error) {}

      const res = await axios.request({
        method: 'post',
        url: `/srv-applet-mgr/v0/event/${projectName}`,
        headers: {
          'Content-Type': 'text/plain'
        },
        data
      });
      if (res.data) {
        await showNotification({ message: 'publish event successed' });
        eventBus.emit('applet.publish-event');
        this.form.reset();
        this.modal.set({ show: false });
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
      },
      onSet(e) {
        if (e.publisher && e.publisher != this.value.publisher) {
          const { allPublishers } = rootStore.w3s;
          const pub = allPublishers.find((item) => String(item.f_publisher_id) === e.publisher);
          if (pub) {
            let json = { payload: 'xxx yyy zzz' };
            try {
              json = JSON.parse(this.value.payload);
            } catch (error) {}

            e.payload = JSON.stringify(
              {
                ...json,
                header: {
                  token: pub.f_token,
                  event_type: 'ANY',
                  pub_id: pub.f_key,
                  pub_time: Date.now()
                }
              },
              null,
              2
            );
          }
        }

        return e;
      }
    })
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Publish Event',
      autoReset: true
    }
  });
}
