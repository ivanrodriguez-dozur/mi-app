import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView, type CameraViewRef } from 'expo-camera';
// face detector is loaded dynamically because the native module may not be present
// (Expo Go might not include it). We'll try to import it at runtime and fall back.
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import React, { useCallback, useRef, useState } from 'react';
// Video will be loaded dynamically into VideoComponent state
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Linking,
} from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface PublishModalProps {
  visible: boolean;
  onClose: () => void;
  onPublished?: (url: string, type: 'photo' | 'video') => void;
  // Optional initial selection passed when opening the modal
  initialSelected?: { uri: string; type: 'photo' | 'video' }[];
}

type TabType = 'publicacion' | 'foto' | 'video';
type FilterId = 'none' | 'warm' | 'cool' | 'mono' | 'vibrant';
// extended filters that use face detection
type FaceFilterId = 'beauty' | 'makeup';
type AllFilterId = FilterId | FaceFilterId;

type SelectedItem = {
  uri: string;
  type: 'photo' | 'video';
  filter: AllFilterId;
  editedUri?: string;
  overlayText?: string;
};

type FilterConfig = {
  label: string;
  overlayColor: string;
  adjust?: {
    saturation?: number;
    contrast?: number;
    brightness?: number;
  };
};

const FILTERS: Record<AllFilterId, FilterConfig> = {
  none: { label: 'Normal', overlayColor: 'transparent' },
  warm: { label: 'Calido', overlayColor: 'rgba(255, 153, 102, 0.22)', adjust: { saturation: 1.15, brightness: 0.05 } },
  cool: { label: 'Frio', overlayColor: 'rgba(120, 190, 255, 0.2)', adjust: { contrast: 1.05, saturation: 0.95 } },
  mono: { label: 'Mono', overlayColor: 'rgba(20, 20, 20, 0.28)', adjust: { saturation: 0 } },
  vibrant: { label: 'Vibrante', overlayColor: 'rgba(255, 64, 160, 0.16)', adjust: { saturation: 1.3, contrast: 1.08 } },
  beauty: { label: 'Beauty', overlayColor: 'transparent', adjust: { contrast: 1.02, saturation: 1.05 } },
  makeup: { label: 'Makeup', overlayColor: 'transparent' },
};

const filterList = (Object.keys(FILTERS) as AllFilterId[]).map((id) => ({ id, ...FILTERS[id] }));

