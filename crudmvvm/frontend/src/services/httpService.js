import axios from 'axios';
import { API_CONFIG } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const httpClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

httpClient.interceptors.request.use(
  async (config) => {
    const startTime = performance.now();
    config.metadata = { startTime };

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      const elapsedTime = performance.now() - startTime;
      console.log(`[TIMEOUT] Request ABORTADA despues de ${elapsedTime.toFixed(2)}ms`);
    }, API_CONFIG.TIMEOUT);

    config.signal = controller.signal;
    config.metadata = { ...config.metadata, timeout };

    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  (response) => {
    if (response.config.metadata?.timeout) {
      clearTimeout(response.config.metadata.timeout);
    }

    if (response.config.metadata?.startTime) {
      const elapsedTime = performance.now() - response.config.metadata.startTime;
      console.log(`[HTTP OK] ${response.config.method.toUpperCase()} ${response.config.url} - ${elapsedTime.toFixed(2)}ms`);
    }

    return response;
  },
  async (error) => {
    if (error.config?.metadata?.timeout) {
      clearTimeout(error.config.metadata.timeout);
    }

    if (error.config?.metadata?.startTime) {
      const elapsedTime = performance.now() - error.config.metadata.startTime;
      console.log(`[HTTP ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${elapsedTime.toFixed(2)}ms - ${error.message}`);
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return httpClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`,
          { refresh_token: refreshToken }
        );

        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('refreshToken', data.refresh_token);

        httpClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        originalRequest.headers.Authorization = `Bearer ${data.token}`;

        processQueue(null, data.token);
        isRefreshing = false;

        return httpClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
