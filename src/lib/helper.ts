import numeral from 'numeral';
import BN from 'bignumber.js';
import { BigNumberState } from '@/store/standard/BigNumberState';
import { NumberState, StringState } from '@/store/standard/base';
import { rootStore } from '@/store/index';
import BigNumber from 'bignumber.js';
import { _ } from './lodash';
import { showNotification } from '@mantine/notifications';

const valMap = {
  undefined: '',
  null: '',
  false: false
};

export interface RouterParsed {
  pathname: string;
  hash: string;
  query: Record<string, string | string[] | undefined>;
}

export const toast = {
  success: (msg: string) => {
    showNotification({
      title: rootStore.lang.t('notification'),
      color: 'green',
      message: msg
    });
  },
  error: (msg: string) => {
    showNotification({
      title: rootStore.lang.t('error'),
      color: 'red',
      message: msg
    });
  },
  warning: (msg: string) => {
    showNotification({
      title: rootStore.lang.t('warning'),
      color: 'yellow',
      message: msg
    });
  }
};

export const helper = {
  promise: {
    async sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    async runAsync<T, U = Error>(promise: Promise<T>): Promise<[U | null, T | null]> {
      return promise.then<[null, T]>((data: T) => [null, data]).catch<[U, null]>((err) => [err, null]);
    }
  },
  get: {
    larger: (a: number, b: number): number => {
      return a > b ? a : b;
    }
  },
  log: (str: Object) => {
    return JSON.parse(JSON.stringify(str));
  },
  env: {
    //@ts-ignore
    isBrower: typeof window === 'undefined' ? false : true,
    isIopayMobile: global?.navigator?.userAgent && (global?.navigator?.userAgent.includes('IoPayAndroid') || global?.navigator?.userAgent.includes('IoPayiOs')),
    isPc() {
      const userAgentInfo = global?.navigator?.userAgent;
      const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
      let flag = true;
      for (let v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
        }
      }
      return flag;
    }
  },
  json: {
    safeParse(val: any) {
      try {
        return JSON.parse(val);
      } catch (error) {
        return val;
      }
    }
  },
  string: {
    toFixString(str, length) {
      if (str && str.length > length) {
        return str.substr(0, length) + '...';
      } else {
        return str;
      }
    },
    truncate(fullStr = '', strLen, separator) {
      if (fullStr.length <= strLen) return fullStr;

      separator = separator || '...';

      var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow / 2),
        backChars = Math.floor(charsToShow / 2);

      return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
    }
  },
  number: {
    countNonZeroNumbers: (str: string) => {
      let index = 0;
      const length = str.length;
      for (; index < length && (str[index] === '0' || str[index] === '.'); index += 1);
      return length - index - Number(str.includes('.'));
    },
    numberWithCommas(num: number) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    toPrecisionFloor: (str: number | string, options?: { decimals?: number; format?: string; toLocalString?: boolean }) => {
      const { decimals = 6, format = '', toLocalString = false } = options || {};
      if (!str || isNaN(Number(str))) return '';

      if (helper.number.countNonZeroNumbers(String(str)) <= decimals) return String(str);
      const numStr = new BN(str).toFixed();
      let result = '';
      let index = 0;
      const numLength = numStr.length;

      for (; numStr[index] === '0' && index < numLength; index += 1);

      if (index === numLength) return '0';

      if (numStr[index] === '.') {
        // number < 0
        result = '0';
        for (; (numStr[index] === '0' || numStr[index] === '.') && index < numLength; index += 1) {
          result = result + numStr[index];
        }
      }
      let resultNumLength = 0;
      for (; index < numLength && (resultNumLength < decimals || !result.includes('.')); index += 1) {
        result = result + numStr[index];

        if (numStr[index] !== '.') resultNumLength += 1;
      }
      if (format) {
        return numeral(Number(result)).format(format);
      }

      if (toLocalString) {
        console.log(helper.number.numberWithCommas(Number(new BN(result).toFixed())));
        return helper.number.numberWithCommas(Number(new BN(result).toFixed()));
      }

      return new BN(result).toFixed();
    },
    getBN: (value: number | string | BN) => {
      return value instanceof BN ? value : typeof value === 'string' ? new BN(Number(value)) : new BN(value);
    }
  },
  state: {
    handleCallBack(callback, val, key?) {
      try {
        if (callback instanceof BigNumberState) {
          callback.setValue(new BigNumber(val.toString()));
        }
        if (callback instanceof NumberState) {
          callback.setValue(Number(val.toString()));
        }
        if (callback instanceof StringState) {
          callback.setValue(val.toString());
        }
      } catch (error) {
        throw new Error(error.message);
      }
    }
  },
  deepMerge(obj, newObj) {
    const newVal = _.mergeWith(obj, newObj, (...args) => {
      const [objValue, srcValue] = args;
      if (typeof srcValue === 'object') {
        return helper.deepMerge(objValue, srcValue);
      }
      return srcValue || valMap[srcValue];
    });
    return newVal;
  },
  getFileLanguage(fileName: string) {
    if (fileName.indexOf('.js') != -1) {
      return 'javascript';
    }
    if (fileName.indexOf('.ts') != -1) {
      return 'typescript';
    }
    if (fileName.indexOf('.json') != -1) {
      return 'json';
    }
    if (fileName.indexOf('.html') != -1) {
      return 'html';
    }
    if (fileName.indexOf('.css') != -1) {
      return 'css';
    }
    if (fileName.indexOf('.md') != -1) {
      return 'markdown';
    }
    if (fileName.indexOf('.go') != -1) {
      return 'go';
    }
    if (fileName.indexOf('.cpp') != -1) {
      return 'cpp';
    }
    if (fileName.indexOf('.wat') != -1) {
      return 'XML';
    }
    if (fileName.indexOf('.wasm') != -1) {
      return 'wasm';
    }
  },
  stringToBase64(str:string){
    return btoa(str);
  },
  bufferUTF8ToUint8Array(bufferUTF8: string):Uint8Array {
    const buffer = new TextEncoder().encode(bufferUTF8);
    return new Uint8Array(buffer);
  },
  Uint8ArrayToWasmBase64FileData(name:string,raw:Uint8Array):string{
    //@ts-ignore
    return `data:application/wasm;name=${name};base64,${Buffer.from(raw, 'binary').toString('base64')}`
  }
};
