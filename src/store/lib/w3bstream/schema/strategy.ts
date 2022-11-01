import { JSONSchemaFormState, JSONValue, JSONModalValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from '@/store/lib/w3bstream/schema/definitions';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';
import { rootStore } from '@/store/index';
import { StrategyType } from '@/server/routers/w3bstream';
import toast from 'react-hot-toast';

export const schema = {
  definitions: {
    applets: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    appletID: { $ref: '#/definitions/applets', title: 'Applet ID' },
    eventType: { type: 'string', title: 'Event Type' },
    handler: { type: 'string', title: 'Handler' }
  },
  required: ['appletID', 'eventType', 'handler']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  applets: definitions.applets
};

export default class StrategyModule {
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
      const { appletID, eventType, handler, strategyID } = e.formData;
      const allApplets = rootStore.w3s.applet.allData;
      const applet = allApplets.find((item) => String(item.f_applet_id) === appletID);
      if (!applet) {
        return;
      }
      let res;
      if (strategyID) {
        res = await axios.request({
          method: 'put',
          url: `/srv-applet-mgr/v0/strategy/${applet.project_name}/${strategyID}`,
          data: {
            appletID,
            eventType,
            handler
          }
        });
      } else {
        res = await axios.request({
          method: 'post',
          url: `/srv-applet-mgr/v0/strategy/${applet.project_name}`,
          data: {
            strategies: [
              {
                appletID,
                eventType,
                handler
              }
            ]
          }
        });
      }

      // if (res.data) {
      //   await showNotification({ message: 'create strategy successed' });
      //   eventBus.emit('strategy.create');
      //   this.reset().extraValue.set({ modal: { show: false } });
      // }

      if (strategyID) {
        await showNotification({ message: 'update strategy successed' });
        eventBus.emit('strategy.update');
      } else {
        await showNotification({ message: 'create strategy successed' });
        eventBus.emit('strategy.create');
      }

      this.form.reset();
      this.modal.set({ show: false });
    },
    value: new JSONValue<SchemaType>({
      default: {
        strategyID: '',
        appletID: '',
        eventType: '',
        handler: ''
      }
    })
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Create Strategy',
      autoReset: true
    }
  });

  table = new JSONSchemaTableState<StrategyType>({
    columns: [
      {
        key: 'f_strategy_id',
        label: 'Strategy ID'
      },
      {
        key: 'f_applet_id',
        label: 'Applet ID'
      },
      {
        key: 'f_project_id',
        label: 'Project ID'
      },
      {
        key: 'f_event_type',
        label: 'Event Type'
      },
      {
        key: 'f_handler',
        label: 'handler'
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
                    strategyID: item.f_strategy_id,
                    appletID: item.f_applet_id.toString(),
                    eventType: String(item.f_event_type),
                    handler: item.f_handler
                  });
                  this.modal.set({ show: true, title: 'Edit Strategy' });
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
                      const p = rootStore.w3s.allProjects.value.find((p) => p.f_project_id === item.f_project_id);
                      if (!p) {
                        return;
                      }
                      await axios.request({
                        method: 'delete',
                        url: `/srv-applet-mgr/v0/strategy/${p.f_name}?strategyID=${item.f_strategy_id}`
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
    rowKey: 'f_strategy_id',
    containerProps: { mt: '10px', h: 'calc(100vh - 200px)' }
  });
}
