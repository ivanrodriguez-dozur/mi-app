import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { VersusCard } from '../components/tournament/VersusCard';
import { PlayerModal } from '../components/tournament/PlayerModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data para las batallas versus
const mockVersusData = [
  {
    id: '1',
    player1: {
      id: '1',
      name: 'MESSI',
      avatar: '⚽',
      team: 'ARGENTINA',
      rating: 95,
      position: 'DEL',
      popularity: { fans: 127000, votes: 12400, admirers: 89200 },
    },
    player2: {
      id: '2',
      name: 'CRISTIANO',
      avatar: '🏆',
      team: 'PORTUGAL',
      rating: 94,
      position: 'DEL',
      popularity: { fans: 119000, votes: 11800, admirers: 85600 },
    },
    matchDay: 'FINAL',
    votes: { player1: 234, player2: 189 },
  },
  {
    id: '2',
    player1: {
      id: '3',
      name: 'NEYMAR',
      avatar: '🎭',
      team: 'BRASIL',
      rating: 89,
      position: 'EXT',
      popularity: { fans: 89000, votes: 8900, admirers: 54300 },
    },
    player2: {
      id: '4',
      name: 'MBAPPÉ',
      avatar: '⚡',
      team: 'FRANCIA',
      rating: 91,
      position: 'DEL',
      popularity: { fans: 95000, votes: 9200, admirers: 62100 },
    },
    matchDay: 'SEMIFINAL',
    votes: { player1: 156, player2: 203 },
  },
  {
    id: '3',
    player1: {
      id: '5',
      name: 'HAALAND',
      avatar: '🦁',
      team: 'NORUEGA',
      rating: 88,
      position: 'DEL',
      popularity: { fans: 76000, votes: 6800, admirers: 41500 },
    },
    player2: {
      id: '6',
      name: 'JUANCHO',
      avatar: '🎯',
      team: 'PERÚ',
      rating: 82,
      position: 'DEL',
      popularity: { fans: 98000, votes: 7400, admirers: 43200 },
    },
    matchDay: 'OCTAVOS',
    votes: { player1: 87, player2: 134 },
  },
];

// Opciones del menú de Torneos
const tournamentMenuOptions = [
  { id: 'classification-table', title: 'TABLA DE CLASIFICACIÓN', icon: 'list', color: '#FFD700' },
  { id: 'player-cards', title: 'PLAYER CARDS', icon: 'diamond', color: '#00FFFF' },
  { id: 'groups', title: 'GRUPOS', icon: 'grid', color: '#7b2cbf' },
  { id: 'qualified', title: 'CLASIFICADOS', icon: 'checkmark-circle', color: '#00FF88' },
  { id: 'featured', title: 'JUGADORES DESTACADOS', icon: 'star', color: '#FF6B6B' },
];

