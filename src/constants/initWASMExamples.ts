import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { v4 as uuidv4 } from 'uuid';
import { templatecode } from './templatecode';
// case "INT":
//   return DATATYPE__INT, nil
// case "INT8":
//   return DATATYPE__INT8, nil
// case "INT16":
//   return DATATYPE__INT16, nil
// case "INT32":
//   return DATATYPE__INT32, nil
// case "INT64":
//   return DATATYPE__INT64, nil
// case "UINT":
//   return DATATYPE__UINT, nil
// case "UINT8":
//   return DATATYPE__UINT8, nil
// case "UINT16":
//   return DATATYPE__UINT16, nil
// case "UINT32":
//   return DATATYPE__UINT32, nil
// case "UINT64":
//   return DATATYPE__UINT64, nil
// case "FLOAT32":
//   return DATATYPE__FLOAT32, nil
// case "FLOAT64":
//   return DATATYPE__FLOAT64, nil
// case "TEXT":
//   return DATATYPE__TEXT, nil
// case "BOOL":
//   return DATATYPE__BOOL, nil
// case "TIMESTAMP":
//   return DATATYPE__TIMESTAMP, nil
// }

export const assemblyScriptExample: FilesItemType = {
  type: 'folder',
  key: uuidv4(),
  label: `Examples`,
  children: [
    {
      type: 'file',
      key: uuidv4(),
      label: `json.ts`,
      data: {
        dataType: 'assemblyscript',
        code: templatecode['json.ts'],
        language: 'typescript',
        extraData: {
          payload: {
            employees: {
              employee: [
                { id: '1', firstName: 'Tom', lastName: 'Cruise', photo: 'https://jsonformatter.org/img/tom-cruise.jpg' },
                { id: '2', firstName: 'Maria', lastName: 'Sharapova', photo: 'https://jsonformatter.org/img/Maria-Sharapova.jpg' },
                { id: '3', firstName: 'Robert', lastName: 'Downey Jr.', photo: 'https://jsonformatter.org/img/Robert-Downey-Jr.jpg' }
              ]
            }
          }
        }
      }
    },
    {
      type: 'file',
      key: uuidv4(),
      label: `log.ts`,
      data: { dataType: 'assemblyscript', code: templatecode['log.ts'], language: 'typescript' }
    },
    {
      type: 'file',
      key: uuidv4(),
      label: `sendTx.ts`,
      data: { dataType: 'assemblyscript', code: templatecode['sendTx.ts'], language: 'typescript' }
    },
    {
      type: 'file',
      key: uuidv4(),
      label: `setDB.ts`,
      data: { dataType: 'assemblyscript', code: templatecode['setDB.ts'], language: 'typescript' }
    },
    {
      type: 'file',
      key: uuidv4(),
      label: `sql.ts`,
      data: { dataType: 'assemblyscript', code: templatecode['sql.ts'], language: 'typescript' }
    }
  ]
};

export const flowExample: FilesItemType = {
  type: 'folder',
  key: uuidv4(),
  label: `Examples`,
  children: [
    {
      type: 'file',
      key: uuidv4(),
      label: `basic.flow`,
      data: {
        dataType: 'flow',
        nodes: [],
        edges: []
      }
    }
  ]
};

export const SqlExample: FilesItemType = {
  type: 'folder',
  key: uuidv4(),
  label: `Examples`,
  children: [
    {
      type: 'file',
      key: uuidv4(),
      label: `sql.json`,
      data: {
        dataType: 'sql',
        code: JSON.stringify(
          [
            {
              name: 't_log',
              desc: 'test table',
              cols: [
                {
                  name: 'number',
                  constrains: {
                    datatype: 'UIN8',
                    length: 255,
                    desc: 'number'
                  }
                },
                {
                  name: 'text',
                  constrains: {
                    datatype: 'TEXT',
                    length: 255,
                    default: '0',
                    desc: 'text'
                  }
                },
                {
                  name: 'boolean',
                  constrains: {
                    datatype: 'BOOL',
                    length: 0,
                    desc: ''
                  }
                }
              ],
              keys: [
                {
                  name: 'ui_username',
                  isUnique: true,
                  columnNames: ['number']
                }
              ],
              withSoftDeletion: true,
              withPrimaryKey: true
            }
          ],
          null,
          2
        )
      }
    }
  ]
};

export const simulationExample: FilesItemType = {
  type: 'folder',
  key: uuidv4(),
  label: `Examples`,
  children: [
    {
      type: 'file',
      key: uuidv4(),
      label: `simulation.ts`,
      data: {
        dataType: 'simulation',
        code: `
//https://github.com/faker-js/faker
function createRandomUser() {
  return {
    userId: faker.datatype.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    birthdate: faker.date.birthdate(),
    registeredAt: faker.date.past(),
  };
}

return faker.helpers.multiple(createRandomUser, {
  count: 5,
});
`
      }
    }
  ]
};
