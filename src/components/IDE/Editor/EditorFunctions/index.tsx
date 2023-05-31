import { helper } from "@/lib/helper";
import toast from 'react-hot-toast';
import reactHotToast from 'react-hot-toast';
import { asc } from 'pages/_app';
import { wasm_vm_sdk } from '@/server/wasmvm/sdk';
import { Button } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { Indexer } from '@/lib/indexer';
import { hooks } from '@/lib/hooks';
import { StorageState } from "@/store/standard/StorageState";
import { TableJSONSchema } from "@/server/wasmvm/sqldb";
import { StdIOType } from "@/server/wasmvm";
//@ts-ignore
import { faker } from '@faker-js/faker';

export const compileAssemblyscript = async (code: string) => {
  let { error, binary, text, stats, stderr } = await asc.compileString(wasm_vm_sdk + code, {
    optimizeLevel: 4,
    runtime: 'stub',
    lib: 'assemblyscript-json/assembly/index',
    debug: true
  });
  let _error = error + '';
  // @ts-ignore
  stderr?.map((i: Uint8Array) => {
    const errorText = new TextDecoder().decode(i);
    if (errorText.includes('ERROR')) {
      // console.log(errorText);
      _error += '\n\n' + errorText;
    }
  });
  return { error: error ? { message: _error } : null, binary, text, stats, stderr };
};

export const compileAndCreateProject = async (needCompile: boolean = true) => {
  const curActiveFile = globalThis.store?.w3s.projectManager.curFilesListSchema.curActiveFile;
  if (needCompile) {
    const { error, binary, text, stats, stderr } = await compileAssemblyscript(curActiveFile.data.code);
    if (error) {
      console.log(error);
      return toast.error(error.message);
    }
    globalThis.store?.w3s.project.createProjectByWasmForm.value.set({
      file: helper.Uint8ArrayToWasmBase64FileData(curActiveFile.label.replace('.ts', '.wasm'), binary)
    });
  } else {
    globalThis.store?.w3s.project.createProjectByWasmForm.value.set({
      file: helper.Uint8ArrayToWasmBase64FileData(curActiveFile.label.replace('.ts', '.wasm'), curActiveFile.data.extraData.raw)
    });
  }

  try {
    await globalThis.store?.w3s.project.createProjectByWasm();
    reactHotToast(
      (t) => (
        <span>
          Creact Project Success
          <Button
            size="sm"
            ml={2}
            onClick={async () => {
              reactHotToast.dismiss(t.id);
              globalThis.store.w3s.currentHeaderTab = 'PROJECTS';
              globalThis.store.w3s.project.resetSelectedNames();
              await globalThis.store?.w3s.project.allProjects.call();
              globalThis.store.w3s.project.allProjects.onSelect(0);
              globalThis.store.w3s.showContent = 'METRICS';
            }}
          >
            Go to
          </Button>
        </span>
      ),
      {
        duration: 5000,
        icon: <CheckCircleIcon color={'green'} />
      }
    );
  } catch (e) {
    console.log(e);
  }
};

export const debugAssemblyscript = async (needCompile = true) => {
  const lab = globalThis.store?.w3s.lab;
  const curActiveFile = globalThis.store?.w3s.projectManager.curFilesListSchema.curActiveFile;
  const payloadCache = new StorageState<string>({
    key: curActiveFile.key + '_payload'
  });
  if (payloadCache.value) {
    lab.simulationEventForm.value.set({
      wasmPayload: payloadCache.value
    });
  } else {
    lab.simulationEventForm.value.set({
      wasmPayload: '{}'
    });
  }
  try {
    // curFilesListSchema.curActiveFile.data?.extraData?.payload ||
    lab.simulationEventForm.afterSubmit = async ({ formData }) => {
      if (formData.wasmPayload) {
        try {
          const wasmPayload = JSON.parse(formData.wasmPayload);
          await lab.onDebugWASM(wasmPayload, needCompile, formData.handleFunc);
          lab.simulationEventHistory.push({ wasmPayload, handleFunc: formData.handleFunc });
        } catch (error) { }
      }
    };
    lab.simulationIndexerForm.afterSubmit = async ({ formData }) => {
      const { contractAddress, chainId, startBlock, contract, contractEventName, handleFunc } = formData;
      let abi: any;
      if (contractAddress && chainId && startBlock && contract && contractEventName) {
        const { abi } = helper.string.validAbi(contract);
        const indexer = new Indexer({
          formData: {
            contractAddress,
            chainId,
            startBlock,
            abi,
            contractEventName
          }
        });
        const payload = await indexer.start();
        await lab.onDebugWASM(payload, needCompile, handleFunc);
        Indexer.indexderHistory.push({ contractAddress, chainId, startBlock, contract, contractEventName, handleFunc });
      }
    };
    hooks.getFormData({
      title: 'Send Simulated Event',
      size: 'xl',
      isAutomaticallyClose: false,
      isCentered: true,
      formList: [
        {
          label: 'Simulate',
          form: lab.simulationEventForm
        },
        {
          label: 'Indexer',
          form: lab.simulationIndexerForm
        }
      ]
    });
  } catch (e) { }
};

export const debugSimulation = () => {
  const lab = globalThis.store.w3s.lab;
  const code = globalThis.store.w3s.projectManager.curFilesListSchema.curActiveFile.data.code;
  const res = new Function('faker', code)(faker);
  const stdio: StdIOType = { '@lv': 'info', msg: res, '@ts': Date.now(), prefix: '' };
  lab.stdout.push(stdio);
};

export const onCreateDB = async () => {
  const curActiveFile = globalThis.store?.w3s.projectManager.curFilesListSchema.curActiveFile;
  const tableJSONSchema: TableJSONSchema = JSON.parse(curActiveFile?.data?.code);
  await globalThis.store.god.sqlDB.createTableByJSONSchema(tableJSONSchema);
};

export { debugDemo } from './demo';