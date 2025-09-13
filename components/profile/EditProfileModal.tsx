import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currentData: {
    coverImage: string | null;
    profileImage: string | null;
    name: string;
    description: string;
    email: string;
  };
  onSave: (data: any) => void;
}

// Android-safe upload: read file as base64 -> data URL -> arrayBuffer -> Uint8Array -> upload
const uploadToSupabase = async (userId: string, type: 'cover' | 'profile', uri: string) => {
  const fileExt = uri.split('.').pop() ?? 'jpg';
  const fileName = `${type}-${Date.now()}.${fileExt}`;
  const bucket = 'user-uploads';
  const folder = type === 'cover' ? 'covers' : 'avatars';
  const remotePath = `users/${userId}/${folder}/${fileName}`;

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as any });
    const mimeType = fileExt.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const res = await fetch(dataUrl);
    const arrayBuffer = await res.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage.from(bucket).upload(remotePath, uint8, { upsert: true });
    if (error) throw error;
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicData?.publicUrl ?? null;
  } catch (err) {
    console.warn('Primary upload failed, trying fallback', err);
    try {
      const res = await fetch(uri);
      const arrayBuffer = await res.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const { data, error } = await supabase.storage.from(bucket).upload(remotePath, uint8, { upsert: true });
      if (error) throw error;
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return publicData?.publicUrl ?? null;
    } catch (err2) {
      console.error('Fallback upload failed', err2);
      return null;
    }
  }
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose, currentData, onSave }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    coverImage: currentData.coverImage,
    profileImage: currentData.profileImage,
    name: currentData.name,
    description: currentData.description,
    email: currentData.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = async () => {
    if (!formData.email) {
      Alert.alert('Error', 'El email es obligatorio');
      return;
    }
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    onSave(formData);
    onClose();
    Alert.alert('Éxito', 'Perfil actualizado correctamente');
  };

  const selectImage = (type: 'cover' | 'profile') => {
    (async () => {
      try {
        if (!user) {
          Alert.alert('Necesitas iniciar sesión', 'Inicia sesión para poder subir imágenes');
          return;
        }

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permiso requerido', 'Necesitamos permiso para acceder a tus imágenes');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
        if ((result as any).canceled) return;
        const assets: any[] = (result as any).assets ?? [];
        const uri = assets[0]?.uri;
        if (!uri) return;

        const publicUrl = await uploadToSupabase(user.id, type, uri);
        if (!publicUrl) {
          Alert.alert('Error', 'No se pudo subir la imagen');
          return;
        }

        if (type === 'cover') setFormData(prev => ({ ...prev, coverImage: publicUrl }));
        else setFormData(prev => ({ ...prev, profileImage: publicUrl }));
      } catch (err) {
        console.error('Unexpected error selecting image:', err);
        Alert.alert('Error', 'Ocurrió un error al seleccionar la imagen');
      }
    })();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#444" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Imágenes del Perfil</Text>

            <View style={styles.imageContainer}>
              <Text style={styles.fieldLabel}>Foto de Portada</Text>
              <TouchableOpacity onPress={() => selectImage('cover')} style={styles.coverImageContainer}>
                {formData.coverImage ? <Image source={{ uri: formData.coverImage }} style={styles.coverImage} /> : <View style={styles.coverPlaceholder} />}
                <View style={styles.cameraOverlay}>
                  <Ionicons name="camera" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
              <Text style={styles.fieldLabel}>Foto de Perfil</Text>
              <TouchableOpacity onPress={() => selectImage('profile')} style={styles.profileImageContainer}>
                {formData.profileImage ? <Image source={{ uri: formData.profileImage }} style={styles.profileImage} /> : <View style={styles.profilePlaceholder} />}
                <View style={styles.cameraOverlaySmall}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Nombre</Text>
              <TextInput style={styles.input} value={formData.name} onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))} placeholder="Tu nombre" maxLength={50} />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Descripción</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))} placeholder="Describe tu perfil..." maxLength={150} multiline numberOfLines={3} />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Correo Electrónico</Text>
              <TextInput style={styles.input} value={formData.email} onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))} placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Contraseña Actual</Text>
              <TextInput style={styles.input} value={formData.currentPassword} onChangeText={(text) => setFormData(prev => ({ ...prev, currentPassword: text }))} placeholder="Contraseña actual" secureTextEntry />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Nueva Contraseña</Text>
              <TextInput style={styles.input} value={formData.newPassword} onChangeText={(text) => setFormData(prev => ({ ...prev, newPassword: text }))} placeholder="Nueva contraseña" secureTextEntry />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Confirmar Nueva Contraseña</Text>
              <TextInput style={styles.input} value={formData.confirmPassword} onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))} placeholder="Confirmar contraseña" secureTextEntry />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
  },
  saveButton: {
    backgroundColor: '#CCFF00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#444',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 16,
  },
  imageContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  coverImageContainer: {
    position: 'relative',
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  profileImageContainer: {
    position: 'relative',
    alignSelf: 'center',
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 50,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#eee',
  },
  cameraOverlaySmall: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default EditProfileModal;
