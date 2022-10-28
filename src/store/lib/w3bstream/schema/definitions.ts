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
      const { curPublisherProjectID } = rootStore.w3s;
      const allPublishers = rootStore.w3s.publishers.table.dataSource;
      const publishers = allPublishers.filter((item) => item.project_id === curPublisherProjectID);
      return publishers.map((i) => `${i.f_publisher_id}`) || [];
    },
    get enumNames() {
      const { curPublisherProjectID } = rootStore.w3s;
      const allPublishers = rootStore.w3s.publishers.table.dataSource;
      const publishers = allPublishers.filter((item) => item.project_id === curPublisherProjectID);
      return publishers.map((i) => `${i.f_name}`) || [];
    }
  },
  applets: {
    type: 'string',
    get enum() {
      const allApplets = rootStore.w3s.applets.table.dataSource;
      return allApplets.map((i) => i.f_applet_id) || [];
    },
    get enumNames() {
      const allApplets = rootStore.w3s.applets.table.dataSource;
      return allApplets.map((i) => `${i.f_name}`) || [];
    }
  }
};
