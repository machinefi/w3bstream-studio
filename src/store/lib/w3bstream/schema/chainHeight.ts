import { JSONValue, JSONSchemaFormState, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { eventBus } from '@/lib/event';
import { definitions } from './definitions';
import { ChainHeightType } from '@/server/routers/w3bstream';
import { axios } from '@/lib/axios';
import toast from 'react-hot-toast';
import { defaultOutlineButtonStyle } from '@/lib/theme';

export const schema = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    projectName: { $ref: '#/definitions/projects', title: 'Project Name' },
    eventType: { type: 'string', title: 'Event Type', description: 'Please choose a unique name for the W3bstream event that should be triggered' },
    chainName: { $ref: '#/definitions/blockChainNames', type: 'string', title: 'Chain Name', description: 'The blockchain network that should be monitored' },
    height: { type: 'number', title: 'Height', description: 'The blockchain height at which the the W3bstream event should be triggered.' }
  },
  required: ['projectName', 'eventType', 'chainName', 'height']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projectName,
  blockChainNames: definitions.blockChainNames
};

export default class ChainHeightModule {
  get curProjectChainHeight() {
    return globalThis.store.w3s.project.curProject?.chainHeights || [];
  }

  table = new JSONSchemaTableState<ChainHeightType>({
    columns: [
      {
        key: 'actions',
        label: 'Actions',
        actions: (item) => {
          return [
            {
              props: {
                size: 'xs',
                ...defaultOutlineButtonStyle,
                onClick() {
                  globalThis.store.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    async onOk() {
                      const regex = /(?:[^_]*_){2}(.*)/;
                      const projectName = item.f_project_name.match(regex)[1];
                      try {
                        await axios.request({
                          method: 'delete',
                          url: `/api/w3bapp/monitor/x/${projectName}/chain_height/${item.f_chain_height_id}`
                        });
                        eventBus.emit('chainHeight.delete');
                        toast.success(globalThis.store.lang.t('success.delete.msg'));
                      } catch (error) {
                        toast.error(globalThis.store.lang.t('error.delete.msg'));
                      }
                    }
                  });
                }
              },
              text: 'Delete'
            }
          ];
        }
      },
      // {
      //   key: 'f_chain_height_id',
      //   label: 'ChainTx ID'
      // },
      // {
      //   key: 'f_finished',
      //   label: 'Finished'
      // },
      {
        key: 'f_event_type',
        label: 'Event Type'
      },
      {
        key: 'f_chain_id',
        label: 'Chain Name',
        render: (item) => {
          if (item.f_chain_name) {
            return item.f_chain_name
          } else {
            try {
              return globalThis.store.w3s.env.envs.value?.blockChains.find(i => i.f_chain_id == item.f_chain_id)?.f_chain_name || ''
            } catch (e) {
              return item.f_chain_id
            }
          }
        }
      },
      {
        key: 'f_height',
        label: 'Height'
      }
    ],
    rowKey: 'f_chain_height_id',
    containerProps: { mt: '10px' }
  });

  form = new JSONSchemaFormState<SchemaType>({
    //@ts-ignore
    schema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      chainID: {
        'ui:widget': 'select'
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.form.reset();
    },
    value: new JSONValue<SchemaType>({
      // @ts-ignore
      default: {
        projectName: '',
        eventType: 'DEFAULT',
        chainName: '',
        height: 0
      }
    })
  });
}
