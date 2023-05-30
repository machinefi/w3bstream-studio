import Axios from 'axios';
import toast from 'react-hot-toast';
import { rootStore } from '../store/index';

export const axios = Axios.create({});

function checkErr(err) {
  if (err.response?.status == 401) {
    rootStore.w3s.config.logout();
  }
  const message = err.response.data.error?.message || err.response.data.message || err.response.data.desc || err.response.data.msg || err.response.data.code || '';
  if (err.response) {
    if (message.includes('UNAUTHORIZED')) {
      globalThis.store.w3s.config.logout();
    } else {
      toast.error(message);
    }
  } else {
    toast.error('Network error');
  }
}
axios.interceptors.request.use((req) => {
  if (rootStore.w3s.config.form.formData.token && !req.headers['Authorization']) {
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
