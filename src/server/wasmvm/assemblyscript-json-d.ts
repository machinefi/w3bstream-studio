//tsc --declaration --lib esnext index.ts
// <reference types="assemblyscript/std/assembly" />
export const assemblyscriptJSONDTS = `
declare namespace ENCODE {
  class JSONEncoder {
    private _isFirstKey;
    private result;
    constructor();
    get isFirstKey(): bool;
    serialize(): Uint8Array;
    toString(): string;
    setString(name: string | null, value: string): void;
    setBoolean(name: string | null, value: bool): void;
    setNull(name: string | null): void;
    setInteger(name: string | null, value: i64): void;
    setFloat(name: string | null, value: f64): void;
    pushArray(name: string | null): bool;
    popArray(): void;
    pushObject(name: string | null): bool;
    popObject(): void;
    private writeKey;
    private writeString;
    private writeBoolean;
    private writeInteger;
    private writeFloat;
    private write;
  }
}
declare namespace Buffer {
  function fromString(str: string): Uint8Array;
  function toString(arr: Uint8Array): string;
  function getDataPtr(arr: Uint8Array): usize;
  function readString(arr: Uint8Array, start: usize, end: usize): string;
}
declare abstract class JSONHandler {
  setString(name: string, value: string): void;
  setBoolean(name: string, value: bool): void;
  setNull(name: string): void;
  setInteger(name: string, value: i64): void;
  setFloat(name: string, value: f64): void;
  pushArray(name: string): bool;
  popArray(): void;
  pushObject(name: string): bool;
  popObject(): void;
}
declare class ThrowingJSONHandler extends JSONHandler {
  setString(name: string, value: string): void;
  setBoolean(name: string, value: bool): void;
  setNull(name: string): void;
  setInteger(name: string, value: i64): void;
  setFloat(name: string, value: f64): void;
  pushArray(name: string): bool;
  pushObject(name: string): bool;
}
declare class DecoderState {
  buffer: Uint8Array;
  lastKey: string;
  readIndex: i32;
  constructor(buffer: Uint8Array);
  get ptr(): usize;
  readString(start: usize, end?: usize): string;
}
declare class JSONDecoder<JSONHandlerT extends JSONHandler> {
  handler: JSONHandlerT;
  _state: DecoderState | null;
  constructor(handler: JSONHandlerT);
  get state(): DecoderState;
  set state(state: DecoderState);
  deserialize(buffer: Uint8Array, decoderState?: DecoderState | null): void;
  private peekChar;
  private readChar;
  private parseValue;
  private parseObject;
  private parseKey;
  private parseArray;
  private parseString;
  private readString;
  private readEscapedChar;
  private readHexDigit;
  private parseNumber;
  private parseBoolean;
  private parseNull;
  private readAndAssert;
  private skipWhitespace;
  private isWhitespace;
}
declare namespace JSON {
  class Handler extends JSONHandler {
    stack: Value[];
    reset(): void;
    get peek(): Value;
    setString(name: string, value: string): void;
    setBoolean(name: string, value: bool): void;
    setNull(name: string): void;
    setInteger(name: string, value: i64): void;
    setFloat(name: string, value: f64): void;
    pushArray(name: string): bool;
    popArray(): void;
    pushObject(name: string): bool;
    popObject(): void;
    addValue(name: string, obj: Value): void;
  }
  abstract class Value {
    static String(str: string): Str;
    static Number(num: f64): Num;
    static Float(num: f64): Float;
    static Integer(num: i64): Integer;
    static Bool(b: bool): Bool;
    static Null(): Null;
    static Array(): Arr;
    static Object(): Obj;
    get isString(): boolean;
    get isNum(): boolean;
    get isFloat(): boolean;
    get isInteger(): boolean;
    get isBool(): boolean;
    get isNull(): boolean;
    get isArr(): boolean;
    get isObj(): boolean;
    /**
     * @returns A valid JSON string of the value
     */
    abstract stringify(): string;
    /**
     *
     * @returns A AS string corresponding to the value.
     */
    toString(): string;
  }
  class Str extends Value {
    _str: string;
    constructor(_str: string);
    stringify(): string;
    toString(): string;
    valueOf(): string;
  }
  class Num extends Value {
    _num: f64;
    constructor(_num: f64);
    stringify(): string;
    valueOf(): f64;
  }
  class Float extends Num {}
  class Integer extends Value {
    _num: i64;
    constructor(_num: i64);
    stringify(): string;
    valueOf(): i64;
  }
  class Null extends Value {
    constructor();
    stringify(): string;
    valueOf(): null;
  }
  class Bool extends Value {
    _bool: bool;
    constructor(_bool: bool);
    stringify(): string;
    valueOf(): bool;
  }
  class Arr extends Value {
    _arr: Array<Value>;
    constructor();
    push(obj: Value): void;
    stringify(): string;
    valueOf(): Array<Value>;
  }
  class Obj extends Value {
    _obj: Map<string, Value>;
    constructor();
    get keys(): string[];
    stringify(): string;
    valueOf(): Map<string, Value>;
    set<T>(key: string, value: T): void;
    has(key: string): bool;
    get(key: string): Value | null;
    getValue(key: string): Value | null;
    getString(key: string): Str | null;
    getNum(key: string): Num | null;
    getFloat(key: string): Float | null;
    getInteger(key: string): Integer | null;
    getBool(key: string): Bool | null;
    getArr(key: string): Arr | null;
    getObj(key: string): Obj | null;
  }
  function from<T>(val: T): Value;
  function parse<T = Uint8Array>(str: T): Value;
}

`;
