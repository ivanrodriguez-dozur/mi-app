import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface FavoritesModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FavoriteItem {
  id: string;
  type: 'video' | 'boom' | 'foto';
  title: string;
  thumbnail: string;
  plays: number;
}

type FavoriteCategory = 'videos' | 'booms' | 'fotos';

/**
 * Modal de favoritos que muestra videos, booms y fotos guardados
 * Organizado por categorías con navegación por tabs
 */
export const FavoritesModal: React.FC<FavoritesModalProps> = ({ visible, onClose }) => {
  const { colors, fontScale } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<FavoriteCategory>('videos');

  // Función para formatear números a formato decimal (1.3k, 1.3M)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    } else {
      return num.toString();
    }
  };

  // Datos de ejemplo de favoritos
  const favoriteItems: Record<FavoriteCategory, FavoriteItem[]> = {
    videos: [
      {
        id: '1',
        type: 'video',
        title: 'Gol increíble de Messi',
        thumbnail: 'https://placehold.co/300x400/1a1a2e/CCFF00?text=Video+1',
        plays: 45600,
      },
      {
        id: '2',
        type: 'video',
        title: 'Tutorial de fintas',
        thumbnail: 'https://placehold.co/300x400/16213e/4FC3F7?text=Video+2',
        plays: 23400,
      },
      {
        id: '3',
        type: 'video',
        title: 'Highlights del partido',
        thumbnail: 'https://placehold.co/300x400/2d1b69/CCFF00?text=Video+3',
        plays: 1200000,
      }
    ],
    booms: [
      {
        id: '4',
        type: 'boom',
        title: 'Boom épico',
        thumbnail: 'https://placehold.co/300x400/ff6b6b/FFFFFF?text=Boom+1',
        plays: 12300,
      },
      {
        id: '5',
        type: 'boom',
        title: 'Momento viral',
        thumbnail: 'https://placehold.co/300x400/4ecdc4/FFFFFF?text=Boom+2',
        plays: 34500,
      }
    ],
    fotos: [
      {
        id: '6',
        type: 'foto',
        title: 'Foto del estadio',
        thumbnail: 'https://placehold.co/300x400/45b7d1/FFFFFF?text=Foto+1',
        plays: 5600,
      },
      {
        id: '7',
        type: 'foto',
        title: 'Celebración del gol',
        thumbnail: 'https://placehold.co/300x400/f9ca24/FFFFFF?text=Foto+2',
        plays: 15400,
      },
      {
        id: '8',
        type: 'foto',
        title: 'Equipo completo',
        thumbnail: 'https://placehold.co/300x400/6c5ce7/FFFFFF?text=Foto+3',
        plays: 9800,
      }
    ]
  };

  const getCategoryIcon = (category: FavoriteCategory) => {
    switch (category) {
      case 'videos': return 'play-circle-outline';
      case 'booms': return 'flash-outline';
      case 'fotos': return 'image-outline';
    }
  };

  const getCategoryLabel = (category: FavoriteCategory) => {
    switch (category) {
      case 'videos': return 'Videos';
      case 'booms': return 'Booms';
      case 'fotos': return 'Fotos';
    }
  };

  const getCategoryCount = (category: FavoriteCategory) => {
    return favoriteItems[category].length;
  };

  const FavoriteItemComponent: React.FC<{ item: FavoriteItem }> = ({ item }) => {
    return (
      <TouchableOpacity style={[styles.favoriteItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          
          {/* Ícono de tipo de contenido */}
          <View style={[styles.typeIcon, { backgroundColor: colors.accent }]}>
            <Ionicons 
              name={getCategoryIcon(item.type as FavoriteCategory)} 
              size={16} 
              color="#000" 
            />
          </View>
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: colors.text, fontSize: 12 * fontScale }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.playsContainer}>
            <Ionicons name="play" size={12} color={colors.textSecondary} />
            <Text style={[styles.playsText, { color: colors.textSecondary, fontSize: 10 * fontScale }]}>
              {formatNumber(item.plays)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <Ionicons name="heart" size={24} color="#FF4444" />
              <Text style={[styles.title, { color: colors.text, fontSize: 20 * fontScale }]}>
                Mis Favoritos
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
            {(['videos', 'booms', 'fotos'] as FavoriteCategory[]).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.tab,
                  { 
                    backgroundColor: selectedCategory === category ? colors.accent : 'transparent',
                    borderColor: colors.border 
                  }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Ionicons 
                  name={getCategoryIcon(category)} 
                  size={18} 
                  color={selectedCategory === category ? '#000' : colors.text} 
                />
                <Text style={[
                  styles.tabText, 
                  { 
                    color: selectedCategory === category ? '#000' : colors.text,
                    fontSize: 12 * fontScale 
                  }
                ]}>
                  {getCategoryLabel(category)}
                </Text>
                <View style={[styles.countBadge, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.countText, { color: colors.text, fontSize: 10 * fontScale }]}>
                    {getCategoryCount(category)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {favoriteItems[selectedCategory].length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 16 * fontScale }]}>
                  No tienes {getCategoryLabel(selectedCategory).toLowerCase()} en favoritos
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                  Presiona el corazón en cualquier contenido para agregarlo aquí
                </Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {favoriteItems[selectedCategory].map((item) => (
                  <FavoriteItemComponent key={item.id} item={item} />
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 3; // 3 columnas con márgenes

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    gap: 6,
  },
  tabText: {
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
  },
  favoriteItem: {
    width: itemWidth,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: itemWidth * 1.2,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  durationOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  typeIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    padding: 6,
  },
  itemTitle: {
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 16,
  },
  playsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playsText: {
    fontWeight: '500',
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 16,
  },
});