import { useState } from 'react';
import { authService } from '../services/authService';
import { Usuario } from '../models/Usuario';

export const useAuthViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(username, password);

      if (response.perfil) {
        const usuarioModel = new Usuario(response.perfil);
        setUsuario(usuarioModel);
      }

      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.log('Error completo:', err);
      console.log('Error response:', err.response);
      console.log('Error data:', err.response?.data);
      console.log('Error message:', err.message);

      const errorMessage = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Error al iniciar sesión';

      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUsuario(null);
  };

  const checkAuth = async () => {
    const authenticated = await authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    return authenticated;
  };

  return {
    loading,
    error,
    isAuthenticated,
    usuario,
    login,
    logout,
    checkAuth,
  };
};
