import httpClient from './httpService';
import { API_CONFIG } from '../config/api';

export const emailService = {
  async sendEmail(emailData) {
    const response = await httpClient.post(API_CONFIG.ENDPOINTS.EMAIL, emailData);
    return response.data;
  },
};
