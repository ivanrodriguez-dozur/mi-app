import React, { useRef } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface FollowButtonProps {
  isFollowing: boolean;
  onToggleFollow: () => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ isFollowing, onToggleFollow }) => {
  const { colors, fontScale, reducedAnimations } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Solo animar si las animaciones no están reducidas
    if (!reducedAnimations) {
      // Animación de escala y opacidad al presionar
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(scaleValue, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
    
    // Ejecutar la función original
    onToggleFollow();
  };
  
  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
        opacity: opacityValue,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={{
          backgroundColor: isFollowing ? colors.error : colors.success,
          paddingHorizontal: 24,
          paddingVertical: 10,
          borderRadius: 20,
          alignSelf: 'center',
          marginVertical: 8,
        }}
      >
        <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 * fontScale }}>
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
