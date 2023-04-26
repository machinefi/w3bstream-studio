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
    key: uuidv4(),
    label: `Flow Example`,
    children: [
      {
        type: 'file',
        key: uuidv4(),
        label: `json.ts`,
        data: {
          dataType: 'assemblyscript',
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
      }
    ]
  }
];
