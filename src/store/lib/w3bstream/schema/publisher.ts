import { JSONSchemaFormState, JSONValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from './definitions';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { PublisherType } from '@/server/routers/w3bstream';
import { PublisherTokenRender } from '@/components/JSONTable/FieldRender';
import { UiSchema } from '@rjsf/utils';
import EditorWidget, { EditorWidgetUIOptions } from '@/components/JSONFormWidgets/EditorWidget';
import { makeObservable, observable } from 'mobx';
import { hooks } from '@/lib/hooks';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import { JSONHistoryState } from '@/store/standard/JSONHistoryState';
import toast from 'react-hot-toast';

export const createPublisherSchema = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    projectName: { $ref: '#/definitions/projects', title: 'Project Name' },
    key: { type: 'string', title: 'Device Name', description: 'Please choose a unique name for this device' }
  },
  required: ['projectName', 'key']
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
    body: { type: 'string', title: 'Body' }
  },
  required: ['projectName', 'body']
} as const;

export const developerPublishEventSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', title: 'Event Type' },
    body: { type: 'string', title: '' }
  },
  required: ['type']
} as const;

type CreatePublisherSchemaType = FromSchema<typeof createPublisherSchema>;
type PublishEventSchemaType = FromSchema<typeof publishEventSchema>;
type DeveloperPublishEventSchemaType = FromSchema<typeof developerPublishEventSchema>;

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
        key: ''
      }
    })
  });

  publishEventForm = new JSONSchemaFormState<PublishEventSchemaType, UiSchema & { body: EditorWidgetUIOptions }>({
    //@ts-ignore
    schema: publishEventSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      body: {
        'ui:widget': EditorWidget,
        'ui:options': {
          editorHeight: '400px',
          lang: 'text',
          showLanguageSelector: true
        }
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
    },
    value: new JSONValue<PublishEventSchemaType>({
      default: {
        projectName: '',
        body: ''
      }
    })
  });

  developerPublishEventForm = new JSONSchemaFormState<DeveloperPublishEventSchemaType, UiSchema & { body: EditorWidgetUIOptions }>({
    //@ts-ignore
    schema: developerPublishEventSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Send'
      },
      body: {
        'ui:widget': EditorWidget,
        'ui:options': {
          editorHeight: '400px',
          lang: 'text',
          showLanguageSelector: false
        }
      }
    },
    afterSubmit: async (e) => {
      // eventBus.emit('base.formModal.afterSubmit', e.formData);
      // this.developerPublishEventForm.reset();
    },
    value: new JSONValue<DeveloperPublishEventSchemaType>({
      default: {
        body: '',
        type: 'DEFAULT'
      }
    })
  });

  showPublishEventRequestTemplates = false;

  table = new JSONSchemaTableState<PublisherType>({
    columns: [
      {
        key: 'f_key',
        label: 'Device Name'
      },
      {
        key: 'f_token',
        label: 'Token',
        render: PublisherTokenRender
      },
      {
        key: 'actions',
        label: 'Actions',
        actions: (item) => {
          return [
            {
              props: {
                size: 'xs',
                ...defaultButtonStyle,
                onClick: async () => {
                  if (globalThis.store.w3s.config.form.formData.accountRole === 'DEVELOPER') {
                    this.createPublisherForm.uiSchema.projectName = {
                      'ui:widget': 'hidden'
                    };
                  }
                  this.createPublisherForm.value.set({
                    projectName: item.project_name,
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
                  const { projectName, key } = formData;
                  if (projectName && key) {
                    try {
                      await axios.request({
                        method: 'put',
                        url: `/api/w3bapp/publisher/x/${projectName}/${item.f_publisher_id}`,
                        data: {
                          key,
                          name: key
                        }
                      });
                      toast.success('update publisher succeeded');
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
                size: 'xs',
                ...defaultOutlineButtonStyle,
                onClick() {
                  globalThis.store.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    async onOk() {
                      await axios.request({
                        method: 'delete',
                        url: `/api/w3bapp/publisher/x/${item.project_name}`,
                        params: {
                          publisherIDs: item.f_publisher_id
                        }
                      });
                      toast.success('Deleted successfully');
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

  records = new JSONHistoryState<{
    type: string;
    body: string;
  }>({
    key: 'publish-event-records'
  });

  constructor() {
    makeObservable(this, {
      showPublishEventRequestTemplates: observable
    });
  }

  set(v: Partial<PublisherModule>) {
    Object.assign(this, v);
  }
}
