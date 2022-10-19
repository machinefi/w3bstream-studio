import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { JSONValue } from '@/store/standard/JSONSchemaState';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { templatecode } from '../../../../lib/templatecode';

type FileItemDataType<T = any> = {
  code?: string;
  language?: 'typescript' | 'scheme' | 'html';
  type: 'folder' | 'file';
  extraData?: T;
};

export type FilesItemType = {
  key: string;
  label: string;
  data: FileItemDataType;
  icon?: string;
  children?: FilesItemType[];
};

type FilesActiveType = {
  activeFiles: Omit<FilesItemType, 'children'>[];
  curActiveFile: Omit<FilesItemType, 'children'> | null;
  files: FilesItemType[];
};

//todo create file in value
export class FilesListSchema extends JSONSchemaState<null, FilesActiveType> {
  constructor(args: Partial<FilesListSchema> = {}) {
    super(args);
    this.init({
      extraValue: new JSONValue<FilesActiveType>({
        default: {
          activeFiles: [],
          curActiveFile: null,
          files: [
            {
              key: uuidv4(),
              label: 'Local Files',
              data: { type: 'folder' },
              icon: 'pi pi-fw pi-credit-card',
              children: [
                { key: uuidv4(), label: 'module.ts', icon: 'pi pi-fw pi-file', data: { type: 'file', code: templatecode['module.ts'], language: 'typescript' } },
                { key: uuidv4(), label: 'index.html', icon: 'pi pi-fw pi-file', data: { type: 'file', code: templatecode['index.html'], language: 'html' } }
              ]
            },
            {
              key: uuidv4(),
              label: 'Remote Files',
              data: { type: 'folder' },
              icon: 'pi pi-fw pi-cloud',
              children: [
                {
                  key: uuidv4(),
                  label: 'Home',
                  data: { type: 'file' },
                  icon: 'pi pi-fw pi-home'
                }
              ]
            }
          ]
        }
      })
    });
  }

  setActiveFiles(activeFile: FilesItemType) {
    const index = _.findIndex(this.extraData.activeFiles, activeFile);
    if (index == -1) {
      this.extraData.activeFiles.push(activeFile);
    }
  }

  deleteActiveFiles(activeFile: FilesItemType) {
    const index = _.findIndex(this.extraData.activeFiles, activeFile);
    this.extraData.activeFiles.splice(index, 1);
  }

  setCurActiveFile(activeFile: FilesItemType) {
    this.extraData.curActiveFile = activeFile;
    this.setActiveFiles(activeFile);
  }
}
