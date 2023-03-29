// @external("env", "abort")
// export function start(rid: i32): i32 {
//   Log("Log:start from typescript123");
//   SetDB("test",1);
//   SendTx(
//       4690,
//       "0x4BF7916893DfA78834B2F8B535654682d36e1163",
//       "0",
//       `6a627842000000000000000000000000${"0x9117f5EF4156709092f79740a97b1638cA399A00".replace("0x", "")}`
//     );
//   // const message = GetDataByRID(rid);
//   return rid;
// }

import { assemblyscriptJSON } from "./assemblyscript-json";

// declare function abort(message: usize ,fileName: usize ,lineNumber: u32,columnNumber: u32): void
export const wasm_vm_sdk = `
${assemblyscriptJSON}
@external("env", "ws_log")
  declare function ws_log(logLevel: u8, ptr: usize, size: usize): i32

@external("env", "ws_set_db")
  declare function ws_set_db(key_ptr: usize, ket_size: i32, return_ptr: usize, return_size: i32): i32
  
@external("env", "ws_get_db")
  declare function ws_get_db(addr: usize, size: usize, rAddr: usize, rSize: usize): i32

@external("env", "ws_send_tx")
  declare function ws_send_tx(chainID: i32, offset: usize, size: usize, vmAddrPtr: usize, vmSizePtr: usize): i32

@external("env", "ws_call_contract")
  declare function ws_call_contract(chainID: i32, offset: usize, size: usize, vmAddrPtr: usize, vmSizePtr: usize): i32

@external("env", "ws_get_data")
  declare function ws_get_data(rid: i32, data_ptr: usize, size_ptr: usize): i32

export function alloc(size: usize): usize {
    return heap.alloc(size);
}

export function freeResource(rid: i32): void {
    heap.free(rid);
}

export function Log(message: string): i32 {
  let strEncoded = String.UTF8.encode(message, false);
  let message_ptr = changetype<usize>(strEncoded);
  let message_size = strEncoded.byteLength;
  ws_log(3, message_ptr, message_size); // logInfoLevel = 3
  return 0;
}

export function GetDataByRID(rid: i32): string {
  let memory_ptr = heap.alloc(sizeof<u32>());
  let size_ptr = heap.alloc(sizeof<u32>());
  //todo fix bugmemory_ptr
  let code = ws_get_data(rid, memory_ptr, size_ptr);
  if (code == 0) {
    let data_ptr = load<u32>(memory_ptr);
    let data_size = load<u32>(size_ptr);
    let data = String.UTF8.decodeUnsafe(data_ptr, data_size, true);
    //gc
    heap.free(data_ptr);
    heap.free(size_ptr);
    return data;
  }
  return "";
}

export function SetDB(key: string, value: i32): i32 {
  let keyEncoded = String.UTF8.encode(key, false);
  let key_ptr = changetype<usize>(keyEncoded);
  let key_size = keyEncoded.byteLength;
  let valueEncoded = String.UTF8.encode(value.toString(), false);
  let value_ptr = changetype<usize>(valueEncoded);
  let value_size = valueEncoded.byteLength;
  ws_set_db(key_ptr, key_size, value_ptr, value_size);
  return 0;
}

export function GetDB(key: string): string | null {
  //key to ptr
  let keyEncoded = String.UTF8.encode(key, false);
  let key_ptr = changetype<usize>(keyEncoded);
  let key_size = keyEncoded.byteLength;

  let rAddr = heap.alloc(sizeof<u32>());
  let rSize = heap.alloc(sizeof<u32>());

  let code = ws_get_db(key_ptr, key_size, rAddr, rSize);
  if (code != 0) {
      return null
      // assert(false, "GetDB failed");
  }
  let rAddrValue = load<u32>(rAddr);
  let rAddrSize = load<u32>(rSize);
  let data = String.UTF8.decodeUnsafe(rAddrValue, rAddrSize, true);
  heap.free(rAddr);
  heap.free(rSize);
  return data;
}



export function SendTx(chainId: i32, to:string, value:string ,data:string): string {
  let tx = \`
  {
      "to": "\${to}",
      "value": "\${value}",
      "data": "\${data.replace('0x','')}"
  }\`
  Log(tx)
  let txEncoded = String.UTF8.encode(tx, false);
  let tx_ptr = changetype<usize>(txEncoded);
  let tx_size = txEncoded.byteLength;

  let vmAddrPtr = heap.alloc(sizeof<u32>());
  let vmSizePtr = heap.alloc(sizeof<u32>());

  const ret = ws_send_tx(chainId, tx_ptr, tx_size, vmAddrPtr, vmSizePtr);

  if(ret!=0) {
    assert(false, "send tx failed");
  }

  let vmAddr = load<u32>(vmAddrPtr);
  let vmSize = load<u32>(vmSizePtr);

  let vm = String.UTF8.decodeUnsafe(vmAddr, vmSize, true);

  heap.free(vmAddrPtr);
  heap.free(vmSizePtr);

  return vm;
}

export function CallContract(chainId:i32,to:string,data:string):string {
  let tx = \`
  {
      "to": "\${to}",
      "data": "\${data.replace('0x','')}"
  }\`
  let txEncoded = String.UTF8.encode(tx, false);
  let tx_ptr = changetype<usize>(txEncoded);
  let tx_size = txEncoded.byteLength;

  let vmAddrPtr = heap.alloc(sizeof<u32>());
  let vmSizePtr = heap.alloc(sizeof<u32>());

  const ret = ws_call_contract(chainId, tx_ptr, tx_size, vmAddrPtr, vmSizePtr);

  if(ret!=0) {
    assert(false, "send tx failed");
  }

  let vmAddr = load<u32>(vmAddrPtr);
  let vmSize = load<u32>(vmSizePtr);

  let vm = String.UTF8.decodeUnsafe(vmAddr, vmSize, true);

  heap.free(vmAddrPtr);
  heap.free(vmSizePtr);

  return vm;
}
`;
