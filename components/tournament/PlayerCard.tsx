import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Helper function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    avatar: string;
    position: string;
    team: string;
    rating: number;
    popularity: {
      fans: number;        // Cantidad de fans/seguidores
      votes: number;       // Votos totales recibidos
      admirers: number;    // Personas que lo admiran
    };
  };
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  onPress?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  rarity = 'rare',
  onPress,
}) => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de shimmer
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
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

    shimmer.start();
    glow.start();

    return () => {
      shimmer.stop();
      glow.stop();
    };
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  };

  const getRarityColors = () => {
    switch (rarity) {
      case 'legendary':
        return {
          primary: '#FFD700',
          secondary: '#FFA500',
          glow: 'rgba(255, 215, 0, 0.6)',
          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
        };
      case 'epic':
        return {
          primary: '#9D4EDD',
          secondary: '#7B2CBF',
          glow: 'rgba(157, 78, 221, 0.6)',
          background: 'linear-gradient(45deg, #9D4EDD, #7B2CBF)',
        };
      case 'rare':
        return {
          primary: '#00BFFF',
          secondary: '#0080FF',
          glow: 'rgba(0, 191, 255, 0.6)',
          background: 'linear-gradient(45deg, #00BFFF, #0080FF)',
        };
      default:
        return {
          primary: '#FFFFFF',
          secondary: '#CCCCCC',
          glow: 'rgba(255, 255, 255, 0.6)',
          background: 'linear-gradient(45deg, #FFFFFF, #CCCCCC)',
        };
    }
  };

  const colors = getRarityColors();

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Efecto de glow */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              backgroundColor: colors.glow,
              opacity: glowAnim,
            },
          ]}
        />

        {/* Shimmer effect */}
        <Animated.View
          style={[
            styles.shimmerEffect,
            {
              transform: [
                {
                  translateX: shimmerAnim.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-200, 200],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Card Background */}
        <View style={[styles.cardBackground, { borderColor: colors.primary }]}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.ratingBadge}>
              <Text style={[styles.ratingText, { color: colors.primary }]}>
                {player.rating}
              </Text>
            </View>
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>{player.position}</Text>
            </View>
          </View>

          {/* Hexagonal Frame */}
          <View style={styles.hexagonContainer}>
            <View style={[styles.hexagonOuter, { borderColor: colors.primary }]}>
              <View style={[styles.hexagonMiddle, { borderColor: colors.secondary }]}>
                <View style={styles.hexagonInner}>
                  {/* Player Avatar */}
                  <View style={styles.avatarContainer}>
                    <Text style={styles.playerAvatar}>{player.avatar}</Text>
                  </View>
                  
                  {/* Decorative Elements */}
                  <View style={[styles.decorativeLines, { backgroundColor: colors.primary }]} />
                </View>
              </View>
            </View>
          </View>

          {/* Player Info */}
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerTeam}>{player.team}</Text>
          </View>

          {/* Popularity Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(player.popularity.fans)}</Text>
              <Text style={styles.statLabel}>FANS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(player.popularity.votes)}</Text>
              <Text style={styles.statLabel}>VOTOS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(player.popularity.admirers)}</Text>
              <Text style={styles.statLabel}>ADMIRAN</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.footerLeft}>
              <View style={[styles.rarityIndicator, { backgroundColor: colors.primary }]} />
              <Text style={[styles.rarityText, { color: colors.primary }]}>
                {rarity.toUpperCase()}
              </Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={[styles.xgBadge, { color: colors.primary, borderColor: colors.primary }]}>
                XG
              </Text>
            </View>
          </View>

          {/* Brand */}
          <View style={styles.brandContainer}>
            <Text style={styles.brandText}>VERSUS</Text>
            <Text style={styles.brandSubtext}>DOZUR LEAGUE</Text>
          </View>

          {/* Corner Decorations */}
          <View style={[styles.cornerDecor, styles.topLeft, { borderColor: colors.primary }]} />
          <View style={[styles.cornerDecor, styles.topRight, { borderColor: colors.primary }]} />
          <View style={[styles.cornerDecor, styles.bottomLeft, { borderColor: colors.primary }]} />
          <View style={[styles.cornerDecor, styles.bottomRight, { borderColor: colors.primary }]} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 200,
    height: 280,
    margin: 10,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 20,
    opacity: 0.3,
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: -50,
    width: 50,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
    zIndex: 2,
  },
  cardBackground: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    borderWidth: 3,
    padding: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ratingBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  positionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hexagonContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  hexagonOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  hexagonMiddle: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  hexagonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  avatarContainer: {
    zIndex: 2,
  },
  playerAvatar: {
    fontSize: 30,
  },
  decorativeLines: {
    position: 'absolute',
    width: 40,
    height: 2,
    top: 10,
    opacity: 0.7,
  },
  playerInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  playerTeam: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rarityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footerRight: {},
  xgBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  brandContainer: {
    position: 'absolute',
    bottom: 5,
    right: 10,
    alignItems: 'flex-end',
  },
  brandText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  brandSubtext: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  cornerDecor: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderWidth: 2,
  },
  topLeft: {
    top: 5,
    left: 5,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
  },
  topRight: {
    top: 5,
    right: 5,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 5,
  },
  bottomLeft: {
    bottom: 5,
    left: 5,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 5,
  },
  bottomRight: {
    bottom: 5,
    right: 5,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 5,
  },
});