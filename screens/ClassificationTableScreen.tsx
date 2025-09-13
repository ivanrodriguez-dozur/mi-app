import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { GroupTable } from '../components/tournament/GroupTable';

// Mock data para la tabla de clasificación DOZUR LEAGUE
const mockTeamsData = [
  {
    id: '1',
    name: 'MARA',
    avatar: '💪',
    matches: 6,
    wins: 4,
    draws: 1,
    losses: 1,
    goalsFor: 12,
    goalsAgainst: 6,
    points: 13,
    position: 1,
    popularity: {
      fans: 145000,
      votes: 28500,
      admirers: 89000,
    },
  },
  {
    id: '2',
    name: 'DOUGLAS',
    avatar: '🔥',
    matches: 6,
    wins: 3,
    draws: 2,
    losses: 1,
    goalsFor: 10,
    goalsAgainst: 7,
    points: 11,
    position: 2,
    popularity: {
      fans: 123000,
      votes: 22000,
      admirers: 67000,
    },
  },
  {
    id: '3',
    name: 'CHOLAS',
    avatar: '⚡',
    matches: 6,
    wins: 2,
    draws: 1,
    losses: 3,
    goalsFor: 8,
    goalsAgainst: 9,
    points: 7,
    position: 3,
    popularity: {
      fans: 87000,
      votes: 15000,
      admirers: 45000,
    },
  },
  {
    id: '4',
    name: 'JUANCHO',
    avatar: '🎯',
    matches: 6,
    wins: 1,
    draws: 2,
    losses: 3,
    goalsFor: 5,
    goalsAgainst: 13,
    points: 5,
    position: 4,
    popularity: {
      fans: 62000,
      votes: 9800,
      admirers: 28000,
    },
  },
];

export default function ClassificationTableScreen() {
  console.log('ClassificationTableScreen loaded!'); // Debug log
  
  React.useEffect(() => {
    try {
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor('#0A0A1B', true);
    } catch (error) {
      console.log('StatusBar error:', error);
    }
  }, []);

  const handleTeamPress = (team: any) => {
    console.log('Team pressed:', team.name);
    // Aquí podrías navegar a una pantalla de detalles del equipo
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0A0A1B" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TABLA DE CLASIFICACIÓN</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabla de clasificación */}
      <View style={styles.content}>
        <GroupTable
          groupName="DOZUR LEAGUE"
          teams={mockTeamsData}
          season="2024"
          league="DOZUR LEAGUE"
          onTeamPress={handleTeamPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#0A0A1B',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
});