import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Dimensions, Platform, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function MediaEditor() {
  const params = useLocalSearchParams();
  const uri = params.uri as string | undefined;
  const type = (params.type as string | undefined) ?? 'photo';
  const router = useRouter();
  const [overlayText, setOverlayText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'none' | 'warm' | 'cool' | 'mono' | 'vibrant'>('none');
  const [trimRange, setTrimRange] = useState({ start: 0, end: 0 }); // placeholder

  useEffect(() => {
    // initialize trimRange for videos if needed
    if (type === 'video') {
      setTrimRange({ start: 0, end: 10 });
    }
  }, [type]);

  const applyAndPublish = () => {
    // For now, just navigate back with result params or call a publish flow
    // We'll navigate back to the previous screen and include a query param so the caller can detect it.
    router.push({ pathname: '/', params: { publishedUri: uri } } as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerText}>Cerrar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editor</Text>
        <TouchableOpacity onPress={applyAndPublish}>
          <Text style={[styles.headerText, { color: '#0a84ff' }]}>Siguiente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.preview}>
        {type === 'video' ? (
          <View style={{ alignItems: 'center' }}>
            <Image source={{ uri: uri as string }} style={styles.media} resizeMode="cover" />
            <TouchableOpacity onPress={() => Linking.openURL(uri as string)} style={{ position: 'absolute' }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 28 }}>▶</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL(uri as string)} style={{ marginTop: 12 }}>
              <Text style={{ color: '#0a84ff' }}>Abrir video</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Image source={{ uri: uri as string }} style={styles.media} resizeMode="contain" />
        )}
      </View>

      <View style={styles.controls}>
        <Text style={styles.label}>Texto</Text>
        <TextInput
          placeholder="Agregar texto al contenido"
          value={overlayText}
          onChangeText={setOverlayText}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Filtros (demo)</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {['none', 'warm', 'cool', 'mono', 'vibrant'].map((f) => (
            <TouchableOpacity key={f} onPress={() => setSelectedFilter(f as any)} style={[styles.filterBtn, selectedFilter === f ? styles.filterSelected : {}]}>
              <Text>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {type === 'video' && (
          <View style={{ marginTop: 14 }}>
            <Text style={styles.label}>Recortar video (demo)</Text>
            <Text style={{ color: '#666', marginTop: 6 }}>Inicio: {trimRange.start}s - Fin: {trimRange.end}s</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: 56, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerText: { fontSize: 16, color: '#222' },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  preview: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  media: { width: width, height: Math.min(width * (Platform.OS === 'web' ? 0.6 : 1.2), height * 0.6) },
  controls: { padding: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  label: { fontWeight: '600', color: '#222' },
  input: { marginTop: 8, borderWidth: 1, borderColor: '#eee', padding: 8, borderRadius: 8 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f3f3f3', marginRight: 8 },
  filterSelected: { borderColor: '#0a84ff', borderWidth: 2 },
});
