export const sqlSDK = `
abstract class SQLTypes {
  Int32: i32 = 0;
  Int64: i64 = 0;
  Float32: f32 = 0;
  Float64: f64 = 0;
  String: string = "";
  Time: string = "";
  Bool: bool = false;
  Bytes: string = "";
  abstract pushSQLType(encoder: ENCODE.JSONEncoder): i32;
}
export namespace SQL {
  export class Int32 extends SQLTypes {
    Int32: i32;
    pushSQLType(encoder: ENCODE.JSONEncoder): i32 {
      encoder.setInteger("int32", this.Int32);
      return 0;
    }
    constructor(value: i32) {
      super();
      this.Int32 = value;
    }
  }

  export class Int64 extends SQLTypes {
    Int64: i64;
    pushSQLType(encoder: ENCODE.JSONEncoder): i32 {
      encoder.setInteger("int64", this.Int64);
      return 0;
    }
    constructor(value: i64) {
      super();
      this.Int64 = value;
    }
  }

  export class Float32 extends SQLTypes {
    Float32: f32;
    pushSQLType(encoder: ENCODE.JSONEncoder): i32 {
      encoder.setFloat("float32", this.Float32);
      return 0;
    }
    constructor(value: f32) {
      super();
      this.Float32 = value;
    }
  }

  export class Float64 extends SQLTypes {
    Float64: f64;
    pushSQLType(encoder: ENCODE.JSONEncoder): i32 {
      encoder.setFloat("float64", this.Float64);
      return 0;
    }
    constructor(value: f64) {
      super();
      this.Float64 = value;
    }
  }

  export class String extends SQLTypes {
    String: string;
    pushSQLType(encoder: ENCODE.JSONEncoder): i32 {
      encoder.setString("string", this.String);
      return 0;
    }
    constructor(value: string) {
      super();
      this.String = value;
    }
  }

  /**
   * Time is a rfc3339 encoding
   */
  export class Time extends SQLTypes {
    Time: string;
    pushSQLType(encoder: ENCODE.JSONEncoder): i32 {
      encoder.setString("time", this.Time);
      return 0;
    }
    constructor(value: string) {
      super();
      this.Time = value;
    }
  }

  export class Bool extends SQLTypes {
    Bool: bool;
    pushSQLType(encoder: ENCODE.JSONEncoder): i32 {
      encoder.setBoolean("bool", this.Bool);
      return 0;
    }
    constructor(value: bool) {
      super();
      this.Bool = value;
    }
  }

  /**
   * Bytes is a base64 encoded string
   */
  export class Bytes extends SQLTypes {
    Bytes: string;
    pushSQLType(encoder: ENCODE.JSONEncoder): i32 {
      //base64 encoding
      encoder.setString("bytes", this.Bytes);
      return 0;
    }
    constructor(value: string) {
      super();
      this.Bytes = value;
    }
  }
}


`;
