import EditorWidget from '@/components/JSONFormWidgets/EditorWidget';
import { eventBus } from '@/lib/event';
import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';

export const updateFlowSchema = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    code: { type: 'string', title: 'Flow code' }
  },
  required: ['code']
} as const;

type UpdateFlowSchemaType = FromSchema<typeof updateFlowSchema>;

export default class SettingModule {
  updateFlowForm = new JSONSchemaFormState<UpdateFlowSchemaType>({
    //@ts-ignore
    schema: updateFlowSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      code: {
        'ui:widget': EditorWidget,
        'ui:options': {
          language: 'json',
          editorHeight: '400px'
        }
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.updateFlowForm.reset();
    },
    value: new JSONValue<UpdateFlowSchemaType>({
      default: {
        code: JSON.stringify(
          {
            source: { strategies: ['flow_poc'] },
            operators: [
              { opType: 'FILTER', wasmFunc: 'filterAge' },
              { opType: 'MAP', wasmFunc: 'mapTax' },
              { opType: 'WINDOW', wasmFunc: 'groupByAge' },
              { opType: 'REDUCE', wasmFunc: 'reduce' }
            ],
            sink: {
              sinkType: 'RMDB',
              sinkInfo: {
                DBInfo: {
                  endpoint: 'postgres://test_user:test_passwd@127.0.0.1:5432/test?sslmode=disable',
                  DBType: 'postgres',
                  table: 'customer',
                  columns: ['id', 'firstName', 'lastName', 'age', 'taxNumber', 'city']
                }
              }
            }
          },
          null,
          2
        )
      }
    })
  });
}
