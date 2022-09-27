import Axios from 'axios';
import { publicConfig } from '../config/public';
import { rootStore } from '../store/index';

export const api = Axios.create({});

api.interceptors.request.use((req) => {
  // req.headers['Authorization'] = ""
  req.baseURL = rootStore.w3s.config.formData.w3bsream.apiUrl;
  return req;
});

api.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    return Promise.reject(err);
  }
);
