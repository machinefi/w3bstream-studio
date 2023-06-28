import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { v4 as uuidv4 } from 'uuid';
import { assemblyScriptExample } from './initWASMExamples';

export const labExamples: FilesItemType[] = [
  {
    type: 'folder',
    key: uuidv4(),
    label: `WASM Example`,
    children: assemblyScriptExample.children
  },
  {
    type: 'folder',
    key: '295ae397-d790-47d6-83df-1489016e0033',
    label: 'IotExample',
    isRename: false,
    isOpen: true,
    children: [
      {
        type: 'file',
        key: '36b173d3-2258-4db5-a4f4-1284c0f5ba4b',
        label: 'index.as',
        data: {
          dataType: 'assemblyscript',
          code: '\n  //sdk docs:https://github.com/machinefi/w3bstream-wasm-ts-sdk\n  export function start(rid: i32): i32 {\n    const message = GetDataByRID(rid);\n    const deviceName = GetEnv(\'DEVICE_NAME\');\n    Log("wasm received message:" + message);\n    Log("deviceName:" + deviceName)\n    let JSONMessage: JSON.Obj = JSON.parse(message) as JSON.Obj;\n    let snr: JSON.Integer | null = JSONMessage.getInteger("snr");\n    let latitude: JSON.Float | null = JSONMessage.getFloat("latitude");\n    let longitude: JSON.Float | null = JSONMessage.getFloat("longitude");\n    let temperature: JSON.Integer | null = JSONMessage.getInteger("temperature");\n    if(snr && latitude && longitude && temperature){\n      let _snr:i64 = snr.valueOf();\n      let _latitude:f64 = latitude.valueOf();\n      let _longitude:f64 = longitude.valueOf();\n      let _temperature:i64 = temperature.valueOf();\n      Log(_snr.toString());\n      Log(_latitude.toString());\n      Log(_longitude.toString());\n      Log(_temperature.toString());\n\n      ExecSQL("INSERT INTO t_iot (snr,lat,long,temperature) VALUES (?,?,?,?);",[new SQL.Int64(_snr),new SQL.Float64(_latitude),new SQL.Float64(_longitude),new SQL.Int64(_temperature)])\n    }\n  \n    // if()\n    return 0;\n  }\n  ',
          language: 'typescript'
        },
        isRename: false
      },
      {
        type: 'file',
        key: '2f021274-2b0c-4fb6-b12a-4089875b0cb4',
        label: 'iot-simulate.ts',
        data: {
          dataType: 'simulation',
          language: 'typescript',
          code: '\n//https://github.com/faker-js/faker\nfunction createRandomUser() {\n  return {\n    snr: faker.number.int({max:1000000}),\n    latitude: faker.location.latitude(),\n    longitude: faker.location.longitude(),\n    gasResistance: faker.number.int(),\n    temperature: faker.number.int({max:100,min:10}),\n    light: faker.number.int(),\n    random: faker.datatype.uuid()\n  };\n}\n\nreturn createRandomUser()\n'
        }
      },
      {
        type: 'file',
        key: 'db6f5833-2b86-4ffb-ab23-d7b0d953bdb0',
        label: 't_iot.json',
        data: {
          dataType: 'sql',
          code: JSON.stringify(
            {
              schemas: [
                {
                  schemaName: 'public',
                  tables: [
                    {
                      tableName: 't_iot',
                      tableSchema: 'public',
                      comment: 'iot table',
                      columns: [
                        {
                          name: 'snr',
                          type: 'int8',
                          isIdentity: true,
                          isNullable: false,
                          isUnique: false,
                          isPrimaryKey: true,
                          comment: 'primary id'
                        },
                        {
                          name: 'lat',
                          type: 'float4',
                          defaultValue: null,
                          isIdentity: false,
                          isNullable: true,
                          isUnique: false,
                          isPrimaryKey: false,
                          comment: null
                        },
                        {
                          name: 'long',
                          type: 'float4',
                          defaultValue: null,
                          isIdentity: false,
                          isNullable: true,
                          isUnique: false,
                          isPrimaryKey: false,
                          comment: null
                        },
                        {
                          name: 'temperature',
                          type: 'int8',
                          defaultValue: null,
                          isIdentity: false,
                          isNullable: false,
                          isUnique: false,
                          isPrimaryKey: false,
                          comment: null
                        }
                      ],
                      relationships: []
                    }
                  ]
                }
              ]
            },
            null,
            2
          ),
          language: 'json'
        },
        isRename: false
      },
      { type: 'file', key: '3f22e866-6b5b-433b-b3d6-42bf9fc41319', label: '.env', data: { dataType: 'env', code: 'DEVICE_NAME=ESP32', language: 'env' } },
      {
        type: 'file',
        key: 'c66404f3-8865-48ab-9661-d86841d34d9e',
        label: 'basic.flow',
        data: {
          nodes: [
            {
              id: '1682491671393',
              type: 'SimulationNode',
              position: { x: 107, y: 358 },
              data: {
                code: '\n//https://github.com/faker-js/faker\nfunction createRandomUser() {\n  return {\n    snr: faker.number.int({max:10000}),\n    latitude: faker.location.latitude(),\n    longitude: faker.location.longitude(),\n    gasResistance: faker.number.int(),\n    temperature: faker.number.int({max:100,min:10}),\n    light: faker.number.int(),\n    random: faker.datatype.uuid()\n  };\n}\n\nreturn createRandomUser()\n',
                triggerInterval: 2,
                label: 'Simulation'
              }
            },
            { id: '1682491679529', type: 'VmRunTimeNode', position: { x: 1148, y: 346 }, data: { handler: 'start', label: 'VM runtime' } },
            {
              id: '1682491683609',
              type: 'AssemblyScriptNode',
              position: { x: 622, y: 425 },
              data: {
                code: '\n  //sdk docs:https://github.com/machinefi/w3bstream-wasm-ts-sdk\n  export function start(rid: i32): i32 {\n    const message = GetDataByRID(rid);\n    const deviceName = GetEnv(\'DEVICE_NAME\');\n    Log("wasm received message:" + message);\n    Log("deviceName:" + deviceName)\n    let JSONMessage: JSON.Obj = JSON.parse(message) as JSON.Obj;\n    let snr: JSON.Integer | null = JSONMessage.getInteger("snr");\n    let latitude: JSON.Float | null = JSONMessage.getFloat("latitude");\n    let longitude: JSON.Float | null = JSONMessage.getFloat("longitude");\n    let temperature: JSON.Integer | null = JSONMessage.getInteger("temperature");\n    if(snr && latitude && longitude && temperature){\n      let _snr:i64 = snr.valueOf();\n      let _latitude:f64 = latitude.valueOf();\n      let _longitude:f64 = longitude.valueOf();\n      let _temperature:i64 = temperature.valueOf();\n      Log(_snr.toString());\n      Log(_latitude.toString());\n      Log(_longitude.toString());\n      Log(_temperature.toString());\n\n      ExecSQL("INSERT INTO t_iot (snr,lat,long,temperature) VALUES (?,?,?,?);",[new SQL.Int64(_snr),new SQL.Float64(_latitude),new SQL.Float64(_longitude),new SQL.Int64(_temperature)])\n    }\n  \n    // if()\n    return 0;\n  }\n  ',
                label: 'AssemblyScript'
              }
            },
            { id: '1682589452818', type: 'DatabaseNode', position: { x: 1063, y: 735 }, data: { db: '', label: 'Database' } }
          ],
          edges: [
            {
              source: '1682491683609',
              sourceHandle: 'variable-source',
              target: '1682491679529',
              targetHandle: 'variable-target-wasm',
              animated: true,
              markerEnd: { type: 'arrowclosed' },
              id: 'reactflow__edge-1682491683609-1682491679529'
            },
            {
              source: '1682491671393',
              sourceHandle: 'flow-source',
              target: '1682491679529',
              targetHandle: 'flow-target',
              animated: true,
              markerEnd: { type: 'arrowclosed' },
              id: 'reactflow__edge-1682491671393-1682491679529'
            }
          ]
        }
      }
    ]
  }
];
