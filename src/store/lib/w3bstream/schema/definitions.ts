import { rootStore } from '@/store/index';

export const definitions = {
  projects: {
    type: 'string',
    get enum() {
      return rootStore.w3s.allProjects.value?.map((i) => i.f_project_id) || [];
    },
    get enumNames() {
      return rootStore.w3s.allProjects.value?.map((i) => `${i.f_name}`) || [];
    }
  }
  // applets: {
  //   type: 'string',
  //   get enum() {
  //     return rootStore.w3s.applets.value?.data?.map((i) => i.appletID) || [];
  //   },
  //   get enumNames() {
  //     return rootStore.w3s.applets.value?.data?.map((i) => `${i.name}`) || [];
  //   }
  // }
};
