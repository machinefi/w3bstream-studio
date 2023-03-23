import Axios from 'axios';
import { rootStore } from '../store/index';
import { showNotification } from '@mantine/notifications';

export const axios = Axios.create({});

function checkErr(err) {
  if (err.response?.status == 401) {
    rootStore.w3s.config.logout();
  }
  const message = err.response.data.error?.message || err.response.data.message || err.response.data.code || '';
  if (err.response) {
    showNotification({
      message,
      color: 'red'
    });
    if (message.includes('UNAUTHORIZED')) {
      globalThis.store.w3s.config.logout();
    }
  } else {
    showNotification({
      color: 'red',
      message: 'Network error'
    });
  }
}
axios.interceptors.request.use((req) => {
  if (rootStore.w3s.config.form.formData.token) {
    req.headers['Authorization'] = `${rootStore.w3s.config.form.formData.token}`;
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
