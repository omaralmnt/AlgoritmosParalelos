import httpClient from './httpService';
import { API_CONFIG } from '../config/api';

export const clienteService = {
  async getAll() {
    const response = await httpClient.get(API_CONFIG.ENDPOINTS.CLIENTES);
    return response.data;
  },

  async getById(id) {
    const response = await httpClient.get(`${API_CONFIG.ENDPOINTS.CLIENTES}/${id}`);
    return response.data;
  },

  async create(cliente) {
    const response = await httpClient.post(API_CONFIG.ENDPOINTS.CLIENTES, cliente);
    return response.data;
  },

  async update(id, cliente) {
    const response = await httpClient.patch(`${API_CONFIG.ENDPOINTS.CLIENTES}/${id}`, cliente);
    return response.data;
  },

  async delete(id) {
    const response = await httpClient.delete(`${API_CONFIG.ENDPOINTS.CLIENTES}/${id}`);
    return response.data;
  },

  async getAllWithAvatars() {
    const clientesResponse = await this.getAll();

    const clientesWithAvatars = await Promise.allSettled(
      clientesResponse.map(async (cliente) => {
        try {
          if (cliente.avatar_url) {
            const avatarResponse = await fetch(cliente.avatar_url);
            return { ...cliente, avatarLoaded: avatarResponse.ok };
          }
          return cliente;
        } catch (error) {
          return cliente;
        }
      })
    );

    return clientesWithAvatars
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  },
};
