import httpClient from './httpService';
import { API_CONFIG } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(username, password) {
    console.log('Login attempt:', { username, endpoint: API_CONFIG.ENDPOINTS.LOGIN });

    const response = await httpClient.post(API_CONFIG.ENDPOINTS.LOGIN, {
      username,
      password,
    });

    console.log('Login response:', response.data);

    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('refreshToken', response.data.refresh_token);
    }

    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
  },

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
};
