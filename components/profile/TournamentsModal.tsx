import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface TournamentsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isTeam: boolean;
  teamMembers?: string[];
}

interface VoteReaction {
  id: string;
  emoji: string;
  name: string;
  value: number;
  color: string;
  effect: string;
}

interface Match {
  id: string;
  participant1: Participant;
  participant2: Participant;
  votes1: number;
  votes2: number;
  totalVotes: number;
  reactions1: { [key: string]: number };
  reactions2: { [key: string]: number };
  endTime: Date;
  hasUserVoted: boolean;
  userVote?: '1' | '2';
  userReaction?: string;
  winner?: '1' | '2';
  isActive: boolean;
}

interface Tournament {
  id: string;
  name: string;
  type: '1v1' | '2v2' | 'equipos';
  status: 'active' | 'finished' | 'upcoming';
  matches: Match[];
  round: number;
  maxRounds: number;
}

type TournamentTab = 'activos' | 'mis-torneos' | 'crear';

export const TournamentsModal: React.FC<TournamentsModalProps> = ({ visible, onClose }) => {
  const { colors, fontScale } = useTheme();
  const [selectedTab, setSelectedTab] = useState<TournamentTab>('activos');

  // Reacciones gaming disponibles
  const VOTE_REACTIONS: VoteReaction[] = [
    { id: 'fire', emoji: '🔥', name: 'En Fuego', value: 3, color: '#FF4444', effect: 'burn' },
    { id: 'crown', emoji: '👑', name: 'Rey', value: 5, color: '#FFD700', effect: 'royal' },
    { id: 'lightning', emoji: '⚡', name: 'Rayo', value: 2, color: '#4169E1', effect: 'electric' },
    { id: 'heart', emoji: '❤️', name: 'Love', value: 1, color: '#FF69B4', effect: 'love' },
    { id: 'star', emoji: '⭐', name: 'Estrella', value: 2, color: '#FFD700', effect: 'sparkle' },
  ];

  // Datos de ejemplo de torneos activos
  const activeTournaments: Tournament[] = [
    {
      id: '1',
      name: 'Copa de Fintas 2024',
      type: '1v1',
      status: 'active',
      round: 1,
      maxRounds: 3,
      matches: [
        {
          id: 'm1',
          participant1: { id: 'p1', name: 'DozurTV', avatar: '🏆', isTeam: false },
          participant2: { id: 'p2', name: 'Messi10', avatar: '⚽', isTeam: false },
          votes1: 45,
          votes2: 38,
          totalVotes: 83,
          reactions1: { fire: 15, crown: 8, lightning: 12, heart: 5, star: 5 },
          reactions2: { fire: 10, crown: 5, lightning: 8, heart: 8, star: 7 },
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas desde ahora
          hasUserVoted: false,
          isActive: true
        },
        {
          id: 'm2',
          participant1: { id: 'p3', name: 'CR7', avatar: '👑', isTeam: false },
          participant2: { id: 'p4', name: 'Neymar', avatar: '🌟', isTeam: false },
          votes1: 62,
          votes2: 55,
          totalVotes: 117,
          reactions1: { fire: 20, crown: 15, lightning: 12, heart: 8, star: 7 },
          reactions2: { fire: 18, crown: 10, lightning: 15, heart: 7, star: 5 },
          endTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hora desde ahora
          hasUserVoted: true,
          userVote: '1',
          userReaction: 'crown',
          isActive: true
        }
      ]
    }
  ];

  const formatTimeLeft = (endTime: Date): string => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Terminado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const handleVote = (matchId: string, participantChoice: '1' | '2', reactionId: string = 'fire') => {
    const reaction = VOTE_REACTIONS.find(r => r.id === reactionId);
    const points = reaction ? reaction.value : 1;
    
    console.log(`🎮 GAMING VOTE! Participant ${participantChoice} in match ${matchId}`);
    console.log(`Reaction: ${reaction?.emoji} (${points} points)`);
    
    // Actualizar el estado de los matches
    setMatches(prevMatches => 
      prevMatches.map(match => {
        if (match.id === matchId) {
          const updatedMatch = { ...match };
          
          // Marcar que el usuario votó
          updatedMatch.hasUserVoted = true;
          updatedMatch.userVote = participantChoice;
          updatedMatch.userReaction = reactionId;
          
          // Actualizar contadores de votos
          if (participantChoice === '1') {
            updatedMatch.votes1 += points;
            updatedMatch.reactions1[reactionId] = (updatedMatch.reactions1[reactionId] || 0) + 1;
          } else {
            updatedMatch.votes2 += points;
            updatedMatch.reactions2[reactionId] = (updatedMatch.reactions2[reactionId] || 0) + 1;
          }
          
          // Recalcular total de votos
          updatedMatch.totalVotes = updatedMatch.votes1 + updatedMatch.votes2;
          
          return updatedMatch;
        }
        return match;
      })
    );
    
    // TODO: Agregar efectos de partículas, sonido, vibración basados en reaction.effect
    // TODO: Animación de confetti o efectos especiales según la reacción
  };

  const ReactionSelector: React.FC<{ 
    onReactionSelect: (reactionId: string) => void; 
    selectedReaction?: string;
    style?: any;
  }> = ({ onReactionSelect, selectedReaction, style }) => {
    return (
      <View style={[styles.reactionSelector, style]}>
        {VOTE_REACTIONS.map((reaction) => (
          <TouchableOpacity
            key={reaction.id}
            style={[
              styles.reactionButton,
              { borderColor: reaction.color },
              selectedReaction === reaction.id && { backgroundColor: reaction.color + '20' }
            ]}
            onPress={() => onReactionSelect(reaction.id)}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            <Text style={[styles.reactionValue, { color: reaction.color }]}>
              {reaction.value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getTimeLeftColor = (endTime: Date): string => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    const hoursLeft = diff / (1000 * 60 * 60);
    
    if (hoursLeft <= 1) return '#FF4444'; // Rojo urgente
    if (hoursLeft <= 6) return '#FF8800'; // Naranja advertencia  
    return '#00AA44'; // Verde normal
  };

  const CircularTimer: React.FC<{ endTime: Date; size?: number }> = ({ endTime, size = 60 }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTime] = useState(24 * 60 * 60 * 1000); // 24 horas en ms
    const rotateAnimation = useRef(new Animated.Value(0)).current;
    const scaleAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const updateTimer = () => {
        const now = new Date();
        const diff = endTime.getTime() - now.getTime();
        const remaining = Math.max(0, diff);
        setTimeLeft(remaining);

        // Calcular progreso (de 24h hacia 0)
        const progress = (totalTime - remaining) / totalTime;
        
        // Animar la rotación del círculo
        Animated.timing(rotateAnimation, {
          toValue: progress,
          duration: 1000,
          useNativeDriver: false,
        }).start();

        // Efecto de pulso cuando quedan menos de 1 hora
        if (remaining <= 60 * 60 * 1000 && remaining > 0) {
          Animated.loop(
            Animated.sequence([
              Animated.timing(scaleAnimation, {
                toValue: 1.1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnimation, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
            ])
          ).start();
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }, [endTime, rotateAnimation, scaleAnimation, totalTime]);

    const circumference = 2 * Math.PI * (size / 2 - 8);
    const strokeDashoffset = rotateAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [circumference, 0],
    });

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const color = getTimeLeftColor(endTime);

    return (
      <Animated.View style={[
        styles.circularTimer, 
        { width: size, height: size, transform: [{ scale: scaleAnimation }] }
      ]}>
        {/* SVG sería ideal aquí, usando View como alternativa */}
        <View style={[styles.timerBackground, { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          borderColor: color + '30',
        }]}>
          <Animated.View style={[
            styles.timerProgress,
            {
              width: size - 4,
              height: size - 4,
              borderRadius: (size - 4) / 2,
              borderColor: color,
              borderWidth: 3,
              transform: [{ 
                rotate: rotateAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }]
            }
          ]} />
          
          <View style={styles.timerContent}>
            <Text style={[styles.timerHours, { color, fontSize: size * 0.2 }]}>
              {hours}
            </Text>
            <Text style={[styles.timerUnit, { color, fontSize: size * 0.1 }]}>
              h {minutes}m
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const MatchCard: React.FC<{ match: Match; tournamentType: string }> = ({ match, tournamentType }) => {
    const timeLeft = formatTimeLeft(match.endTime);
    const showResults = match.hasUserVoted || timeLeft === 'Terminado';
    const timeColor = getTimeLeftColor(match.endTime);
    const [voteAnimation] = useState(new Animated.Value(1));
    const [pulseAnimation] = useState(new Animated.Value(1));
    const [selectedReaction, setSelectedReaction] = useState<string>('fire');
    const [showReactionSelector, setShowReactionSelector] = useState<'1' | '2' | null>(null);

    // Animación de pulso para el timer urgente
    useEffect(() => {
      if (timeColor === '#FF4444') {
        const pulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, {
              toValue: 1.1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimation, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
        pulse.start();
        return () => pulse.stop();
      }
    }, [timeColor, pulseAnimation]);

    const handleVotePress = (choice: '1' | '2') => {
      if (match.hasUserVoted) return;

      if (showReactionSelector === choice) {
        // Confirmar voto con reacción seleccionada
        Animated.sequence([
          Animated.timing(voteAnimation, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(voteAnimation, {
            toValue: 1,
            tension: 100,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();

        handleVote(match.id, choice, selectedReaction);
        setShowReactionSelector(null);
      } else {
        // Mostrar selector de reacciones
        setShowReactionSelector(choice);
      }
    };

    const getTopReactions = (reactions: { [key: string]: number }) => {
      return Object.entries(reactions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([reactionId, count]) => {
          const reaction = VOTE_REACTIONS.find(r => r.id === reactionId);
          return { ...reaction, count };
        });
    };
    
    return (
      <Animated.View 
        style={[
          styles.matchCard, 
          { 
            backgroundColor: colors.card, 
            borderColor: timeColor,
            borderWidth: 2,
            transform: [{ scale: voteAnimation }]
          }
        ]}
      >
        {/* Header Gaming */}
        <View style={styles.matchHeader}>
          <View style={styles.matchTypeContainer}>
            <Text style={[styles.matchType, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
              {tournamentType.toUpperCase()}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: colors.accent }]}>
              <Ionicons name="flash" size={12} color="#000" />
            </View>
          </View>
          
          {/* Timer Gaming */}
          <View style={styles.timerSection}>
            <CircularTimer endTime={match.endTime} size={50} />
          </View>
          
          {match.isActive && (
            <View style={[styles.liveIndicator, { backgroundColor: '#FF4444' }]}>
              <View style={styles.livePulse} />
              <Text style={[styles.liveText, { fontSize: 10 * fontScale }]}>LIVE</Text>
            </View>
          )}
        </View>

        {/* Versus Battle Layout */}
        <View style={styles.battleground}>
          {/* Participante 1 - Gaming Style */}
          <TouchableOpacity
            style={[
              styles.participant,
              styles.participantLeft,
              match.hasUserVoted && match.userVote === '1' && styles.participantSelected,
              { backgroundColor: match.hasUserVoted && match.userVote === '1' ? colors.accent + '30' : 'transparent' }
            ]}
            onPress={() => handleVotePress('1')}
            disabled={match.hasUserVoted}
            activeOpacity={0.7}
          >
            <View style={[styles.avatarContainer, styles.avatarLeft]}>
              <Text style={styles.avatar}>{match.participant1.avatar}</Text>
              {match.hasUserVoted && match.userVote === '1' && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark" size={16} color="#000" />
                </View>
              )}
            </View>
            
            <Text style={[styles.participantName, { color: colors.text, fontSize: 14 * fontScale }]}>
              {match.participant1.name}
            </Text>
            
            {showResults && (
              <View style={styles.voteInfo}>
                <Text style={[styles.voteCount, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                  🔥 {match.votes1} votos
                </Text>
                {match.totalVotes > 0 && (
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <Animated.View 
                      style={[
                        styles.progressFill,
                        styles.progressLeft,
                        { 
                          backgroundColor: '#4CAF50',
                          width: `${(match.votes1 / match.totalVotes) * 100}%` 
                        }
                      ]} 
                    />
                  </View>
                )}
                {match.totalVotes > 0 && (
                  <Text style={[styles.percentage, { color: '#4CAF50', fontSize: 11 * fontScale }]}>
                    {Math.round((match.votes1 / match.totalVotes) * 100)}%
                  </Text>
                )}
                {/* Reacciones más populares */}
                <View style={{ flexDirection: 'row', marginTop: 4, gap: 4 }}>
                  {getTopReactions(match.reactions1).map((reaction, index) => (
                    <View key={index} style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                    }}>
                      <Text style={{ fontSize: 10 }}>{reaction?.emoji}</Text>
                      <Text style={{ 
                        fontSize: 9, 
                        color: colors.textSecondary,
                        marginLeft: 2,
                        fontWeight: '600' 
                      }}>
                        {reaction?.count}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* VS Gaming Central */}
          <View style={styles.vsContainer}>
            <View style={[styles.vsCircle, { borderColor: colors.accent }]}>
              <Text style={[styles.vsText, { color: colors.accent, fontSize: 18 * fontScale }]}>VS</Text>
            </View>
            <View style={[styles.vsLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Participante 2 - Gaming Style */}
          <TouchableOpacity
            style={[
              styles.participant,
              styles.participantRight,
              match.hasUserVoted && match.userVote === '2' && styles.participantSelected,
              { backgroundColor: match.hasUserVoted && match.userVote === '2' ? colors.accent + '30' : 'transparent' }
            ]}
            onPress={() => handleVotePress('2')}
            disabled={match.hasUserVoted}
            activeOpacity={0.7}
          >
            <View style={[styles.avatarContainer, styles.avatarRight]}>
              <Text style={styles.avatar}>{match.participant2.avatar}</Text>
              {match.hasUserVoted && match.userVote === '2' && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark" size={16} color="#000" />
                </View>
              )}
            </View>
            
            <Text style={[styles.participantName, { color: colors.text, fontSize: 14 * fontScale }]}>
              {match.participant2.name}
            </Text>
            
            {showResults && (
              <View style={styles.voteInfo}>
                <Text style={[styles.voteCount, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                  🔥 {match.votes2} votos
                </Text>
                {match.totalVotes > 0 && (
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <Animated.View 
                      style={[
                        styles.progressFill,
                        styles.progressRight,
                        { 
                          backgroundColor: '#FF5722',
                          width: `${(match.votes2 / match.totalVotes) * 100}%` 
                        }
                      ]} 
                    />
                  </View>
                )}
                {match.totalVotes > 0 && (
                  <Text style={[styles.percentage, { color: '#FF5722', fontSize: 11 * fontScale }]}>
                    {Math.round((match.votes2 / match.totalVotes) * 100)}%
                  </Text>
                )}
                {/* Reacciones más populares */}
                <View style={{ flexDirection: 'row', marginTop: 4, gap: 4 }}>
                  {getTopReactions(match.reactions2).map((reaction, index) => (
                    <View key={index} style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                    }}>
                      <Text style={{ fontSize: 10 }}>{reaction?.emoji}</Text>
                      <Text style={{ 
                        fontSize: 9, 
                        color: colors.textSecondary,
                        marginLeft: 2,
                        fontWeight: '600' 
                      }}>
                        {reaction?.count}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Gaming Footer */}
        {!showResults ? (
          <View style={styles.votingInstructions}>
            <Ionicons name="flash" size={16} color={colors.accent} />
            <Text style={[styles.instructionText, { color: colors.textSecondary, fontSize: 11 * fontScale }]}>
              ¡Toca tu favorito! • Solo una oportunidad 🎮
            </Text>
          </View>
        ) : (
          <View style={styles.resultFooter}>
            <Ionicons name="trophy" size={16} color="#FFD700" />
            <Text style={[styles.resultText, { color: colors.textSecondary, fontSize: 11 * fontScale }]}>
              Total: {match.totalVotes} votos 🏆
            </Text>
          </View>
        )}

        {/* Selector de Reacciones Gaming */}
        {showReactionSelector && !match.hasUserVoted && (
          <ReactionSelector
            selectedReaction={selectedReaction}
            onReactionSelect={setSelectedReaction}
            style={{ marginTop: 12 }}
          />
        )}
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}> 
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}> 
            <View style={styles.headerLeft}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={[styles.title, { color: colors.text, fontSize: 20 * fontScale }]}>Torneos</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}> 
            {(['activos', 'mis-torneos', 'crear'] as TournamentTab[]).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  { backgroundColor: selectedTab === tab ? colors.accent : 'transparent', borderColor: colors.border }
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  { color: selectedTab === tab ? '#000' : colors.text, fontSize: 13 * fontScale }
                ]}>
                  {tab === 'activos' ? 'Activos' : tab === 'mis-torneos' ? 'Mis Torneos' : 'Crear'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {selectedTab === 'activos' && (
              <View>
                {activeTournaments.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="trophy-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 16 * fontScale }]}>No hay torneos activos</Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>¡Crea o únete a un torneo para comenzar!</Text>
                  </View>
                ) : (
                  activeTournaments.map(tournament => (
                    <View key={tournament.id} style={styles.tournamentContainer}>
                      <Text style={[styles.tournamentName, { color: colors.text, fontSize: 16 * fontScale }]}>
                        {tournament.name} - Ronda {tournament.round}/{tournament.maxRounds}
                      </Text>
                      {tournament.matches.map(match => (
                        <MatchCard key={match.id} match={match} tournamentType={tournament.type} />
                      ))}
                    </View>
                  ))
                )}
              </View>
            )}
            {selectedTab === 'mis-torneos' && (
              <View style={styles.emptyState}>
                <Ionicons name="trophy" size={64} color="#FFD700" />
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: 16 * fontScale }]}>No tienes torneos propios</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>Crea tu propio torneo y compite</Text>
              </View>
            )}
            {selectedTab === 'crear' && (
              <View style={styles.createContainer}>
                <Text style={[styles.createTitle, { color: colors.text, fontSize: 16 * fontScale }]}>Crear nuevo torneo tipo VS</Text>
                <Text style={[styles.createSubtext, { color: colors.textSecondary, fontSize: 12 * fontScale }]}>
                  • Selecciona tipo: 1vs1, 2vs2 o equipos{'\n'}
                  • Configura participantes y enfrentamientos{'\n'}
                  • Establece tiempo de votación{'\n'}
                  • ¡Que comience la competencia!
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  tabText: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
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
  createContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  createTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  createSubtext: {
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  tournamentContainer: {
    marginBottom: 24,
  },
  tournamentName: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchType: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  typeBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerSection: {
    alignItems: 'center',
  },
  circularTimer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBackground: {
    borderWidth: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerProgress: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  timerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerHours: {
    fontWeight: 'bold',
    lineHeight: 14,
  },
  timerUnit: {
    fontWeight: '600',
    lineHeight: 10,
    opacity: 0.8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  liveText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  battleground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  participant: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  participantLeft: {
    marginRight: 8,
  },
  participantRight: {
    marginLeft: 8,
  },
  participantSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarLeft: {
    alignItems: 'flex-end',
  },
  avatarRight: {
    alignItems: 'flex-start',
  },
  avatar: {
    fontSize: 40,
    marginBottom: 8,
  },
  selectedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantName: {
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  voteInfo: {
    alignItems: 'center',
    width: '100%',
  },
  voteCount: {
    fontWeight: '500',
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLeft: {
    alignSelf: 'flex-start',
  },
  progressRight: {
    alignSelf: 'flex-end',
  },
  percentage: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  vsCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    zIndex: 2,
  },
  vsText: {
    fontWeight: 'bold',
  },
  vsLine: {
    position: 'absolute',
    top: 25,
    left: 0,
    right: 0,
    height: 2,
    zIndex: 1,
  },
  votingInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  instructionText: {
    fontStyle: 'italic',
    fontWeight: '500',
  },
  resultFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  resultText: {
    fontWeight: '500',
  },
  
  // Estilos para Selector de Reacciones Gaming
  reactionSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reactionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 2,
    padding: 8,
    minWidth: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  reactionEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  reactionValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});