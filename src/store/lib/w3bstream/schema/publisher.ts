import { JSONSchemaFormState, JSONValue, JSONModalValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from '@/store/lib/w3bstream/schema/definitions';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';
import { PublisherType } from '@/server/routers/w3bstream';
import { PublisherTokenRender } from '@/components/JSONTableRender';
import { rootStore } from '@/store/index';
import toast from 'react-hot-toast';

export const schema = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    projectID: { $ref: '#/definitions/projects', title: 'Project ID' },
    name: { type: 'string', title: 'Name' },
    key: { type: 'string', title: 'Key' }
  },
  required: ['projectID', 'name', 'key']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projects
};

export default class PublisherModule {
  form = new JSONSchemaFormState<SchemaType>({
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
      const { publisherID, projectName, projectID, name, key } = e.formData;
      let res;
      if (publisherID && projectName) {
        res = await axios.request({
          method: 'put',
          url: `/srv-applet-mgr/v0/publisher/${projectName}/${publisherID}`,
          data: {
            name,
            key
          }
        });
      } else {
        res = await axios.request({
          method: 'post',
          url: `/srv-applet-mgr/v0/publisher/${projectID}`,
          data: {
            name,
            key
          }
        });
      }

      if (publisherID) {
        await showNotification({ message: 'update publisher successed' });
        eventBus.emit('publisher.update');
      } else {
        await showNotification({ message: 'create publisher successed' });
        eventBus.emit('publisher.create');
      }

      this.form.reset();
      this.modal.set({ show: false });
    },
    value: new JSONValue<SchemaType>({
      default: {
        publisherID: '',
        projectName: '',
        projectID: '',
        name: '',
        key: ''
      }
    })
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Create Publisher',
      autoReset: true
    }
  });

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
        key: 'f_key',
        label: 'Key'
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
                bg: '#37A169',
                color: '#fff',
                onClick: () => {
                  this.form.value.set({
                    publisherID: item.f_publisher_id,
                    projectName: item.project_name,
                    projectID: item.project_id,
                    name: item.f_name,
                    key: item.f_key
                  });
                  this.modal.set({ show: true, title: 'Edit Publisher' });
                }
              },
              text: 'Edit'
            },
            {
              props: {
                ml: '8px',
                bg: '#E53E3E',
                color: '#fff',
                onClick() {
                  rootStore.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    async onOk() {
                      await axios.request({
                        method: 'delete',
                        url: `/srv-applet-mgr/v0/publisher/${item.project_name}?publisherID=${item.f_publisher_id}`
                      });
                      eventBus.emit('strategy.delete');
                      toast.success('Deleted successfully');
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
    containerProps: { mt: '10px', h: 'calc(100vh - 200px)' }
  });
}

export class PublishEventModule {}
