import { IndexDb } from '@/lib/dexie';
import { toast } from '@/lib/helper';
import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { JSONValue } from '@/store/standard/JSONSchemaState';
import _ from 'lodash';
import { toJS } from 'mobx';
import { string } from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { templatecode } from '../../../../lib/templatecode';

type FileItemDataType<T = any> = {
  code?: string;
  language?: 'typescript' | 'scheme' | 'html';

  extraData?: T;
};

export type FilesItemType = {
  key: string;
  label: string;
  isOpen?: Boolean;
  isRename?: Boolean;
  type: 'folder' | 'file';
  data?: FileItemDataType;
  children?: FilesItemType[];
};

export type FilesType = {
  activeFileIds?: string[];
  curActiveFileId?: string;
  files: FilesItemType[];
};

//todo create file in value
export class FilesListSchema extends JSONSchemaState<null, FilesType> {
  lockFile: boolean = true;
  project_id: string;
  constructor(args: Partial<FilesListSchema> = {}) {
    super(args);
    this.init({
      reactive: true,
      extraValue: new JSONValue<FilesType>({
        default: {
          activeFileIds: [],
          curActiveFileId: null,
          files: [
            {
              key: uuidv4(),
              type: 'folder',
              label: 'Browser Files',
              children: [
                {
                  type: 'file',
                  key: uuidv4(),
                  label: `module.ts`,
                  data: { code: templatecode['module.ts'], language: 'typescript' }
                },
                { type: 'file', key: uuidv4(), label: `index.html`, data: { code: templatecode['index.html'], language: 'html' } }
              ]
            },
            {
              key: uuidv4(),
              label: 'Remote Files',
              type: 'folder',
              children: [
                {
                  type: 'file',
                  key: uuidv4(),
                  label: `module.ts`
                }
              ]
            }
          ]
        }
      })
    });
  }

  findFile(objects: FilesItemType[], key: string): FilesItemType {
    for (let o of objects || []) {
      if (o.key == key) return o;
      const o_ = this.findFile(o.children, key);
      if (o_) return o_;
    }
  }

  findCurFolder(objects: FilesItemType[]): FilesItemType {
    for (let o of objects || []) {
      if (o.children?.find((i) => i.key == this.extraData.curActiveFileId)) return o;
      const o_ = this.findCurFolder(o.children);
      if (o_) return o_;
    }
  }

  get activeFiles() {
    const activeFiles = [];
    this.extraData.activeFileIds?.forEach((key) => {
      activeFiles.push(this.findFile(this.extraData.files, key));
    });
    return activeFiles;
  }

  get curActiveFile() {
    return this.findFile(this.extraData.files, this.extraData.curActiveFileId);
  }

  createFileFormFolder(file: FilesItemType, action: 'file' | 'folder') {
    if (file.type == 'folder' && action == 'file') {
      file.children.push({
        type: 'file',
        key: uuidv4(),
        label: `New File`,
        isRename: true,
        data: { code: '', language: 'typescript' }
      });
      file.isOpen = true;
    }
    if (file.type == 'folder' && action == 'folder') {
      file.children.push({
        type: 'folder',
        key: uuidv4(),
        label: `New Folder`,
        isRename: true,
        isOpen: false,
        children: []
      });
      file.isOpen = true;
    }
    this.syncToIndexDb();
  }

  deleteFile(file: FilesItemType) {
    const curFolder = this.findCurFolder(this.extraData.files);
    _.remove(curFolder.children, (i) => i.key == file.key);
    this.syncToIndexDb();
  }

  setActiveFiles(activeFile: FilesItemType) {
    const index = _.findIndex(this.extraData.activeFileIds, (i) => i == activeFile.key);
    if (index == -1) {
      this.extraData.activeFileIds.push(activeFile.key);
    }
    this.syncToIndexDb();
  }

  deleteActiveFiles(activeFile: FilesItemType) {
    _.remove(this.extraData.activeFileIds, (i) => i == activeFile.key);
    console.log(toJS(this.extraData.activeFileIds));
    this.syncToIndexDb();
  }

  setCurFileCode(code: string) {
    if (this.lockFile) return;
    this.curActiveFile.data.code = code;
    _.debounce(() => {
      this.syncToIndexDb();
    })();
  }

  unlockFile() {
    this.lockFile = false;
  }

  lockedFile() {
    this.lockFile = true;
  }

  setCurActiveFile(activeFile: FilesItemType) {
    this.extraData.curActiveFileId = activeFile.key;
    this.lockFile = true;
    this.setActiveFiles(activeFile);
  }

  async syncToIndexDb() {
    const IndexDbFile = await IndexDb.findFilesById(String(this.project_id));
    if (IndexDbFile[0]) {
      await IndexDb.files.update(String(this.project_id), { data: toJS(this.extraData) });
    } else {
      await IndexDb.files.add({ id: String(this.project_id), data: toJS(this.extraData) });
    }
  }
}
