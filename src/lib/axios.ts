import Axios from 'axios';
import { publicConfig } from '../config/public';
import { rootStore } from '../store/index';

export const axios = Axios.create({});

axios.interceptors.request.use((req) => {
  // req.headers['Authorization'] = ""
  req.baseURL = rootStore.w3s.config.formData.apiUrl;
  if (rootStore.w3s.config.formData.token) {
    req.headers['authorizations'] = `Bearer ${rootStore.w3s.config.formData.token}`;
  }
  return req;
});

axios.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    return Promise.reject(err);
  }
);
