import httpClient from './httpService';
import { API_CONFIG } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usuarioService } from './usuarioService';

export const authService = {
  async login(username, password) {
    console.log('=== INICIO LOGIN ===');
    const startTotal = performance.now();

    const loginPromise = httpClient.post(API_CONFIG.ENDPOINTS.LOGIN, {
      nombreUsuario: username,
      clave: password,
    });

    const startLogin = performance.now();
    const [loginResponse] = await Promise.all([loginPromise]);
    const endLogin = performance.now();

    console.log(`[TIEMPO] Login: ${(endLogin - startLogin).toFixed(2)}ms`);

    if (loginResponse.data.token) {
      await AsyncStorage.setItem('token', loginResponse.data.token);
      await AsyncStorage.setItem('refreshToken', loginResponse.data.refresh_token);

      const startPerfil = performance.now();
      const perfilPromise = usuarioService.getPerfil();
      const [perfil] = await Promise.all([perfilPromise]);
      const endPerfil = performance.now();

      console.log(`[TIEMPO] Carga perfil: ${(endPerfil - startPerfil).toFixed(2)}ms`);

      const endTotal = performance.now();
      console.log(`[TIEMPO] TOTAL (login + perfil en paralelo): ${(endTotal - startTotal).toFixed(2)}ms`);
      console.log('=== FIN LOGIN ===');

      return {
        ...loginResponse.data,
        perfil,
      };
    }

    return loginResponse.data;
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
