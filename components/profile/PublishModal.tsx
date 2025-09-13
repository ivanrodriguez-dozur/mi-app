import React, { useState, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface PublishModalProps {
  visible: boolean;
  onClose: () => void;
  onPublished?: (url: string, type: 'photo' | 'video') => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ visible, onClose, onPublished }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<any>(null);

  React.useEffect(() => {
    (async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  setHasPermission(status === 'granted');
    })();
    if (!visible) setPreviewUri(null);
  }, [visible]);

  const toggleMediaType = () => {
    setMediaType((prev) => (prev === 'photo' ? 'video' : 'photo'));
    setPreviewUri(null);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      if (mediaType === 'photo') {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        setPreviewUri(photo.uri);
      } else {
  const video = await cameraRef.current.recordAsync({ maxDuration: 15, quality: '480p' });
  setPreviewUri(video.uri);
      }
    } catch {
      Alert.alert('Error', 'No se pudo capturar el archivo');
    }
  };

  const handleStartVideo = async () => {
    if (!cameraRef.current) return;
    try {
  const video = await cameraRef.current.recordAsync({ maxDuration: 15, quality: '480p' });
  setPreviewUri(video.uri);
    } catch {
      Alert.alert('Error', 'No se pudo grabar el video');
    }
  };

  const handleStopVideo = async () => {
    if (!cameraRef.current) return;
    try {
      await cameraRef.current.stopRecording();
    } catch {}
  };

  // Upload logic (igual que antes)
  const uploadToSupabase = async () => {
    if (!user || !previewUri || !mediaType) return;
    setUploading(true);
    try {
      const fileExt = previewUri.split('.').pop() ?? (mediaType === 'photo' ? 'jpg' : 'mp4');
      const fileName = `${mediaType}-${Date.now()}.${fileExt}`;
      const bucket = 'user-uploads';
      const folder = mediaType === 'photo' ? 'photos' : 'videos';
      const remotePath = `users/${user.id}/${folder}/${fileName}`;
      let uint8;
      if (mediaType === 'photo') {
        const base64 = await FileSystem.readAsStringAsync(previewUri, { encoding: 'base64' });
        const mimeType = fileExt.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64}`;
        const res = await fetch(dataUrl);
        const arrayBuffer = await res.arrayBuffer();
        uint8 = new Uint8Array(arrayBuffer);
      } else {
        const res = await fetch(previewUri);
        const arrayBuffer = await res.arrayBuffer();
        uint8 = new Uint8Array(arrayBuffer);
      }
      const { data, error } = await supabase.storage.from(bucket).upload(remotePath, uint8, { upsert: true });
      if (error) throw error;
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      setUploading(false);
      setPreviewUri(null);
      if (onPublished) onPublished(publicData?.publicUrl ?? '', mediaType);
      Alert.alert('Éxito', 'Archivo publicado correctamente');
      onClose();
    } catch {
      setUploading(false);
      Alert.alert('Error', 'No se pudo subir el archivo');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Camera preview with controls overlay */}
        <View style={styles.cameraContainer}>
          {hasPermission === null ? (
            <ActivityIndicator color="#fff" />
          ) : hasPermission === false ? (
            <Text style={{ color: '#fff' }}>Sin permiso de cámara</Text>
          ) : (
            <Camera
              ref={cameraRef}
              style={styles.camera}
              type={'back'}
              ratio="16:9"
            />
          )}
          {/* Overlay controls */}
          <View style={styles.overlayControls} pointerEvents="box-none">
            <View style={styles.toggleContainer}>
              <TouchableOpacity onPress={toggleMediaType} style={[styles.toggleButton, mediaType === 'photo' && styles.selectedToggle]}>
                <Text style={[styles.toggleText, mediaType === 'photo' && styles.selectedText]}>FOTO</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleMediaType} style={[styles.toggleButton, mediaType === 'video' && styles.selectedToggle]}>
                <Text style={[styles.toggleText, mediaType === 'video' && styles.selectedText]}>VIDEO</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.captureContainer}>
              {mediaType === 'photo' ? (
                <TouchableOpacity style={styles.captureButton} onPress={handleCapture} disabled={uploading}>
                  <Ionicons name="camera" size={64} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.captureButton} onPress={handleStartVideo} disabled={uploading}>
                  <Ionicons name="videocam" size={64} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {/* Preview and publish */}
        {previewUri && (
          <View style={styles.previewContainer}>
            {mediaType === 'photo' ? (
              <Image source={{ uri: previewUri }} style={styles.previewImage} />
            ) : (
              <Ionicons name="videocam" size={64} color="#2196F3" style={{ alignSelf: 'center' }} />
            )}
            <TouchableOpacity style={styles.publishButton} onPress={uploadToSupabase} disabled={uploading}>
              {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.publishButtonText}>Publicar</Text>}
            </TouchableOpacity>
            {mediaType === 'video' && (
              <TouchableOpacity style={styles.publishButton} onPress={handleStopVideo}>
                <Text style={styles.publishButtonText}>Detener grabación</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {/* Bottom options (POST, CREATE, LIVE) - UI only */}
        <View style={styles.bottomOptions}>
          <Text style={[styles.bottomOption, styles.selectedBottom]}>POST</Text>
          <Text style={styles.bottomOption}>CREATE</Text>
          <Text style={styles.bottomOption}>LIVE</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    paddingTop: 32,
    paddingHorizontal: 0,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  camera: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  overlayControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 0,
  },
  captureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#CCFF00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    gap: 24,
  },
  toggleButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#222',
  },
  selectedToggle: {
    backgroundColor: '#CCFF00',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  selectedText: {
    color: '#222',
  },
  previewContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  previewImage: {
    width: 220,
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
  },
  publishButton: {
    backgroundColor: '#CCFF00',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  publishButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottomOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingBottom: 24,
  },
  bottomOption: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  selectedBottom: {
    opacity: 1,
    color: '#CCFF00',
  },
});

export default PublishModal;
