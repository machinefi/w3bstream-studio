import { makeAutoObservable, toJS, makeObservable, observable, action, reaction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { _ } from '@/lib/lodash';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { helper } from '@/lib/helper';

interface ExecHistory {
  method: string;
  hash: string;
  address: string;
  params: string[];
  options: any;
}

export class ContractInstance {
  id = uuidv4();
  address: string = '';
  name: string = '';
  functionsCache: {
    [key: string]: {
      callResult: string;
    };
  } = {};
  abi = [];
  functions: FunctionState[] = [];
  readFunctions: FunctionState[] = [];
  writeFunction: FunctionState[] = [];
  events: FunctionState[] = [];

  execHistory: ExecHistory[] = [];
  tabIndex = 0;
  show = false;

  constructor(args: Partial<ContractInstance>) {
    Object.assign(this, args);
    this.initData();
    makeAutoObservable(this);
  }

  toggleShow(val: boolean) {
    this.show = val;
  }

  toJSON() {
    return {
      id: this.id,
      address: this.address,
      name: this.name,
      functionsCache: _.keyBy(
        this.functions.filter((i) => !!i.callResult),
        'name'
      ),
      tabIndex: this.tabIndex,
      execHistory: this.execHistory,
      show: this.show
    };
  }

  addExecHistory(val: ExecHistory) {
    this.execHistory.push(val);
  }
  clearExecHistory() {
    this.execHistory = [];
  }

  setAddress(val) {
    this.address = val;
  }
  setName(val) {
    this.name = val;
  }
  setTabIndex(val) {
    this.tabIndex = val;
  }

  initData() {
    const abi = toJS(this.abi);
    if (!abi) return;
    try {
      const functions = abi
        ?.filter((item) => item.type === 'function')
        .map((v) => {
          const func = this.functionsCache[v.name];
          const args: Partial<FunctionState> = {
            type: v.type,
            name: v.name,
            stateMutability: v.stateMutability,
            inputs: v.inputs.map((i) => new FunctionArgsState(i))
          };
          if (func) {
            args.callResult = func.callResult;
          }
          if (v.stateMutability === 'payable') {
            args.amount = new EtherInputState({});
          }

          return new FunctionState(args);
        });

      this.functions = functions;
      this.readFunctions = this.functions.filter((i) => ['view', 'pure'].includes(i.stateMutability)).sort((a, b) => a.name.length - b.name.length);
      this.writeFunction = this.functions.filter((i) => ['payable', 'nonpayable'].includes(i.stateMutability)).sort((a, b) => a.name.length - b.name.length);
      this.events = abi.filter((i) => i.type === 'event').sort((a, b) => a.name.length - b.name.length);
      const viewFunctions = this.functions.filter((i) => ['view', 'pure'].includes(i.stateMutability) && i.inputs.length == 0 && !i.callResult);
      // this.workspace.workspaceManager.IDE.currentNetwork.multicall(
      //   viewFunctions.map((i) => ({
      //     abi,
      //     address: this.address,
      //     method: i.name,
      //     handler: (v) => {
      //       if (v) {
      //         i.callResult = v.toString();
      //       }
      //     }
      //   }))
      // );
    } catch (error) {
      console.error(error);
    }
  }
}

export class FunctionState {
  name: string;
  type: string;
  inputs: FunctionArgsState[];
  amount?: EtherInputState;
  stateMutability?: string = '';
  callResult: any = '';
  callError: any = '';
  showCustom = false;
  gasLimit = 0;
  constructor(args: Partial<FunctionState>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get callResultFormat() {
    return helper.string.toFixString(this.callResult, 20);
  }

  get background() {
    switch (this.stateMutability) {
      case 'view':
      case 'pure':
        return 'orange.400';
      case 'nonpayable':
        return 'blue.400';
      case 'payable':
        return 'red.400';
      default:
        return '';
    }
  }

  toJSON() {
    return {
      callResult: this.callResult
    };
  }

  setAmount(val: Partial<EtherInputState>) {
    this.amount = new EtherInputState(val);
  }
  setShowCustom(val: boolean) {
    this.showCustom = val;
  }
  setGasLimit(val) {
    this.gasLimit = val.replace(/^\$/, '');
  }

  setCallResult(val) {
    this.callResult = val;
  }
  setCallError(val) {
    this.callError = val;
  }
}

export class FunctionArgsState {
  name: string;
  type: string;
  value: any = '';
  internalType = '';
  constructor(args: Partial<FunctionArgsState>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }
  setValue(val) {
    this.value = val;
  }
}

export class EtherInputState {
  input = 0;
  unit = 'wei';
  unitConfig = {
    ether: 1e18,
    finney: 1e14,
    gwei: 1e8,
    wei: 1
  };

  constructor(args: Partial<EtherInputState>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get value() {
    return new BigNumber(this.input).multipliedBy(this.unitConfig[this.unit]).toFixed(0);
  }

  setInput(val: any) {
    this.input = val;
  }
  setUnit(val: string) {
    this.unit = val;
  }
}
