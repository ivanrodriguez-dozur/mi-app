import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BracketCard } from '../components/tournament/BracketCard';
import { PlayerCard } from '../components/tournament/PlayerCard';
import { VersusCard } from '../components/tournament/VersusCard';

// Mock data para las tarjetas
const mockMatches = [
  {
    id: '1',
    player1: { id: '1', name: 'CAMILO.G', avatar: '⚽', score: 2, isWinner: true },
    player2: { id: '2', name: 'ALDAIR', avatar: '🏃', score: 1 },
    round: 'CUARTOS DE FINAL',
    status: 'completed' as const,
    winner: '1',
  },
  {
    id: '2',
    player1: { id: '3', name: 'DOUGLAS', avatar: '🔥', score: undefined },
    player2: { id: '4', name: 'CHOLAS', avatar: '⚡', score: undefined },
    round: 'SEMIFINAL',
    status: 'live' as const,
  },
  {
    id: '3',
    player1: { id: '5', name: 'MARA', avatar: '💪', score: undefined },
    player2: { id: '6', name: 'JUANCHO', avatar: '🎯', score: undefined },
    round: 'FINAL',
    status: 'upcoming' as const,
  },
];

const mockVersusPlayers = {
  player1: {
    id: '1',
    name: 'CAMILO.G',
    avatar: '⚽',
    team: 'COLOMBIA',
    rating: 92,
    position: 'DEL',
    popularity: {
      fans: 245000,
      votes: 18500,
      admirers: 92000,
    },
  },
  player2: {
    id: '2',
    name: 'ALDAIR',
    avatar: '🏃',
    team: 'ARGENTINA',
    rating: 89,
    position: 'MED',
    popularity: {
      fans: 189000,
      votes: 15200,
      admirers: 76500,
    },
  },
};

const mockPlayer = {
  id: '1',
  name: 'DOUGLAS',
  avatar: '🔥',
  position: 'DEL',
  team: 'ATLETICO FC',
  rating: 94,
  popularity: {
    fans: 156000,      // 156K fans
    votes: 23400,      // 23.4K votos
    admirers: 78900,   // 78.9K admiradores
  },
};

export default function TournamentCardsDemo() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DOZUR LEAGUE CARDS</Text>
        <View style={styles.headerRight}>
          <Ionicons name="diamond" size={24} color="#00FFFF" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Tarjeta Bracket/Fixture */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 BRACKET FIXTURE</Text>
          <Text style={styles.sectionDescription}>
            Sistema de eliminatorias con bracket visual
          </Text>
          <BracketCard
            matches={mockMatches}
            title="DOZUR LEAGUE"
            subtitle="FASE ELIMINATORIA"
            onMatchPress={(match) => console.log('Match pressed:', match)}
          />
        </View>

        {/* Tarjeta Versus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚔️ VERSUS CARD</Text>
          <Text style={styles.sectionDescription}>
            Enfrentamiento 1v1 con votación en tiempo real
          </Text>
          <VersusCard
            player1={mockVersusPlayers.player1}
            player2={mockVersusPlayers.player2}
            matchDay="MATCH DAY 1"
            showVoting={true}
            votes={{ player1: 156, player2: 234 }}
            onVote={(playerId) => console.log('Voted for:', playerId)}
          />
        </View>

        {/* Tarjeta Individual */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 PLAYER CARD</Text>
          <Text style={styles.sectionDescription}>
            Tarjeta coleccionable con stats y rareza
          </Text>
          <View style={styles.playerCardContainer}>
            <PlayerCard
              player={mockPlayer}
              rarity="legendary"
              onPress={() => console.log('Player card pressed')}
            />
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#00FFFF" />
            <Text style={styles.infoTitle}>Características</Text>
            <Text style={styles.infoText}>
              • Diseño inspirado en DOZUR LEAGUE{'\n'}
              • Animaciones fluidas y efectos gaming{'\n'}
              • Sistema de votación por reacciones{'\n'}
              • Clasificaciones en tiempo real{'\n'}
              • Tarjetas coleccionables con rareza
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    justifyContent: 'space-between',
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
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 1,
  },
  sectionDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  playerCardContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  infoSection: {
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    alignItems: 'center',
  },
  infoTitle: {
    color: '#00FFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    letterSpacing: 1,
  },
  infoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 50,
  },
});