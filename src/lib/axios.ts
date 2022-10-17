import Axios from 'axios';
import { rootStore } from '../store/index';
import { showNotification } from '@mantine/notifications';

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
