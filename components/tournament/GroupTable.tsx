import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlayerCard } from './PlayerCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TeamData {
  id: string;
  name: string;
  avatar: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  position: number;
  popularity: {
    fans: number;
    votes: number;
    admirers: number;
  };
}

interface GroupTableProps {
  groupName: string;
  teams: TeamData[];
  season: string;
  league: string;
  onTeamPress?: (team: TeamData) => void;
}

export const GroupTable: React.FC<GroupTableProps> = ({
  groupName,
  teams,
  season = "2024",
  league = "LIGA V3",
  onTeamPress,
}) => {
  const [currentTopIndex, setCurrentTopIndex] = useState(0);
  
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const aDiff = a.goalsFor - a.goalsAgainst;
    const bDiff = b.goalsFor - b.goalsAgainst;
    if (bDiff !== aDiff) return bDiff - aDiff;
    return b.goalsFor - a.goalsFor;
  });

  // Obtener los dos primeros equipos para la clasificación
  const topTwoTeams = sortedTeams.slice(0, 2);

  const getPositionStyle = (position: number) => {
    if (position <= 2) return styles.qualifiedPosition; // Clasificados
    if (position <= 4) return styles.playoffPosition; // Playoff
    return styles.eliminatedPosition; // Eliminados
  };

  const getPositionColor = (position: number) => {
    if (position <= 2) return '#00FF88'; // Verde para clasificados
    if (position <= 4) return '#FFD700'; // Dorado para playoff
    return '#FF4444'; // Rojo para eliminados
  };

  const renderTableHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, styles.positionColumn]}>#</Text>
      <Text style={[styles.headerCell, styles.nameColumn]}>EQUIPO</Text>
      <Text style={[styles.headerCell, styles.statColumn]}>EJ</Text>
      <Text style={[styles.headerCell, styles.statColumn]}>G</Text>
      <Text style={[styles.headerCell, styles.statColumn]}>E</Text>
      <Text style={[styles.headerCell, styles.statColumn]}>P</Text>
      <Text style={[styles.headerCell, styles.pointsColumn]}>PTS</Text>
    </View>
  );

  const renderTeamRow = (team: TeamData, index: number) => {
    const position = index + 1;
    
    return (
      <TouchableOpacity
        key={team.id}
        style={[styles.teamRow, getPositionStyle(position)]}
        onPress={() => onTeamPress?.(team)}
      >
        {/* Posición */}
        <View style={[styles.positionCell, styles.positionColumn]}>
          <View style={[styles.positionBadge, { backgroundColor: getPositionColor(position) }]}>
            <Text style={styles.positionText}>{position}</Text>
          </View>
        </View>

        {/* Equipo */}
        <View style={[styles.teamCell, styles.nameColumn]}>
          <View style={styles.teamInfo}>
            <View style={styles.teamAvatarContainer}>
              {/* Espacio para foto del usuario */}
              <View style={styles.userPhotoPlaceholder} />
            </View>
            <Text style={styles.teamName}>{team.name}</Text>
          </View>
        </View>

        {/* Estadísticas */}
        <Text style={[styles.statCell, styles.statColumn]}>{team.matches}</Text>
        <Text style={[styles.statCell, styles.statColumn]}>{team.wins}</Text>
        <Text style={[styles.statCell, styles.statColumn]}>{team.draws}</Text>
        <Text style={[styles.statCell, styles.statColumn]}>{team.losses}</Text>
        
        {/* Puntos */}
        <View style={[styles.pointsCell, styles.pointsColumn]}>
          <Text style={[styles.pointsText, { color: getPositionColor(position) }]}>
            {team.points}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tableContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoSection}>
            <View style={styles.logo}>
              <Ionicons name="diamond" size={24} color="#00FFFF" />
            </View>
            <View>
              <Text style={styles.leagueName}>DOZUR LEAGUE</Text>
              <Text style={styles.phaseText}>FASE DE GRUPOS</Text>
            </View>
          </View>
          <View style={styles.seasonBadge}>
            <Text style={styles.seasonText}>{season}</Text>
            <Text style={styles.ligaText}>{league}</Text>
          </View>
        </View>

        <View style={styles.headerBottom}>
          <View style={styles.groupBadge}>
            <Text style={styles.groupText}>{groupName}</Text>
          </View>
          <Text style={styles.tableTitle}>CLASIFICACIÓN</Text>
        </View>
      </View>

      {/* Tabla */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {renderTableHeader()}
          <View style={styles.tableBody}>
            {sortedTeams.map((team, index) => renderTeamRow(team, index))}
          </View>
        </View>
      </ScrollView>

      {/* Clasificación - Tarjetas deslizables */}
      <View style={styles.classificationSection}>
        <Text style={styles.classificationTitle}>CLASIFICACIÓN</Text>
        <View style={styles.cardsContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH * 0.7));
              setCurrentTopIndex(index);
            }}
          >
            {topTwoTeams.map((team, index) => (
              <View key={team.id} style={styles.cardWrapper}>
                <PlayerCard
                  player={{
                    id: team.id,
                    name: team.name,
                    avatar: team.avatar,
                    position: index === 0 ? '1° LUGAR' : '2° LUGAR',
                    team: groupName,
                    rating: Math.round((team.points / (team.matches * 3)) * 100),
                    popularity: team.popularity,
                  }}
                  rarity={index === 0 ? 'legendary' : 'epic'}
                />
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsBadgeText}>{team.points} PTS</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Indicadores de página */}
          <View style={styles.pageIndicators}>
            {topTwoTeams.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.pageIndicator,
                  index === currentTopIndex && styles.activePageIndicator
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Players Section */}
      <View style={styles.playersSection}>
        <Text style={styles.playersTitle}>JUGADORES DESTACADOS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.playersGrid}>
            {sortedTeams.slice(0, 4).map((team) => (
              <View key={team.id} style={styles.playerCard}>
                <View style={styles.playerFrame}>
                  {/* Espacio para foto del usuario */}
                  <View style={styles.userPhotoPlaceholder} />
                </View>
                <Text style={styles.playerName}>{team.name}</Text>
                <View style={styles.playerBadge}>
                  <Text style={styles.playerBadgeText}>PTS</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Ionicons name="diamond" size={16} color="#00FFFF" />
          <Text style={styles.footerBrand}>VERSUS</Text>
        </View>
        <View style={styles.footerRight}>
          <Text style={styles.footerText}>DOZUR</Text>
          <Text style={styles.footerSubtext}>MEGUSTA</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
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
    marginBottom: 15,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  leagueName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  phaseText: {
    color: '#7b2cbf',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  seasonBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  seasonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ligaText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '600',
  },
  headerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  groupBadge: {
    backgroundColor: 'rgba(123, 44, 191, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#7b2cbf',
  },
  groupText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tableTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
  table: {
    backgroundColor: 'rgba(22, 33, 62, 0.5)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(123, 44, 191, 0.3)',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(123, 44, 191, 0.4)',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  positionColumn: {
    width: 40,
  },
  nameColumn: {
    width: 120,
    textAlign: 'left',
  },
  statColumn: {
    width: 35,
  },
  pointsColumn: {
    width: 45,
  },
  tableBody: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  qualifiedPosition: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#00FF88',
  },
  playoffPosition: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  eliminatedPosition: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#FF4444',
  },
  positionCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamCell: {
    justifyContent: 'center',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamAvatar: {
    fontSize: 16,
    marginRight: 8,
  },
  teamName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  statCell: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  positiveDiff: {
    color: '#00FF88',
  },
  negativeDiff: {
    color: '#FF4444',
  },
  pointsCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(22, 33, 62, 0.3)',
    borderRadius: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
  },
  playersSection: {
    marginTop: 20,
  },
  playersTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1,
  },
  playersGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  playerCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(22, 33, 62, 0.6)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(123, 44, 191, 0.3)',
    width: 80,
  },
  playerFrame: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    borderWidth: 2,
    borderColor: '#7b2cbf',
  },
  playerAvatar: {
    fontSize: 20,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  playerBadge: {
    backgroundColor: '#7b2cbf',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  playerBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
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
  footerBrand: {
    color: '#00FFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footerSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  // Nuevos estilos
  teamAvatarContainer: {
    marginRight: 8,
  },
  userPhotoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  // Estilos para la sección de clasificación
  classificationSection: {
    marginVertical: 20,
  },
  classificationTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 1,
  },
  cardsContainer: {
    alignItems: 'center',
  },
  cardWrapper: {
    width: SCREEN_WIDTH * 0.7,
    alignItems: 'center',
    paddingHorizontal: 10,
    position: 'relative',
  },
  pointsBadge: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(123, 44, 191, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  pointsBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 8,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activePageIndicator: {
    backgroundColor: '#00FFFF',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});