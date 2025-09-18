import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';

interface MenuButtonProps {
  onPress: () => void;
}

/**
 * Botón de menú con ícono de tres líneas
 * Para editar: Cambia el nombre del ícono en 'name' o el tamaño en 'size'
 * Posición: Se coloca en la esquina superior derecha del header
 */
export const MenuButton: React.FC<MenuButtonProps> = ({ onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      position: 'absolute',
      top: 50,
      right: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      padding: 8,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      zIndex: 10,
    }}
  >
    <Ionicons name="menu" size={24} color="#444" />
  </TouchableOpacity>
);