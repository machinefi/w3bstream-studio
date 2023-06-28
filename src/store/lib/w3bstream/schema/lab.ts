import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { UiSchema } from '@rjsf/utils';
import EditorWidget, { EditorWidgetUIOptions } from '@/components/JSONFormWidgets/EditorWidget';
import { StdIOType, WASM } from '@/server/wasmvm';
import { makeObservable, observable } from 'mobx';
import toast from 'react-hot-toast';
import { StorageState } from '@/store/standard/StorageState';
import FileWidget from '@/components/JSONFormWidgets/FileWidget';
import { eventBus } from '@/lib/event';
import { definitions } from './definitions';
import { helper } from '@/lib/helper';
import IndexerHistoryWidget from '@/components/JSONFormWidgets/IndexerHistoryWidget';
import { JSONHistoryState } from '@/store/standard/JSONHistoryState';
import labSimulateHistoryWidget from '@/components/JSONFormWidgets/labSimulateHistoryWidget';
import { compileAssemblyscript } from '@/components/IDE/Editor/EditorFunctions';
import labSimulateWidget from '@/components/JSONFormWidgets/labSimulateWidget';

export const uploadWasmTemplateFormSchema = {
  type: 'object',
  properties: {
    file: { type: 'string', title: 'Upload File' }
  },
  required: ['file']
} as const;
type UploadWasmTemplateFormSchemaType = FromSchema<typeof uploadWasmTemplateFormSchema>;

export const simulationEventSchema = {
  type: 'object',
  properties: {
    handleFunc: { type: 'string', title: 'Handle Function' },
    wasmPayload: { type: 'string', title: '' },
    history: { type: 'string', title: 'History' },
    simulator: { type: 'string', title: 'Simulator' }
  },
  required: ['handleFunc']
} as const;

export const simulationIndexerSchema = {
  type: 'object',
  definitions: {
    contracts: {
      type: 'string'
    },
    contractsEvents: {
      type: 'string'
    }
  },
  properties: {
    handleFunc: { type: 'string', title: 'Handle Function' },
    chainId: { type: 'number', title: 'Chain ID', default: 4689 },
    contract: { $ref: '#/definitions/contracts', title: 'Contract' },
    contractEventName: { $ref: '#/definitions/contractsEvents', title: 'Contract Event' },
    contractAddress: { type: 'string', title: 'Contract Address' },
    startBlock: { type: 'number', title: 'Start Block', default: 16737070 },
    indexHistory: { type: 'string', title: 'Handle Function' }
  },
  required: ['handleFunc', 'chainId', 'contractEventName', 'contractAddress', 'startBlock']
} as const;

type SimulationEventSchemaType = FromSchema<typeof simulationEventSchema>;
//@ts-ignore
simulationIndexerSchema.definitions = {
  contracts: definitions.labContracts,
  contractsEvents: definitions.labContractEvents
};
type SimulationIndexerSchema = FromSchema<typeof simulationIndexerSchema>;

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
          editorHeight: '200px',
          showLanguageSelector: false
        }
      },
      history: {
        'ui:widget': labSimulateHistoryWidget
      },
      simulator: {
        'ui:widget': labSimulateWidget
      },
      layout: ['handleFunc', 'wasmPayload', 'history', 'simulator']
    },
    value: new JSONValue<SimulationEventSchemaType>({
      default: {
        wasmPayload: JSON.stringify({}, null, 2),
        handleFunc: 'start'
      }
    })
  });

  simulationIndexerForm = new JSONSchemaFormState<SimulationIndexerSchema, UiSchema>({
    //@ts-ignore
    schema: simulationIndexerSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      indexHistory: {
        'ui:widget': IndexerHistoryWidget
      },
      layout: ['handleFunc', ['chainId', 'startBlock'], ['contract', 'contractEventName'], 'contractAddress', 'indexHistory']
    },
    onChange: async (e) => {
      const { contract } = e.formData;
      const { abi, address } = helper.string.validAbi(contract);
      if (address) {
        e.formData.contractAddress = address;
      }
      this.simulationIndexerForm.value.set(e.formData);
      // console.log(contract);
    },
    value: new JSONValue<SimulationIndexerSchema>({
      default: {
        contractAddress: '',
        contract: '',
        contractEventName: '',
        handleFunc: 'start',
        chainId: 4689,
        startBlock: 16737070
      }
    })
  });

  stdout: StdIOType[] = [];
  stderr: StdIOType[] = [];
  payloadCache: StorageState<string>;
  simulationEventHistory = new JSONHistoryState<{
    handleFunc: string;
    wasmPayload: string;
  }>({
    size: 10,
    key: 'lab.simulationEventHistory'
  });

  get simulations() {
    const files = [];
    const findAssemblyScriptCode = (arr) => {
      arr?.forEach((i) => {
        if (i.data?.dataType === 'simulation') {
          files.push({
            label: i.label,
            code: i.data?.code
          });
        } else if (i.type === 'folder') {
          findAssemblyScriptCode(i.children);
        }
      });
    };
    findAssemblyScriptCode(globalThis.store?.w3s?.projectManager.curFilesList ?? []);
    return files || [];
  }

  uploadWasmForm = new JSONSchemaFormState<UploadWasmTemplateFormSchemaType>({
    //@ts-ignore
    schema: uploadWasmTemplateFormSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      file: {
        'ui:widget': FileWidget,
        'ui:options': {
          accept: {
            'application/wasm': ['.wasm']
          },
          tips: `Code Upload`,
          flexProps: {
            h: '200px',
            borderRadius: '8px'
          }
        }
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.uploadWasmForm.reset();
    },
    value: new JSONValue<UploadWasmTemplateFormSchemaType>({
      default: {
        file: ''
      }
    })
  });

  uploadProjectForm = new JSONSchemaFormState<UploadWasmTemplateFormSchemaType>({
    //@ts-ignore
    schema: uploadWasmTemplateFormSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      file: {
        'ui:widget': FileWidget,
        'ui:options': {
          accept: {
            'application/json': ['.json']
          },
          tips: `JSON File Upload`,
          flexProps: {
            h: '200px',
            borderRadius: '8px'
          }
        }
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.uploadWasmForm.reset();
    },
    value: new JSONValue<UploadWasmTemplateFormSchemaType>({
      default: {
        file: ''
      }
    })
  });

  constructor() {
    makeObservable(this, {
      stdout: observable,
      stderr: observable
    });
  }

  async onDebugWASM(wasmPayload: any, needCompile = true, start_func = 'start') {
    const { curFilesListSchema } = globalThis.store.w3s.projectManager;
    let buffer;
    if (needCompile) {
      const { error, binary, text, stats } = await compileAssemblyscript(curFilesListSchema.curActiveFile.data?.code);
      if (error) {
        return toast.error(error.message);
      }
      buffer = Buffer.from(binary);
    } else {
      buffer = Buffer.from(curFilesListSchema.curActiveFile.data?.extraData?.raw);
    }

    const wasi = new WASM(buffer);
    wasi.sendEvent(JSON.stringify(wasmPayload));
    this.payloadCache = new StorageState<string>({
      key: curFilesListSchema.curActiveFile.key + '_payload'
    });
    this.payloadCache.save(JSON.stringify(wasmPayload));
    const { stderr, stdout } = await wasi.start(start_func, false);
    this.stdout = this.stdout.concat(stdout ?? []);
    this.stdout = this.stdout.concat(stderr ?? []);
  }
}
