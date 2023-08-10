import { JSONSchemaFormState, JSONValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from '@/store/lib/w3bstream/schema/definitions';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { StrategyType } from '@/server/routers/w3bstream';
import { hooks } from '@/lib/hooks';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import toast from 'react-hot-toast';
import InputTagWidget from '@/components/JSONFormWidgets/InputTagWidget';

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
    handler: { type: 'string', title: 'Handler' },
    autoCollectMetric: { type: 'boolean', title: 'Auto Collect Metric',description:"Checking this option the app collects your uploaded data for statistics and charting purposes." },
  },
  required: ['appletID', 'eventType', 'handler']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  applets: definitions.applets
};

export default class StrategyModule {
  get curStrategies() {
    return globalThis.store.w3s.applet.curApplet?.strategies || [];
  }

  form = new JSONSchemaFormState<SchemaType>({
    //@ts-ignore
    schema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.form.reset();
    },
    value: new JSONValue<SchemaType>({
      default: {
        appletID: '',
        eventType: '',
        handler: '',
        autoCollectMetric:false
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
        label: 'Handler'
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
                  this.form.uiSchema.appletID = {
                    'ui:widget': 'hidden'
                  };
                  this.form.value.set({
                    appletID: item.f_applet_id.toString(),
                    eventType: String(item.f_event_type),
                    handler: item.f_handler,
                    autoCollectMetric:item.f_auto_collect_metric == 1 ? true : false
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
                  const { appletID, eventType, handler,autoCollectMetric } = formData;
                  if (appletID && eventType && handler) {
                    try {
                      await axios.request({
                        method: 'put',
                        url: `/api/w3bapp/strategy/${item.f_strategy_id}`,
                        data: {
                          appletID,
                          eventType,
                          handler,
                          autoCollectMetric
                        }
                      });
                      toast.success('update strategy succeeded');
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
    rowKey: 'f_strategy_id',
    containerProps: { mt: '10px' }
  });

  async createStrategy() {
    const curApplet = globalThis.store.w3s.applet.curApplet;
    const curProject = globalThis.store.w3s.project.curProject;
    if (curApplet) {
      this.form.value.set({
        appletID: curApplet.f_applet_id.toString()
      });
      this.form.uiSchema.appletID = {
        'ui:widget': 'hidden'
      };
    }
    const formData = await hooks.getFormData({
      title: 'Create Strategy',
      size: 'xl',
      formList: [
        {
          form: this.form
        }
      ]
    });
    const { appletID, eventType, handler,autoCollectMetric } = formData;
    if (appletID && eventType && handler) {
      try {
        await axios.request({
          method: 'post',
          url: `/api/w3bapp/strategy/x/${curProject?.name}`,
          data: {
            appletID,
            eventType,
            handler,
            autoCollectMetric
          }
        });
        toast.success('create strategy succeeded');
        eventBus.emit('strategy.create');
      } catch (error) {}
    }
  }
}
