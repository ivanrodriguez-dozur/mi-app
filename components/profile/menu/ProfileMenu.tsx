import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';

interface ProfileMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

/**
 * Modal de menú del perfil con opciones de navegación
 * Para editar: Modifica las opciones en el array 'menuOptions'
 * Para cambiar estilos: Modifica el objeto 'styles' al final del archivo
 */
export const ProfileMenu: React.FC<ProfileMenuProps> = ({ visible, onClose, onNavigate }) => {
  const { colors, reducedAnimations } = useTheme();
  const { user } = useAuth();
  // Opciones del menú sin 'Iniciar Sesión'
  const menuOptions = [
    { id: 'account', title: 'Cuenta', icon: 'person-outline' },
    { id: 'statistics', title: 'Estadísticas', icon: 'stats-chart-outline' },
    { id: 'darkMode', title: 'Modo Oscuro', icon: 'moon-outline' },
    { id: 'terms', title: 'Términos y Condiciones', icon: 'document-text-outline' },
    ...(user 
      ? [{ id: 'logout', title: 'Cerrar Sesión', icon: 'log-out-outline' }]
      : []
    ),
  ];

  const handleOptionPress = (optionId: string) => {
    // Solo llamar onNavigate, el cierre se maneja en ProfileHeader
    onNavigate(optionId);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={reducedAnimations ? "none" : "fade"}
      onRequestClose={onClose}
      hardwareAccelerated={true}
    >
      <TouchableOpacity 
        style={[styles.overlay]} 
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Flecha indicadora */}
          <View style={[styles.arrow, { borderBottomColor: colors.card }]} />
          
          {/* Lista de opciones del menú */}
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.menuItem, { backgroundColor: colors.surface }]}
              onPress={() => handleOptionPress(option.id)}
              activeOpacity={0.7}
            >
              <Ionicons name={option.icon as any} size={20} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>{option.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  container: {
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    borderWidth: 1,
  },
  arrow: {
    position: 'absolute',
    top: -8,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 1,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});