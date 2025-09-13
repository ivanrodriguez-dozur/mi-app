import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TournamentsIconProps {
  size?: number;
  onPress?: () => void;
}

/**
 * Ícono de torneos para la barra de acciones
 * Usa un diseño gaming moderno con ondas animadas que llaman la atención
 */
export const TournamentsIcon: React.FC<TournamentsIconProps> = ({ 
  size = 24, 
  onPress 
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de pulso del icono principal
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

    // Animación de ondas expansivas
    const waveAnimation = Animated.loop(
      Animated.stagger(400, [
        Animated.sequence([
          Animated.timing(wave1, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(wave1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(wave2, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(wave2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(wave3, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(wave3, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseAnimation.start();
    waveAnimation.start();

    return () => {
      pulseAnimation.stop();
      waveAnimation.stop();
    };
  }, [pulseAnim, wave1, wave2, wave3]);

  const renderWave = (animValue: Animated.Value, delay: number) => {
    const scale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 2.5],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0.7, 0.3, 0],
    });

    return (
      <Animated.View
        style={{
          position: 'absolute',
          width: size + 20,
          height: size + 20,
          borderRadius: (size + 20) / 2,
          borderWidth: 2,
          borderColor: '#FFD700',
          transform: [{ scale }],
          opacity,
        }}
      />
    );
  };

  return (
    <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
      {/* Ondas animadas */}
      {renderWave(wave1, 0)}
      {renderWave(wave2, 400)}
      {renderWave(wave3, 800)}
      
      {/* Icono principal con pulso */}
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
        }}
      >
        <TouchableOpacity
          onPress={onPress}
          style={{
            padding: 8,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 215, 0, 0.15)', // Fondo dorado sutil para combinar con las espadas
            shadowColor: '#FFD700',
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}
        >
          <Ionicons 
            name="flash" 
            size={size} 
            color="#FFD700" // Color dorado para representar poder/combate
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};