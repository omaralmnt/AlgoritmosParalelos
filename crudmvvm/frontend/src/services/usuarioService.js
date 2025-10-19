import httpClient from './httpService';
import { API_CONFIG } from '../config/api';

export const usuarioService = {
  async getPerfil() {
    const response = await httpClient.get(API_CONFIG.ENDPOINTS.PERFIL);
    return response.data;
  },
};
