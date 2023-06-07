import { IndexDb } from '@/lib/dexie';
import { _ } from '@/lib/lodash';
import { toJS, makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { VSCodeFilesType } from '../project';
import { helper } from '@/lib/helper';
import { eventBus } from '@/lib/event';
import { StorageState } from '@/store/standard/StorageState';
import { DNDTreeDataType } from '@/components/Tree';

type FileItemDataType<T = any> = {
  dataType?: string; // simulation flow assemblyscript abi env
  code?: string;
  language?: string;
  extraData?: T;
  size?: number;
  [key: string]: any;
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

const tempVScodeFilesStorage = new StorageState<FilesItemType[]>({ key: 'tempVScodeFiles', default: [] });

//todo create file in value
export class FilesListSchema {
  lockFile: boolean = true;
  project_id: string = 'GLOBAL';
  activeFileIds: string[] = [];
  curActiveFileId: string = '';
  files: FilesItemType[] = [
    {
      key: uuidv4(),
      type: 'folder',
      label: 'Browser Files',
      children: [] //assemblyScriptExample
    },
    {
      key: uuidv4(),
      type: 'folder',
      label: VSCodeRemoteFolderName,
      children: []
    }
  ];
  get filesFlatten() {
    const flattenData: DNDTreeDataType[] = [];
    const flatten = (data: FilesItemType[], parent: string) => {
      data?.forEach((item) => {
        flattenData.push({
          id: item?.key,
          parent: parent,
          droppable: item.type == 'folder',
          text: item?.label,
          data: item
        });
        if (item?.children) {
          flatten(item?.children, item?.key);
        }
      });
    };
    flatten(this.files, '0');
    return flattenData;
  }
  currentCopyFile: FilesItemType | null = null;

  constructor(args: Partial<FilesListSchema>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  setVscodeRemotFile(files: VSCodeFilesType[]) {
    console.log(files);
    const hasVscodeFileFolder = this.files.find((i) => i.label == VSCodeRemoteFolderName);
    if (hasVscodeFileFolder) {
      hasVscodeFileFolder.children = [];
      console.log(this.files);
      this.syncToIndexDb();
      if (!files) return (hasVscodeFileFolder.children = []);
      files.forEach((file) => {
        let dataType = 'wasm';
        if (file.name.endsWith('.abi.json')) {
          dataType = 'abi';
        } else if (file.name.endsWith('.wasm')) {
          dataType = 'wasm';
        }

        hasVscodeFileFolder.children.push({
          type: 'file',
          key: helper.stringToBase64(VSCodeRemoteFolderName + file.name),
          isOpen: true,
          label: file.name,
          //todo resolve buffer base64 data to buffer
          data: {
            code: helper.base64ToUTF8(file.content),
            language: helper.getFileLanguage(file.name),
            extraData: {
              raw: helper.base64ToUint8Array(file.content)
            },
            dataType,
            size: file.size
          }
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
    // this.syncToIndexDb();
  }
  findFile(objects: FilesItemType[], key: string): FilesItemType {
    for (let o of objects || []) {
      if (o.key == key) return o;
      const o_ = this.findFile(o.children, key);
      if (o_) return o_;
    }
  }

  findFilesByLabel(objects: FilesItemType[], label: string): FilesItemType[] {
    const files: FilesItemType[] = [];
    for (let o of objects || []) {
      if (o.label == label) files.push(o);
      if (o.children) files.push(...this.findFilesByLabel(o.children, label));
    }
    return files;
  }

  findCurFolder(objects: FilesItemType[]): FilesItemType {
    for (let o of objects || []) {
      if (o.children?.find((i) => i.key == this.curActiveFileId)) return o;
      const o_ = this.findCurFolder(o.children);
      if (o_) return o_;
    }
  }

  findParentFolder(objects: FilesItemType[], key: string): FilesItemType {
    for (let o of objects || []) {
      if (o.children?.find((i) => i.key == key)) return o;
      const o_ = this.findParentFolder(o.children, key);
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

  curActiveFileIs(label: string | string[]) {
    if (Array.isArray(label)) {
      return label.some((i) => this.curActiveFile?.label.endsWith(`.${i}`));
    }
    return this?.curActiveFile?.label.endsWith(`.${label}`);
  }

  regenFileKey(file: FilesItemType) {
    file.key = uuidv4();
    file.children?.forEach((i) => this.regenFileKey(i));
  }

  createFileFormFolder(file: FilesItemType, action: 'file' | 'folder', _template?: FilesItemType) {
    const template = _.cloneDeep(_template);
    template && this.regenFileKey(template);
    console.log(template);
    if (file.type == 'folder' && action == 'file') {
      file.children.push(
        template ?? {
          type: 'file',
          key: uuidv4(),
          label: `NewFile.ts`,
          isRename: true,
          data: { code: '', language: 'typescript' }
        }
      );
      file.isOpen = true;
    }
    if (file.type == 'folder' && action == 'folder') {
      file.children.push(
        template ?? {
          type: 'folder',
          key: uuidv4(),
          label: `New Folder`,
          isRename: true,
          isOpen: false,
          children: []
        }
      );
      file.isOpen = true;
    }
    eventBus.emit('file.change');
    this.syncToIndexDb();
  }

  moveFileFromKey(srouceKey: string, targetKey: string) {
    //find Parent folder, if folder is same , swap the index
    // console.log(srouceKey, targetKey, toJS(this.files));
    const sourceFile = this.findFile(this.files, srouceKey);
    const targetFile = this.findFile(this.files, targetKey);
    // console.log(toJS(sourceFile), toJS(targetFile));
    const sourceFolder = this.findParentFolder(this.files, srouceKey);
    const targetFolder = targetFile.type == 'folder' ? targetFile : this.findParentFolder(this.files, targetKey);
    // console.log(sourceFile.label, targetFile.label, targetFolder.label);
    if (targetFile.label == 'VSCode Files' || sourceFile == targetFile) return;
    if (sourceFolder.key == targetFolder.key) {
      const sourceIndex = _.findIndex(sourceFolder.children, (i) => i.key == srouceKey);
      const targetIndex = _.findIndex(sourceFolder.children, (i) => i.key == targetKey);
      const temp = sourceFolder.children[sourceIndex];
      sourceFolder.children[sourceIndex] = sourceFolder.children[targetIndex];
      sourceFolder.children[targetIndex] = temp;
      // console.log('sourceFolder.key == targetFolder.key');
      eventBus.emit('file.change');
      this.syncToIndexDb();
    } else {
      // console.log('remove');
      _.remove(sourceFolder.children, (i) => i.key == srouceKey);
      targetFolder.children.push(sourceFile);
      eventBus.emit('file.change');
      this.syncToIndexDb();
    }
  }

  deleteFile(file: FilesItemType) {
    this.deleteFileDeep(this.files, file);
  }

  deleteFileDeep(sourceFile: FilesItemType[], file: FilesItemType) {
    sourceFile?.forEach((i) => {
      const index = _.findIndex(i?.children, (j) => j.key == file.key);
      if (index != -1) {
        _.remove(i?.children, (i) => i.key == file.key);
      } else {
        this.deleteFileDeep(i?.children, file);
      }
    });
    eventBus.emit('file.change');
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
      // _.remove(this.activeFileIds, (i) => i == activeFile.key);
      this.activeFileIds.splice(index, 1);
      if (this.activeFileIds[index] == this.curActiveFileId) {
        this.curActiveFileId = '';
      }
    }
    this.syncToIndexDb();
  }

  deleteOtherActiveFiles(activeFile: FilesItemType) {
    this.activeFileIds = [activeFile.key];
    this.syncToIndexDb();
  }

  deleteRightActiveFiles(activeFile: FilesItemType) {
    const index = _.findIndex(this.activeFileIds, (i) => i == activeFile.key);
    if (index != -1) {
      this.activeFileIds.splice(index + 1, this.activeFileIds.length - index - 1);
    }
    this.syncToIndexDb();
  }

  deleteLeftActiveFiles(activeFile: FilesItemType) {
    const index = _.findIndex(this.activeFileIds, (i) => i == activeFile.key);
    if (index != -1) {
      this.activeFileIds.splice(0, index);
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

  findENV(key: string) {
    const envFiles = this.findFilesByLabel(this.files, '.env');
    console.log(envFiles);
    let env = {};
    if (envFiles) {
      envFiles.forEach((file) => {
        const _env = file.data.code.split('\n').reduce((acc, cur) => {
          const [key, value] = cur.split('=');
          acc[key] = value;
          return acc;
        }, {});
        env = { ...env, ..._env };
      });
    }
    console.log(env);
    return env?.[key] ?? null;
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
