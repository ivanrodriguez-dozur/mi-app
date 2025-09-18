import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  Linking,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const FILTER_OPTIONS = ['none', 'warm', 'cool', 'mono', 'vibrant'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

type MediaFit = 'contain' | 'cover' | 'stretch';
type ToolKey = 'trim' | 'adjust' | 'duration';

export default function MediaEditor() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const uri = params.uri as string | undefined;
  const type = (params.type as string | undefined) ?? 'photo';
  const router = useRouter();

  const [overlayText, setOverlayText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('none');
  const [trimRange, setTrimRange] = useState({ start: 0, end: type === 'video' ? 10 : 0 });
  const [targetDuration, setTargetDuration] = useState(type === 'video' ? 10 : 0);
  const [taggedPeople, setTaggedPeople] = useState<string[]>([]);
  const [location, setLocation] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [coinPrice, setCoinPrice] = useState('10');
  const [showCoinInfo, setShowCoinInfo] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolKey | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [mediaFit, setMediaFit] = useState<MediaFit>('contain');

  useEffect(() => {
    if (type === 'video') {
      setTrimRange({ start: 0, end: 10 });
      setTargetDuration(10);
    } else {
      setTrimRange({ start: 0, end: 0 });
      setTargetDuration(0);
    }
  }, [type]);

  const togglePrivacy = useCallback(() => {
    setPrivacy((prev) => {
      const next = prev === 'public' ? 'private' : 'public';
      if (next === 'public') {
        setShowCoinInfo(false);
      }
      return next;
    });
  }, []);

  const handleTagPeople = useCallback(() => {
    setTaggedPeople((prev) => {
      if (prev.length >= 1) {
        return [];
      }
      return ['@valery'];
    });
  }, []);

  const handleToolPress = useCallback(
    (tool: ToolKey) => {
      if (tool === 'duration' && type !== 'video') {
        Alert.alert('No disponible', 'La opcion Duracion solo aplica para videos.');
        return;
      }
      setActiveTool((prev) => (prev === tool ? null : tool));
    },
    [type]
  );

  const handleLocation = useCallback(() => {
    setLocation((prev) => (prev ? null : 'Ciudad de Mexico, MX'));
  }, []);

  const applyAndPublish = () => {
    router.push({
      pathname: '/',
      params: {
        publishedUri: uri,
        overlayText,
        filter: selectedFilter,
        privacy,
        price: privacy === 'private' ? coinPrice : undefined,
      },
    } as any);
  };

  const adjustTrim = (key: 'start' | 'end', delta: number) => {
    if (type !== 'video') {
      return;
    }
    setTrimRange((prev) => {
      let nextStart = prev.start;
      let nextEnd = prev.end;
      if (key === 'start') {
        nextStart = Math.max(0, Math.min(nextEnd - 1, prev.start + delta));
      } else {
        nextEnd = Math.max(nextStart + 1, prev.end + delta);
      }
      return { start: nextStart, end: nextEnd };
    });
  };

  const adjustDuration = (delta: number) => {
    if (type !== 'video') {
      return;
    }
    setTargetDuration((prev) => Math.max(1, prev + delta));
  };

  const adjustZoom = (delta: number) => {
    setPreviewZoom((prev) => {
      const next = Math.max(0.8, Math.min(2, prev + delta));
      return parseFloat(next.toFixed(2));
    });
  };

  const renderToolPanel = () => {
    if (!activeTool) {
      return null;
    }
    if (activeTool === 'trim') {
      if (type !== 'video') {
        return (
          <View style={styles.toolPanel}>
            <Text style={styles.toolPanelTitle}>Recortar video</Text>
            <Text style={styles.toolPanelHint}>Esta opcion solo aplica para videos.</Text>
          </View>
        );
      }
      return (
        <View style={styles.toolPanel}>
          <Text style={styles.toolPanelTitle}>Recortar video</Text>
          <View style={styles.toolRow}>
            <Text style={styles.toolLabel}>Inicio</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustTrim('start', -1)}>
                <Text style={styles.stepperBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{trimRange.start}s</Text>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustTrim('start', 1)}>
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.toolRow}>
            <Text style={styles.toolLabel}>Fin</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustTrim('end', -1)}>
                <Text style={styles.stepperBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{trimRange.end}s</Text>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustTrim('end', 1)}>
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
    if (activeTool === 'adjust') {
      return (
        <View style={styles.toolPanel}>
          <Text style={styles.toolPanelTitle}>Ajustar tamano</Text>
          <View style={styles.toolRow}>
            <Text style={styles.toolLabel}>Zoom</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustZoom(-0.1)}>
                <Text style={styles.stepperBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{previewZoom.toFixed(2)}x</Text>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustZoom(0.1)}>
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.fitRow}>
            {(['contain', 'cover', 'stretch'] as MediaFit[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.fitBtn, mediaFit === mode && styles.fitBtnActive]}
                onPress={() => setMediaFit(mode)}
              >
                <Text style={[styles.fitLabel, mediaFit === mode && styles.fitLabelActive]}>
                  {mode === 'contain' ? 'Contener' : mode === 'cover' ? 'Cubrir' : 'Estirar'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
    if (activeTool === 'duration' && type === 'video') {
      return (
        <View style={styles.toolPanel}>
          <Text style={styles.toolPanelTitle}>Duracion objetivo</Text>
          <Text style={styles.toolPanelHint}>Define la duracion final estimada del clip.</Text>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustDuration(-1)}>
              <Text style={styles.stepperBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{targetDuration}s</Text>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustDuration(1)}>
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0A0A0A' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.header, { paddingTop: insets.top + 8, height: insets.top + 64 }] }>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.headerText}>Cerrar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editor</Text>
          <TouchableOpacity
            onPress={applyAndPublish}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.headerText, { color: '#0a84ff' }]}>Siguiente</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 220 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          bounces={false}
        >
          <View style={styles.preview}>
            {type === 'video' ? (
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={{ uri: uri as string }}
                  style={[styles.media, { transform: [{ scale: previewZoom }] }]}
                  resizeMode={mediaFit}
                />
                <TouchableOpacity onPress={() => Linking.openURL(uri as string)} style={styles.playButton}>
                  <Ionicons name="play" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL(uri as string)} style={{ marginTop: 12 }}>
                  <Text style={{ color: '#0a84ff' }}>Abrir video</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Image
                source={{ uri: uri as string }}
                style={[styles.media, { transform: [{ scale: previewZoom }] }]}
                resizeMode={mediaFit}
              />
            )}
            <View style={styles.previewToolbar}>
              <TouchableOpacity
                style={[styles.previewToolBtn, activeTool === 'trim' && styles.previewToolBtnActive]}
                onPress={() => handleToolPress('trim')}
              >
                <Ionicons name="cut-outline" size={18} color="#fff" />
                <Text style={styles.previewToolLabel}>Recortar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.previewToolBtn, activeTool === 'adjust' && styles.previewToolBtnActive]}
                onPress={() => handleToolPress('adjust')}
              >
                <Ionicons name="expand-outline" size={18} color="#fff" />
                <Text style={styles.previewToolLabel}>Ajustar tamano</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.previewToolBtn, activeTool === 'duration' && styles.previewToolBtnActive]}
                onPress={() => handleToolPress('duration')}
              >
                <Ionicons name="time-outline" size={18} color="#fff" />
                <Text style={styles.previewToolLabel}>Duracion</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.controls}>
            {renderToolPanel()}

            <Text style={styles.sectionTitle}>Detalles del boom</Text>
            <View style={styles.textCard}>
              <Ionicons name="pencil" size={18} color="#FF3A5C" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Anade un titulo o descripcion"
                placeholderTextColor="#999"
                value={overlayText}
                onChangeText={setOverlayText}
                style={styles.textInput}
                multiline
              />
            </View>

            <View style={styles.optionCard}>
              <TouchableOpacity style={styles.optionRow} onPress={handleTagPeople}>
                <Ionicons name="at" size={20} color="#fff" />
                <Text style={styles.optionLabel}>Etiquetar personas</Text>
                <Text style={styles.optionValue}>{taggedPeople.length > 0 ? taggedPeople.join(', ') : 'Anadir'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionRow} onPress={handleLocation}>
                <Ionicons name="location" size={20} color="#fff" />
                <Text style={styles.optionLabel}>Ubicacion</Text>
                <Text style={styles.optionValue}>{location ?? 'Anadir lugar'}</Text>
              </TouchableOpacity>
              <View style={styles.optionRow}>
                <TouchableOpacity style={styles.privacyPill} onPress={togglePrivacy}>
                  <Ionicons name={privacy === 'public' ? 'earth' : 'lock-closed'} size={18} color="#fff" />
                  <Text style={styles.privacyText}>{privacy === 'public' ? 'Publico' : 'Privado'}</Text>
                </TouchableOpacity>
                {privacy === 'private' ? (
                  <View style={styles.coinInputRow}>
                    <View style={styles.coinIconWrapped}>
                      <View style={styles.coinGoldOuter}>
                        <View style={styles.coinGoldInner} />
                      </View>
                    </View>
                    <TextInput
                      value={coinPrice}
                      onChangeText={setCoinPrice}
                      keyboardType="numeric"
                      placeholder="Coins"
                      placeholderTextColor="#999"
                      style={styles.coinInput}
                    />
                    <TouchableOpacity
                      onPress={() => setShowCoinInfo((prev) => !prev)}
                      style={styles.coinInfoButton}
                    >
                      <Text style={styles.coinInfoText}>!</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
              {privacy === 'private' && showCoinInfo ? (
                <View style={styles.coinInfoBubble}>
                  <Text style={styles.coinInfoBubbleText}>
                    Selecciona la cantidad de Boomcoins que quieres que paguen por ver tu contenido.
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Filtros (demo)</Text>
            <View style={styles.filterRow}>
              {FILTER_OPTIONS.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setSelectedFilter(f)}
                  style={[styles.filterBtn, selectedFilter === f && styles.filterSelected]}
                >
                  <Text style={{ color: selectedFilter === f ? '#FF3A5C' : '#fff' }}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {type === 'video' && (
              <View style={styles.trimInfo}>
                <Ionicons name="cut-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.trimLabel}>Inicio: {trimRange.start}s · Fin: {trimRange.end}s</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1F1F1F',
    backgroundColor: '#0A0A0A',
    paddingBottom: 8,
  },
  headerText: { fontSize: 16, color: '#fff' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  preview: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', position: 'relative' },
  media: { width, height: Math.min(width * (Platform.OS === 'web' ? 0.6 : 1.1), height * 0.6) },
  playButton: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewToolbar: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  previewToolBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6 },
  previewToolBtnActive: { backgroundColor: 'rgba(255,58,92,0.18)', borderRadius: 16 },
  previewToolLabel: { color: '#fff', marginLeft: 8, fontSize: 14, fontWeight: '600' },
  controls: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    paddingTop: 24,
    backgroundColor: '#0F0F11',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
  },
  toolPanel: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toolPanelTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  toolPanelHint: { color: '#9B9B9B', fontSize: 13, marginTop: 6 },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  toolLabel: { color: '#fff', fontSize: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 14 },
  stepperBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  stepperBtnText: { color: '#FF3A5C', fontSize: 16, fontWeight: '700' },
  stepperValue: { color: '#fff', minWidth: 50, textAlign: 'center', fontWeight: '600' },
  fitRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  fitBtn: { flex: 1, marginHorizontal: 4, paddingVertical: 10, borderRadius: 14, backgroundColor: '#1C1C1E', alignItems: 'center' },
  fitBtnActive: { borderColor: '#FF3A5C', borderWidth: 2 },
  fitLabel: { color: '#9B9B9B', fontSize: 13, fontWeight: '600' },
  fitLabelActive: { color: '#FF3A5C' },
  sectionTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  textCard: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  textInput: { flex: 1, color: '#fff', fontSize: 15, lineHeight: 20 },
  optionCard: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionLabel: { color: '#fff', fontSize: 15, marginLeft: 12, flex: 1 },
  optionValue: { color: '#8C8C8C', fontSize: 14 },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  privacyText: { color: '#fff', fontWeight: '600' },
  coinInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    marginLeft: 12,
  },
  coinIconWrapped: { marginRight: 8 },
  coinGoldOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FDD357',
    borderWidth: 1,
    borderColor: '#D89B00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinGoldInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFF1B3' },
  coinInput: { marginLeft: 6, minWidth: 50, color: '#fff', fontWeight: '600' },
  coinInfoButton: { marginLeft: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF3A5C', alignItems: 'center', justifyContent: 'center' },
  coinInfoText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  coinInfoBubble: { backgroundColor: 'rgba(0,0,0,0.85)', padding: 12, borderRadius: 12, marginTop: 8, marginHorizontal: 16 },
  coinInfoBubbleText: { color: '#eee', fontSize: 13, lineHeight: 18 },
  filterRow: { flexDirection: 'row', marginTop: 12 },
  filterBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#1C1C1E', marginRight: 10 },
  filterSelected: { borderColor: '#FF3A5C', borderWidth: 2 },
  trimInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  trimLabel: { color: '#ddd' },
});
