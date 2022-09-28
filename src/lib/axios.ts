import Axios from 'axios';
import { publicConfig } from '../config/public';
import { rootStore } from '../store/index';
import { showNotification } from '@mantine/notifications';

export const axios = Axios.create({});

function checkErr(err) {
  console.error(err);
  const data = err.response?.data;
  if (data?.desc) {
    if (data?.desc.includes('token')) {
      rootStore.w3s.config.logout();
      return;
    }
    showNotification({
      color: 'red',
      message: data.desc
    });
  }
}

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
    checkErr(err);
    return Promise.reject(err);
  }
);
