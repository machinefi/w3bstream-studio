import { helper, toast } from "@/lib/helper";
import { rootStore } from "@/store/index";
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
import { VM } from '@ethereumjs/vm';
import { Address } from '@ethereumjs/util';
import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { Block } from '@ethereumjs/block';
import { Transaction, AccessListEIP2930TxData, FeeMarketEIP1559TxData, TxData } from '@ethereumjs/tx';
import { defaultAbiCoder as AbiCoder } from '@ethersproject/abi';
import { hexToBytes } from 'ethereum-cryptography/utils';
import ERC20Bytecode from '@/constants/bytecode/ERC20.json';

type TransactionsData = TxData | AccessListEIP2930TxData | FeeMarketEIP1559TxData

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
  const curActiveFile = rootStore?.w3s.projectManager.curFilesListSchema.curActiveFile;
  if (needCompile) {
    const { error, binary, text, stats, stderr } = await compileAssemblyscript(curActiveFile.data.code);
    if (error) {
      console.log(error);
      return toast.error(error.message);
    }
    rootStore?.w3s.project.createProjectByWasmForm.value.set({
      file: helper.Uint8ArrayToWasmBase64FileData(curActiveFile.label.replace('.ts', '.wasm'), binary)
    });
  } else {
    rootStore?.w3s.project.createProjectByWasmForm.value.set({
      file: helper.Uint8ArrayToWasmBase64FileData(curActiveFile.label.replace('.ts', '.wasm'), curActiveFile.data.extraData.raw)
    });
  }

  try {
    await rootStore?.w3s.project.createProjectByWasm();
    reactHotToast(
      (t) => (
        <span>
          Creact Project Success
          <Button
            size="sm"
            ml={2}
            onClick={async () => {
              reactHotToast.dismiss(t.id);
              rootStore.w3s.currentHeaderTab = 'PROJECTS';
              rootStore.w3s.project.resetSelectedNames();
              await rootStore?.w3s.project.allProjects.call();
              rootStore.w3s.project.allProjects.onSelect(0);
              rootStore.w3s.showContent = 'METRICS';
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
  const lab = rootStore?.w3s.lab;
  const curActiveFile = rootStore?.w3s.projectManager.curFilesListSchema.curActiveFile;
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
  const curActiveFile = rootStore?.w3s.projectManager.curFilesListSchema.curActiveFile;
  const tableJSONSchema: TableJSONSchema = JSON.parse(curActiveFile?.data?.code);
  await rootStore.god.sqlDB.createTableByJSONSchema(tableJSONSchema);
};


const common = new Common({ chain: Chain.Rinkeby, hardfork: Hardfork.Istanbul })

export const encodeDeployment = (
  bytecode: string,
  params?: {
    types: any[]
    values: unknown[]
  }
) => {
  const deploymentData = '0x' + bytecode
  if (params) {
    const argumentsEncoded = AbiCoder.encode(params.types, params.values)
    return deploymentData + argumentsEncoded.slice(2)
  }
  return deploymentData
}

export const getAccountNonce = async (vm: VM, accountPrivateKey: Uint8Array) => {
  const address = Address.fromPrivateKey(Buffer.from(accountPrivateKey))
  const account = await vm.stateManager.getAccount(address)
  if (account) {
    return account.nonce
  } else {
    return BigInt(0)
  }
}

export const buildTransaction = (data: Partial<TransactionsData>): TransactionsData => {
  const defaultData: Partial<TransactionsData> = {
    nonce: BigInt(0),
    gasLimit: 2_000_000,
    gasPrice: 1,
    value: 0,
    data: '0x',
  }

  return {
    ...defaultData,
    ...data,
  }
}

async function deployContract(
  vm: VM,
  block: Block,
  senderPrivateKey: Uint8Array,
  deploymentBytecode: string,
  greeting: string
): Promise<Address> {
  // Contracts are deployed by sending their deployment bytecode to the address 0
  // The contract params should be abi-encoded and appended to the deployment bytecode.

  const data = encodeDeployment(deploymentBytecode, {
    types: ['string'],
    values: [greeting],
  })

  const txData = {
    data,
    nonce: await getAccountNonce(vm, senderPrivateKey),
  }

  const tx = Transaction.fromTxData(buildTransaction(txData), { common }).sign(Buffer.from(senderPrivateKey))

  const deploymentResult = await vm.runTx({ tx, block, skipBalance: true })

  if (deploymentResult.execResult.exceptionError) {
    throw deploymentResult.execResult.exceptionError
  }

  return deploymentResult.createdAddress!
}


class Wallet {
  accountPk: Uint8Array;
  accountAddress: Address;
  constructor() {
    this.accountPk = hexToBytes('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109');
    this.accountAddress = Address.fromPrivateKey(Buffer.from(this.accountPk));
  }
}

class BlockChain {
  block: Block
  constructor() {
    this.block = Block.fromBlockData({ header: { extraData: new Uint8Array(97) } }, { common })
  }

  async deploy(contract: string, wallet: Wallet) {
    const vm = await VM.create({ common })
    const bytecode = ERC20Bytecode.bytecode
    const contractAddress = await deployContract(vm, this.block, wallet.accountPk, bytecode, '')
    return contractAddress.toString();
  }
}

export const debugDemo = async () => {
  const lab = globalThis.store.w3s.lab;
  const code = globalThis.store.w3s.projectManager.curFilesListSchema.curActiveFile.data.code;

  let errMsg = '';
  let msg = '';
  try {
    msg = await new Function('Wallet', 'BlockChain', code)(Wallet, BlockChain);
    console.log('[Demo Return Value]:', msg);
  } catch (error) {
    errMsg = error.message;
  }

  const stdio: StdIOType = errMsg
    ? { '@lv': 'error', msg: errMsg, '@ts': Date.now(), prefix: '' }
    : { '@lv': 'info', msg, '@ts': Date.now(), prefix: '' };
  lab.stdout.push(stdio);
}