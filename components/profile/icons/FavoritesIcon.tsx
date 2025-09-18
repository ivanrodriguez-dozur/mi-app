import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';

interface FavoritesIconProps {
  size?: number;
  onPress?: () => void;
  color?: string; // Opción para personalizar el color del corazón
}

/**
 * Ícono de favoritos para la barra de acciones
 * Usa el corazón como símbolo universal de favoritos
 * 
 * @param size - Tamaño del icono (por defecto 24)
 * @param onPress - Función que se ejecuta al presionar el icono
 * @param color - Color personalizado del icono (opcional)
 * 
 * Ejemplos de uso:
 * <FavoritesIcon /> // Color gris oscuro por defecto (#B0B0B0)
 * <FavoritesIcon color="#FF4444" /> // Color rojo personalizado
 * <FavoritesIcon color="#FF6B6B" /> // Color coral personalizado
 */
export const FavoritesIcon: React.FC<FavoritesIconProps> = ({ 
  size = 24, 
  onPress,
  color // Color personalizable
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
        name="heart" 
        size={size} 
        color={color || '#B0B0B0'} // Color gris más oscuro por defecto
      />
    </TouchableOpacity>
  );
};