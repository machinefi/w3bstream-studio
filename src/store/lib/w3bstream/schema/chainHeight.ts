import { JSONValue, JSONSchemaFormState, JSONModalValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import { gradientButtonStyle } from '@/lib/theme';
import { definitions } from './definitions';
import { ChainHeightType } from '@/server/routers/w3bstream';
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
    eventType: { type: 'string', title: 'Event Type' },
    chainID: { type: 'number', title: 'Chain ID' },
    height: { type: 'number', title: 'Height' }
  },
  required: ['projectID', 'eventType', 'chainID', 'height']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projectName
};

export default class ChainHeightModule {
  table = new JSONSchemaTableState<ChainHeightType>({
    columns: [
      {
        key: 'f_chain_height_id',
        label: 'ChainTx ID'
      },
      {
        key: 'f_project_name',
        label: 'Project Name'
      },
      {
        key: 'f_finished',
        label: 'Finished'
      },
      {
        key: 'f_event_type',
        label: 'Event Type'
      },
      {
        key: 'f_chain_id',
        label: 'Chain ID'
      },
      {
        key: 'f_height',
        label: 'Height'
      },
      {
        key: 'f_updated_at',
        label: 'Updated At'
      },
      {
        key: 'actions',
        label: 'Actions',
        actions: (item) => {
          return [
            {
              props: {
                bg: '#E53E3E',
                color: '#fff',
                onClick() {
                  rootStore.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    async onOk() {
                      const project = rootStore.w3s.allProjects.value.find((p) => p.f_name === item.f_project_name);
                      try {
                        await axios.request({
                          method: 'delete',
                          url: `/srv-applet-mgr/v0/monitor/chain_height/${project?.f_name}`,
                          data: {
                            chainHeightID: item.f_chain_height_id
                          }
                        });
                        eventBus.emit('chainHeight.delete');
                        toast.success('Deleted successfully');
                      } catch (error) {
                        toast.error('Delete failed');
                      }
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
    rowKey: 'f_chain_height_id',
    containerProps: { mt: '10px', h: 'calc(100vh - 200px)' }
  });

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
      const res = await axios.request({
        method: 'post',
        url: `/srv-applet-mgr/v0/monitor/chain_height/${e.formData.projectID}`,
        data: e.formData
      });
      if (res.data) {
        await showNotification({ message: 'Blockchain height monitor sucessfully created.' });
        eventBus.emit('chainHeight.create');
        this.form.reset();
        this.modal.set({ show: false });
      }
    },
    value: new JSONValue<SchemaType>({
      default: {
        projectID: '',
        eventType: 'DEFAULT',
        chainID: 4690,
        height: 0
      }
    })
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Create blockchain height monitor',
      autoReset: true
    }
  });
}
