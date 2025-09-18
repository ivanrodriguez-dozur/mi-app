import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openGallery = useCallback(async () => {
    if (loading) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Necesitamos acceso a tu galería para continuar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        router.replace({
          pathname: '/media-editor',
          params: {
            uri: asset.uri,
            type: asset.type ?? 'photo',
          },
        } as any);
        return;
      }

      router.back();
    } catch (err) {
      console.error(err);
      setError('No pudimos abrir tu galería. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [loading, router]);

  useEffect(() => {
    openGallery();
  }, [openGallery]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Seleccionar contenido</ThemedText>
      <ThemedText style={styles.subtitle}>
        Elige una foto o video de tu dispositivo para crear un nuevo Boom.
      </ThemedText>

      {loading ? (
        <ActivityIndicator size="large" color="#FF3A5C" style={{ marginTop: 32 }} />
      ) : (
        <TouchableOpacity style={styles.primaryBtn} onPress={openGallery}>
          <ThemedText type="link" style={styles.primaryLabel}>Abrir galería</ThemedText>
        </TouchableOpacity>
      )}

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <ThemedText style={styles.cancelLabel}>Cancelar</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#0A0A0A',
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    color: '#CFCFCF',
  },
  primaryBtn: {
    marginTop: 28,
    backgroundColor: '#FF3A5C',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 18,
  },
  primaryLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  error: {
    color: '#FF7A7A',
    marginTop: 18,
    textAlign: 'center',
  },
  cancelBtn: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelLabel: {
    color: '#888',
  },
});
