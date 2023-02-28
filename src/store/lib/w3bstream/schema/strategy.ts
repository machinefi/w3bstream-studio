import { JSONSchemaFormState, JSONValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from '@/store/lib/w3bstream/schema/definitions';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';
import { StrategyType } from '@/server/routers/w3bstream';
import toast from 'react-hot-toast';
import { hooks } from '@/lib/hooks';

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
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.form.reset();
    },
    value: new JSONValue<SchemaType>({
      default: {
        appletID: '',
        eventType: '',
        handler: ''
      }
    })
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
                onClick: async () => {
                  this.form.value.set({
                    appletID: item.f_applet_id.toString(),
                    eventType: String(item.f_event_type),
                    handler: item.f_handler
                  });
                  const formData = await hooks.getFormData({
                    title: 'Edit Strategy',
                    size: 'md',
                    formList: [
                      {
                        form: this.form
                      }
                    ]
                  });
                  const { appletID, eventType, handler } = formData;
                  if (appletID && eventType && handler) {
                    const allApplets = globalThis.store.w3s.applet.allData;
                    const applet = allApplets.find((item) => String(item.f_applet_id) === appletID);
                    try {
                      await axios.request({
                        method: 'put',
                        url: `/api/w3bapp/strategy/${applet.project_name}/${item.f_strategy_id}`,
                        data: {
                          appletID,
                          eventType,
                          handler
                        }
                      });
                      await showNotification({ message: 'update strategy succeeded' });
                      eventBus.emit('strategy.update');
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
                onClick() {
                  globalThis.store.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    async onOk() {
                      const p = globalThis.store.w3s.allProjects.value.find((p) => p.f_project_id === item.f_project_id);
                      if (!p) {
                        return;
                      }
                      await axios.request({
                        method: 'delete',
                        url: `/api/w3bapp/strategy/${p.f_name}?strategyID=${item.f_strategy_id}`
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

  async createStrategy() {
    const formData = await hooks.getFormData({
      title: 'Create Strategy',
      size: 'md',
      formList: [
        {
          form: this.form
        }
      ]
    });
    const { appletID, eventType, handler } = formData;
    if (appletID && eventType && handler) {
      const allApplets = globalThis.store.w3s.applet.allData;
      const applet = allApplets.find((item) => String(item.f_applet_id) === appletID);
      if (!applet) {
        return;
      }
      try {
        await axios.request({
          method: 'post',
          url: `/api/w3bapp/strategy/${applet.project_name}`,
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
        await showNotification({ message: 'create strategy succeeded' });
        eventBus.emit('strategy.create');
      } catch (error) {}
    }
  }
}
