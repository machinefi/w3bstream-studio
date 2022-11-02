import { rootStore } from '@/store/index';

export const definitions = {
  projects: {
    type: 'string',
    get enum() {
      return rootStore.w3s.allProjects.value?.map((i) => `${i.f_project_id}`) || [];
    },
    get enumNames() {
      return rootStore.w3s.allProjects.value?.map((i) => `${i.f_name}`) || [];
    }
  },
  publishers: {
    type: 'string',
    get enum() {
      const allPublishers = rootStore.w3s.publisher.table.dataSource;
      return allPublishers.map((i) => `${i.f_publisher_id}`) || [];
    },
    get enumNames() {
      const allPublishers = rootStore.w3s.publisher.table.dataSource;
      return allPublishers.map((i) => `${i.f_name}`) || [];
    }
  },
  applets: {
    type: 'string',
    get enum() {
      const allApplets = rootStore.w3s.applet.allData;
      return allApplets.map((i) => i.f_applet_id) || [];
    },
    get enumNames() {
      const allApplets = rootStore.w3s.applet.allData;
      return allApplets.map((i) => `${i.f_name}`) || [];
    }
  }
};
