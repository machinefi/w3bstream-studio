import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { v4 as uuidv4 } from 'uuid';
import { templatecode } from './templatecode';

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
