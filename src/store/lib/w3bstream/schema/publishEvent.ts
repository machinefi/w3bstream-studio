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
          emptyValue: `{"payload":""}`,
          onChangeLanguage: (language) => {
            console.log('language:', language);
            if (language === 'text') {
              this.form.value.set({
                payload: `{"example": "This is an example payload"}`
              });
            } else {
              this.form.value.set({
                payload: JSON.stringify(
                  {
                    payload: `{"example": "This is an example payload"}`
                  },
                  null,
                  2
                )
              });
            }
          }
        }
      }
    },
    afterSubmit: async (e) => {
      const { projectID } = e.formData;
      const project = rootStore.w3s.allProjects.value.find((item) => item.f_project_id.toString() === projectID);
      const data = this.generateBody();
      const res = await axios.request({
        method: 'post',
        url: `/srv-applet-mgr/v0/event/${project.f_name}`,
        headers: {
          'Content-Type': 'text/plain'
        },
        data
      });
      if (res.data) {
        await showNotification({ message: 'publish event successed' });
        eventBus.emit('applet.publish-event');
      }
    },
    value: new JSONValue<SchemaType>({
      default: {
        projectID: '',
        publisher: '',
        payload: JSON.stringify(
          {
            payload: `{"example": "This is an example payload"}`
          },
          null,
          2
        )
      }
    })
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Publish Event',
      autoReset: false
    }
  });

  set(v: Partial<PublishEventModule>) {
    Object.assign(this, v);
  }

  generateBody() {
    const { publisher, payload } = this.form.formData;
    const allPublishers = rootStore.w3s.publisher.table.dataSource;
    const pub = allPublishers.find((item) => String(item.f_publisher_id) === publisher);
    const header = {
      event_type: 'ANY',
      pub_id: pub.f_key,
      token: pub.f_token,
      pub_time: Date.now()
    };

    try {
      const body = JSON.parse(payload);
      if (body.payload) {
        return {
          header,
          ...body
        };
      } else {
        return {
          header,
          payload: JSON.stringify(body)
        };
      }
    } catch (error) {
      return {
        header,
        payload: `${payload}`
      };
    }
  }
}
