import _ from '@/lib/lodash';
import { FilesItemType } from './filesList';

export const definitions = {
  wasmcodeFiles: {
    type: 'string',
    get enum() {
      const files = [];
      const findWasmCode = (arr: FilesItemType[]) => {
        arr.forEach((i) => {
          if (i.data?.dataType === 'assemblyscript') {
            files.push(i.key);
          } else if (i.type === 'folder') {
            findWasmCode(i.children);
          }
        });
      };
      findWasmCode(globalThis.store.w3s.projectManager.curFilesList as FilesItemType[]);
      return files || [];
    },
    get enumNames() {
      const fileNames = [];
      const findWasmCode = (arr: FilesItemType[]) => {
        arr.forEach((i) => {
          if (i.data?.dataType === 'assemblyscript') {
            fileNames.push(i.label);
          } else if (i.type === 'folder') {
            findWasmCode(i.children);
          }
        });
      };
      findWasmCode(globalThis.store.w3s.projectManager.curFilesList as FilesItemType[]);
      return fileNames || [];
    }
  },

  projects: {
    type: 'string',
    get enum() {
      return globalThis.store.w3s.project.allProjects.value?.map((i) => `${i.f_project_id}`) || [];
    },
    get enumNames() {
      return globalThis.store.w3s.project.allProjects.value?.map((i) => `${i.f_name}`) || [];
    }
  },
  projectName: {
    type: 'string',
    get enum() {
      return globalThis.store.w3s.project.allProjects.value?.map((i) => `${i.f_name}`) || [];
    },
    get enumNames() {
      return globalThis.store.w3s.project.allProjects.value?.map((i) => `${i.f_name}`) || [];
    }
  },
  publishers: {
    type: 'string',
    get enum() {
      const allPublishers = globalThis.store.w3s.publisher.allData;
      return allPublishers.length ? allPublishers.map((i) => `${i.f_publisher_id}`) : [''];
    },
    get enumNames() {
      const allPublishers = globalThis.store.w3s.publisher.allData;
      return allPublishers.length ? allPublishers.map((i) => `${i.f_name}`) : [''];
    }
  },
  applets: {
    type: 'string',
    get enum() {
      const allApplets = globalThis.store.w3s.applet.allData;
      return allApplets.map((i) => i.f_applet_id);
    },
    get enumNames() {
      const allApplets = globalThis.store.w3s.applet.allData;
      return allApplets.map((i) => `${i.f_name}`);
    }
  }
};
