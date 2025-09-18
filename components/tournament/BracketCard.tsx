import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Player {
  id: string;
  name: string;
  avatar: string;
  score?: number;
  isWinner?: boolean;
}

interface Match {
  id: string;
  player1: Player;
  player2: Player;
  round: string;
  status: 'upcoming' | 'live' | 'completed';
  winner?: string;
}

interface BracketCardProps {
  matches: Match[];
  title: string;
  subtitle: string;
  onMatchPress?: (match: Match) => void;
}

export const BracketCard: React.FC<BracketCardProps> = ({
  matches,
  title,
  subtitle,
  onMatchPress,
}) => {
  const renderMatch = (match: Match, index: number) => {
    const isCompleted = match.status === 'completed';
    const isLive = match.status === 'live';
    
    return (
      <TouchableOpacity
        key={match.id}
        style={[
          styles.matchContainer,
          isLive && styles.liveMatch,
          isCompleted && styles.completedMatch,
        ]}
        onPress={() => onMatchPress?.(match)}
      >
        {/* Indicador de estado */}
        <View style={styles.matchStatus}>
          {isLive && (
            <>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </>
          )}
          {isCompleted && (
            <Ionicons name="checkmark-circle" size={16} color="#00FF88" />
          )}
        </View>

        {/* Player 1 */}
        <View style={[
          styles.playerSlot,
          match.winner === match.player1.id && styles.winnerSlot
        ]}>
          <View style={styles.playerInfo}>
            <Text style={styles.playerAvatar}>{match.player1.avatar}</Text>
            <Text style={[
              styles.playerName,
              match.winner === match.player1.id && styles.winnerName
            ]}>
              {match.player1.name}
            </Text>
          </View>
          {isCompleted && (
            <Text style={[
              styles.playerScore,
              match.winner === match.player1.id && styles.winnerScore
            ]}>
              {match.player1.score || 0}
            </Text>
          )}
        </View>

        {/* VS Divider */}
        <View style={styles.vsDivider}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Player 2 */}
        <View style={[
          styles.playerSlot,
          match.winner === match.player2.id && styles.winnerSlot
        ]}>
          <View style={styles.playerInfo}>
            <Text style={styles.playerAvatar}>{match.player2.avatar}</Text>
            <Text style={[
              styles.playerName,
              match.winner === match.player2.id && styles.winnerName
            ]}>
              {match.player2.name}
            </Text>
          </View>
          {isCompleted && (
            <Text style={[
              styles.playerScore,
              match.winner === match.player2.id && styles.winnerScore
            ]}>
              {match.player2.score || 0}
            </Text>
          )}
        </View>

        {/* Round Info */}
        <View style={styles.roundInfo}>
          <Text style={styles.roundText}>{match.round}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bracketCard}>
      {/* Header Gaming */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="diamond" size={20} color="#00FFFF" />
            </View>
            <Text style={styles.leagueName}>DOZUR LEAGUE</Text>
          </View>
          <Text style={styles.phaseTitle}>{subtitle}</Text>
        </View>
        
        <View style={styles.headerBottom}>
          <Text style={styles.tournamentTitle}>{title}</Text>
          <View style={styles.seasonBadge}>
            <Text style={styles.seasonText}>2024</Text>
            <Text style={styles.ligaText}>LIGA V3</Text>
          </View>
        </View>
      </View>

      {/* Bracket Visual */}
      <View style={styles.bracketContainer}>
        <View style={styles.bracketLines}>
          {/* Líneas del bracket */}
          <View style={styles.bracketLine} />
          <View style={[styles.bracketLine, styles.verticalLine]} />
          <View style={[styles.bracketLine, styles.finalLine]} />
        </View>

        {/* Matches Grid */}
        <View style={styles.matchesGrid}>
          {matches.map((match, index) => renderMatch(match, index))}
        </View>

        {/* Trophy Center */}
        <View style={styles.trophyContainer}>
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={30} color="#FFD700" />
          </View>
          <Text style={styles.trophyText}>FINAL</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Ionicons name="diamond" size={16} color="#00FFFF" />
          <Text style={styles.footerText}>VERSUS</Text>
        </View>
        <View style={styles.footerRight}>
          <Text style={styles.brandText}>DOZUR</Text>
          <Text style={styles.brandSubtext}>MEGUSTA</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bracketCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 20,
    margin: 10,
    borderWidth: 2,
    borderColor: '#16213e',
    elevation: 10,
    shadowColor: '#7b2cbf',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  leagueName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  phaseTitle: {
    color: '#7b2cbf',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(123, 44, 191, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    letterSpacing: 1,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tournamentTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    flex: 1,
  },
  seasonBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  seasonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ligaText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '600',
  },
  bracketContainer: {
    position: 'relative',
    minHeight: 300,
    marginVertical: 20,
  },
  bracketLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  bracketLine: {
    position: 'absolute',
    backgroundColor: 'rgba(123, 44, 191, 0.5)',
    height: 2,
  },
  verticalLine: {
    width: 2,
    height: '50%',
    left: '50%',
    top: '25%',
  },
  finalLine: {
    width: '30%',
    top: '50%',
    left: '35%',
  },
  matchesGrid: {
    zIndex: 2,
    gap: 15,
  },
  matchContainer: {
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(123, 44, 191, 0.3)',
    marginVertical: 5,
  },
  liveMatch: {
    borderColor: '#FF4444',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  completedMatch: {
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  matchStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 5,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  liveText: {
    color: '#FF4444',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  playerSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginVertical: 2,
  },
  winnerSlot: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderWidth: 1,
    borderColor: '#00FF88',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    fontSize: 20,
    marginRight: 10,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  winnerName: {
    color: '#00FF88',
    fontWeight: 'bold',
  },
  playerScore: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  winnerScore: {
    color: '#00FF88',
  },
  vsDivider: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  vsText: {
    color: '#7b2cbf',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  roundInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  roundText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  trophyContainer: {
    position: 'absolute',
    right: 20,
    top: '40%',
    alignItems: 'center',
    zIndex: 3,
  },
  trophyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  trophyText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 5,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(123, 44, 191, 0.3)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    color: '#00FFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  brandSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    letterSpacing: 0.5,
  },
});