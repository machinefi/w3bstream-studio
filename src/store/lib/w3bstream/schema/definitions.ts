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
      const { allPublishers, curPublisherProjectID } = rootStore.w3s;
      const publishers = allPublishers.filter((item) => item.project_id === curPublisherProjectID);
      return publishers.map((i) => `${i.f_publisher_id}`) || [];
    },
    get enumNames() {
      const { allPublishers, curPublisherProjectID } = rootStore.w3s;
      const publishers = allPublishers.filter((item) => item.project_id === curPublisherProjectID);
      return publishers.map((i) => `${i.f_name}`) || [];
    }
  },
  applets: {
    type: 'string',
    get enum() {
      return rootStore.w3s.allApplets.map((i) => i.f_applet_id) || [];
    },
    get enumNames() {
      return rootStore.w3s.allApplets.map((i) => `${i.f_name}`) || [];
    }
  }
};
