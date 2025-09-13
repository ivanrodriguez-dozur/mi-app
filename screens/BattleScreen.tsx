import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VoteReaction {
  id: string;
  emoji: string;
  name: string;
  value: number;
  color: string;
  effect: string;
}

const VOTE_REACTIONS: VoteReaction[] = [
  { id: 'fire', emoji: '🔥', name: 'En Fuego', value: 3, color: '#FF4444', effect: 'burn' },
  { id: 'crown', emoji: '👑', name: 'Royalty', value: 5, color: '#FFD700', effect: 'golden' },
  { id: 'lightning', emoji: '⚡', name: 'Electric', value: 2, color: '#00BFFF', effect: 'spark' },
  { id: 'heart', emoji: '❤️', name: 'Love', value: 1, color: '#FF69B4', effect: 'hearts' },
  { id: 'star', emoji: '⭐', name: 'Star', value: 2, color: '#FFD700', effect: 'sparkle' },
];

export default function BattleScreen() {
  const params = useLocalSearchParams();
  const tournament = params.tournament ? JSON.parse(params.tournament as string) : null;
  
  const [selectedPlayer, setSelectedPlayer] = useState<'1' | '2' | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<string>('fire');
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState({ player1: 45, player2: 55 });
  
  // Animaciones
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const voteAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent', true);
    
    // Animación de pulso continua
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const handlePlayerSelect = (player: '1' | '2') => {
    if (hasVoted) return;
    setSelectedPlayer(player);
    
    // Animación de selección
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleVote = () => {
    if (!selectedPlayer || hasVoted) return;
    
    const reaction = VOTE_REACTIONS.find(r => r.id === selectedReaction);
    
    // Animación de voto
    Animated.sequence([
      Animated.timing(voteAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(voteAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setHasVoted(true);
    
    // Simular actualización de votos
    setVotes(prev => ({
      player1: selectedPlayer === '1' ? prev.player1 + reaction!.value : prev.player1,
      player2: selectedPlayer === '2' ? prev.player2 + reaction!.value : prev.player2,
    }));

    // Auto-cerrar después de votar
    setTimeout(() => {
      router.back();
    }, 2500);
  };

  const renderReactionSelector = () => (
    <View style={styles.reactionSelector}>
      <Text style={styles.reactionTitle}>Selecciona tu reacción:</Text>
      <View style={styles.reactionsContainer}>
        {VOTE_REACTIONS.map((reaction) => (
          <TouchableOpacity
            key={reaction.id}
            style={[
              styles.reactionButton,
              { borderColor: reaction.color },
              selectedReaction === reaction.id && { 
                backgroundColor: reaction.color + '30',
                borderWidth: 3,
              }
            ]}
            onPress={() => setSelectedReaction(reaction.id)}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            <Text style={[styles.reactionValue, { color: reaction.color }]}>
              +{reaction.value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderVoteAnimation = () => {
    const selectedReactionData = VOTE_REACTIONS.find(r => r.id === selectedReaction);
    
    return (
      <Animated.View
        style={[
          styles.voteAnimation,
          {
            opacity: voteAnim,
            transform: [
              {
                scale: voteAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 1.2, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.voteEmojiLarge}>{selectedReactionData?.emoji}</Text>
        <Text style={styles.voteText}>¡VOTO CONFIRMADO!</Text>
        <Text style={[styles.votePoints, { color: selectedReactionData?.color }]}>
          +{selectedReactionData?.value} PUNTOS
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con info del torneo */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.tournamentInfo}>
          <Text style={styles.tournamentTitle}>{tournament.title}</Text>
          <Text style={styles.tournamentSubtitle}>{tournament.subtitle}</Text>
        </View>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{tournament.timeLeft}</Text>
        </View>
      </View>

      {/* VS Battle Arena */}
      <View style={styles.battleArena}>
        {/* Player 1 */}
        <Animated.View
          style={[
            styles.playerSection,
            { transform: [{ scale: scaleAnim }] },
            selectedPlayer === '1' && styles.selectedPlayer,
          ]}
        >
          <TouchableOpacity
            style={[
              styles.playerCard,
              styles.playerLeft,
              selectedPlayer === '1' && { borderColor: '#00FF88', borderWidth: 4 },
            ]}
            onPress={() => handlePlayerSelect('1')}
            disabled={hasVoted}
          >
            <Animated.View
              style={[
                styles.playerAvatar,
                { transform: [{ scale: selectedPlayer === '1' ? pulseAnim : 1 }] },
              ]}
            >
              <Text style={styles.avatarText}>
                {tournament.participants.player1.avatar}
              </Text>
            </Animated.View>
            <Text style={styles.playerName}>
              {tournament.participants.player1.name}
            </Text>
            {hasVoted && (
              <View style={styles.voteResult}>
                <Text style={styles.votePercentage}>{votes.player1}%</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* VS Central */}
        <View style={styles.vsSection}>
          <View style={styles.vsCircle}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={styles.vsLightning}>
            <Ionicons name="flash" size={30} color="#FFD700" />
          </View>
        </View>

        {/* Player 2 */}
        <Animated.View
          style={[
            styles.playerSection,
            { transform: [{ scale: scaleAnim }] },
            selectedPlayer === '2' && styles.selectedPlayer,
          ]}
        >
          <TouchableOpacity
            style={[
              styles.playerCard,
              styles.playerRight,
              selectedPlayer === '2' && { borderColor: '#FF4444', borderWidth: 4 },
            ]}
            onPress={() => handlePlayerSelect('2')}
            disabled={hasVoted}
          >
            <Animated.View
              style={[
                styles.playerAvatar,
                { transform: [{ scale: selectedPlayer === '2' ? pulseAnim : 1 }] },
              ]}
            >
              <Text style={styles.avatarText}>
                {tournament.participants.player2.avatar}
              </Text>
            </Animated.View>
            <Text style={styles.playerName}>
              {tournament.participants.player2.name}
            </Text>
            {hasVoted && (
              <View style={styles.voteResult}>
                <Text style={styles.votePercentage}>{votes.player2}%</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Selector de Reacciones */}
      {selectedPlayer && !hasVoted && renderReactionSelector()}

      {/* Botón de Voto */}
      {selectedPlayer && !hasVoted && (
        <TouchableOpacity style={styles.voteButton} onPress={handleVote}>
          <Text style={styles.voteButtonText}>
            VOTAR POR {selectedPlayer === '1' ? 'PLAYER 1' : 'PLAYER 2'}
          </Text>
          <Ionicons name="flash" size={20} color="#000" />
        </TouchableOpacity>
      )}

      {/* Prize Info */}
      <View style={styles.prizeInfo}>
        <Ionicons name="trophy" size={24} color="#FFD700" />
        <Text style={styles.prizeText}>Premio: {tournament.prize}</Text>
      </View>

      {/* Animación de Voto */}
      {renderVoteAnimation()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tournamentInfo: {
    flex: 1,
    alignItems: 'center',
  },
  tournamentTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tournamentSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  timerContainer: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  timerText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  battleArena: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  playerSection: {
    flex: 1,
  },
  selectedPlayer: {
    // Efecto visual para jugador seleccionado
  },
  playerCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerLeft: {
    marginRight: 10,
  },
  playerRight: {
    marginLeft: 10,
  },
  playerAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  avatarText: {
    fontSize: 50,
  },
  playerName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  voteResult: {
    marginTop: 10,
    backgroundColor: 'rgba(0,255,136,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  votePercentage: {
    color: '#00FF88',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vsSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  vsCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  vsText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  vsLightning: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  reactionSelector: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  reactionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reactionButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    padding: 10,
    minWidth: 50,
  },
  reactionEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  reactionValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 20,
    gap: 10,
  },
  voteButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  prizeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  prizeText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  voteAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -100 }],
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  voteEmojiLarge: {
    fontSize: 60,
    marginBottom: 10,
  },
  voteText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  votePoints: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
});