export const PublishModal: React.FC<PublishModalProps> = ({ visible, onClose, onPublished, initialSelected }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('publicacion');
  const [uploading, setUploading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(() => {
    if (!initialSelected || initialSelected.length === 0) return [];
    return initialSelected.map((it) => ({ uri: it.uri, type: it.type, filter: 'none' as AllFilterId }));
  });
  const [galleryAssets, setGalleryAssets] = useState<MediaLibrary.Asset[]>([]);
  const [galleryPermission, setGalleryPermission] = useState<boolean | null>(null);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<AllFilterId>('none');
  const [viewMode, setViewMode] = useState<'select' | 'editor'>('select');
  const [editingIndex, setEditingIndex] = useState(0);
  const [overlayTextInput, setOverlayTextInput] = useState('');
  const [faces, setFaces] = useState<any[]>([]);
  const [FaceDetectorModule, setFaceDetectorModule] = useState<any | null>(null);
  const [filterScrollWidth, setFilterScrollWidth] = useState(0);
  const FILTER_ITEM_SIZE = 64;
  const FILTER_ITEM_SPACING = 12;
  const cameraRef = useRef<CameraViewRef | null>(null);
  // videoRef removed; videos are opened via Linking.openURL fallback

  React.useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(cameraStatus === 'granted');
      const { status: microphoneStatus } = await Camera.requestMicrophonePermissionsAsync();
      setHasMicrophonePermission(microphoneStatus === 'granted');
    })();
    // try load face detector dynamically only when not running inside Expo Go
    (async () => {
      try {
        // When running inside Expo Go the native module is not available and
        // importing the JS wrapper will attempt to require the native module
        // and throw. Check appOwnership to avoid the import in Expo Go.
        const ownership = (Constants as any)?.appOwnership ?? 'expo';
        if (ownership === 'expo') {
          setFaceDetectorModule(null);
          return;
        }
        const mod = await import('expo-face-detector');
        setFaceDetectorModule(mod);
      } catch (err) {
        console.warn('expo-face-detector import failed', err);
        setFaceDetectorModule(null);
      }
    })();

    // no-op: avoid importing expo-av at runtime to keep Expo Go compatible
  }, []);

  React.useEffect(() => {
    if (!visible) {
      setSelectedItems([]);
      setActiveTab('publicacion');
      setIsRecording(false);
      try {
        cameraRef.current?.stopRecording?.();
      } catch {}
    }
  }, [visible]);

  // loadGalleryAssets is declared below; hoist usage after declaration by moving the effect down later

  React.useEffect(() => {
    setSelectedItems((prev) => prev.map((item) => ({ ...item, filter: selectedFilter })));
  }, [selectedFilter]);

  const loadGalleryAssets = useCallback(async () => {
    setGalleryLoading(true);
    try {
      // requestPermissionsAsync returns slightly different shapes depending on platform/SDK
      // For iOS it may include `granted` or `status` / `authorizationStatus`. Be defensive.
      const res: any = await MediaLibrary.requestPermissionsAsync();
      const status = res.status ?? (res.granted ? 'granted' : 'denied');
      const permitted = status === 'granted' || res.granted === true || res.authorizationStatus === 'AUTHORIZED';
      setGalleryPermission(permitted);
      if (!permitted) {
        // guide user to settings if needed
        Alert.alert('Permisos', 'Se requiere acceso a la galería para ver tus archivos. Por favor, activa los permisos en Ajustes.', [
          { text: 'Cancelar' },
          { text: 'Abrir Ajustes', onPress: () => {
            // attempt to open settings (works on RN Linking)
            try { Linking.openSettings(); } catch {}
          } }
        ]);
        return;
      }

      // get assets (limit to recent items). If assets is undefined, fallback to empty array
      const assetsResult = await MediaLibrary.getAssetsAsync({
        sortBy: [MediaLibrary.SortBy.creationTime],
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        first: 60,
      });
      const assets = assetsResult?.assets ?? [];
      // Normalize URIs: some iOS assets use the 'ph://' scheme which isn't directly fetchable.
      // Use getAssetInfoAsync to obtain a localUri (file://) when available.
      const normalized = await Promise.all(
        assets.map(async (a: any) => {
          let uri = a.uri ?? a.localUri;
          try {
            if (!uri || uri.startsWith('ph://')) {
              const info = await MediaLibrary.getAssetInfoAsync(a.id);
              uri = info?.localUri ?? info?.uri ?? uri;
            }
          } catch (err) {
            // non-fatal
            console.warn('getAssetInfoAsync failed for', a.id, err);
          }
          if (!uri && a.filename) {
            uri = `file://${a.filename}`;
          }
          return { ...a, uri };
        })
      );
      setGalleryAssets(normalized);
    } catch (err) {
      console.warn('loadGalleryAssets error', err);
      Alert.alert('Error', 'No se pudo cargar la galería');
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!visible || activeTab !== 'publicacion') return;
    if (galleryAssets.length > 0) return;
    loadGalleryAssets();
  }, [visible, activeTab, galleryAssets.length, loadGalleryAssets]);

  const handleSelectAsset = (asset: MediaLibrary.Asset) => {
    // In 'publicacion' mode we want a single focused selection for preview/editor
    const type = asset.mediaType === MediaLibrary.MediaType.video ? 'video' : 'photo';
    if (activeTab === 'publicacion') {
      setSelectedItems([{ uri: asset.uri, type, filter: selectedFilter }]);
      setEditingIndex(0);
      return;
    }
    // otherwise toggle selection (multi-select)
    setSelectedItems((prev) => {
      const exists = prev.find((item) => item.uri === asset.uri);
      if (exists) {
        return prev.filter((item) => item.uri !== asset.uri);
      }
      return [...prev, { uri: asset.uri, type, filter: selectedFilter }];
    });
  };

  const handleCapturePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePicture({ quality: 0.8 });
      setSelectedItems([{ uri: photo.uri, type: 'photo', filter: selectedFilter }]);
    } catch {
      Alert.alert('Error', 'No se pudo capturar la foto');
    }
  };

  const handleRecordVideo = async () => {
    if (!cameraRef.current) return;
    if (isRecording) {
      try {
        await cameraRef.current.stopRecording();
      } catch {}
      return;
    }
    if (hasMicrophonePermission !== true) {
      const { status } = await Camera.requestMicrophonePermissionsAsync();
      const granted = status === 'granted';
      setHasMicrophonePermission(granted);
      if (!granted) {
        Alert.alert('Error', 'Se requiere permiso de microfono para grabar video');
        return;
      }
    }
    setIsRecording(true);
    try {
      // call record via any to avoid SDK typing mismatch
      const video = await (cameraRef.current as any).record({ maxDuration: 60 });
      if (video?.uri) {
        setSelectedItems([{ uri: video.uri, type: 'video', filter: selectedFilter }]);
      }
    } catch {
      Alert.alert('Error', 'No se pudo grabar el video');
    } finally {
      setIsRecording(false);
    }
  };

  const handleRotateCamera = () => {
    setCameraFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const handleFiltersPress = () => {
    Alert.alert('Filtros', 'Sigue desplazando para elegir un filtro.');
  };

  const FILTER_ICON: Record<AllFilterId, string> = {
    none: 'image',
    warm: 'sunny',
    cool: 'snow',
    mono: 'contrast',
    vibrant: 'color-palette',
    beauty: 'happy',
    makeup: 'color-palette',
  };

  const applyFilterToPhoto = async (uri: string, filter: AllFilterId, ext: string) => {
    const config = FILTERS[filter];
    if (!config.adjust || filter === 'none') {
      return { uri, mimeType: ext === 'png' ? 'image/png' : 'image/jpeg' };
    }
    // manipulateAsync types may not include 'adjust' action on all SDK versions; cast to any
    const result = await (manipulateAsync as any)(uri, [{ adjust: config.adjust }], {
      compress: 1,
      format: SaveFormat.JPEG,
    });
    return { uri: result.uri, mimeType: 'image/jpeg' };
  };

  const uploadToSupabase = async () => {
    if (!user || selectedItems.length === 0) return;
    setUploading(true);
    const items = [...selectedItems];
    try {
      const bucket = 'user-uploads';
      for (const item of items) {
        const originalExt = item.uri.split('.').pop()?.toLowerCase() ?? (item.type === 'photo' ? 'jpg' : 'mp4');
        const folder = item.type === 'photo' ? 'photos' : 'videos';
        let uint8: Uint8Array;
        let contentType: string;
        let uploadExt = originalExt;
        let uploadUri = item.uri;
        if (item.type === 'photo') {
          const { uri, mimeType } = await applyFilterToPhoto(item.uri, item.filter, originalExt);
          uploadUri = uri;
          contentType = mimeType;
          uploadExt = mimeType === 'image/png' ? 'png' : 'jpg';
          const base64 = await FileSystem.readAsStringAsync(uploadUri, { encoding: 'base64' });
          const res = await fetch(`data:${mimeType};base64,${base64}`);
          const arrayBuffer = await res.arrayBuffer();
          uint8 = new Uint8Array(arrayBuffer);
        } else {
          contentType = originalExt === 'mov' ? 'video/quicktime' : 'video/mp4';
          const res = await fetch(uploadUri);
          const arrayBuffer = await res.arrayBuffer();
          uint8 = new Uint8Array(arrayBuffer);
        }
        const fileName = `${item.type}-${Date.now()}-${Math.floor(Math.random() * 10000)}.${uploadExt}`;
        const remotePath = `users/${user.id}/${folder}/${fileName}`;
        const { error } = await supabase.storage.from(bucket).upload(remotePath, uint8, {
          upsert: true,
          contentType,
        });
        if (error) {
          throw error;
        }
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(remotePath);
        if (onPublished) {
          onPublished(publicData?.publicUrl ?? '', item.type);
        }
      }
      setSelectedItems([]);
      Alert.alert('Exito', 'Archivo publicado correctamente');
      onClose();
    } catch {
      Alert.alert('Error', 'No se pudo subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const renderGalleryItem = ({ item }: { item: MediaLibrary.Asset }) => {
    const isSelected = selectedItems.some((selected) => selected.uri === item.uri);
    return (
      <TouchableOpacity
        onPress={() => handleSelectAsset(item)}
        style={[styles.galleryItem, isSelected && styles.galleryItemSelected]}
      >
        <Image source={{ uri: item.uri }} style={styles.galleryImage} />
        {item.mediaType === MediaLibrary.MediaType.video && (
          <View style={styles.galleryVideoBadge}>
            <Ionicons name="videocam" size={18} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSelectedPreview = () => {
    if (!selectedItems.length) {
      return (
        <View style={styles.previewPlaceholder}>
          <Text style={styles.previewPlaceholderText}>Selecciona archivos para ver la previsualizacion.</Text>
        </View>
      );
    }
    // Show focused preview (first selected or editingIndex)
    const focused = selectedItems[editingIndex] ?? selectedItems[0];
    const overlayColor = FILTERS[focused.filter].overlayColor;
    return (
      <View style={styles.previewFullContainer}>
        <View style={styles.previewFullSquare}>
          {focused.type === 'photo' ? (
            <Image source={{ uri: focused.editedUri ?? focused.uri }} style={styles.previewFullSquareImage} resizeMode="cover" />
          ) : (
            <View style={styles.previewVideoFull}>
              <Image source={{ uri: focused.editedUri ?? focused.uri }} style={styles.previewFullSquareImage} resizeMode="cover" />
              <TouchableOpacity style={styles.playOverlay} onPress={() => { try { Linking.openURL(focused.editedUri ?? focused.uri); } catch {} }}>
                <Ionicons name="play" size={44} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {overlayColor !== 'transparent' && (
            <View style={[styles.previewFilterOverlay, { backgroundColor: overlayColor }]} />
          )}
          {/* text overlay (visual only) */}
          {focused.overlayText ? (
            <View style={styles.textOverlayContainer} pointerEvents="none">
              <Text style={styles.textOverlay}>{focused.overlayText}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const goToEditor = () => {
    if (!selectedItems.length) return;
    setEditingIndex(0);
    setViewMode('editor');
  };

  const applyFilterToCurrent = async (filterId: AllFilterId) => {
    const item = selectedItems[editingIndex];
    if (!item || item.type !== 'photo') return;
    try {
      const ext = item.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const { uri } = await applyFilterToPhoto(item.editedUri ?? item.uri, filterId, ext);
      setSelectedItems((prev) => prev.map((it, i) => i === editingIndex ? { ...it, editedUri: uri, filter: filterId } : it));
    } catch (err) {
      console.warn('applyFilterToCurrent failed', err);
    }
  };

  const applyCropToCurrent = async (ratio: '1:1' | '4:5' | '16:9') => {
    const item = selectedItems[editingIndex];
    if (!item || item.type !== 'photo') return;
    try {
      // get image size
      const uriToUse = item.editedUri ?? item.uri;
      const size = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        Image.getSize(uriToUse, (w, h) => resolve({ width: w, height: h }), reject);
      });
      let targetW = size.width;
      let targetH = size.height;
      const [rw, rh] = ratio.split(':').map(Number);
      const targetRatio = rw / rh;
      if (size.width / size.height > targetRatio) {
        // too wide -> crop width
        targetW = Math.floor(size.height * targetRatio);
      } else {
        // too tall -> crop height
        targetH = Math.floor(size.width / targetRatio);
      }
      const originX = Math.floor((size.width - targetW) / 2);
      const originY = Math.floor((size.height - targetH) / 2);
      const result = await (manipulateAsync as any)(uriToUse, [{ crop: { originX, originY, width: targetW, height: targetH } }], { compress: 1, format: SaveFormat.JPEG });
      setSelectedItems((prev) => prev.map((it, i) => i === editingIndex ? { ...it, editedUri: result.uri } : it));
    } catch (err) {
      console.warn('applyCropToCurrent failed', err);
    }
  };

  const setOverlayTextForCurrent = (text: string) => {
    setSelectedItems((prev) => prev.map((it, i) => i === editingIndex ? { ...it, overlayText: text } : it));
  };

  const renderCameraContent = () => {
    if (hasPermission === null) {
      return (
        <View style={styles.cameraMessage}>
          <ActivityIndicator color="#fff" />
        </View>
      );
    }
    if (hasPermission === false) {
      return (
        <View style={styles.cameraMessage}>
          <Text style={styles.permissionText}>Sin permiso de camara</Text>
        </View>
      );
    }
    const overlayColor = FILTERS[selectedFilter].overlayColor;
    return (
      <View style={styles.cameraWrapper}>
        {/* CameraView: enable face detection when face filters are available (pass props as any to avoid strict typings) */}
        {(() => {
          const faceProps: any = {
            onFacesDetected: (event: any) => {
              const detected = event?.faces ?? [];
              setFaces(detected);
            },
            faceDetectorSettings: FaceDetectorModule?.Constants?.Mode
              ? {
                  mode: FaceDetectorModule.Constants.Mode.fast,
                  detectLandmarks: FaceDetectorModule.Constants.Landmarks.all,
                  runClassifications: FaceDetectorModule.Constants.Classifications.none,
                }
              : undefined,
          };
          return (
            <CameraView
              ref={cameraRef as any}
              style={styles.camera}
              facing={cameraFacing}
              ratio="16:9"
              mode={activeTab === 'video' ? 'video' : 'picture'}
              {...(FaceDetectorModule ? (faceProps as any) : {})}
            />
          );
        })()}
        {overlayColor !== 'transparent' && (
          <View pointerEvents="none" style={[styles.cameraFilterOverlay, { backgroundColor: overlayColor }]} />
        )}
        {/* Face-adaptive overlays for face filters */}
        {selectedFilter === 'makeup' && faces.map((f, i) => (
          <React.Fragment key={`face-makeup-${i}`}>
            <View pointerEvents="none" style={[styles.faceOverlay, {
              left: f.bounds.origin.x,
              top: f.bounds.origin.y,
              width: f.bounds.size.width,
              height: f.bounds.size.height,
            }]} />
            {/* simple lip tint using mouth landmarks when available */}
            {f.leftMouthPosition && f.rightMouthPosition && (
              (() => {
                const lx = f.leftMouthPosition.x;
                const ly = f.leftMouthPosition.y;
                const rx = f.rightMouthPosition.x;
                const ry = f.rightMouthPosition.y;
                const cx = (lx + rx) / 2;
                const baseY = (ly + ry) / 2;
                const noseY = f.noseBasePosition ? f.noseBasePosition.y : baseY + 4;
                const cy = baseY + (noseY - baseY) * 0.2;
                const w = Math.max(8, Math.hypot(rx - lx, ry - ly));
                const h = w * 0.45;
                return (
                  <View pointerEvents="none" style={[styles.lipTint, {
                    left: cx - w / 2,
                    top: cy - h / 2,
                    width: w,
                    height: h,
                    borderRadius: h / 2,
                  }]} />
                );
              })()
            )}
          </React.Fragment>
        ))}
        {selectedFilter === 'beauty' && faces.map((f, i) => (
          <View key={`face-beauty-${i}`} pointerEvents="none" style={[styles.faceBeautyOverlay, {
            left: f.bounds.origin.x,
            top: f.bounds.origin.y,
            width: f.bounds.size.width,
            height: f.bounds.size.height,
          }]} />
        ))}
        <View style={styles.sideControls}>
          <TouchableOpacity style={styles.sideControlButton} onPress={handleRotateCamera}>
            <Ionicons name="camera-reverse" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideControlButton} onPress={handleFiltersPress}>
            <Ionicons name="color-wand" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* bottom row: filters on the left, capture button centered */}
        <View style={styles.bottomControlsRow} pointerEvents="box-none">
          <View style={styles.filterPickerContainerInner}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
              onLayout={(e) => setFilterScrollWidth(e.nativeEvent.layout.width)}
              snapToInterval={FILTER_ITEM_SIZE + FILTER_ITEM_SPACING}
              decelerationRate="fast"
              onMomentumScrollEnd={(e) => {
                const offsetX = e.nativeEvent.contentOffset.x;
                const ITEM_SPACED = FILTER_ITEM_SIZE + FILTER_ITEM_SPACING;
                // compute index by center of visible area near right side
                const visibleWidth = filterScrollWidth || 1;
                const rightEdge = offsetX + visibleWidth;
                const index = Math.round((rightEdge - FILTER_ITEM_SIZE / 2) / ITEM_SPACED) - 1;
                const clamped = Math.max(0, Math.min(filterList.length - 1, index));
                const sel = filterList[clamped]?.id ?? 'none';
                setSelectedFilter(sel);
              }}
            >
              {filterList.map((filter) => {
                const isActive = filter.id === selectedFilter;
                return (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterBubbleCircular,
                      isActive && styles.filterBubbleActiveCircular,
                    ]}
                    onPress={() => setSelectedFilter(filter.id)}
                    activeOpacity={0.85}
                  >
                    {/* Animated scale for active filter */}
                    <Animated.View
                      style={{
                        transform: [{ scale: isActive ? 1.06 : 1 }],
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: FILTER_ITEM_SIZE,
                        height: FILTER_ITEM_SIZE,
                        borderRadius: FILTER_ITEM_SIZE / 2,
                        backgroundColor: isActive ? '#CCFF00' : 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <Ionicons name={FILTER_ICON[filter.id] as any} size={22} color={isActive ? '#1f1f1f' : '#fff'} />
                    </Animated.View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <View style={styles.captureControls}>
          {activeTab === 'foto' && (
            <TouchableOpacity style={styles.captureButton} onPress={handleCapturePhoto} disabled={uploading}>
              <Ionicons name="camera" size={42} color="#000" />
            </TouchableOpacity>
          )}
          {activeTab === 'video' && (
            <TouchableOpacity
              style={[styles.captureButton, styles.captureButtonVideo, isRecording && styles.captureButtonRecording]}
              onPress={handleRecordVideo}
              disabled={uploading}
            >
              <Ionicons name={isRecording ? 'stop' : 'videocam'} size={42} color="#000" />
            </TouchableOpacity>
          )}
        </View>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (activeTab === 'publicacion') {
      // Si no hay archivo seleccionado, mostrar galería a pantalla completa
      if (!selectedItems.length) {
        return (
          <View style={{ flex: 1, backgroundColor: '#181818' }}>
            <View style={{ flex: 1 }}>
              {galleryLoading ? (
                <View style={styles.galleryLoading}>
                  <ActivityIndicator color="#fff" />
                </View>
              ) : galleryPermission === false ? (
                <View style={styles.galleryLoading}>
                  <Text style={styles.permissionText}>Sin permiso de galeria</Text>
                </View>
              ) : (
                galleryAssets.length === 0 ? (
                  <View style={styles.galleryLoading}>
                    <Text style={styles.permissionText}>No se encontraron archivos en la galería.</Text>
                    <TouchableOpacity onPress={loadGalleryAssets} style={{ marginTop: 12, padding: 10, backgroundColor: '#CCFF00', borderRadius: 8 }}>
                      <Text style={{ color: '#1f1f1f', fontWeight: '700' }}>Recargar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <FlatList
                    data={galleryAssets}
                    keyExtractor={(item) => item.id}
                    renderItem={renderGalleryItem}
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 8 }}
                    style={{ flex: 1 }}
                  />
                )
              )}
            </View>
          </View>
        );
      }
      // Si hay archivo seleccionado, mostrarlo en pantalla completa con flecha y botón
      return (
        <View style={{ flex: 1, backgroundColor: '#181818' }}>
          {/* Flecha para volver */}
          <View style={{ position: 'absolute', top: 32, left: 16, zIndex: 10 }}>
            <TouchableOpacity onPress={() => {
              setSelectedItems([]);
              setViewMode('select');
            }} style={{ padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 }}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          {/* Preview del archivo seleccionado, pantalla completa */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 0 }}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
              {renderSelectedPreview()}
            </View>
          </View>
          {/* Botón Siguiente solo abajo */}
          <View style={{ position: 'absolute', bottom: 32, left: 0, right: 0, alignItems: 'center' }}>
            <TouchableOpacity
              style={{ backgroundColor: '#CCFF00', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12 }}
              onPress={goToEditor}
            >
              <Text style={{ color: '#1f1f1f', fontWeight: 'bold', fontSize: 18 }}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return renderCameraContent();
  };

  const renderFilterPicker = () => (
    <View style={styles.filterPickerContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {filterList.map((filter) => {
          const isActive = filter.id === selectedFilter;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterBubble, isActive && styles.filterBubbleActive, { backgroundColor: filter.overlayColor }]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[styles.filterBubbleLabel, isActive && styles.filterBubbleLabelActive]}>{filter.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const tabs: { key: TabType; label: string }[] = [
    { key: 'publicacion', label: 'Publicacion' },
    { key: 'foto', label: 'Foto' },
    { key: 'video', label: 'Video' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>{renderContent()}</View>
  {viewMode === 'editor' && renderFilterPicker()}
        {/* Solo mostrar el botón Siguiente en la vista de preview de Publicacion, no aquí */}
        {viewMode === 'editor' && (
          <View style={styles.publishContainer}>
            <View style={{ width: '100%' }}>
              {/* Editor controls */}
              <View style={styles.editorControls}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
                  {filterList.map((f) => (
                    <TouchableOpacity key={f.id} onPress={() => applyFilterToCurrent(f.id)} style={[styles.filterBubbleCircular, { marginRight: 8 }]}>
                      <Ionicons name={FILTER_ICON[f.id] as any} size={18} color="#fff" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.cropButtonsRow}>
                  <TouchableOpacity style={styles.cropButton} onPress={() => applyCropToCurrent('1:1')}>
                    <Text style={{ color: '#fff' }}>1:1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cropButton} onPress={() => applyCropToCurrent('4:5')}>
                    <Text style={{ color: '#fff' }}>4:5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cropButton} onPress={() => applyCropToCurrent('16:9')}>
                    <Text style={{ color: '#fff' }}>16:9</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.addTextRow}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', marginRight: 8 }}>Texto:</Text>
                  <View style={styles.textInputFake}>
                    <Text style={{ color: '#fff' }}>{selectedItems[editingIndex]?.overlayText ?? ''}</Text>
                  </View>
                  <TouchableOpacity style={styles.editTextButton} onPress={() => {
                    setOverlayTextInput(selectedItems[editingIndex]?.overlayText ?? '');
                  }}>
                    <Text style={{ color: '#fff' }}>Editar</Text>
                  </TouchableOpacity>
                </View>
                {/* overlay text input */}
                <View style={{ marginTop: 8 }}>
                  <ScrollView horizontal>
                    <TouchableOpacity style={styles.applyTextButton} onPress={() => { setOverlayTextForCurrent(overlayTextInput); setOverlayTextInput(''); }}>
                      <Text style={{ color: '#1f1f1f' }}>Aplicar texto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.clearTextButton} onPress={() => setOverlayTextForCurrent('')}>
                      <Text style={{ color: '#fff' }}>Quitar texto</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.publishButton, (uploading || selectedItems.length === 0) && styles.publishButtonDisabled, { marginTop: 12 }]}
                onPress={uploadToSupabase}
                disabled={uploading || selectedItems.length === 0}
              >
                {uploading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.publishButtonText}>Publicar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.bottomTabs}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.bottomTab, isActive && styles.bottomTabActive]}
              >
                <Text style={[styles.bottomTabText, isActive && styles.bottomTabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cameraWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraFilterOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    color: '#fff',
    textAlign: 'center',
  },
  sideControls: {
    position: 'absolute',
    top: 32,
    right: 12,
  },
  sideControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    marginBottom: 16,
  },
  captureControls: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
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
  captureButtonVideo: {
    backgroundColor: '#FF5555',
  },
  captureButtonRecording: {
    backgroundColor: '#FF0000',
  },
  galleryContainer: {
    flex: 1,
  },
  galleryPreview: {
    flex: 2.2,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholder: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  previewPlaceholderText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontSize: 14,
  },
  previewStrip: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  previewFullSquare: {
    width: '100%',
    height: '70%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  previewFullSquareImage: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
    borderRadius: 18,
  },
  previewVideo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* editor / full preview styles */
  previewFullContainer: {
    flex: 1,
    marginBottom: 0,
    width: '100%',
    minHeight: 0,
  },
  previewFull: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  previewFullImage: {
    width: '100%',
    height: '100%',
  },
  previewVideoFull: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  textOverlayContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  textOverlay: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  previewThumbWrapper: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  previewThumbActive: {
    borderColor: '#CCFF00',
  },
  previewThumb: {
    width: '100%',
    height: '100%',
  },
  previewFilterOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gallerySheet: {
    minHeight: 120,
    maxHeight: 180,
    height: 'auto',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingBottom: 0,
    marginBottom: 0,
    width: '100%',
  },
  galleryLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryListContent: {
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  galleryItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    margin: 4,
  },
  galleryItemSelected: {
    borderWidth: 3,
    borderColor: '#CCFF00',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryVideoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterPickerContainer: {
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  /* circular filter picker near capture button */
  bottomControlsRow: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  filterPickerContainerInner: {
    width: 220,
    paddingLeft: 4,
  },
  filterBubbleCircular: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterBubbleActiveCircular: {
    borderColor: '#CCFF00',
    borderWidth: 2,
  },
  faceOverlay: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,64,160,0.6)',
    backgroundColor: 'rgba(255,64,160,0.15)',
  },
  faceBeautyOverlay: {
    position: 'absolute',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  lipTint: {
    position: 'absolute',
    backgroundColor: 'rgba(255,64,160,0.45)',
  },
  filterBubble: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  filterBubbleActive: {
    borderColor: '#CCFF00',
  },
  editorControls: {
    backgroundColor: 'rgba(0,0,0,0.24)',
    padding: 8,
    borderRadius: 12,
  },
  cropButtonsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cropButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    marginRight: 8,
  },
  addTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  textInputFake: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    marginRight: 8,
  },
  editTextButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#444',
    borderRadius: 8,
  },
  applyTextButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#CCFF00',
    borderRadius: 8,
    marginRight: 8,
  },
  clearTextButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#555',
    borderRadius: 8,
  },
  filterBubbleLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  filterBubbleLabelActive: {
    color: '#1f1f1f',
  },
  publishContainer: {
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  publishButton: {
    backgroundColor: '#CCFF00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: 'rgba(204,255,0,0.4)',
  },
  publishButtonText: {
    color: '#1f1f1f',
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  bottomTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bottomTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#CCFF00',
  },
  bottomTabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomTabTextActive: {
    color: '#CCFF00',
  },
});

export default PublishModal;





