import { VM } from '@ethereumjs/vm';
import { Address } from '@ethereumjs/util';
import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { Block } from '@ethereumjs/block';
import { Transaction, TxData } from '@ethereumjs/tx';
import { hexToBytes } from 'ethereum-cryptography/utils';
import { defaultAbiCoder } from '@ethersproject/abi';
import { StdIOType } from '@/server/wasmvm';
import { helper } from '@/lib/helper';
import { compileAssemblyscript } from '.';
import { PromiseState } from '@/store/standard/PromiseState';
import ERC20 from '@/constants/abis/ERC20.json';

type TransactionsData = TxData;

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
    const argumentsEncoded = defaultAbiCoder.encode(params.types, params.values);
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

async function deployContract(vm: VM, block: Block, senderPrivateKey: Uint8Array, deploymentBytecode: string) {
  const data = encodeDeployment(deploymentBytecode, {
    types: ['string'],
    values: ['']
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

  return deploymentResult;
}

const demoAssemblyScript = `export function start(rid: i32): i32 {
  Log("start from typescript");
  const message = GetDataByRID(rid);
  Log("wasm received message:" + message);
  return 0;
}
`;

const demoDbSchemas = [
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
        ]
      }
    ]
  }
];

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
    const contractJson = contractFile ? helper.json.safeParse(contractFile.data.code) : ERC20;
    const vm = await VM.create({ common });
    const deploymentResult = await deployContract(vm, this.block, wallet.accountPk, contractJson.bytecode);
    return deploymentResult;
  }
}

class W3bstream {
  assemblyScript: string;
  operator: Wallet;
  wasmBuffer: Buffer;
  constructor(args: { assemblyScript: string; operator: Wallet }) {
    Object.assign(this, args);
  }

  async awaitWasmReady() {
    if (this.wasmBuffer) {
      return;
    }
    const { curFilesListSchema } = globalThis.store.w3s.projectManager;
    const wasmFiles = curFilesListSchema.findFilesByLabel(curFilesListSchema.files, this.assemblyScript);
    const wasmFile = wasmFiles[0];
    const assemblyScriptCode = wasmFile ? wasmFile.data.code : demoAssemblyScript;
    const { error, binary } = await compileAssemblyscript(assemblyScriptCode);
    if (error) {
      throw error;
    }
    this.wasmBuffer = Buffer.from(binary);
  }

  async awaitDatabaseReady() {
    const sqlDB = globalThis.store.god.sqlDB;
    const tableName = demoDbSchemas[0].tables[0].tableName;
    if (sqlDB.findDBExist(tableName)) {
      return;
    }
    const sqlResult = await sqlDB.createTableByJSONSchema({
      schemas: demoDbSchemas
    });
    return sqlResult;
  }

  async upload(json: { data: { [x: string]: any } }[]) {
    await this.awaitDatabaseReady();
    for (const item of json) {
      const keys = Object.keys(item).join(',');
      const values = Object.values(item)
        .map((i) => `'${JSON.stringify(i)}'`)
        .join(',');
      const sql = `INSERT INTO demo (${keys}) VALUES (${values})`;
      await globalThis.store.god.sqlDB.db.exec(sql);
    }
  }

  async getData(query?: string) {
    await this.awaitDatabaseReady();
    const sql = query ? query : `SELECT * FROM demo ORDER BY id DESC LIMIT 1`;
    const res = globalThis.store.god.sqlDB.db.exec(sql);
    const columnNames = demoDbSchemas[0].tables[0].columns.map((c) => c.name);
    const dataSource = [];
    if (res.length > 0) {
      res[0].values.forEach((i) => {
        const obj: { [key: string]: any } = {};
        i.forEach((j, index) => {
          obj[columnNames[index]] = helper.json.safeParse(j);
        });
        dataSource.push(obj);
      });
    }
    const data = dataSource[0];
    if (!data) {
      throw new Error('No data found');
    }
    return data;
  }
}

const Log = (msg: string) => {
  const lab = globalThis.store.w3s.lab;
  lab.stdout.push({ '@lv': 'info', msg, '@ts': Date.now(), prefix: '' });
};

export const debugDemo = new PromiseState<() => Promise<any>, any>({
  function: async () => {
    const lab = globalThis.store.w3s.lab;
    const code = globalThis.store.w3s.projectManager.curFilesListSchema.curActiveFile.data.code;
    try {
      const res = await new Function('Wallet', 'BlockChain', 'W3bstream', 'Log', code)(Wallet, BlockChain, W3bstream, Log);
      console.log('[Demo Return Value]:', res);
    } catch (error) {
      lab.stdout.push({ '@lv': 'error', msg: error.message, '@ts': Date.now(), prefix: '' });
    }
  }
});
