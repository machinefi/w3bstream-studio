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
    projects: {
      type: 'string'
    },
    publishers: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    projectID: { $ref: '#/definitions/projects', title: 'Project ID' },
    publisher: { $ref: '#/definitions/publishers', title: 'Publisher' },
    payload: { type: 'string', title: 'Payload' }
  },
  required: ['projectID', 'publisher', 'payload']
} as const;

//@ts-ignore
schema.definitions = {
  projects: definitions.projects,
  publishers: definitions.publishers
};

type SchemaType = FromSchema<typeof schema>;

export default class PublishEventModule {
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
      const { projectID, payload } = e.formData;
      let data = { payload: 'xxx yyy zzz' };
      try {
        data = JSON.parse(payload);
      } catch (error) {}

      const p = rootStore.w3s.allProjects.value.find((item) => item.f_project_id.toString() === projectID);

      const res = await axios.request({
        method: 'post',
        url: `/api/w3bapp/event/${p.f_name}`,
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
        projectID: '',
        publisher: '',
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
          const allPublishers = rootStore.w3s.publisher.table.dataSource;
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

  set(v: Partial<PublishEventModule>) {
    Object.assign(this, v);
  }
}
