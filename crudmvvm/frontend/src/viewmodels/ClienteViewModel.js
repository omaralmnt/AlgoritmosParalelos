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
      console.log('=== INICIO CARGA CLIENTES ===');
      const startTotal = performance.now();

      const startClientes = performance.now();
      const data = await clienteService.getAll();
      const endClientes = performance.now();
      console.log(`[TIEMPO] Carga lista clientes: ${(endClientes - startClientes).toFixed(2)}ms`);

      const clientesModels = data.map(item => new Cliente(item));

      const avatarPromises = clientesModels
        .filter(cliente => cliente.avatar)
        .map(cliente =>
          fetch(cliente.avatar)
            .then(() => ({ cliente: cliente.id, loaded: true }))
            .catch(() => ({ cliente: cliente.id, loaded: false }))
        );

      if (avatarPromises.length > 0) {
        const startAvatars = performance.now();
        const avatarResults = await Promise.allSettled(avatarPromises);
        const endAvatars = performance.now();

        console.log(`[TIEMPO] Carga ${avatarPromises.length} avatares en paralelo: ${(endAvatars - startAvatars).toFixed(2)}ms`);
        console.log(`[AVATARES] Exitosos: ${avatarResults.filter(r => r.status === 'fulfilled' && r.value.loaded).length}`);
        console.log(`[AVATARES] Fallidos: ${avatarResults.filter(r => r.status === 'fulfilled' && !r.value.loaded).length}`);
      }

      const endTotal = performance.now();
      console.log(`[TIEMPO] TOTAL (lista + avatares): ${(endTotal - startTotal).toFixed(2)}ms`);
      console.log('=== FIN CARGA CLIENTES ===');

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
      console.log('=== INICIO REFRESH CLIENTES ===');
      const startTotal = performance.now();

      const startClientes = performance.now();
      const data = await clienteService.getAll();
      const endClientes = performance.now();
      console.log(`[TIEMPO] Refresh lista clientes: ${(endClientes - startClientes).toFixed(2)}ms`);

      const clientesModels = data.map(item => new Cliente(item));

      const avatarPromises = clientesModels
        .filter(cliente => cliente.avatar)
        .map(cliente =>
          fetch(cliente.avatar)
            .then(() => ({ cliente: cliente.id, loaded: true }))
            .catch(() => ({ cliente: cliente.id, loaded: false }))
        );

      if (avatarPromises.length > 0) {
        const startAvatars = performance.now();
        const avatarResults = await Promise.allSettled(avatarPromises);
        const endAvatars = performance.now();

        console.log(`[TIEMPO] Refresh ${avatarPromises.length} avatares en paralelo: ${(endAvatars - startAvatars).toFixed(2)}ms`);
        console.log(`[AVATARES] Exitosos: ${avatarResults.filter(r => r.status === 'fulfilled' && r.value.loaded).length}`);
      }

      const endTotal = performance.now();
      console.log(`[TIEMPO] TOTAL REFRESH: ${(endTotal - startTotal).toFixed(2)}ms`);
      console.log('=== FIN REFRESH CLIENTES ===');

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
