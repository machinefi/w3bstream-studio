import { IndexDb } from '@/lib/dexie';
import _ from 'lodash';
import { toJS, makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { templatecode } from '../../../../lib/templatecode';
import { VSCodeFilesType } from '../project';
import { helper } from '@/lib/helper';

type FileItemDataType<T = any> = {
  code?: string;
  language?: string;
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

export const VSCodeRemoteFolderName = 'VSCode Files';

//todo create file in value
export class FilesListSchema {
  lockFile: boolean = true;
  project_id: string;
  activeFileIds: string[] = [];
  curActiveFileId: string = '';
  files: FilesItemType[] = [
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
        }
      ]
    },
    {
      key: uuidv4(),
      type: 'folder',
      label: VSCodeRemoteFolderName,
      children: []
    }
  ];

  constructor(args: Partial<FilesListSchema>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  setVscodeRemotFile(files: VSCodeFilesType[]) {
    const hasVscodeFileFolder = this.files.find((i) => i.label == VSCodeRemoteFolderName);
    if (hasVscodeFileFolder) {
      hasVscodeFileFolder.children = [];
      if (!files) return;
      files.forEach((file) => {
        hasVscodeFileFolder.children.push({
          type: 'file',
          key: helper.stringToBase64(VSCodeRemoteFolderName + file.name),
          isOpen: true,
          label: file.name,
          //todo resolve buffer base64 data to buffer
          data: { code:helper.base64ToUTF8(file.content), language: helper.getFileLanguage(file.name),extraData:{
            raw:helper.base64ToUint8Array(file.content)
          }}
        });
      });
    } else {
      this.files.push({
        key: uuidv4(),
        type: 'folder',
        label: 'VSCode Files',
        children: []
      });
      this.setVscodeRemotFile(files);
    }
    this.syncToIndexDb();
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
      if (o.children?.find((i) => i.key == this.curActiveFileId)) return o;
      const o_ = this.findCurFolder(o.children);
      if (o_) return o_;
    }
  }

  get activeFiles(): FilesItemType[] {
    const activeFiles: FilesItemType[] = [];
    this.activeFileIds?.forEach((key) => {
      activeFiles.push(this.findFile(this.files, key));
    });
    return activeFiles;
  }

  get curActiveFile() {
    return this.findFile(this.files, this.curActiveFileId) || null;
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
    const curFolder = this.findCurFolder(this.files);
    if (curFolder.children) {
      _.remove(curFolder.children, (i) => i.key == file.key);
    }
    this.deleteActiveFiles(file);
  }

  setActiveFiles(activeFile: FilesItemType) {
    const index = _.findIndex(this.activeFileIds, (i) => i == activeFile.key);
    if (index == -1) {
      this.activeFileIds.push(activeFile.key);
    }
    this.syncToIndexDb();
  }

  deleteActiveFiles(activeFile: FilesItemType) {
    const index = _.findIndex(this.activeFileIds, (i) => i == activeFile.key);
    if (index != -1) {
      if (this.activeFileIds[index] == this.curActiveFileId) {
        this.curActiveFileId = '';
        console.log('curActiveFileId null', this.curActiveFileId);
      }
      _.remove(this.activeFileIds, (i) => i == activeFile.key);
    }
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
    this.curActiveFileId = activeFile.key;
    this.lockFile = true;
    this.setActiveFiles(activeFile);
  }

  async syncToIndexDb() {
    const IndexDbFile = await IndexDb.findFilesById(String(this.project_id));
    if (IndexDbFile[0]) {
      await IndexDb.files.update(String(this.project_id), { data: toJS(this) });
    } else {
      await IndexDb.files.add({ id: String(this.project_id), data: toJS(this) });
    }
  }
}