export default function TournamentsScreen() {
  const [activeSection, setActiveSection] = useState<'versus' | 'tournaments'>('versus');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  
  // Animaciones para efectos galácticos
  const starOpacity1 = useRef(new Animated.Value(0)).current;
  const starOpacity2 = useRef(new Animated.Value(0)).current;
  const starOpacity3 = useRef(new Animated.Value(0)).current;
  const asteroidMove1 = useRef(new Animated.Value(-100)).current;
  const asteroidMove2 = useRef(new Animated.Value(-150)).current;
  const asteroidMove3 = useRef(new Animated.Value(-200)).current;
  const twinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent', true);
    
    // Animación de estrellas parpadeantes
    const starAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(starOpacity1, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(starOpacity1, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const starAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(starOpacity2, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(starOpacity2, {
          toValue: 0.2,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    const starAnimation3 = Animated.loop(
      Animated.sequence([
        Animated.timing(starOpacity3, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(starOpacity3, {
          toValue: 0.4,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de asteroides flotantes
    const asteroidAnimation1 = Animated.loop(
      Animated.timing(asteroidMove1, {
        toValue: SCREEN_WIDTH + 100,
        duration: 15000,
        useNativeDriver: true,
      })
    );

    const asteroidAnimation2 = Animated.loop(
      Animated.timing(asteroidMove2, {
        toValue: SCREEN_WIDTH + 150,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    const asteroidAnimation3 = Animated.loop(
      Animated.timing(asteroidMove3, {
        toValue: SCREEN_WIDTH + 200,
        duration: 25000,
        useNativeDriver: true,
      })
    );

    // Animación de destello general
    const twinkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(twinkle, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Iniciar todas las animaciones
    starAnimation1.start();
    starAnimation2.start();
    starAnimation3.start();
    asteroidAnimation1.start();
    asteroidAnimation2.start();
    asteroidAnimation3.start();
    twinkleAnimation.start();

    return () => {
      starAnimation1.stop();
      starAnimation2.stop();
      starAnimation3.stop();
      asteroidAnimation1.stop();
      asteroidAnimation2.stop();
      asteroidAnimation3.stop();
      twinkleAnimation.stop();
    };
  }, [starOpacity1, starOpacity2, starOpacity3, asteroidMove1, asteroidMove2, asteroidMove3, twinkle]);

  const handleVote = (playerId: string) => {
    console.log('Vote for player:', playerId);
    // Aquí iría la lógica de votación
  };

  const handlePlayerPress = (player: any) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  const handleClosePlayerModal = () => {
    setShowPlayerModal(false);
    setSelectedPlayer(null);
  };

  const handleTournamentOptionPress = (option: any) => {
    switch (option.id) {
      case 'classification-table':
        // Navegar a tabla de clasificación
        console.log('Navegando a classification-table');
        router.push('/classification-table');
        break;
      case 'player-cards':
        router.push('/tournament-cards-demo');
        break;
      case 'groups':
        // Navegar a grupos
        break;
      case 'qualified':
        // Navegar a clasificados
        break;
      case 'featured':
        // Navegar a jugadores destacados
        break;
    }
  };

  const renderVersusCard = ({ item }: { item: any }) => (
    <View style={styles.versusCardWrapper}>
      <VersusCard
        player1={item.player1}
        player2={item.player2}
        matchDay={item.matchDay}
        onVote={handleVote}
        onPlayerPress={handlePlayerPress}
        votes={item.votes}
        showVoting={true}
      />
    </View>
  );

  const renderTournamentOption = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.tournamentOption}
      onPress={() => handleTournamentOptionPress(item)}
    >
      <View style={[styles.optionIconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={32} color={item.color} />
      </View>
      <Text style={styles.optionTitle}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Fondo galáctico con estrellas y asteroides */}
      <View style={styles.galaxyBackground}>
        {/* Estrellas parpadeantes */}
        <Animated.View style={[styles.star, styles.star1, { opacity: starOpacity1 }]} />
        <Animated.View style={[styles.star, styles.star2, { opacity: starOpacity2 }]} />
        <Animated.View style={[styles.star, styles.star3, { opacity: starOpacity3 }]} />
        <Animated.View style={[styles.star, styles.star4, { opacity: starOpacity1 }]} />
        <Animated.View style={[styles.star, styles.star5, { opacity: starOpacity2 }]} />
        <Animated.View style={[styles.star, styles.star6, { opacity: starOpacity3 }]} />
        <Animated.View style={[styles.star, styles.star7, { opacity: starOpacity1 }]} />
        <Animated.View style={[styles.star, styles.star8, { opacity: starOpacity2 }]} />
        <Animated.View style={[styles.star, styles.star9, { opacity: starOpacity3 }]} />
        <Animated.View style={[styles.star, styles.star10, { opacity: starOpacity1 }]} />
        
        {/* Asteroides flotantes */}
        <Animated.View 
          style={[
            styles.asteroid, 
            styles.asteroid1, 
            { transform: [{ translateX: asteroidMove1 }] }
          ]} 
        />
        <Animated.View 
          style={[
            styles.asteroid, 
            styles.asteroid2, 
            { transform: [{ translateX: asteroidMove2 }] }
          ]} 
        />
        <Animated.View 
          style={[
            styles.asteroid, 
            styles.asteroid3, 
            { transform: [{ translateX: asteroidMove3 }] }
          ]} 
        />
        
        {/* Destello galáctico */}
        <Animated.View 
          style={[
            styles.galaxyTwinkle,
            { opacity: twinkle }
          ]} 
        />
      </View>

      {/* Header Simplificado */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      {/* Selector de Secciones */}
      <View style={styles.sectionSelector}>
        <TouchableOpacity
          style={[
            styles.sectionButton,
            activeSection === 'versus' && styles.activeSectionButton
          ]}
          onPress={() => setActiveSection('versus')}
        >
          <Text style={[
            styles.sectionButtonText,
            activeSection === 'versus' && styles.activeSectionButtonText
          ]}>
            VERSUS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sectionButton,
            activeSection === 'tournaments' && styles.activeSectionButton
          ]}
          onPress={() => setActiveSection('tournaments')}
        >
          <Text style={[
            styles.sectionButtonText,
            activeSection === 'tournaments' && styles.activeSectionButtonText
          ]}>
            TORNEOS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido de las secciones */}
      <View style={styles.contentContainer}>
        {activeSection === 'versus' ? (
          <View style={styles.versusSection}>
            <FlatList
              data={mockVersusData}
              renderItem={renderVersusCard}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.versusScrollContent}
              snapToInterval={SCREEN_WIDTH}
              decelerationRate="fast"
            />
          </View>
        ) : (
          <View style={styles.tournamentsSection}>
            <Text style={styles.sectionTitle}>OPCIONES DE TORNEO</Text>
            <FlatList
              data={tournamentMenuOptions}
              renderItem={renderTournamentOption}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.tournamentScrollContent}
            />
          </View>
        )}
      </View>

      {/* Modal del jugador */}
      <PlayerModal
        visible={showPlayerModal}
        player={selectedPlayer}
        onClose={handleClosePlayerModal}
        onVote={handleVote}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50, // Reducido para ganar espacio
    paddingHorizontal: 20,
    paddingBottom: 10, // Reducido para ganar espacio
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
  headerRight: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  sectionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeSectionButton: {
    backgroundColor: '#00FFFF',
  },
  sectionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeSectionButtonText: {
    color: '#000000',
  },
  contentContainer: {
    flex: 1,
  },
  versusSection: {
    flex: 1,
  },
  tournamentsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  versusCardWrapper: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
  },
  versusScrollContent: {
    alignItems: 'center',
  },
  tournamentScrollContent: {
    paddingBottom: 20,
  },
  tournamentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  // Galactic Background Styles
  galaxyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    width: 2,
    height: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  star1: {
    top: '10%',
    left: '15%',
  },
  star2: {
    top: '25%',
    right: '20%',
  },
  star3: {
    top: '40%',
    left: '8%',
  },
  star4: {
    top: '60%',
    right: '15%',
  },
  star5: {
    top: '75%',
    left: '25%',
  },
  star6: {
    top: '20%',
    left: '60%',
  },
  star7: {
    top: '80%',
    right: '40%',
  },
  star8: {
    top: '35%',
    right: '35%',
  },
  star9: {
    top: '55%',
    left: '70%',
  },
  star10: {
    top: '15%',
    right: '50%',
  },
  asteroid: {
    position: 'absolute',
    backgroundColor: '#666666',
    borderRadius: 3,
    shadowColor: '#333333',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
  },
  asteroid1: {
    width: 4,
    height: 4,
    top: '30%',
    left: '5%',
  },
  asteroid2: {
    width: 6,
    height: 6,
    top: '70%',
    right: '10%',
  },
  asteroid3: {
    width: 3,
    height: 3,
    top: '50%',
    left: '80%',
  },
  galaxyTwinkle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
});