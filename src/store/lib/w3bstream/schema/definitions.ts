import { rootStore } from '../../../index';

export const definitions = {
  projects: {
    type: 'string',
    get enum() {
      return rootStore.w3s.projects.value?.data?.map((i) => i.projectID) || [];
    },
    get enumNames() {
      return rootStore.w3s.projects.value?.data?.map((i) => `${i.name}-${i.version}`) || [];
    }
  },
  applets: {
    type: 'string',
    get enum() {
      return rootStore.w3s.applets.value?.data?.map((i) => i.appletID) || [];
    },
    get enumNames() {
      return rootStore.w3s.applets.value?.data?.map((i) => `${i.name}`) || [];
    }
  }
};
