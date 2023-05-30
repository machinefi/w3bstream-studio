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
import { Contract, ethers } from 'ethers';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { trpc } from '@/lib/trpc';
import { compileAssemblyscript } from '.';
import stringify from 'json-stable-stringify';
import { PromiseState } from '@/store/standard/PromiseState';

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

async function awaitProjectReady(assemblyScript: string) {
  const { curFilesListSchema } = globalThis.store.w3s.projectManager;
  const wasmFiles = curFilesListSchema.findFilesByLabel(curFilesListSchema.files, assemblyScript);
  const wasmFile = wasmFiles[0];
  if (!wasmFile) {
    throw new Error('AssemblyScript file not found');
  }
  const wasmName = wasmFile.label;
  const projectName = `demo_${wasmName.replace('.ts', '')}`;
  const p = globalThis.store.w3s.project.allProjects.value.find((p) => p.name === projectName);
  if (p) {
    return p.f_project_id;
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
    const projectID = res.data.createdProjectIds[0];
    await globalThis.store.w3s.dbTable.importTables({
      projectID,
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
    return projectID;
  } else {
    throw new Error('create project failed');
  }
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
    instance.methods.mintWithProof = ({ to, amount, proof }: { to: string; amount: number; proof: any }) => {
      const publicKey = '0x046d9038945ff8f4669201ba1e806c9a46a5034a578e4d52c031521985380392944efd6c702504d9130573bb939f5c124af95d38168546cc7207a7e0baf14172ff';
      const recoveredPublicKey = ethers.utils.recoverPublicKey(ethers.utils.hashMessage(proof.message), proof.signature);
      if (publicKey.toLowerCase() === recoveredPublicKey.toLowerCase()) {
        return instance.methods.mint(to, amount);
      } else {
        throw new Error('Invalid signature');
      }
    };
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

  async upload(json: { data: { [x: string]: any } }[]) {
    if (!this.projectID) {
      this.projectID = await awaitProjectReady(this.assemblyScript);
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

  async getProof(query?: string) {
    const sql = query ? query : `SELECT * FROM demo ORDER BY id DESC LIMIT 1`;
    if (!this.projectID) {
      this.projectID = await awaitProjectReady(this.assemblyScript);
    }
    const { data, errorMsg } = await trpc.pg.query.mutate({
      sql,
      projectID: this.projectID
    });
    if (errorMsg) {
      throw new Error(errorMsg);
    }

    const row = data[0];
    if (!row) {
      throw new Error('No data found');
    }

    const privateKey = this.operator.accountPk;
    const message = stringify(row.data);
    const signingKey = new ethers.utils.SigningKey(privateKey);
    const messageHash = ethers.utils.hashMessage(message);
    const signature = signingKey.signDigest(messageHash);

    return {
      data: row,
      proof: {
        message: message,
        signature
      }
    };
  }
}

export const debugDemo = new PromiseState<() => Promise<any>, any>({
  function: async () => {
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
  }
});

// export const debugDemo = async () => {
//   const lab = globalThis.store.w3s.lab;
//   const code = globalThis.store.w3s.projectManager.curFilesListSchema.curActiveFile.data.code;

//   let errMsg = '';
//   let msg = '';
//   try {
//     const res = await new Function('Wallet', 'BlockChain', 'W3bstream', code)(Wallet, BlockChain, W3bstream);
//     console.log('[Demo Return Value]:', res);
//   } catch (error) {
//     errMsg = error.message;
//   }

//   const stdio: StdIOType = errMsg ? { '@lv': 'error', msg: errMsg, '@ts': Date.now(), prefix: '' } : { '@lv': 'info', msg, '@ts': Date.now(), prefix: '' };
//   lab.stdout.push(stdio);
// };
