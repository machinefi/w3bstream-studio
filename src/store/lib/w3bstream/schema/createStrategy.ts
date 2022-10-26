import { JSONSchemaModalState, JSONSchemaState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from '@/store/lib/w3bstream/schema/definitions';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';
import { rootStore } from '@/store/index';

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

type ExtraDataType = {
  modal: JSONSchemaModalState;
};

export class CreateStrategySchema extends JSONSchemaState<SchemaType, ExtraDataType> {
  constructor(args: Partial<CreateStrategySchema> = {}) {
    super(args);
    this.init({
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
        const { allApplets } = rootStore.w3s;
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

        this.reset().extraValue.set({ modal: { show: false } });
      },
      value: new JSONValue<SchemaType>({
        default: {
          strategyID: '',
          appletID: '',
          eventType: '',
          handler: ''
        }
      }),
      extraValue: new JSONValue<ExtraDataType>({
        default: {
          modal: { show: false, title: 'Create Strategy' }
        }
      })
    });
  }
}
