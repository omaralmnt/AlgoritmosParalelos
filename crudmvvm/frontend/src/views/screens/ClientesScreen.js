import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useClienteViewModel } from '../../viewmodels/ClienteViewModel';
import { useAuthViewModel } from '../../viewmodels/AuthViewModel';
import { useEmailViewModel } from '../../viewmodels/EmailViewModel';

export default function ClientesScreen({ navigation }) {
  const {
    clientes,
    loading,
    refreshing,
    error,
    loadClientes,
    refreshClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  } = useClienteViewModel();

  const { logout } = useAuthViewModel();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sexo, setSexo] = useState('');
  const [avatar, setAvatar] = useState('');
  const [perfilExpanded, setPerfilExpanded] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const { loading: emailLoading, error: emailError, success: emailSuccess, sendEmail, clearMessages } = useEmailViewModel();

  useEffect(() => {
    loadClientes();
    loadPerfil();
  }, []);

  useEffect(() => {
    if (emailSuccess) {
      Alert.alert(
        'Email enviado',
        'Tu email ha sido enviado exitosamente y está en cola de procesamiento.',
        [
          {
            text: 'OK',
            onPress: () => {
              closeEmailModal();
              clearMessages();
            },
          },
        ]
      );
    }
  }, [emailSuccess]);

  const loadPerfil = async () => {
    try {
      const { usuarioService } = require('../../services/usuarioService');
      const { Usuario } = require('../../models/Usuario');
      const perfil = await usuarioService.getPerfil();
      setUsuario(new Usuario(perfil));
    } catch (err) {
      console.log('Error al cargar perfil:', err);
    }
  };

  const openModal = (cliente = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setNombre(cliente.nombre);
      setCorreo(cliente.correo);
      setTelefono(cliente.telefono);
      setSexo(cliente.sexo || '');
      setAvatar(cliente.avatar || '');
    } else {
      setEditingCliente(null);
      setNombre('');
      setCorreo('');
      setTelefono('');
      setSexo('');
      setAvatar('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCliente(null);
  };

  const handleSave = async () => {
    const clienteData = { nombre, correo, telefono, sexo, avatar };

    let success;
    if (editingCliente) {
      success = await updateCliente(editingCliente.id, clienteData);
    } else {
      success = await createCliente(clienteData);
    }

    if (success) {
      closeModal();
    }
  };

  const handleDelete = (id, nombre) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Eliminar a ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteCliente(id),
        },
      ]
    );
  };

  const openEmailModal = () => {
    setEmailTo('');
    setEmailSubject('');
    setEmailMessage('');
    setEmailModalVisible(true);
  };

  const closeEmailModal = () => {
    setEmailModalVisible(false);
    setEmailTo('');
    setEmailSubject('');
    setEmailMessage('');
  };

  const handleSendEmail = async () => {
    if (!emailTo.trim()) {
      Alert.alert('Error', 'Por favor ingresa el email del destinatario');
      return;
    }

    if (!emailSubject.trim()) {
      Alert.alert('Error', 'Por favor ingresa el asunto del email');
      return;
    }

    if (!emailMessage.trim()) {
      Alert.alert('Error', 'Por favor ingresa el mensaje');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTo)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    await sendEmail(emailTo, emailSubject, emailMessage);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {item.avatar && (
          <Image
            source={{ uri: item.avatar }}
            style={styles.avatar}
            defaultSource={require('../../../assets/icon.png')}
          />
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{item.nombre}</Text>
          <Text style={styles.email}>{item.correo}</Text>
          <Text style={styles.phone}>{item.telefono}</Text>
          <Text style={styles.sexo}>{item.sexo}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openModal(item)}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.nombre)}
        >
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing && clientes.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.perfilContainer}>
        <View style={styles.perfilHeader}>
          <TouchableOpacity
            style={styles.perfilHeaderLeft}
            onPress={() => setPerfilExpanded(!perfilExpanded)}
          >
            {usuario?.avatar && (
              <Image source={{ uri: usuario.avatar }} style={styles.perfilAvatar} />
            )}
            <View>
              <Text style={styles.perfilHeaderTitle}>Mi Perfil</Text>
              {usuario?.nombreusuario && (
                <Text style={styles.perfilHeaderSubtitle}>@{usuario.nombreusuario}</Text>
              )}
            </View>
            <Text style={styles.perfilToggle}>{perfilExpanded ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.emailButtonHeader}
              onPress={openEmailModal}
            >
              <Text style={styles.emailButtonHeaderText}>📧 Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButtonHeader} onPress={handleLogout}>
              <Text style={styles.logoutButtonHeaderText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {perfilExpanded && usuario && (
          <View style={styles.perfilContent}>
            {usuario.nombre && (
              <View style={styles.perfilRow}>
                <Text style={styles.perfilLabel}>Nombre:</Text>
                <Text style={styles.perfilValue}>{usuario.nombre}</Text>
              </View>
            )}
            {usuario.correo && (
              <View style={styles.perfilRow}>
                <Text style={styles.perfilLabel}>Correo:</Text>
                <Text style={styles.perfilValue}>{usuario.correo}</Text>
              </View>
            )}
            {usuario.telefono && (
              <View style={styles.perfilRow}>
                <Text style={styles.perfilLabel}>Teléfono:</Text>
                <Text style={styles.perfilValue}>{usuario.telefono}</Text>
              </View>
            )}
            {usuario.fechaNacimiento && (
              <View style={styles.perfilRow}>
                <Text style={styles.perfilLabel}>Fecha Nac.:</Text>
                <Text style={styles.perfilValue}>{usuario.fechaNacimiento}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={clientes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString()}
        refreshing={refreshing}
        onRefresh={refreshClientes}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay clientes</Text>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor="#999"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Teléfono (ej: 8091234567)"
              placeholderTextColor="#999"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Sexo: masculino o femenino"
              placeholderTextColor="#999"
              value={sexo}
              onChangeText={setSexo}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="URL del avatar (opcional)"
              placeholderTextColor="#999"
              value={avatar}
              onChangeText={setAvatar}
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={emailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEmailModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.emailModalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Enviar Email</Text>
              <Text style={styles.emailSubtitle}>
                Completa los campos para enviar un email
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Para (email destinatario)*"
                placeholderTextColor="#999"
                value={emailTo}
                onChangeText={setEmailTo}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!emailLoading}
              />

              <TextInput
                style={styles.input}
                placeholder="Asunto*"
                placeholderTextColor="#999"
                value={emailSubject}
                onChangeText={setEmailSubject}
                editable={!emailLoading}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mensaje*"
                placeholderTextColor="#999"
                value={emailMessage}
                onChangeText={setEmailMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!emailLoading}
              />

              {emailError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSendEmail}
                  disabled={emailLoading}
                >
                  {emailLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Enviar Email</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeEmailModal}
                  disabled={emailLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  sexo: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
  error: {
    backgroundColor: '#ff3b30',
    color: '#fff',
    padding: 10,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalActions: {
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  perfilContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  perfilHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#007AFF',
  },
  perfilHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  perfilAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  perfilHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  perfilHeaderSubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 2,
  },
  perfilToggle: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  emailButtonHeader: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  emailButtonHeaderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButtonHeader: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutButtonHeaderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  perfilContent: {
    padding: 15,
    backgroundColor: '#fff',
  },
  perfilRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  perfilLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  perfilValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  emailModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
    alignSelf: 'center',
  },
  emailSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  errorContainer: {
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
});
