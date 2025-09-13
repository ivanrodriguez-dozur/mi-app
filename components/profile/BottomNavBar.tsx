import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const ICON_SIZE = 28;

const icons = [
  { key: 'home', label: 'Home', icon: <Ionicons name="home" size={ICON_SIZE} /> },
  { key: 'booms', label: 'Booms', icon: <MaterialIcons name="favorite" size={ICON_SIZE} /> },
  { key: 'add', label: 'Add', icon: <Ionicons name="add-circle" size={ICON_SIZE} /> },
  { key: 'games', label: 'Games', icon: <FontAwesome5 name="gamepad" size={ICON_SIZE} /> },
  { key: 'profile', label: 'Profile', icon: <Ionicons name="person" size={ICON_SIZE} /> },
];

interface BottomNavBarProps {
  selected: string;
  onSelect: (key: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ selected, onSelect }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {icons.map(({ key, icon }, idx) => (
        <TouchableOpacity
          key={key}
          onPress={() => onSelect(key)}
          style={[
            styles.iconContainer,
            selected === key && { backgroundColor: colors.accent },
          ]}
        >
          {React.cloneElement(icon, {
            color: selected === key ? '#222' : colors.text,
          })}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 10,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 20,
  },
});
