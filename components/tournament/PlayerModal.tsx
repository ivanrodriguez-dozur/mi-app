import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Player {
  id: string;
  name: string;
  avatar: string;
  team: string;
  rating: number;
  position: string;
  popularity: {
    fans: number;
    votes: number;
    admirers: number;
  };
}

interface PlayerModalProps {
  visible: boolean;
  player: Player | null;
  onClose: () => void;
  onVote: (playerId: string) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  visible,
  player,
  onClose,
  onVote,
}) => {
  if (!player) return null;

  const handleVote = () => {
    onVote(player.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.9)" barStyle="light-content" />
      
      {/* Fondo oscuro con tap para cerrar */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          {/* Header con botón cerrar */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Card del jugador */}
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.playerCard}
            onPress={() => {}} // Prevenir que se cierre al tocar la card
          >
            {/* Área de foto del jugador */}
            <View style={styles.photoArea}>
              <Text style={styles.avatarPlaceholder}>{player.avatar}</Text>
            </View>

            {/* Botón de votar */}
            <TouchableOpacity style={styles.voteButton} onPress={handleVote}>
              <Ionicons name="thumbs-up" size={24} color="#FFFFFF" />
              <Text style={styles.voteButtonText}>VOTAR</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.6, // Más compacto
    position: 'relative',
  },
  header: {
    position: 'absolute',
    top: -50,
    right: 0,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerCard: {
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00FFFF',
    overflow: 'hidden',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  photoArea: {
    height: 350, // Más grande para la foto
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    fontSize: 80,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF88',
    margin: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  voteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
    letterSpacing: 1,
  },
});