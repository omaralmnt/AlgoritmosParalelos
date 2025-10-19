import { useState, useCallback } from 'react';
import { clienteService } from '../services/clienteService';
import { Cliente } from '../models/Cliente';

export const useClienteViewModel = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadClientes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await clienteService.getAllWithAvatars();
      const clientesModels = data.map(item => new Cliente(item));
      setClientes(clientesModels);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const refreshClientes = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      const data = await clienteService.getAllWithAvatars();
      const clientesModels = data.map(item => new Cliente(item));
      setClientes(clientesModels);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al refrescar clientes');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const createCliente = async (clienteData) => {
    setLoading(true);
    setError(null);

    try {
      const newCliente = new Cliente(clienteData);
      await clienteService.create(newCliente.toJSON());
      await loadClientes();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear cliente');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCliente = async (id, clienteData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedCliente = new Cliente(clienteData);
      await clienteService.update(id, updatedCliente.toJSON());
      await loadClientes();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar cliente');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCliente = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await clienteService.delete(id);
      await loadClientes();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar cliente');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    clientes,
    loading,
    refreshing,
    error,
    loadClientes,
    refreshClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  };
};
