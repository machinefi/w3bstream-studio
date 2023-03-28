import { FilesItemType } from '@/store/lib/w3bstream/schema/filesList';
import { v4 as uuidv4 } from 'uuid';
import { templatecode } from './templatecode';

export const examples: FilesItemType = {
  type: 'folder',
  key: uuidv4(),
  label: `Examples`,
  children: [
    {
      type: 'file',
      key: uuidv4(),
      label: `json.ts`,
      data: {
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
      data: { code: templatecode['log.ts'], language: 'typescript' }
    },
    {
      type: 'file',
      key: uuidv4(),
      label: `sendTx.ts`,
      data: { code: templatecode['sendTx.ts'], language: 'typescript' }
    },
    {
      type: 'file',
      key: uuidv4(),
      label: `setDB.ts`,
      data: { code: templatecode['setDB.ts'], language: 'typescript' }
    }
  ]
};
