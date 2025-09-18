import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SharedVideo {
  id: string;
  title: string;
  thumbnail: string;
  plays: number;
}

interface SharedVideosModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SharedVideosModal: React.FC<SharedVideosModalProps> = ({ visible, onClose }) => {
  const { colors, fontScale } = useTheme();

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

  // Mock data de videos compartidos - simplificado
  const sharedVideos: SharedVideo[] = [
    {
      id: '1',
      title: 'Gol increíble de chilena',
      thumbnail: 'https://placehold.co/200x200?text=Video+1',
      plays: 1500,
    },
    {
      id: '2',
      title: 'Jugada épica 1vs1',
      thumbnail: 'https://placehold.co/200x200?text=Video+2',
      plays: 2800,
    },
    {
      id: '3',
      title: 'Mejor jugada del mes',
      thumbnail: 'https://placehold.co/200x200?text=Video+3',
      plays: 5200,
    },
    {
      id: '4',
      title: 'Compilación de goles',
      thumbnail: 'https://placehold.co/200x200?text=Video+4',
      plays: 950,
    },
    {
      id: '5',
      title: 'Tutorial de gambetas',
      thumbnail: 'https://placehold.co/200x200?text=Video+5',
      plays: 1200000,
    },
    {
      id: '6',
      title: 'Partido completo destacado',
      thumbnail: 'https://placehold.co/200x200?text=Video+6',
      plays: 800,
    },
  ];

  const renderVideoItem = ({ item }: { item: SharedVideo }) => (
    <TouchableOpacity style={[styles.videoItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <Text style={[styles.videoTitle, { color: colors.text, fontSize: 12 * fontScale }]} numberOfLines={2}>
        {item.title}
      </Text>
      <View style={styles.playsContainer}>
        <Ionicons name="play" size={12} color={colors.textSecondary} />
        <Text style={[styles.playsText, { color: colors.textSecondary, fontSize: 11 * fontScale }]}>
          {formatNumber(item.plays)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <Ionicons name="share" size={24} color="#6B7280" />
              <Text style={[styles.title, { color: colors.text, fontSize: 20 * fontScale }]}>
                Videos Compartidos
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Videos List */}
          <FlatList
            data={sharedVideos}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.videosList}
            columnWrapperStyle={styles.row}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="share-outline" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 16 * fontScale }]}>
                  No hay videos compartidos
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                  Los videos que compartas aparecerán aquí
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    gap: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  videosList: {
    padding: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  videoItem: {
    width: '30%',
    padding: 8,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  videoTitle: {
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  playsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  playsText: {
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    marginTop: 4,
    textAlign: 'center',
  },
});