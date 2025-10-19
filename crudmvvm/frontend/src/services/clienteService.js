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
};
