import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';

interface TournamentsIconProps {
  size?: number;
  onPress?: () => void;
}

/**
 * Ícono de torneos para la barra de acciones
 * Usa el trofeo como símbolo de competiciones y torneos
 */
export const TournamentsIcon: React.FC<TournamentsIconProps> = ({ 
  size = 24, 
  onPress 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 8,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons 
        name="trophy" 
        size={size} 
        color="#FFD700" // Color dorado para el trofeo
      />
    </TouchableOpacity>
  );
};