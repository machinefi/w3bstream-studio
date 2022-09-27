import Axios from 'axios';
import { publicConfig } from '../config/public';
import { rootStore } from '../store/index';
import { showNotification } from '@mantine/notifications';

export const axios = Axios.create({});

axios.interceptors.request.use((req) => {
  req.baseURL = rootStore.w3s.config.formData.apiUrl;
  if (rootStore.w3s.config.formData.token) {
    req.headers['Authorization'] = `${rootStore.w3s.config.formData.token}`;
  }
  return req;
});

axios.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    console.error(err);
    const data = err.response.data;
    if (data.desc) {
      showNotification({
        color: 'red',
        message: data.desc
      });
      return;
    }
    return Promise.reject(err);
  }
);
