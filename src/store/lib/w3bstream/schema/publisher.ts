import { JSONSchemaFormState, JSONValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from './definitions';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { PublisherType } from '@/server/routers/w3bstream';
import { PublisherTokenRender } from '@/components/JSONTable/FieldRender';
import { UiSchema } from '@rjsf/utils';
import EditorWidget, { EditorWidgetUIOptions } from '@/components/JSONFormWidgets/EditorWidget';
import { ShowRequestTemplatesButtonWidget } from '@/components/IDE/PublishEventRequestTemplates';
import { makeObservable, observable } from 'mobx';
import { helper } from '@/lib/helper';
import { hooks } from '@/lib/hooks';

export const createPublisherSchema = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    projectName: { $ref: '#/definitions/projects', title: 'Project Name' },
    name: { type: 'string', title: 'Name' },
    key: { type: 'string', title: 'Publisher ID' }
  },
  required: ['projectName', 'name', 'key']
} as const;

export const publishEventSchema = {
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
    projectName: { $ref: '#/definitions/projects', title: 'Project Name' },
    publisher: { $ref: '#/definitions/publishers', title: 'Publisher' },
    payload: { type: 'string', title: 'Payload' },
    showRequestTemplates: { type: 'string', title: '' }
  },
  required: ['projectName', 'payload']
} as const;

type CreatePublisherSchemaType = FromSchema<typeof createPublisherSchema>;
type PublishEventSchemaType = FromSchema<typeof publishEventSchema>;

//@ts-ignore
createPublisherSchema.definitions = {
  projects: definitions.projectName
};

//@ts-ignore
publishEventSchema.definitions = {
  projects: definitions.projectName,
  publishers: definitions.publishers
};

export default class PublisherModule {
  createPublisherForm = new JSONSchemaFormState<CreatePublisherSchemaType>({
    //@ts-ignore
    schema: createPublisherSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.createPublisherForm.reset();
    },
    value: new JSONValue<CreatePublisherSchemaType>({
      default: {
        projectName: '',
        name: '',
        key: ''
      }
    })
  });

  publishEventForm = new JSONSchemaFormState<PublishEventSchemaType, UiSchema & { payload: EditorWidgetUIOptions }>({
    //@ts-ignore
    schema: publishEventSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      payload: {
        'ui:widget': EditorWidget,
        'ui:options': {
          emptyValue: `{"payload":""}`,
          showLanguageSelector: true,
          onChangeLanguage: (language) => {
            if (language === 'text') {
              this.publishEventForm.value.set({
                payload: JSON.stringify(
                  [
                    {
                      payload: 'This is is an example payload1'
                    },
                    {
                      payload: 'This is is an example payload2'
                    }
                  ],
                  null,
                  2
                )
              });
            } else {
              this.publishEventForm.value.set({
                payload: JSON.stringify(
                  [
                    {
                      payload: {
                        example: 'This is is an example payload1'
                      }
                    },
                    {
                      payload: {
                        example2: 'This is is an example payload2'
                      }
                    }
                  ],
                  null,
                  2
                )
              });
            }
          }
        }
      },
      showRequestTemplates: {
        'ui:widget': ShowRequestTemplatesButtonWidget
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
    },
    value: new JSONValue<PublishEventSchemaType>({
      default: {
        projectName: '',
        payload: JSON.stringify(
          [
            {
              payload: {
                example: 'This is is an example payload1'
              }
            },
            {
              payload: {
                example2: 'This is is an example payload2'
              }
            }
          ],
          null,
          2
        )
      }
    })
  });
  generateBody() {
    const { publisher, payload } = this.publishEventForm.formData;
    const allPublishers = this.table.dataSource;
    const pub = allPublishers.find((item) => String(item.f_publisher_id) === publisher);
    const header = pub
      ? {
          event_type: 'ANY',
          pub_id: pub.f_key,
          token: pub.f_token,
          pub_time: Date.now()
        }
      : {
          event_type: 'ANY',
          pub_id: '',
          token: '',
          pub_time: Date.now()
        };

    try {
      const body = JSON.parse(payload);
      if (Array.isArray(body)) {
        return {
          events: body.map((item) => ({
            header,
            payload: typeof item?.payload == 'string' ? helper.stringToBase64(item?.payload) : helper.stringToBase64(JSON.stringify(item?.payload))
          }))
        };
      }

      if (body.payload) {
        return {
          events: [
            {
              header,
              payload: helper.stringToBase64(body.payload)
            }
          ]
        };
      }
      return {
        events: [
          {
            header,
            payload: helper.stringToBase64(body)
          }
        ]
      };
    } catch (error) {
      return {
        events: [
          {
            header,
            payload: helper.stringToBase64(payload)
          }
        ]
      };
    }
  }

  showPublishEventRequestTemplates = false;

  table = new JSONSchemaTableState<PublisherType>({
    columns: [
      {
        key: 'f_publisher_id',
        label: 'Publisher ID'
      },
      {
        key: 'f_name',
        label: 'name'
      },
      {
        key: 'project_name',
        label: 'Project Name'
      },
      {
        key: 'f_created_at',
        label: 'created at'
      },
      {
        key: 'f_token',
        label: 'token',
        render: PublisherTokenRender
      },
      {
        key: 'actions',
        label: 'Actions',
        actions: (item) => {
          return [
            {
              props: {
                bg: '#946FFF',
                color: '#fff',
                size: 'xs',
                onClick: async () => {
                  this.createPublisherForm.value.set({
                    projectName: item.project_name,
                    name: item.f_name,
                    key: item.f_key
                  });
                  const formData = await hooks.getFormData({
                    title: 'Edit Publisher',
                    size: 'md',
                    formList: [
                      {
                        form: this.createPublisherForm
                      }
                    ]
                  });
                  const { projectName, name, key } = formData;
                  if (projectName && name && key) {
                    try {
                      await axios.request({
                        method: 'put',
                        url: `/api/w3bapp/publisher/${projectName}/${item.f_publisher_id}`,
                        data: {
                          name,
                          key
                        }
                      });
                      await showNotification({ message: 'update publisher succeeded' });
                      eventBus.emit('publisher.update');
                    } catch (error) {}
                  }
                }
              },
              text: 'Edit'
            },
            {
              props: {
                ml: '8px',
                bg: '#E53E3E',
                color: '#fff',
                size: 'xs',
                onClick() {
                  globalThis.store.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    async onOk() {
                      await axios.request({
                        method: 'delete',
                        url: `/api/w3bapp/publisher/${item.project_name}?publisherID=${item.f_publisher_id}`
                      });
                      await showNotification({ message: 'Deleted successfully' });
                      eventBus.emit('strategy.delete');
                    }
                  });
                }
              },
              text: 'Delete'
            }
          ];
        }
      }
    ],
    rowKey: 'f_publisher_id',
    containerProps: { mt: '10px' }
  });

  allData: PublisherType[] = [];

  constructor() {
    makeObservable(this, {
      showPublishEventRequestTemplates: observable
    });
  }

  set(v: Partial<PublisherModule>) {
    Object.assign(this, v);
  }
}
