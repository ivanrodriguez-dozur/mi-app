import React, { useEffect, useRef } from 'react';
import {
    Animated,
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
  team: string;
  rating: number;
  position: string;
  popularity: {
    fans: number;
    votes: number;
    admirers: number;
  };
}

interface VersusCardProps {
  player1: Player;
  player2: Player;
  matchDay?: string;
  onVote?: (playerId: string) => void;
  onPlayerPress?: (player: Player) => void;
  showVoting?: boolean;
  votes?: { player1: number; player2: number };
}

export const VersusCard: React.FC<VersusCardProps> = ({
  player1,
  player2,
  matchDay = "MATCH DAY",
  onVote,
  onPlayerPress,
  showVoting = true,
  votes = { player1: 0, player2: 0 },
}) => {
  // Animaciones
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de pulso para las tarjetas
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de glow
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de destellos
    const sparkle = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de ondas para el VS
    const wave = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    glow.start();
    sparkle.start();
    wave.start();

    return () => {
      pulse.stop();
      glow.stop();
      sparkle.stop();
      wave.stop();
    };
  }, [pulseAnim, glowAnim, sparkleAnim, waveAnim]);

  // Interpolaciones para animaciones
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 0.3, 0],
  });

  return (
    <View style={styles.container}>
      {/* Tarjeta del Jugador 1 (Arriba) */}
      <TouchableOpacity
        onPress={() => onPlayerPress?.(player1)}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.playerCard,
            styles.topCard,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {/* Efectos de brillo alrededor */}
          <Animated.View
            style={[
              styles.cardGlow,
              styles.topCardGlow,
              { opacity: glowOpacity },
            ]}
          />
          
          {/* Destellos en las esquinas */}
          <Animated.View
            style={[
              styles.sparkle,
              styles.topLeftSparkle,
              { opacity: sparkleOpacity },
            ]}
          />
          <Animated.View
            style={[
              styles.sparkle,
              styles.topRightSparkle,
              { opacity: sparkleOpacity },
            ]}
          />

          {/* Área para la foto (vacía para Supabase) */}
          <View style={styles.photoArea} />
        </Animated.View>
      </TouchableOpacity>

      {/* VS Épico con efectos de explosión */}
      <View style={styles.vsContainer}>
        {/* Efectos de explosión en el fondo */}
        <Animated.View
          style={[
            styles.explosionEffect,
            { 
              opacity: sparkleOpacity,
              transform: [{ scale: waveScale }],
            },
          ]}
        />
        
        {/* Rayos dorados */}
        <Animated.View
          style={[
            styles.lightRay,
            styles.ray1,
            { opacity: glowOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.lightRay,
            styles.ray2,
            { opacity: waveOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.lightRay,
            styles.ray3,
            { opacity: sparkleOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.lightRay,
            styles.ray4,
            { opacity: glowOpacity },
          ]}
        />
        
        {/* Partículas brillantes */}
        <Animated.View
          style={[
            styles.particle,
            styles.particle1,
            { opacity: sparkleOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle2,
            { opacity: waveOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle3,
            { opacity: glowOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle4,
            { opacity: sparkleOpacity },
          ]}
        />
        
        {/* Resplandor central */}
        <Animated.View
          style={[
            styles.centralGlow,
            { 
              opacity: glowOpacity,
              transform: [{ scale: glowAnim }],
            },
          ]}
        />
        
        {/* VS Central */}
        <View style={styles.vsMain}>
          <Text style={styles.vsText}>VS</Text>
        </View>
      </View>

      {/* Tarjeta del Jugador 2 (Abajo) */}
      <TouchableOpacity
        onPress={() => onPlayerPress?.(player2)}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.playerCard,
            styles.bottomCard,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
        {/* Efectos de brillo alrededor */}
        <Animated.View
          style={[
            styles.cardGlow,
            styles.bottomCardGlow,
            { opacity: glowOpacity },
          ]}
        />
        
        {/* Destellos en las esquinas */}
        <Animated.View
          style={[
            styles.sparkle,
            styles.bottomLeftSparkle,
            { opacity: sparkleOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.sparkle,
            styles.bottomRightSparkle,
            { opacity: sparkleOpacity },
          ]}
        />

        {/* Área para la foto (vacía para Supabase) */}
        <View style={styles.photoArea} />
      </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 40,
    height: 700, // Más alto para tarjetas verticales
    alignSelf: 'center',
    position: 'relative',
  },
  playerCard: {
    width: '100%',
    height: 320, // Más altas
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00FFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  topCard: {
    marginBottom: 2, // Casi tocándose
  },
  bottomCard: {
    marginTop: 2, // Casi tocándose
  },
  cardGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  topCardGlow: {
    top: -5,
  },
  bottomCardGlow: {
    bottom: -5,
  },
  sparkle: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#FFD700',
    borderRadius: 5,
  },
  topLeftSparkle: {
    top: 10,
    left: 10,
  },
  topRightSparkle: {
    top: 10,
    right: 10,
  },
  bottomLeftSparkle: {
    bottom: 10,
    left: 10,
  },
  bottomRightSparkle: {
    bottom: 10,
    right: 10,
  },
  photoArea: {
    flex: 1,
    margin: 10, // Reducido para más espacio de imagen
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60, // Reducido para más espacio a las cards
    position: 'relative',
    zIndex: 5,
  },
  // Efecto de explosión de fondo
  explosionEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 100, 0, 0.3)', // Naranja ardiente
    shadowColor: '#FF6400',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 15,
  },
  // Rayos de luz
  lightRay: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 215, 0, 0.8)', // Dorado brillante
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  ray1: {
    width: 4,
    height: 60,
    top: -30,
    left: '50%',
    marginLeft: -2,
    transform: [{ rotate: '0deg' }],
  },
  ray2: {
    width: 4,
    height: 60,
    top: -30,
    left: '50%',
    marginLeft: -2,
    transform: [{ rotate: '45deg' }],
  },
  ray3: {
    width: 4,
    height: 60,
    top: -30,
    left: '50%',
    marginLeft: -2,
    transform: [{ rotate: '90deg' }],
  },
  ray4: {
    width: 4,
    height: 60,
    top: -30,
    left: '50%',
    marginLeft: -2,
    transform: [{ rotate: '-45deg' }],
  },
  // Partículas brillantes
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 10,
  },
  particle1: {
    top: -20,
    left: -25,
  },
  particle2: {
    top: -25,
    right: -20,
  },
  particle3: {
    bottom: -20,
    left: -30,
  },
  particle4: {
    bottom: -25,
    right: -25,
  },
  // Resplandor central
  centralGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.4)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 12,
  },
  // VS principal
  vsMain: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 20,
    zIndex: 10,
  },
  vsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 3,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});