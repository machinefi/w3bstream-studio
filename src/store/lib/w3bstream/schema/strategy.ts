import { JSONSchemaFormState, JSONValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from '@/store/lib/w3bstream/schema/definitions';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { StrategyType } from '@/server/routers/w3bstream';
import { hooks } from '@/lib/hooks';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import { makeObservable, observable, set } from 'mobx';

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
        submitText: 'Submit'
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
                size: 'xs',
                ...defaultButtonStyle,
                onClick: async () => {
                  if (globalThis.store.w3s.config.form.formData.accountRole === 'DEVELOPER') {
                    this.form.uiSchema.appletID = {
                      'ui:widget': 'hidden'
                    };
                  }
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
                        url: `/api/w3bapp/strategy/${item.f_strategy_id}`,
                        data: {
                          appletID,
                          eventType,
                          handler
                        }
                      });
                      showNotification({ message: 'update strategy succeeded' });
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
                size: 'xs',
                ...defaultOutlineButtonStyle,
                onClick() {
                  globalThis.store.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    async onOk() {
                      const p = globalThis.store.w3s.project.allProjects.value.find((p) => p.f_project_id === item.f_project_id);
                      if (!p) {
                        return;
                      }
                      await axios.request({
                        method: 'delete',
                        url: `/api/w3bapp/strategy/x/${p.name}`,
                        params: {
                          strategyID: item.f_strategy_id
                        }
                      });
                      showNotification({ message: 'Deleted successfully' });
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
    rowKey: 'f_strategy_id',
    containerProps: { mt: '10px' }
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
          url: `/api/w3bapp/strategy/x/${applet.project_name}`,
          data: {
            data: [
              {
                appletID,
                eventType,
                handler
              }
            ]
          }
        });
        showNotification({ message: 'create strategy succeeded' });
        eventBus.emit('strategy.create');
      } catch (error) {}
    }
  }

  allData: StrategyType[] = [];

  constructor() {
    makeObservable(this, {
      allData: observable
    });
  }

  set(v: Partial<StrategyModule>) {
    Object.assign(this, v);
  }
}
