import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { UiSchema } from '@rjsf/utils';
import EditorWidget, { EditorWidgetUIOptions } from '@/components/JSONFormWidgets/EditorWidget';
import { StdIOType, WASM } from '@/server/wasmvm';
import { makeObservable, observable } from 'mobx';

export const simulationEventSchema = {
  type: 'object',
  properties: {
    wasmPayload: { type: 'string', title: '' }
  },
  required: []
} as const;

type SimulationEventSchemaType = FromSchema<typeof simulationEventSchema>;

export default class LabModule {
  simulationEventForm = new JSONSchemaFormState<SimulationEventSchemaType, UiSchema & { wasmPayload: EditorWidgetUIOptions }>({
    //@ts-ignore
    schema: simulationEventSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      wasmPayload: {
        'ui:widget': EditorWidget,
        'ui:options': {
          editorHeight: '400px',
          showLanguageSelector: false
        }
      }
    },
    value: new JSONValue<SimulationEventSchemaType>({
      default: {
        wasmPayload: JSON.stringify({}, null, 2)
      }
    })
  });

  stdout: StdIOType[] = [];
  stderr: StdIOType[] = [];

  constructor() {
    makeObservable(this, {
      stdout: observable,
      stderr: observable
    });
  }

  async onDebugWASM(wasmPayload) {
    const { curFilesListSchema } = globalThis.store.w3s.projectManager;
    const buffer = Buffer.from(curFilesListSchema?.curActiveFile.data.extraData?.raw);
    const wasi = new WASM(buffer);
    wasi.sendEvent(JSON.stringify(wasmPayload));
    const { stderr, stdout } = await wasi.start();
    this.stdout = this.stdout.concat(stdout ?? []);
    this.stderr = this.stderr.concat(stderr ?? []);
  }
}
