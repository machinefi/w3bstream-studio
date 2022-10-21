import Axios from 'axios';
import { rootStore } from '../store/index';
import { showNotification } from '@mantine/notifications';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export const axios = Axios.create({});

function checkErr(err) {
  if (err.response?.status == 401) {
    rootStore.w3s.config.logout();
  }
  if (err.response) {
    showNotification({
      color: 'red',
      message: err.response.data.desc || err.response.data.msg || err.response.data.key
    });
  } else {
    showNotification({
      color: 'red',
      message: 'Network error'
    });
  }
}
console.log(publicRuntimeConfig['NEXT_PUBLIC_API_URL']);
axios.interceptors.request.use((req) => {
  req.baseURL = publicRuntimeConfig['NEXT_PUBLIC_API_URL'] || 'http://localhost:8888';
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
