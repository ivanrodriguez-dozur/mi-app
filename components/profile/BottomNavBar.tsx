import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useBottomNav, BottomNavKey } from '../../contexts/BottomNavContext';
import { useTheme } from '../../contexts/ThemeContext';

const ICON_SIZE = 28;

type BottomNavBarProps = {
  onSelect?: (key: BottomNavKey) => boolean | void;
};

const icons: { key: BottomNavKey; icon: React.ReactElement<any> }[] = [
  { key: 'boom', icon: <Ionicons name="flame" size={ICON_SIZE} /> },
  { key: 'shop', icon: <MaterialIcons name="shopping-cart" size={ICON_SIZE} /> },
  { key: 'add', icon: <Ionicons name="add-circle" size={ICON_SIZE} /> },
  { key: 'messages', icon: <MaterialIcons name="mail" size={ICON_SIZE} /> },
  { key: 'profile', icon: <Ionicons name="person" size={ICON_SIZE} /> },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ onSelect }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const { selected, setSelected } = useBottomNav();

  const accentColor = colors.accent ?? '#FF3366';
  const highlightColor = `${accentColor}22`;

  const handlePress = React.useCallback(
    (key: BottomNavKey) => {
      setSelected(key);
      const handled = onSelect?.(key);
      if (handled === false) {
        return;
      }

      switch (key) {
        case 'messages':
          router.push('/(tabs)/messages');
          break;
        case 'shop':
          router.push('/(tabs)/shop');
          break;
        case 'add':
          router.push('/modal');
          break;
        case 'boom':
          router.push('/(tabs)');
          break;
        case 'profile':
          router.push('/(tabs)/profile');
          break;
        default:
          router.push('/(tabs)');
          break;
      }
    },
    [router, onSelect, setSelected]
  );

  return (
    <View
      style={[styles.container, {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
      }]}
    >
      {icons.map(({ key, icon }) => {
        const isSelected = selected === key;
        const iconColor = isSelected ? accentColor : colors.text;
        const iconSize = isSelected ? ICON_SIZE + 4 : ICON_SIZE;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => handlePress(key)}
            activeOpacity={0.85}
            style={[styles.iconContainer, isSelected && { backgroundColor: highlightColor }]}
          >
            {React.cloneElement(icon as any, { color: iconColor, size: iconSize })}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 100,
    elevation: 10,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 18,
    marginHorizontal: 4,
  },
});

