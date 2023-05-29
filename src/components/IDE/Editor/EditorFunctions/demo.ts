import { VM } from '@ethereumjs/vm';
import { Address } from '@ethereumjs/util';
import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { Block } from '@ethereumjs/block';
import { Transaction, AccessListEIP2930TxData, FeeMarketEIP1559TxData, TxData } from '@ethereumjs/tx';
import { defaultAbiCoder as AbiCoder } from '@ethersproject/abi';
import { hexToBytes } from 'ethereum-cryptography/utils';
import Web3 from 'web3';
import { StdIOType } from '@/server/wasmvm';
import { helper } from '@/lib/helper';
import { Contract } from 'ethers';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { trpc } from '@/lib/trpc';
import { compileAssemblyscript } from '.';

type TransactionsData = TxData | AccessListEIP2930TxData | FeeMarketEIP1559TxData;

const common = new Common({ chain: Chain.Rinkeby, hardfork: Hardfork.Istanbul });

export const encodeDeployment = (
  bytecode: string,
  params?: {
    types: any[];
    values: unknown[];
  }
) => {
  const deploymentData = '0x' + bytecode;
  if (params) {
    const argumentsEncoded = AbiCoder.encode(params.types, params.values);
    return deploymentData + argumentsEncoded.slice(2);
  }
  return deploymentData;
};

export const getAccountNonce = async (vm: VM, accountPrivateKey: Uint8Array) => {
  const address = Address.fromPrivateKey(Buffer.from(accountPrivateKey));
  const account = await vm.stateManager.getAccount(address);
  if (account) {
    return account.nonce;
  } else {
    return BigInt(0);
  }
};

export const buildTransaction = (data: Partial<TransactionsData>): TransactionsData => {
  const defaultData: Partial<TransactionsData> = {
    nonce: BigInt(0),
    gasLimit: 2_000_000,
    gasPrice: 1,
    value: 0,
    data: '0x'
  };

  return {
    ...defaultData,
    ...data
  };
};

async function deployContract(vm: VM, block: Block, senderPrivateKey: Uint8Array, deploymentBytecode: string, greeting: string): Promise<Address> {
  // Contracts are deployed by sending their deployment bytecode to the address 0
  // The contract params should be abi-encoded and appended to the deployment bytecode.

  const data = encodeDeployment(deploymentBytecode, {
    types: ['string'],
    values: [greeting]
  });

  const txData = {
    data,
    nonce: await getAccountNonce(vm, senderPrivateKey)
  };

  const tx = Transaction.fromTxData(buildTransaction(txData), { common }).sign(Buffer.from(senderPrivateKey));

  const deploymentResult = await vm.runTx({ tx, block, skipBalance: true });

  if (deploymentResult.execResult.exceptionError) {
    throw deploymentResult.execResult.exceptionError;
  }

  return deploymentResult.createdAddress!;
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
  block: Block;

  constructor() {
    this.block = Block.fromBlockData({ header: { extraData: new Uint8Array(97) } }, { common });
  }

  async deploy(contract: string, wallet: Wallet) {
    const { curFilesListSchema } = globalThis.store.w3s.projectManager;
    const contractFiles = curFilesListSchema.findFilesByLabel(curFilesListSchema.files, contract);
    const contractFile = contractFiles[0];
    if (!contractFile) {
      throw new Error('Contract file not found');
    }
    const { bytecode, abi } = helper.json.safeParse(contractFile.data.code);
    const vm = await VM.create({ common });
    const contractAddress = await deployContract(vm, this.block, wallet.accountPk, bytecode, '');
    const address = contractAddress.toString();
    const web3 = new Web3('http://localhost:8545');
    const instance = new web3.eth.Contract(abi, address);
    return {
      address,
      instance
    };
  }
}

class W3bstream {
  assemblyScript: string;
  operator: Wallet;
  contract: {
    address: string;
    instance: Contract;
  };
  projectID: string;

  constructor(args: {
    assemblyScript: string;
    operator: Wallet;
    contract: {
      address: string;
      instance: Contract;
    };
  }) {
    Object.assign(this, args);
  }

  async createProject() {
    const { curFilesListSchema } = globalThis.store.w3s.projectManager;
    const wasmFiles = curFilesListSchema.findFilesByLabel(curFilesListSchema.files, this.assemblyScript);
    const wasmFile = wasmFiles[0];
    if (!wasmFile) {
      throw new Error('AssemblyScript file not found');
    }
    const wasmName = wasmFile.label;
    const projectName = `demo_${wasmName.replace('.ts', '')}`;
    const p = globalThis.store.w3s.project.allProjects.value.find((p) => p.name === projectName);
    if (p) {
      this.projectID = p.f_project_id;
      return;
    }
    const { error, binary } = await compileAssemblyscript(wasmFile.data.code);
    if (error) {
      throw new Error(error.message);
    }
    const wasmRaw = helper.Uint8ArrayToWasmBase64FileData(wasmName.replace('.ts', '.wasm'), binary);
    const projectData = {
      name: projectName,
      description: '',
      applets: [{ wasmRaw, appletName: 'applet_01' }],
      datas: []
    };
    const res = await axios.request({
      method: 'post',
      url: `/api/init`,
      data: {
        project: [projectData]
      }
    });
    if (res.data?.message === 'OK') {
      this.projectID = res.data.createdProjectIds[0];
      await globalThis.store.w3s.dbTable.importTables({
        projectID: this.projectID,
        schemas: [
          {
            schemaName: 'public',
            tables: [
              {
                tableName: 'demo',
                tableSchema: 'public',
                comment: '',
                columns: [
                  {
                    name: 'id',
                    type: 'int8',
                    isIdentity: true,
                    isNullable: false,
                    isUnique: false,
                    isPrimaryKey: true,
                    comment: 'primary id'
                  },
                  {
                    name: 'data',
                    type: 'jsonb',
                    defaultValue: null,
                    isIdentity: false,
                    isNullable: true,
                    isUnique: false,
                    isPrimaryKey: false,
                    comment: ''
                  }
                ],
                relationships: []
              }
            ]
          }
        ]
      });
      eventBus.emit('project.create');
    } else {
      throw new Error('create project failed');
    }
  }

  async upload(json: { data: { [x: string]: any } }[]) {
    await this.createProject();
    if (!this.projectID) {
      throw new Error('projectID not found');
    }
    for (const item of json) {
      await trpc.pg.createTableData.mutate({
        projectID: this.projectID,
        tableSchema: 'public',
        tableName: 'demo',
        keys: Object.keys(item),
        values: Object.values(item)
      });
    }
  }

  async getProof(query: string) {
    if (!this.projectID) {
      throw new Error('projectID not found');
    }
    const { data, errorMsg } = await trpc.pg.query.mutate({
      projectID: this.projectID,
      sql: query
    });
    if (errorMsg) {
      throw new Error(errorMsg);
    }
    return {
      data
    };
  }
}

export const debugDemo = async () => {
  const lab = globalThis.store.w3s.lab;
  const code = globalThis.store.w3s.projectManager.curFilesListSchema.curActiveFile.data.code;

  let errMsg = '';
  let msg = '';
  try {
    const res = await new Function('Wallet', 'BlockChain', 'W3bstream', code)(Wallet, BlockChain, W3bstream);
    console.log('[Demo Return Value]:', res);
  } catch (error) {
    errMsg = error.message;
  }

  const stdio: StdIOType = errMsg ? { '@lv': 'error', msg: errMsg, '@ts': Date.now(), prefix: '' } : { '@lv': 'info', msg, '@ts': Date.now(), prefix: '' };
  lab.stdout.push(stdio);
};
