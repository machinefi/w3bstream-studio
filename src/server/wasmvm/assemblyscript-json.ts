
export const assemblyscriptJSON = `
export namespace ENCODE {
  export class JSONEncoder {
    private _isFirstKey: i32[];
    private result: string[];

    constructor() {
      this._isFirstKey = new Array<i32>(10);
      this.result = new Array<string>();
      this._isFirstKey.push(1);
    }

    get isFirstKey(): bool {
      return this._isFirstKey[this._isFirstKey.length - 1] as bool;
    }

    serialize(): Uint8Array {
      // TODO: Write directly to UTF8 bytes
      return Buffer.fromString(this.toString());
    }

    toString(): string {
      return this.result.join("");
    }

    setString(name: string | null, value: string): void {
      this.writeKey(name);
      this.writeString(value);
    }

    setBoolean(name: string | null, value: bool): void {
      this.writeKey(name);
      this.writeBoolean(value);
    }

    setNull(name: string | null): void {
      this.writeKey(name);
      this.write("null");
    }

    setInteger(name: string | null, value: i64): void {
      this.writeKey(name);
      this.writeInteger(value);
    }

    setFloat(name: string | null, value: f64): void {
      this.writeKey(name);
      this.writeFloat(value);
    }

    pushArray(name: string | null): bool {
      this.writeKey(name);
      this.write("[");
      this._isFirstKey.push(1);
      return true;
    }

    popArray(): void {
      this.write("]");
      this._isFirstKey.pop();
    }

    pushObject(name: string | null): bool {
      this.writeKey(name);
      this.write("{");
      this._isFirstKey.push(1);
      return true;
    }

    popObject(): void {
      this.write("}");
      this._isFirstKey.pop();
    }

    private writeKey(str: string | null): void {
      if (!this.isFirstKey) {
        this.write(",");
      } else {
        this._isFirstKey[this._isFirstKey.length - 1] = 0;
      }
      if (str != null && (str as string).length > 0) {
        this.writeString(str!);
        this.write(":");
      }
    }

    private writeString(str: string): void {
      this.write('"');
      let savedIndex = 0;
      for (let i = 0; i < str.length; i++) {
        let char = str.charCodeAt(i);
        let needsEscaping =
          char < 0x20 || char == '"'.charCodeAt(0) || char == "\\\\".charCodeAt(0);
        if (needsEscaping) {
          this.write(str.substring(savedIndex, i));
          savedIndex = i + 1;
          if (char == '"'.charCodeAt(0)) {
            this.write('\\\\"');
          } else if (char == "\\\\".charCodeAt(0)) {
            this.write("\\\\\\\\");
          } else if (char == "\\b".charCodeAt(0)) {
            this.write("\\\\b");
          } else if (char == "\\n".charCodeAt(0)) {
            this.write("\\\\n");
          } else if (char == "\\r".charCodeAt(0)) {
            this.write("\\\\r");
          } else if (char == "\\t".charCodeAt(0)) {
            this.write("\\\\t");
          } else {
            // TODO: Implement encoding for other contol characters
            // @ts-ignore integer does have toString
            assert(
              false,
              "Unsupported control character code: " + char.toString()
            );
          }
        }
      }
      this.write(str.substring(savedIndex, str.length));
      this.write('"');
    }

    private writeBoolean(value: bool): void {
      this.write(value ? "true" : "false");
    }

    private writeInteger(value: i64): void {
      this.write(value.toString());
    }

    private writeFloat(value: f64): void {
      this.write(value.toString());
    }

    private write(str: string): void {
      this.result.push(str);
    }
  }

}

export namespace Buffer {
  export function fromString(str: string): Uint8Array {
    const buffer = String.UTF8.encode(str, false);
    if (buffer.byteLength === 0) return new Uint8Array(0);
    return Uint8Array.wrap(buffer);
  }

  export function toString(arr: Uint8Array): string {
    return String.UTF8.decode(arr.buffer, false);
  }

  export function getDataPtr(arr: Uint8Array): usize {
    return changetype<usize>(arr.buffer) + arr.byteOffset;
  }

  export function readString(
    arr: Uint8Array,
    start: usize,
    end: usize
  ): string {
    return String.UTF8.decodeUnsafe(getDataPtr(arr) + start, end - start);
  }
}
export abstract class JSONHandler {
  setString(name: string, value: string): void {}

  setBoolean(name: string, value: bool): void {}

  setNull(name: string): void {}

  setInteger(name: string, value: i64): void {}

  setFloat(name: string, value: f64): void {}

  pushArray(name: string): bool {
    return true;
  }

  popArray(): void {}

  pushObject(name: string): bool {
    return true;
  }

  popObject(): void {}
}
export class ThrowingJSONHandler extends JSONHandler {
  setString(name: string, value: string): void {
    assert(false, "Unexpected string field " + name + ' : "' + value + '"');
  }

  setBoolean(name: string, value: bool): void {
    assert(
      false,
      "Unexpected bool field " + name + " : " + (value ? "true" : "false")
    );
  }

  setNull(name: string): void {
    assert(false, "Unexpected null field " + name);
  }

  setInteger(name: string, value: i64): void {
    // @ts-ignore integer does have toString
    assert(
      false,
      "Unexpected integer field " + name + " : " + value.toString()
    );
  }

  setFloat(name: string, value: f64): void {
    // @ts-ignore integer does have toString
    assert(
      false,
      "Unexpected float field " + name + " : " + value.toString()
    );
  }

  pushArray(name: string): bool {
    assert(false, "Unexpected array field " + name);
    return true;
  }

  pushObject(name: string): bool {
    assert(false, "Unexpected object field " + name);
    return true;
  }
}
// @ts-ignore: decorator
@lazy const TRUE_STR = "true";
// @ts-ignore: decorator
@lazy const FALSE_STR = "false";
// @ts-ignore: decorator
@lazy const NULL_STR = "null";
// @ts-ignore: decorator
@lazy const CHAR_0: i32 = 48; // "0".charCodeAt(0);
// @ts-ignore: decorator
@lazy const CHAR_9: i32 = 57; // "9".charCodeAt(0);
// @ts-ignore: decorator
@lazy const CHAR_A: i32 = 65; // "A".charCodeAt(0);
// @ts-ignore: decorator
@lazy const CHAR_A_LOWER: i32 = 97; // "a".charCodeAt(0);
// @ts-ignore: decorator
@lazy const CHAR_PERIOD: i32 = 46; // ".".charCodeAt(0);
// @ts-ignore: decorator
@lazy const CHAR_MINUS: i32 = 45; // "-".charCodeAt(0);
// @ts-ignore: decorator
@lazy const CHAR_PLUS: i32 = 43; // "+".charCodeAt(0);
// @ts-ignore: decorator
@lazy const CHAR_E: i32 = 69; // "E".charCodeAt(0);
// @ts-ignore: decorator
@lazy const CHAR_E_LOWER: i32 = 101; // "e".charCodeAt(0);

export class DecoderState {
  lastKey: string = "";
  readIndex: i32 = 0;
  constructor(public buffer: Uint8Array) {}

  get ptr(): usize {
    return Buffer.getDataPtr(this.buffer);
  }

  readString(start: usize, end: usize = this.readIndex): string {
    return Buffer.readString(this.buffer, start, end - 1);
  }
}

export class JSONDecoder<JSONHandlerT extends JSONHandler> {
  handler: JSONHandlerT;
  _state: DecoderState | null = null;

  constructor(handler: JSONHandlerT) {
    this.handler = handler;
  }

  get state(): DecoderState {
    return this._state as DecoderState;
  }

  set state(state: DecoderState) {
    this._state = state;
  }

  deserialize(
    buffer: Uint8Array,
    decoderState: DecoderState | null = null
  ): void {
    if (decoderState != null) {
      this.state = decoderState;
    } else {
      this.state = new DecoderState(buffer);
    }

    assert(this.parseValue(), "Cannot parse JSON");
    // TODO: Error if input left
  }

  private peekChar(): i32 {
    if (this.state.readIndex >= this.state.buffer.length) {
      return -1;
    }
    return this.state.buffer[this.state.readIndex];
  }

  private readChar(): i32 {
    assert(
      this.state.readIndex < this.state.buffer.length,
      "Unexpected input end"
    );
    return this.state.buffer[this.state.readIndex++];
  }

  private parseValue(): bool {
    this.skipWhitespace();
    let result =
      this.parseObject() ||
      this.parseArray() ||
      this.parseString() ||
      this.parseBoolean() ||
      this.parseNumber() ||
      this.parseNull();
    this.skipWhitespace();
    return result;
  }

  private parseObject(): bool {
    if (this.peekChar() != "{".charCodeAt(0)) {
      return false;
    }
    let key = this.state.lastKey;
    // @ts-ignore can be null
    this.state.lastKey = "";
    if (this.handler.pushObject(key)) {
      this.readChar();
      this.skipWhitespace();

      let firstItem = true;
      while (this.peekChar() != "}".charCodeAt(0)) {
        if (!firstItem) {
          assert(this.readChar() == ",".charCodeAt(0), "Expected ','");
        } else {
          firstItem = false;
        }
        this.parseKey();
        this.parseValue();
      }
      assert(this.readChar() == "}".charCodeAt(0), "Unexpected end of object");
    }
    this.handler.popObject();
    return true;
  }

  private parseKey(): void {
    this.skipWhitespace();
    this.state.lastKey = this.readString();
    this.skipWhitespace();
    assert(this.readChar() == ":".charCodeAt(0), "Expected ':'");
  }

  private parseArray(): bool {
    if (this.peekChar() != "[".charCodeAt(0)) {
      return false;
    }
    let key = this.state.lastKey;
    // @ts-ignore can be null
    this.state.lastKey = "";
    if (this.handler.pushArray(key)) {
      this.readChar();
      this.skipWhitespace();

      let firstItem = true;
      while (this.peekChar() != "]".charCodeAt(0)) {
        if (!firstItem) {
          assert(this.readChar() == ",".charCodeAt(0), "Expected ','");
        } else {
          firstItem = false;
        }
        this.parseValue();
      }
      assert(this.readChar() == "]".charCodeAt(0), "Unexpected end of array");
    }
    this.handler.popArray();
    return true;
  }

  private parseString(): bool {
    if (this.peekChar() != '"'.charCodeAt(0)) {
      return false;
    }
    this.handler.setString(this.state.lastKey, this.readString());
    return true;
  }

  private readString(): string {
    assert(
      this.readChar() == '"'.charCodeAt(0),
      "Expected double-quoted string"
    );
    let savedIndex = this.state.readIndex;
    // @ts-ignore can be null
    let stringParts: Array<string> = new Array<string>();
    for (;;) {
      let byte = this.readChar();
      assert(byte >= 0x20, "Unexpected control character");
      if (byte == '"'.charCodeAt(0)) {
        let s = this.state.readString(savedIndex);
        if (stringParts.length == 0) {
          return s;
        }
        stringParts.push(s);
        return stringParts.join("");
      } else if (byte == "\\\\".charCodeAt(0)) {
        if (this.state.readIndex > savedIndex + 1) {
          stringParts.push(this.state.readString(savedIndex));
        }
        stringParts.push(this.readEscapedChar());
        savedIndex = this.state.readIndex;
      }
    }
    // Should never happen
    return "";
  }

  private readEscapedChar(): string {
    let byte = this.readChar();
    // TODO: Use lookup table for anything except \\u
    if (byte == '"'.charCodeAt(0)) {
      return '"';
    }
    if (byte == "\\\\".charCodeAt(0)) {
      return "\\\\";
    }
    if (byte == "/".charCodeAt(0)) {
      return "/";
    }
    if (byte == "b".charCodeAt(0)) {
      return "\\b";
    }
    if (byte == "n".charCodeAt(0)) {
      return "\\n";
    }
    if (byte == "r".charCodeAt(0)) {
      return "\\r";
    }
    if (byte == "t".charCodeAt(0)) {
      return "\\t";
    }
    if (byte == "u".charCodeAt(0)) {
      let d1 = this.readHexDigit();
      let d2 = this.readHexDigit();
      let d3 = this.readHexDigit();
      let d4 = this.readHexDigit();
      let charCode = d1 * 0x1000 + d2 * 0x100 + d3 * 0x10 + d4;
      return String.fromCodePoint(charCode);
    }
    assert(false, "Unexpected escaped character: " + String.fromCharCode(byte));
    return "";
  }

  private readHexDigit(): i32 {
    let byte = this.readChar();
    let digit = byte - CHAR_0;
    if (digit > 9) {
      digit = byte - CHAR_A + 10;
      if (digit < 10 || digit > 15) {
        digit = byte - CHAR_A_LOWER + 10;
      }
    }
    assert(digit >= 0 && digit < 16, "Unexpected \\\\u digit");
    return digit;
  }

  private parseNumber(): bool {
    let number: f64 = 0;
    let sign: f64 = 1;
    let isFloat: boolean = false;
    // Also keeping the number as a string, because we will want to use the
    // AS parseFloat as it handles precision best.
    let numberAsString: string = "";

    if (this.peekChar() == CHAR_MINUS) {
      sign = -1;
      numberAsString += String.fromCharCode(this.readChar());
    }
    let digits = 0;
    while (
      (CHAR_0 <= this.peekChar() && this.peekChar() <= CHAR_9) ||
      CHAR_PERIOD == this.peekChar() ||
      CHAR_MINUS == this.peekChar() ||
      CHAR_PLUS == this.peekChar() ||
      CHAR_E == this.peekChar() ||
      CHAR_E_LOWER == this.peekChar()
    ) {

      let charCode = this.readChar();
      numberAsString += String.fromCharCode(charCode);

      if (charCode == CHAR_E || charCode == CHAR_E_LOWER || charCode == CHAR_PERIOD || charCode == CHAR_PLUS || charCode == CHAR_MINUS) {
        isFloat = true;
      } else {
        if (!isFloat) {
          let value: f64 = charCode - CHAR_0;
          number *= 10;
          number += value;
        }
        digits++;
      }
    }
    if (digits > 0) {
      if (isFloat || numberAsString == "-0") {
        this.handler.setFloat(this.state.lastKey, parseFloat(numberAsString));
      } else {
        this.handler.setInteger(this.state.lastKey, (number * sign) as i64);
      }
      return true;
    }
    return false;
  }

  private parseBoolean(): bool {
    if (this.peekChar() == FALSE_STR.charCodeAt(0)) {
      this.readAndAssert(FALSE_STR);
      this.handler.setBoolean(this.state.lastKey, false);
      return true;
    }
    if (this.peekChar() == TRUE_STR.charCodeAt(0)) {
      this.readAndAssert(TRUE_STR);
      this.handler.setBoolean(this.state.lastKey, true);
      return true;
    }

    return false;
  }

  private parseNull(): bool {
    if (this.peekChar() == NULL_STR.charCodeAt(0)) {
      this.readAndAssert(NULL_STR);
      this.handler.setNull(this.state.lastKey);
      return true;
    }
    return false;
  }

  private readAndAssert(str: string): void {
    for (let i = 0; i < str.length; i++) {
      assert(str.charCodeAt(i) == this.readChar(), "Expected '" + str + "'");
    }
  }

  private skipWhitespace(): void {
    while (this.isWhitespace(this.peekChar())) {
      this.readChar();
    }
  }

  private isWhitespace(charCode: i32): bool {
    return (
      charCode == 0x9 || charCode == 0xa || charCode == 0xd || charCode == 0x20
    );
  }
}

export namespace JSON {
  export class Handler extends JSONHandler {
    stack: Value[] = new Array<Value>();

    reset(): void {
      while (this.stack.length > 0) {
        this.stack.pop();
      }
    }

    get peek(): Value {
      return this.stack[this.stack.length - 1];
    }

    setString(name: string, value: string): void {
      const obj: Value = Value.String(value);
      this.addValue(name, obj);
    }

    setBoolean(name: string, value: bool): void {
      const obj = Value.Bool(value);
      this.addValue(name, obj);
    }

    setNull(name: string): void {
      const obj = Value.Null();
      this.addValue(name, obj);
    }

    setInteger(name: string, value: i64): void {
      const obj = Value.Integer(value);
      this.addValue(name, obj);
    }

    setFloat(name: string, value: f64): void {
      const obj = Value.Float(value);
      this.addValue(name, obj);
    }

    pushArray(name: string): bool {
      const obj: Value = Value.Array();
      if (this.stack.length == 0) {
        this.stack.push(obj);
      } else {
        this.addValue(name, obj);
        this.stack.push(obj);
      }
      return true;
    }

    popArray(): void {
      if (this.stack.length > 1) {
        this.stack.pop();
      }
    }

    pushObject(name: string): bool {
      const obj: Value = Value.Object();
      this.addValue(name, obj);
      this.stack.push(obj);
      return true;
    }

    popObject(): void {
      if (this.stack.length > 1) {
        this.stack.pop();
      }
    }

    addValue(name: string, obj: Value): void {
      if (name.length == 0 && this.stack.length == 0) {
        this.stack.push(obj);
        return;
      }
      if (this.peek instanceof Obj) {
        (this.peek as Obj).set(name, obj);
      } else if (this.peek instanceof Arr) {
        (this.peek as Arr).push(obj);
      }
    }
  }

  namespace _JSON {
    // @ts-ignore decorator is valid
    @lazy
    export const handler: Handler = new JSON.Handler();
    // @ts-ignore decorator is valid
    @lazy
    export const decoder:  JSONDecoder<JSON.Handler> = new JSONDecoder<JSON.Handler>(
      new JSON.Handler()
    );

    /** Parses a string or Uint8Array and returns a Json Value. */
    export function parse<T = Uint8Array>(str: T): Value {
      var arr: Uint8Array;
      if (isString<T>(str)) {
        arr = Buffer.fromString(str as string);
      } else {
        arr = changetype<Uint8Array>(str);
      }
      _JSON.decoder.deserialize(arr);
      const res = _JSON.decoder.handler.peek;
      _JSON.decoder.handler.reset();
      return res;
    }
  }

  // @ts-ignore
  @lazy const NULL: Null = new JSON.Null();

  export abstract class Value {
    static String(str: string): Str {
      return new Str(str);
    }
    static Number(num: f64): Num {
      return new Num(num);
    }
    static Float(num: f64): Float {
      return new Float(num);
    }
    static Integer(num: i64): Integer {
      return new Integer(num);
    }
    static Bool(b: bool): Bool {
      return new Bool(b);
    }
    static Null(): Null {
      return NULL;
    }
    static Array(): Arr {
      return new Arr();
    }
    static Object(): Obj {
      return new Obj();
    }

    get isString(): boolean {
      return this instanceof Str;
    }

    get isNum(): boolean {
      return this instanceof Num;
    }

    get isFloat(): boolean {
      return this instanceof Float;
    }

    get isInteger(): boolean {
      return this instanceof Integer;
    }

    get isBool(): boolean {
      return this instanceof Bool;
    }

    get isNull(): boolean {
      return this instanceof Null;
    }

    get isArr(): boolean {
      return this instanceof Arr;
    }

    get isObj(): boolean {
      return this instanceof Obj;
    }

    /**
     * @returns A valid JSON string of the value
     */
    abstract stringify(): string;

    /**
     *
     * @returns A AS string corresponding to the value.
     */
    toString(): string {
      return this.stringify();
    }
  }

  export class Str extends Value {
    constructor(public _str: string) {
      super();
    }

    stringify(): string {
      let escaped: i32[] = [];
      for (let i = 0; i < this._str.length; i++) {
        const charCode = this._str.charCodeAt(i);
        if (
          charCode == 0x22 || // "    quotation mark  U+0022
          charCode == 0x5C || // \    reverse solidus U+005C
          charCode < 0x20 // control characters
        ) {
          escaped.push(0x5c); // add a reverse solidus (backslash) to escape reserved chars
        }
        escaped.push(charCode);
      }
      return "\\"" + String.fromCharCodes(escaped) + "\\"";
    }

    toString(): string {
      return this._str;
    }

    valueOf(): string {
      return this._str;
    }
  }

  export class Num extends Value {
    constructor(public _num: f64) {
      super();
    }

    stringify(): string {
      return this._num.toString();
    }

    valueOf(): f64 {
      return this._num;
    }
  }

  export class Float extends Num {
  }

  export class Integer extends Value {
    constructor(public _num: i64) {
      super();
    }

    stringify(): string {
      return this._num.toString();
    }

    valueOf(): i64 {
      return this._num;
    }
  }

  export class Null extends Value {
    constructor() {
      super();
    }

    stringify(): string {
      return "null";
    }

    valueOf(): null {
      return null;
    }
  }

  export class Bool extends Value {
    constructor(public _bool: bool) {
      super();
    }

    stringify(): string {
      return this._bool.toString();
    }

    valueOf(): bool {
      return this._bool;
    }
  }

  export class Arr extends Value {
      _arr: Array<Value>;
      constructor() {
        super();
        this._arr = new Array<Value>();
      }

      push(obj: Value): void {
        this._arr.push(obj);
      }

      stringify(): string {
        return (
          "[" +
          this._arr
            .map<string>((val: Value, i: i32, _arr: Value[]): string =>
              val.stringify()
            )
            .join(",") +
          "]"
        );
      }

      valueOf(): Array<Value> {
        return this._arr;
      }
  }

  export class Obj extends Value {
      _obj: Map<string, Value>;

      constructor() {
        super();
        this._obj = new Map();
      }

      get keys(): string[] {
        return this._obj.keys();
      }

      stringify(): string {
        const keys = this._obj.keys();
        const objs: string[] = new Array<string>(keys.length);
        for (let i: i32 = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = this._obj.get(key);
          // Currently must get the string value before interpolation
          // see: https://github.com/AssemblyScript/assemblyscript/issues/1944
          const valStr = value.stringify();
          objs[i] = \`"\${key}":\${valStr}\`;
        }

        return \`{\${objs.join(",")}}\`;
      }

      valueOf(): Map<string, Value> {
        return this._obj;
      }

      set<T>(key: string, value: T): void {
        if (isReference<T>(value)) {
          if (value instanceof Value) {
            this._obj.set(key, value as Value);
            return;
          }
        }
        this._obj.set(key, from<T>(value));
      }

      has(key: string): bool {
        return this._obj.has(key);
      }

      get(key: string): Value | null {
        if (!this._obj.has(key)) {
          return null;
        }
        return this._obj.get(key);
      }

      getValue(key: string): Value | null {
        return this.get(key);
      }

      getString(key: string): Str | null {
        let jsonValue = this.get(key);
        if (jsonValue != null && jsonValue.isString) {
          return jsonValue as Str;
        }
        return null;
      }

      getNum(key: string): Num | null {
        let jsonValue = this.get(key);
        if (jsonValue != null && jsonValue.isNum) {
          return jsonValue as Num;
        }
        return null;
      }

      getFloat(key: string): Float | null {
        let jsonValue = this.get(key);
        if (jsonValue != null && jsonValue.isFloat) {
          return jsonValue as Float;
        }
        return null;
      }

      getInteger(key: string): Integer | null {
        let jsonValue = this.get(key);
        if (jsonValue != null && jsonValue.isInteger) {
          return jsonValue as Integer;
        }
        return null;
      }

      getBool(key: string): Bool | null {
        let jsonValue = this.get(key);
        if (jsonValue != null && jsonValue.isBool) {
          return jsonValue as Bool;
        }
        return null;
      }

      getArr(key: string): Arr | null {
        let jsonValue = this.get(key);
        if (jsonValue != null && jsonValue.isArr) {
          return jsonValue as Arr;
        }
        return null;
      }

      getObj(key: string): Obj | null {
        let jsonValue = this.get(key);
        if (jsonValue != null && jsonValue.isObj) {
          return jsonValue as Obj;
        }
        return null;
      }
  }

  export function from<T>(val: T): Value {
    if (isBoolean<T>(val)) {
      return Value.Bool(val as bool);
    }
    if (isInteger<T>(val)) {
      return Value.Integer(val);
    }
    if (isFloat<T>(val)) {
      return Value.Float(val);
    }
    if (isString<T>(val)) {
      return Value.String(val as string);
    }
    if (val == null) {
      return Value.Null();
    }
    if (isArrayLike<T>(val)) {
      const arr = Value.Array();
      for (let i: i32 = 0; i < val.length; i++) {
        // @ts-ignore
        arr.push(from<valueof<T>>(val[i]));
      }
      return arr;
    }
    /**
       * TODO: add object support.
       */
    return Value.Object();
  }

  // @ts-ignore
  @inline
  /** Parses a string or Uint8Array and returns a Json Value. */
  export function parse<T = Uint8Array>(str: T): Value {
    return _JSON.parse(str);
  }
}
`