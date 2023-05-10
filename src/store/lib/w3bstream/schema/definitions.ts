import { helper } from '@/lib/helper';
import { Indexer } from '@/lib/indexer';
import { rootStore } from '@/store/index';
import { ContractInstance } from '../../ContractInstance';

export const definitions = {
  projects: {
    type: 'string',
    get enum() {
      return globalThis.store.w3s.project.allProjects.value?.map((i) => `${i.f_project_id}`) || [];
    },
    get enumNames() {
      return globalThis.store.w3s.project.allProjects.value?.map((i) => `${i.name}`) || [];
    }
  },
  projectName: {
    type: 'string',
    get enum() {
      return globalThis.store.w3s.project.allProjects.value?.map((i) => `${i.name}`) || [];
    },
    get enumNames() {
      return globalThis.store.w3s.project.allProjects.value?.map((i) => `${i.name}`) || [];
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
      return allPublishers.length ? allPublishers.map((i) => `${i.f_key}`) : [''];
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
  },
  blockChains: {
    type: 'string',
    get enum() {
      return globalThis.store.w3s.blockChain.allBlockChain.value?.map((i) => `${i.f_chain_id}`) || [];
    },
    get enumNames() {
      return globalThis.store.w3s.blockChain.allBlockChain.value?.map((i) => `${i.f_chain_id}`) || [];
    }
  },
  labContracts: {
    type: 'string',
    get enum() {
      const files = [];
      const findAssemblyScriptCode = (arr) => {
        arr?.forEach((i) => {
          if (i.data?.dataType === 'abi') {
            files.push(i.data.code);
          } else if (i.type === 'folder') {
            findAssemblyScriptCode(i.children);
          }
        });
      };
      findAssemblyScriptCode(globalThis.store?.w3s?.projectManager.curFilesList ?? []);
      return files || [];
    },
    get enumNames() {
      const files = [];
      const findAssemblyScriptCode = (arr) => {
        arr?.forEach((i) => {
          if (i.data?.dataType === 'abi') {
            files.push(i.label);
          } else if (i.type === 'folder') {
            findAssemblyScriptCode(i.children);
          }
        });
      };
      findAssemblyScriptCode(globalThis.store?.w3s?.projectManager.curFilesList ?? []);
      return files || [];
    }
  },
  labContractEvents: {
    type: 'string',
    get enum() {
      let files = [];
      const { abi, address } = helper.string.validAbi(rootStore.w3s.lab.simulationIndexerForm.value.value.contract);
      if (!abi) return [];
      const contractInstance = new ContractInstance({ abi });
      files = contractInstance.events.map((i) => i.name);
      return files || [];
    },
    get enumNames() {
      let files = [];
      const { abi, address } = helper.string.validAbi(rootStore.w3s.lab.simulationIndexerForm.value.value.contract);
      if (!abi) return [];
      const contractInstance = new ContractInstance({ abi });
      files = contractInstance.events.map((i) => i.name);
      return files || [];
    }
  },
  labContractIndexerHistory: {
    type: 'string',
    get enum() {
      return Indexer.indexderHistory.list.map((i) => JSON.stringify(i)) || [];
    },
    get enumNames() {
      return Indexer.indexderHistory.list.map((i) => `${i.chainId}-${i.contractAddress}-${i.contractEventName}-${i.startBlock}`) || [];
    }
  }
};
