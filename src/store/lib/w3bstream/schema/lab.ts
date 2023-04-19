import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { UiSchema } from '@rjsf/utils';
import EditorWidget, { EditorWidgetUIOptions } from '@/components/JSONFormWidgets/EditorWidget';
import { StdIOType, WASM } from '@/server/wasmvm';
import { makeObservable, observable } from 'mobx';
import { compileAssemblyscript } from '@/components/IDE/Editor';
import toast from 'react-hot-toast';
import { StorageState } from '@/store/standard/StorageState';

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
  payloadCache: StorageState<string>;

  constructor() {
    makeObservable(this, {
      stdout: observable,
      stderr: observable
    });
  }

  async onDebugWASM(wasmPayload) {
    const { curFilesListSchema } = globalThis.store.w3s.projectManager;
    const { error, binary, text, stats } = await compileAssemblyscript(curFilesListSchema.curActiveFile.data?.code);
    if (error) {
      return toast.error(error.message);
    }
    const buffer = Buffer.from(binary);
    const wasi = new WASM(buffer);
    wasi.sendEvent(JSON.stringify(wasmPayload));
    this.payloadCache = new StorageState<string>({
      key: curFilesListSchema.curActiveFile.key + '_payload'
    });
    this.payloadCache.save(JSON.stringify(wasmPayload));
    const { stderr, stdout } = await wasi.start();
    this.stdout = this.stdout.concat(stdout ?? []);
    this.stderr = this.stderr.concat(stderr ?? []);
  }
}
