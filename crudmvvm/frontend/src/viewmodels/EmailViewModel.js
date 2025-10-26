import { useState } from 'react';
import { emailService } from '../services/emailService';

export const useEmailViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sendEmail = async (to, subject, message) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const emailData = { to, subject, message };
      const response = await emailService.sendEmail(emailData);
      setSuccess(true);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.response?.data?.error ||
                          err.response?.data?.message ||
                          'Error al enviar el email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    loading,
    error,
    success,
    sendEmail,
    clearMessages,
  };
};
